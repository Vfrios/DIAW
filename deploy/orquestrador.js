const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const readline = require('node:readline');

const PORT = 3001;
const APPS_DIR = '/app/apps';
const CUSTOM_DIR = '/app/custom';
const MODE = process.env.MODO || 'sob-demanda';
const MAX_APPS = parsePositiveInt('MAX_APPS', 2);
const MEMORY_LIMIT_MB = parsePositiveInt('MEM_LIMIT_MB', 360);
const IDLE_MINUTES = parsePositiveInt('IDLE_MINUTOS', 10);
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;
const STARTUP_TIMEOUT_MS = 90_000;
const KILL_TIMEOUT_MS = 5_000;
const STARTUP_RESERVE_MB = 120;
const manifestPath = '/app/runtime/projetos-com-portas.json';

function parsePositiveInt(name, fallback) {
  const parsed = Number(process.env[name] || fallback);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} precisa ser um inteiro positivo.`);
  return parsed;
}

if (!['sob-demanda', 'sempre-ligado'].includes(MODE)) {
  throw new Error('MODO deve ser "sob-demanda" ou "sempre-ligado".');
}

const projects = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const bySlug = new Map(projects.map((project) => [project.slug, project]));
const states = new Map(projects.map((project) => [project.slug, {
  slug: project.slug,
  tipo: project.tipo,
  estado: project.tipo === 'estatico' ? 'no-ar' : 'parada',
  porta: project.porta,
  pid: null,
  rssMb: 0,
  iniciadaEm: null,
  ultimaAtividade: null,
  erro: '',
  processo: null,
  job: null,
  geracao: 0,
  solicitadaEm: null
}]));

const rateHistory = new Map();
let encerrando = '';
let shuttingDown = false;

function jsonResponse(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body)
  });
  response.end(body);
}

function activeApps(exceptSlug) {
  return [...states.values()]
    .filter((state) => state.slug !== exceptSlug && (state.processo || state.estado === 'iniciando') &&
      ['iniciando', 'no-ar', 'encerrando'].includes(state.estado))
    .sort((left, right) => (left.solicitadaEm || 0) - (right.solicitadaEm || 0));
}

function readRssMb(pid) {
  if (!pid) return 0;
  try {
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    const match = /^VmRSS:\s+(\d+)\s+kB$/m.exec(status);
    return match ? Math.round(Number(match[1]) / 1024) : 0;
  } catch {
    return 0;
  }
}

function heapMb(memory) {
  const match = /^(\d+)([mMgG])$/.exec(memory || '128m');
  if (!match) return 128;
  const value = Number(match[1]);
  return match[2].toLowerCase() === 'g' ? value * 1024 : value;
}

function updateMemory() {
  for (const state of states.values()) state.rssMb = readRssMb(state.pid);
}

function totalRssMb() {
  updateMemory();
  return [...states.values()].reduce((total, state) => total + state.rssMb, 0);
}

function childLog(slug, stream, label) {
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  lines.on('line', (line) => console.log(`[${slug}] ${label}: ${line}`));
}

function waitForExit(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), timeoutMs);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve(true);
    });
  });
}

async function stopApp(state, reason, replacingProject) {
  state.geracao += 1;
  if (!state.processo) {
    state.estado = 'parada';
    state.pid = null;
    state.rssMb = 0;
    state.erro = '';
    return;
  }

  state.estado = 'encerrando';
  const currentProject = bySlug.get(state.slug);
  const label = currentProject ? currentProject.rotulo || currentProject.titulo : state.slug;
  const nextLabel = replacingProject && (replacingProject.rotulo || replacingProject.titulo);
  encerrando = reason === 'substituição'
    ? `${label} para abrir ${nextLabel || 'outra tarefa'}`
    : label;
  const child = state.processo;
  child.kill('SIGTERM');
  const exited = await waitForExit(child, KILL_TIMEOUT_MS);
  if (!exited) {
    child.kill('SIGKILL');
    await waitForExit(child, 1_000);
  }
  if (state.processo === child) state.processo = null;
  state.pid = null;
  state.rssMb = 0;
  state.estado = 'parada';
  state.erro = '';
  state.iniciadaEm = null;
  encerrando = '';
}

async function makeRoom(project, generation, force) {
  if (force) return;
  while (activeApps(project.slug).length >= MAX_APPS) {
    if (generation !== states.get(project.slug).geracao || shuttingDown) return;
    const oldest = activeApps(project.slug)[0];
    if (!oldest) return;
    console.log(`[orquestrador] ${oldest.slug} será encerrado por FIFO antes de iniciar ${project.slug}.`);
    await stopApp(oldest, 'substituição', project);
  }
}

function javaCommand(project) {
  const jarPath = path.join(APPS_DIR, `${project.slug}.jar`);
  if (!fs.existsSync(jarPath)) throw new Error(`JAR compilado de "${project.slug}" não foi encontrado.`);
  const javaHome = `/opt/java/${project.java}`;
  const memory = project.memoria || '128m';
  return {
    command: path.join(javaHome, 'bin', 'java'),
    args: [
      `-Xmx${memory}`,
      '-XX:+UseSerialGC',
      '-Xss512k',
      '-XX:TieredStopAtLevel=1',
      '-Dspring.main.lazy-initialization=true',
      '-jar',
      jarPath
    ],
    javaHome
  };
}

function launchProcess(project) {
  const env = { ...process.env, ...(project.env || {}) };
  delete env.PORT;
  const cwd = project.tipo === 'custom' ? path.join(CUSTOM_DIR, project.slug) : '/app';
  const javaHome = project.java ? `/opt/java/${project.java}` : '';
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.PATH = `${path.join(javaHome, 'bin')}:${env.PATH || ''}`;
  }
  if (project.porta) {
    env.PORT = String(project.porta);
    env.SERVER_PORT = String(project.porta);
  }

  if (project.tipo === 'custom') {
    return spawn('/bin/sh', ['-lc', project.start], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }

  const launch = javaCommand(project);
  return spawn(launch.command, launch.args, {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

async function waitForHealth(project, state, generation, child) {
  const context = (project.env && project.env.SERVER_SERVLET_CONTEXT_PATH) || '';
  const healthPath = `${context}${project.healthcheck}`.replace(/\/+/g, '/');
  const healthUrl = `http://127.0.0.1:${project.porta}${healthPath.startsWith('/') ? healthPath : `/${healthPath}`}`;
  const expiresAt = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < expiresAt && generation === state.geracao && !shuttingDown) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`A aplicação encerrou antes de responder em ${project.healthcheck}.`);
    }
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(1_500) });
      if (response.ok) return;
    } catch {
      // Durante o início a porta ainda pode não estar aceitando conexões.
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }
  if (generation !== state.geracao || shuttingDown) return;
  throw new Error(`A aplicação não ficou saudável em até ${STARTUP_TIMEOUT_MS / 1000}s (${healthUrl}).`);
}

async function startApp(slug, force = false, waitUntilReady = false) {
  const project = bySlug.get(slug);
  const state = states.get(slug);
  if (!project || !state) throw new Error('Projeto não encontrado no manifesto.');
  if (project.tipo === 'estatico') return state;
  if (state.estado === 'no-ar') return state;
  if (state.estado === 'iniciando') {
    if (waitUntilReady && state.job) await state.job;
    return state;
  }

  const generation = ++state.geracao;
  state.estado = 'iniciando';
  state.erro = '';
  state.solicitadaEm = Date.now();
  state.ultimaAtividade = Date.now();
  state.job = (async () => {
    try {
      await makeRoom(project, generation, force);
      if (generation !== state.geracao || shuttingDown) return;

      const requiredRss = heapMb(project.memoria) + STARTUP_RESERVE_MB;
      if (requiredRss > MEMORY_LIMIT_MB) {
        throw new Error(`A memória configurada para ${slug} mais a reserva mínima excede MEM_LIMIT_MB=${MEMORY_LIMIT_MB}.`);
      }
      let currentRss = totalRssMb();
      while (currentRss + requiredRss > MEMORY_LIMIT_MB && activeApps(slug).length > 0) {
        const oldest = activeApps(slug)[0];
        if (oldest) await stopApp(oldest, 'limite de memória');
        currentRss = totalRssMb();
      }
      if (generation !== state.geracao || shuttingDown) return;

      const child = launchProcess(project);
      state.processo = child;
      state.pid = child.pid;
      childLog(slug, child.stdout, 'stdout');
      childLog(slug, child.stderr, 'stderr');
      child.once('error', (error) => {
        if (state.processo === child) {
          state.erro = `Não foi possível iniciar: ${error.message}`;
          state.estado = 'erro';
        }
      });
      child.once('exit', (code, signal) => {
        if (state.processo !== child) return;
        state.processo = null;
        state.pid = null;
        state.rssMb = 0;
        if (state.estado !== 'encerrando' && !shuttingDown) {
          state.estado = code === 0 ? 'parada' : 'erro';
          state.erro = code === 0 ? '' : `A aplicação encerrou inesperadamente (${signal || `código ${code}`}).`;
          if (state.estado === 'erro') state.iniciadaEm = null;
        }
      });

      await waitForHealth(project, state, generation, child);
      if (generation !== state.geracao || shuttingDown) return;
      state.estado = 'no-ar';
      state.iniciadaEm = Date.now();
      state.ultimaAtividade = Date.now();
      console.log(`[orquestrador] ${slug} está no ar na porta ${project.porta}.`);
      await enforceMemoryLimit();
    } catch (error) {
      if (generation === state.geracao && !shuttingDown) {
        state.erro = error.message;
        state.estado = 'erro';
        if (state.processo) {
          const child = state.processo;
          child.kill('SIGTERM');
          await waitForExit(child, KILL_TIMEOUT_MS);
          if (state.processo === child) state.processo = null;
          state.pid = null;
          state.rssMb = 0;
        }
        console.error(`[orquestrador] Falha ao iniciar ${slug}: ${error.message}`);
      }
    } finally {
      if (state.geracao === generation) state.job = null;
    }
  })();
  if (waitUntilReady) await state.job;
  return state;
}

async function enforceMemoryLimit() {
  let total = totalRssMb();
  while (total > MEMORY_LIMIT_MB) {
    const oldest = [...states.values()]
      .filter((state) => state.processo && state.estado === 'no-ar')
      .sort((left, right) => (left.solicitadaEm || 0) - (right.solicitadaEm || 0))[0];
    if (!oldest) break;
    console.warn(`[orquestrador] RSS das JVMs (${total} MB) excedeu MEM_LIMIT_MB=${MEMORY_LIMIT_MB}; encerrando ${oldest.slug}.`);
    await stopApp(oldest, 'limite de memória');
    total = totalRssMb();
  }
}

function statusPayload() {
  const apps = projects.map((project) => {
    const state = states.get(project.slug);
    state.rssMb = readRssMb(state.pid);
    return {
      slug: state.slug,
      tipo: state.tipo,
      estado: state.estado,
      porta: state.porta,
      pid: state.pid,
      rssMb: state.rssMb,
      iniciadaEm: state.iniciadaEm,
      ultimaAtividade: state.ultimaAtividade,
      erro: state.erro
    };
  });
  return {
    modo: MODE,
    maxApps: MAX_APPS,
    memLimitMb: MEMORY_LIMIT_MB,
    rssTotalMb: apps.reduce((total, app) => total + app.rssMb, 0),
    encerrando,
    apps
  };
}

function clientIp(request) {
  return request.headers['x-real-ip'] || request.socket.remoteAddress || 'desconhecido';
}

function withinRateLimit(request) {
  const now = Date.now();
  const ip = clientIp(request);
  const recent = (rateHistory.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateHistory.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateHistory.set(ip, recent);
  return true;
}

const server = http.createServer(async (request, response) => {
  request.resume();
  const url = new URL(request.url, 'http://localhost');
  if (request.method === 'GET' && url.pathname === '/healthz') {
    response.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-store' });
    response.end('ok\n');
    return;
  }
  if (request.method === 'GET' && url.pathname === '/_status') {
    jsonResponse(response, 200, statusPayload());
    return;
  }

  const touch = /^\/_internal\/touch\/([a-z0-9-]+)$/.exec(url.pathname);
  if (touch && ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(request.method) && bySlug.has(touch[1])) {
    const project = bySlug.get(touch[1]);
    const state = states.get(touch[1]);
    if (project.tipo !== 'estatico' && state.processo) state.ultimaAtividade = Date.now();
    response.writeHead(204);
    response.end();
    return;
  }

  const control = /^\/_api\/apps\/([a-z0-9-]+)\/(start|stop)$/.exec(url.pathname);
  if (request.method === 'POST' && control) {
    if (!withinRateLimit(request)) {
      jsonResponse(response, 429, { erro: 'Muitas solicitações. Aguarde um minuto antes de tentar novamente.' });
      return;
    }
    const [, slug, action] = control;
    const project = bySlug.get(slug);
    if (!project) {
      jsonResponse(response, 404, { erro: 'Projeto não encontrado no manifesto.' });
      return;
    }
    if (project.tipo === 'estatico') {
      jsonResponse(response, 400, { erro: 'Esta aplicação é estática e já está disponível.' });
      return;
    }
    if (action === 'start') {
      const state = await startApp(slug);
      jsonResponse(response, 202, { slug, estado: state.estado });
      return;
    }
    const state = states.get(slug);
    await stopApp(state, 'solicitação');
    jsonResponse(response, 200, { slug, estado: state.estado });
    return;
  }

  jsonResponse(response, 404, { erro: 'Rota não encontrada.' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[orquestrador] Controle local disponível na porta ${PORT}; modo=${MODE}, MAX_APPS=${MAX_APPS}, MEM_LIMIT_MB=${MEMORY_LIMIT_MB}.`);
  if (MODE === 'sempre-ligado') {
    projects.filter((project) => project.tipo !== 'estatico')
      .reduce((promise, project) => promise.then(() => startApp(project.slug, true, true)), Promise.resolve())
      .catch((error) => console.error(`[orquestrador] Inicialização sempre-ligado falhou: ${error.message}`));
  }
});

setInterval(() => {
  if (MODE === 'sob-demanda') {
    const idleForMs = IDLE_MINUTES * 60_000;
    for (const state of states.values()) {
      if (state.estado === 'no-ar' && state.ultimaAtividade && Date.now() - state.ultimaAtividade >= idleForMs) {
        console.log(`[orquestrador] Encerrando ${state.slug} após ${IDLE_MINUTES} minutos sem atividade.`);
        stopApp(state, 'ociosidade').catch((error) => console.error(`[orquestrador] Erro ao encerrar ${state.slug}: ${error.message}`));
      }
    }
  }
  enforceMemoryLimit().catch((error) => console.error(`[orquestrador] Erro no guard-rail de memória: ${error.message}`));
}, 2_000).unref();

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateHistory) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (recent.length) rateHistory.set(ip, recent);
    else rateHistory.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[orquestrador] Recebido ${signal}; encerrando aplicações.`);
  server.close();
  await Promise.all([...states.values()].filter((state) => state.processo).map((state) => stopApp(state, 'desligamento')));
  const nginx = spawn('nginx', ['-s', 'quit'], { stdio: 'ignore' });
  await waitForExit(nginx, 2_000);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
