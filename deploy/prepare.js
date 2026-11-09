const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { REPO_ROOT, assignPorts, loadAndValidate } = require('./validate');

const WORK_ROOT = path.resolve(process.env.DIAW_WORK_ROOT || '/workspace');
const PROJECTS_ROOT = path.join(WORK_ROOT, 'projects');
const OUTPUT_ROOT = path.join(WORK_ROOT, 'output');
const STATIC_ROOT = path.join(WORK_ROOT, 'site');
const RUNTIME_ROOT = path.join(WORK_ROOT, 'runtime');
const PLAN_ROOT = path.join(WORK_ROOT, 'build-plans');

function run(command, cwd, env = {}) {
  const options = {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  };
  const result = process.platform === 'win32'
    ? spawnSync(command, { ...options, shell: true })
    : spawnSync('/bin/sh', ['-c', command], options);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`O comando "${command}" falhou na pasta "${cwd}" (código ${result.status}).`);
}

function runNode(script, args, cwd) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`O script "${path.basename(script)}" falhou (código ${result.status}).`);
}

function copyProject(project) {
  const source = path.resolve(REPO_ROOT, project.pasta);
  const destination = path.join(PROJECTS_ROOT, project.slug);
  fs.cpSync(source, destination, {
    recursive: true,
    dereference: false,
    filter: (entry) => {
      const relative = path.relative(source, entry);
      const parts = relative.split(path.sep);
      const name = path.basename(entry);
      if (parts.some((part) => ['.git', 'node_modules', 'target', 'dist', '.next', '.vite'].includes(part))) return false;
      if (name === '.env' || name.startsWith('.env.')) return false;
      if (project.slug === 'portfolio' && relative === path.join('config', 'application.properties')) return false;
      return true;
    }
  });
  return destination;
}

function patchViteConfig(projectDir, project) {
  const frontendDir = project.frontend === '.' ? projectDir : path.join(projectDir, project.frontend || '');
  const configPath = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs']
    .map((name) => path.join(frontendDir, name))
    .find((candidate) => fs.existsSync(candidate));
  if (!configPath) throw new Error(`O projeto "${project.slug}" declara frontend, mas não tem vite.config.*.`);

  let source = fs.readFileSync(configPath, 'utf8');
  if (/base\s*:/.test(source)) {
    throw new Error(`O projeto "${project.slug}" já define base no Vite; ajuste o suporte a subcaminho no manifesto ou na preparação.`);
  }
  const marker = /defineConfig\(\s*\{/;
  if (!marker.test(source)) throw new Error(`Não foi possível adaptar o Vite do projeto "${project.slug}".`);
  source = source.replace(marker, (match) => `${match}\n  base: process.env.DIAW_BASE || '/',`);
  fs.writeFileSync(configPath, source);
}

function patchFrontendSource(project) {
  const projectDir = path.join(PROJECTS_ROOT, project.slug);
  if (project.slug === 'lab2') {
    const routerPath = path.join(projectDir, 'frontend', 'src', 'main.jsx');
    let router = fs.readFileSync(routerPath, 'utf8');
    if (!router.includes('<BrowserRouter>')) throw new Error('LAB2: BrowserRouter não foi encontrado para configurar o basename.');
    router = router.replace('<BrowserRouter>', '<BrowserRouter basename={import.meta.env.BASE_URL}>');
    fs.writeFileSync(routerPath, router);

    const apiPath = path.join(projectDir, 'frontend', 'src', 'services', 'api.js');
    let api = fs.readFileSync(apiPath, 'utf8');
    api = api.replace("(import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')",
      "(import.meta.env.PROD ? `${import.meta.env.BASE_URL}api` : 'http://localhost:8080/api')");
    api = api.replace("window.location.href = '/login';", "window.location.href = `${import.meta.env.BASE_URL}login`;");
    fs.writeFileSync(apiPath, api);
  }

  if (project.slug === 'portfolio') {
    const appPath = path.join(projectDir, 'frontend', 'src', 'App.jsx');
    let app = fs.readFileSync(appPath, 'utf8');
    app = app.replace("fetch('/api/portfolio')", "fetch(`${import.meta.env.BASE_URL}api/portfolio`)");
    fs.writeFileSync(appPath, app);

    const contactPath = path.join(projectDir, 'frontend', 'src', 'pages', 'Contact.jsx');
    let contact = fs.readFileSync(contactPath, 'utf8');
    contact = contact.replace("fetch('/api/contact'", "fetch(`${import.meta.env.BASE_URL}api/contact`");
    fs.writeFileSync(contactPath, contact);
  }
}

function generateBuildPlans(projects) {
  fs.mkdirSync(PLAN_ROOT, { recursive: true });
  for (const java of [17, 21, 25]) {
    const matching = projects.filter((project) =>
      (project.tipo === 'spring' || project.tipo === 'spring-react') && project.java === java);
    if (!matching.length) continue;

    const lines = ['#!/bin/sh', 'set -eu', 'mkdir -p /workspace/output'];
    for (const project of matching) {
      const cwd = path.join(PROJECTS_ROOT, project.slug);
      lines.push(`cd ${shellQuote(cwd)}`);
      lines.push(`DIAW_BASE=${shellQuote(`/${project.slug}/`)} ${project.build}`);
      const artifactPath = path.join(cwd, project.artefato);
      lines.push(`test -f ${shellQuote(artifactPath)} || { echo ${shellQuote(`Build de ${project.slug} não gerou o artefato ${project.artefato}.`)} >&2; exit 1; }`);
      lines.push(`cp ${shellQuote(artifactPath)} ${shellQuote(path.join(OUTPUT_ROOT, `${project.slug}.jar`))}`);
    }
    const planPath = path.join(PLAN_ROOT, `java-${java}.sh`);
    fs.writeFileSync(planPath, `${lines.join('\n')}\n`, { mode: 0o755 });
  }
}

function removeDependencies(projectDir) {
  for (const entry of fs.readdirSync(projectDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const entryPath = path.join(projectDir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.pnpm-store') {
      fs.rmSync(entryPath, { recursive: true, force: true });
    } else {
      removeDependencies(entryPath);
    }
  }
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function main() {
  const projects = assignPorts(loadAndValidate());
  fs.mkdirSync(PROJECTS_ROOT, { recursive: true });
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  fs.mkdirSync(STATIC_ROOT, { recursive: true });
  fs.mkdirSync(RUNTIME_ROOT, { recursive: true });
  fs.mkdirSync(path.join(WORK_ROOT, 'custom'), { recursive: true });

  for (const project of projects) {
    const projectDir = copyProject(project);
    if (project.tipo === 'spring-react' && project.frontend) {
      patchViteConfig(projectDir, project);
      patchFrontendSource(project);
      if (project.frontendBuild) {
        const frontendDir = path.join(projectDir, project.frontend);
        run(`corepack prepare pnpm@12.5.1 --activate && ${project.frontendBuild}`,
          projectDir, { DIAW_BASE: `/${project.slug}/` });
        const staticSource = path.join(frontendDir, 'dist');
        if (!fs.existsSync(staticSource)) throw new Error(`O build do frontend de "${project.slug}" não criou frontend/dist.`);
        const backendStatic = path.join(projectDir, 'backend', 'src', 'main', 'resources', 'static');
        fs.rmSync(backendStatic, { recursive: true, force: true });
        fs.cpSync(staticSource, backendStatic, { recursive: true });
      }
    } else if (project.tipo === 'estatico') {
      patchViteConfig(projectDir, project);
      run(project.build, projectDir, { DIAW_BASE: `/${project.slug}/` });
      const staticSource = path.resolve(projectDir, project.artefato);
      if (!staticSource.startsWith(`${projectDir}${path.sep}`) || !fs.existsSync(staticSource)) {
        throw new Error(`O build estático de "${project.slug}" não gerou "${project.artefato}".`);
      }
      fs.cpSync(staticSource, path.join(STATIC_ROOT, project.slug), { recursive: true });
    } else if (project.tipo === 'custom') {
      if (project.build !== 'true') run(project.build, projectDir, { DIAW_BASE: `/${project.slug}/` });
      fs.mkdirSync(path.join(WORK_ROOT, 'custom'), { recursive: true });
      fs.cpSync(projectDir, path.join(WORK_ROOT, 'custom', project.slug), { recursive: true });
    }
  }

  for (const project of projects.filter((item) => item.tipo !== 'custom')) {
    const projectDir = path.join(PROJECTS_ROOT, project.slug);
    removeDependencies(projectDir);
    if (project.tipo === 'estatico') fs.rmSync(path.resolve(projectDir, project.artefato), { recursive: true, force: true });
    if (project.tipo === 'spring-react' && project.frontendBuild) {
      fs.rmSync(path.join(projectDir, project.frontend, 'dist'), { recursive: true, force: true });
    }
  }

  fs.copyFileSync(path.join(REPO_ROOT, 'deploy', 'projetos.json'), path.join(RUNTIME_ROOT, 'projetos.json'));
  fs.writeFileSync(path.join(RUNTIME_ROOT, 'projetos-com-portas.json'), `${JSON.stringify(projects, null, 2)}\n`);
  generateBuildPlans(projects);
  runNode(path.join(REPO_ROOT, 'deploy', 'gerar-menu.js'), [STATIC_ROOT], REPO_ROOT);
  runNode(path.join(REPO_ROOT, 'deploy', 'gerar-nginx.js'), [path.join(WORK_ROOT, 'nginx.conf.template')], REPO_ROOT);
  console.log('Preparação do container concluída; nenhum projeto Java foi iniciado.');
}

try {
  main();
} catch (error) {
  console.error(`Falha na preparação do container: ${error.message}`);
  process.exitCode = 1;
}
