const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT, assignPorts, loadAndValidate } = require('./validate');

const siteDir = process.argv[2] || path.join(REPO_ROOT, 'site');
const projects = assignPorts(loadAndValidate());
const presentationPath = path.join(__dirname, 'apresentacao.json');
const presentation = JSON.parse(fs.readFileSync(presentationPath, 'utf8'));
const tasks = projects.map((project) => {
  const details = presentation[project.slug] || {};
  return {
    id: project.slug,
    visivel: project.visivel !== false,
    rotulo: project.rotulo || project.titulo,
    titulo: project.titulo,
    tipo: details.tipo || project.tipo,
    resumo: details.resumo || '',
    pasta: project.pasta,
    tecnologias: details.tecnologias || (project.java ? [`Java ${project.java}`] : []),
    integrantes: details.integrantes || [],
    requisitos: details.requisitos || [],
    executar: details.executar || [],
    abrirEm: details.abrirEm || '/',
    acesso: details.acesso,
    roteiro: details.roteiro || [],
    endpoints: details.endpoints || [],
    documentos: details.documentos || [],
    estrutura: details.estrutura || [],
    observacoes: details.observacoes || [],
    local: `/${project.slug}`
  };
});

fs.mkdirSync(siteDir, { recursive: true });
let html = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');

const actionsStart = html.indexOf('    var acoes = "";', html.indexOf('  function renderDetalhe(t) {'));
const captureStart = html.indexOf('    var captura = "";', actionsStart);
if (actionsStart < 0 || captureStart < 0) {
  throw new Error('Não foi possível localizar o bloco de ações no index.html para gerar os controles de inicialização.');
}

const actionCode = `    var statusApp = estadoApps[t.id] || { estado: "parada" };
    var appBase = "/" + encodeURIComponent(t.id) + "/";
    var caminhoInicial = String(t.abrirEm || "/").replace(/^\\/+/, "");
    var urlApp = appBase + caminhoInicial;
    var acoes = "";
    if (statusApp.estatico || statusApp.estado === "no-ar") {
      acoes += '<a class="btn primario" href="' + esc(urlApp) + '">Abrir</a>';
      if (!statusApp.estatico) acoes += '<button type="button" class="btn" data-app-action="stop" data-slug="' + esc(t.id) + '">Parar</button>';
    } else {
      var textoBotao = statusApp.estado === "iniciando" ? (servidorAcordando ? "Acordando o servidor…" : "Iniciando…") :
        statusApp.estado === "encerrando" ? "Encerrando…" :
        statusApp.estado === "erro" ? "Falha ao iniciar — tentar novamente" : "Iniciar e abrir";
      acoes += '<button type="button" class="btn primario" data-app-action="start" data-slug="' + esc(t.id) + '"' +
        ((statusApp.estado === "iniciando" || statusApp.estado === "encerrando") ? " disabled" : "") + '>' + esc(textoBotao) + '</button>';
    }
    if (REPO) acoes += '<a class="btn" href="' + esc(urlGithub("tree", t.pasta)) + '" target="_blank" rel="noopener">' + ICO.github + "Ver no GitHub</a>";
    if (statusApp.erro) acoes += '<p class="aviso" role="alert">' + esc(statusApp.erro) + '</p>';
    if (estadoEncerrando) acoes += '<p class="aviso" aria-live="polite">' + esc(estadoEncerrando) + '</p>';
`;
html = `${html.slice(0, actionsStart)}${actionCode}${html.slice(captureStart)}`;

const detailMarker = '  function renderDetalhe(t) {';
const controlCode = `  var estadoApps = {};
  var estadoEncerrando = "";
  var servidorAcordando = false;
  var navegacaoPendente = null;
  var acaoEmAndamento = {};

  function atualizarEstados(payload) {
    if (!payload || !Array.isArray(payload.apps)) return;
    var encerramentoNovo = payload.encerrando ? "Encerrando " + payload.encerrando + "…" : "";
    var mudou = encerramentoNovo !== estadoEncerrando;
    estadoEncerrando = encerramentoNovo;
    payload.apps.forEach(function (app) {
      var anterior = estadoApps[app.slug] || {};
      if (anterior.estado !== app.estado || anterior.erro !== (app.erro || "") || anterior.estatico !== (app.tipo === "estatico")) mudou = true;
      estadoApps[app.slug] = {
        estado: app.estado,
        erro: app.erro || "",
        estatico: app.tipo === "estatico"
      };
    });
    TODAS.forEach(function (t) {
      if (!estadoApps[t.id]) {
        estadoApps[t.id] = { estado: "parada", erro: "" };
        mudou = true;
      }
    });
    if (navegacaoPendente && estadoApps[navegacaoPendente.slug] && estadoApps[navegacaoPendente.slug].estado === "no-ar") {
      var destino = navegacaoPendente.url;
      navegacaoPendente = null;
      window.location.assign(destino);
      return;
    }
    if (mudou && selecionada) {
      var tarefaAtual = porId(selecionada);
      if (tarefaAtual) renderDetalhe(tarefaAtual);
    }
  }

  function consultarEstado() {
    var resolvido = false;
    var espera = setTimeout(function () {
      if (!resolvido) {
        servidorAcordando = true;
        if (selecionada) {
          var tarefa = porId(selecionada);
          if (tarefa) renderDetalhe(tarefa);
        }
      }
    }, 5000);
    fetch("/_status", { cache: "no-store" }).then(function (resposta) {
      if (!resposta.ok) throw new Error("O servidor respondeu com erro ao consultar o estado.");
      return resposta.json();
    }).then(atualizarEstados).catch(function () {
      if (navegacaoPendente) {
        estadoApps[navegacaoPendente.slug] = {
          estado: "erro",
          erro: "Não foi possível consultar o estado do servidor. Tente novamente."
        };
        navegacaoPendente = null;
        if (selecionada) {
          var tarefa = porId(selecionada);
          if (tarefa) renderDetalhe(tarefa);
        }
      }
    }).finally(function () {
      resolvido = true;
      clearTimeout(espera);
      if (servidorAcordando) {
        servidorAcordando = false;
        if (selecionada) {
          var tarefa = porId(selecionada);
          if (tarefa) renderDetalhe(tarefa);
        }
      }
    });
  }

  function executarAcao(slug, acao) {
    if (acaoEmAndamento[slug]) return;
    acaoEmAndamento[slug] = true;
    if (acao === "start") {
      var tarefa = porId(slug);
      var sufixo = tarefa ? String(tarefa.abrirEm || "/").replace(/^\\/+/, "") : "";
      var destino = "/" + encodeURIComponent(slug) + "/" + sufixo;
      navegacaoPendente = { slug: slug, url: destino };
      estadoApps[slug] = { estado: "iniciando", erro: "" };
      if (selecionada) renderDetalhe(porId(selecionada));
    } else {
      estadoApps[slug] = { estado: "encerrando", erro: "" };
      if (selecionada) renderDetalhe(porId(selecionada));
    }
    var endpoint = acao === "start" ? "start" : "stop";
    fetch("/_api/apps/" + encodeURIComponent(slug) + "/" + endpoint, { method: "POST" })
      .then(function (resposta) {
        return resposta.json().then(function (dados) {
          if (!resposta.ok) throw new Error(dados.erro || "A solicitação não foi aceita.");
          return dados;
        });
      })
      .then(function () { consultarEstado(); })
      .catch(function (erro) {
        navegacaoPendente = null;
        estadoApps[slug] = {
          estado: "erro",
          erro: erro && erro.message ? erro.message : "Não foi possível iniciar a aplicação."
        };
        if (selecionada) renderDetalhe(porId(selecionada));
      })
      .finally(function () { delete acaoEmAndamento[slug]; });
  }

`;
if (!html.includes(detailMarker)) throw new Error('Não foi possível localizar a função de detalhe no index.html.');
html = html.replace(detailMarker, `${controlCode}${detailMarker}`);

const detailClick = '    if (e.target.closest("[data-voltar]")) { voltarParaLista(); return; }';
if (!html.includes(detailClick)) throw new Error('Não foi possível localizar os eventos do painel de detalhes.');
html = html.replace(detailClick, `${detailClick}
    var acao = e.target.closest("[data-app-action]");
    if (acao) {
      executarAcao(acao.getAttribute("data-slug"), acao.getAttribute("data-app-action"));
      return;
    }`);

const startMarker = '  renderFiltros();\n  aplicar(idDoHash(), false);';
if (!html.includes(startMarker)) throw new Error('Não foi possível localizar o início do menu.');
html = html.replace(startMarker, `  consultarEstado();
  window.setInterval(consultarEstado, 2000);
${startMarker}`);

fs.writeFileSync(path.join(siteDir, 'index.html'), html);
fs.writeFileSync(path.join(siteDir, 'tarefas.js'),
  `window.DIAW_CONFIG = ${JSON.stringify({
    titulo: 'Trabalhos de DIAW',
    curso: 'Engenharia de Software, PUC Minas',
    periodo: '2026.2',
    repositorio: 'https://github.com/Vfrios/DIAW',
    branch: 'main'
  }, null, 2)};\nwindow.DIAW_TAREFAS = ${JSON.stringify(tasks, null, 2)};\n`);

console.log(`Menu gerado com ${tasks.length} projetos.`);
