const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SUPPORTED_JAVA = new Set([17, 21, 25]);
const TYPES = new Set(['spring', 'spring-react', 'estatico', 'custom']);

function fail(message) {
  throw new Error(`Manifesto inválido: ${message}`);
}

function loadAndValidate() {
  const manifestPath = path.join(__dirname, 'projetos.json');
  let projects;
  try {
    projects = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`não foi possível ler deploy/projetos.json (${error.message}).`);
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    fail('o arquivo deve conter uma lista com pelo menos um projeto.');
  }

  const slugs = new Set();
  const ports = new Set();
  for (const [index, project] of projects.entries()) {
    const label = project && project.slug ? `projeto "${project.slug}"` : `projeto na posição ${index + 1}`;
    if (!project || typeof project !== 'object' || Array.isArray(project)) fail(`${label} deve ser um objeto.`);
    if (typeof project.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
      fail(`${label}: slug deve conter somente letras minúsculas, números e hífens.`);
    }
    if (slugs.has(project.slug)) fail(`slug repetido "${project.slug}".`);
    slugs.add(project.slug);
    if (!TYPES.has(project.tipo)) fail(`${label}: tipo "${project.tipo}" não é reconhecido.`);
    if (typeof project.pasta !== 'string' || !project.pasta.trim()) fail(`${label}: pasta é obrigatória.`);

    const projectPath = path.resolve(REPO_ROOT, project.pasta);
    if (!projectPath.startsWith(`${REPO_ROOT}${path.sep}`) || !fs.existsSync(projectPath) || !fs.statSync(projectPath).isDirectory()) {
      fail(`${label}: pasta "${project.pasta}" não existe na raiz do repositório.`);
    }

    if (project.tipo === 'estatico') {
      if (project.java !== null) fail(`${label}: projetos estáticos devem declarar "java": null.`);
      if (!project.build || !project.artefato) fail(`${label}: projetos estáticos exigem build e artefato.`);
    } else {
      if (project.java !== null && !SUPPORTED_JAVA.has(project.java)) {
        fail(`${label}: Java ${project.java} não é suportado; use 17, 21, 25 ou null para processo Node/custom.`);
      }
      if (!project.healthcheck || !project.healthcheck.startsWith('/')) fail(`${label}: healthcheck deve começar com "/".`);
      if (project.tipo !== 'custom' && (!project.build || !project.artefato)) {
        fail(`${label}: projetos Spring exigem build e artefato.`);
      }
      if (project.tipo === 'custom' && (!project.start || !project.healthcheck)) {
        fail(`${label}: projetos custom exigem start e healthcheck.`);
      }
      if (project.tipo === 'custom' && !project.build) fail(`${label}: projetos custom exigem build (use "true" se não houver etapa de compilação).`);
      if (!project.memoria || !/^\d+[mMgG]$/.test(project.memoria)) {
        fail(`${label}: memoria deve ser um limite como "128m" ou "1g".`);
      }
    }
    if (project.tipo === 'spring-react' && (typeof project.frontend !== 'string' || !project.frontend)) {
      fail(`${label}: projetos spring-react precisam declarar a pasta frontend.`);
    }

    if (project.porta !== null && project.porta !== undefined) {
      if (!Number.isInteger(project.porta) || project.porta < 1024 || project.porta > 65535) {
        fail(`${label}: porta deve ser null ou um número entre 1024 e 65535.`);
      }
      if (ports.has(project.porta)) fail(`${label}: porta ${project.porta} foi declarada mais de uma vez.`);
      ports.add(project.porta);
    }
    if (!project.env || typeof project.env !== 'object' || Array.isArray(project.env)) {
      fail(`${label}: env deve ser um objeto.`);
    }
    if (!Array.isArray(project.envSecretas)) fail(`${label}: envSecretas deve ser uma lista de nomes.`);
    for (const key of Object.keys(project.env)) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(key)) fail(`${label}: nome de variável inválido "${key}".`);
    }
    for (const key of project.envSecretas) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(key)) fail(`${label}: nome de variável secreta inválido "${key}".`);
    }
    if (project.tipo === 'spring' || project.tipo === 'spring-react') {
      const artifact = path.resolve(projectPath, project.artefato || '.');
      if (!artifact.startsWith(`${projectPath}${path.sep}`)) fail(`${label}: artefato deve ficar dentro da pasta do projeto.`);
    }
  }
  return projects;
}

function assignPorts(projects) {
  const used = new Set(projects.filter((project) => project.porta).map((project) => project.porta));
  let next = 9001;
  return projects.map((project) => {
    if (project.tipo === 'estatico') return { ...project, porta: null };
    if (project.porta) return { ...project };
    while (used.has(next)) next += 1;
    const result = { ...project, porta: next };
    used.add(next);
    next += 1;
    return result;
  });
}

if (require.main === module) {
  try {
    const projects = loadAndValidate();
    console.log(`Manifesto válido: ${projects.length} projetos.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { REPO_ROOT, assignPorts, loadAndValidate };
