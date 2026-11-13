#!/bin/sh
set -eu

BASE_PORT="${PORT_TESTE:-18080}"
BASE_URL="http://127.0.0.1:${BASE_PORT}"
CONTAINER="diaw-completo-teste-$$"

if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: instale o Docker para executar os testes de integração." >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "Erro: curl é necessário para executar os testes." >&2
  exit 1
fi
for variable in SPRING_DATASOURCE_URL SPRING_DATASOURCE_USERNAME SPRING_DATASOURCE_PASSWORD JWT_SECRET POKEDEX_MONGODB_URI MATRICULAS_MONGODB_URI; do
  eval "value=\${$variable-}"
  if [ -z "$value" ]; then
    echo "Erro: defina $variable no ambiente antes do teste (o script não lê nem exibe arquivos .env)." >&2
    exit 1
  fi
done

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "==> Construindo a imagem Docker"
docker build -t diaw-completo:teste .

echo "==> Iniciando o container local"
docker run -d --name "$CONTAINER" \
  -p "127.0.0.1:${BASE_PORT}:10000" \
  -e PORT=10000 \
  -e MODO=sob-demanda \
  -e MAX_APPS=2 \
  -e MEM_LIMIT_MB=360 \
  -e IDLE_MINUTOS=10 \
  -e SPRING_DATASOURCE_URL \
  -e SPRING_DATASOURCE_USERNAME \
  -e SPRING_DATASOURCE_PASSWORD \
  -e JWT_SECRET \
  -e POKEDEX_MONGODB_URI \
  -e MATRICULAS_MONGODB_URI \
  -e MAIL_USERNAME \
  -e MAIL_PASSWORD \
  -e MAIL_TO \
  diaw-completo:teste >/dev/null

ready=0
attempt=0
while [ "$attempt" -lt 90 ]; do
  if curl --silent --fail "$BASE_URL/healthz" >/dev/null 2>&1; then ready=1; break; fi
  attempt=$((attempt + 1))
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "Erro: /healthz não respondeu. Logs do container:" >&2
  docker logs "$CONTAINER" >&2
  exit 1
fi

curl --silent --fail "$BASE_URL/" | grep -q "Trabalhos de DIAW"
curl --silent --fail "$BASE_URL/pokedex-react/" | grep -q "root"
curl --silent --fail "$BASE_URL/pokedex-react/" | grep -q "Voltar ao menu"
curl --silent --fail "$BASE_URL/_status" | node -e '
let data = ""; process.stdin.on("data", chunk => data += chunk).on("end", () => {
  const status = JSON.parse(data);
  const ativos = status.apps.filter(app => app.tipo !== "estatico" && app.estado !== "parada");
  if (ativos.length) { console.error("Havia JVM/processo ativo logo após o boot."); process.exit(1); }
  console.log("Boot sem processos de projeto: confirmado.");
});'
echo "Menu, /healthz, Pokédex estática e estado inicial: OK"

wait_app() {
  slug="$1"
  attempt=0
  while [ "$attempt" -lt 100 ]; do
    state="$(curl --silent --fail "$BASE_URL/_status" | node -e '
      let data = ""; process.stdin.on("data", chunk => data += chunk).on("end", () => {
        const status = JSON.parse(data);
        const app = status.apps.find(item => item.slug === process.argv[1]);
        if (!app) { console.log("ausente"); process.exit(2); }
        console.log(app.estado + (app.erro ? ":" + app.erro : ""));
      });' "$slug")"
    case "$state" in
      no-ar) return 0 ;;
      erro:*) echo "Falha ao iniciar $slug: ${state#erro:}" >&2; return 1 ;;
    esac
    attempt=$((attempt + 1))
    sleep 1
  done
  echo "Tempo esgotado aguardando $slug. Estado: $state" >&2
  return 1
}

check_app() {
  slug="$1"
  path="$2"
  echo "==> Iniciando e verificando /${slug}${path}"
  curl --silent --show-error --fail -X POST "$BASE_URL/_api/apps/${slug}/start" >/dev/null
  wait_app "$slug"
  curl --silent --show-error --fail "$BASE_URL/${slug}${path}" >/dev/null
}

check_app lab2 /
check_app portfolio /api/portfolio
check_app trabalho1-clima /clima/belo-horizonte
check_app trabalho2-auralogin /login
curl --silent --show-error --fail "$BASE_URL/trabalho2-auralogin/login" | grep -q "Voltar ao menu"
check_app pokedex /
curl --silent --show-error --fail "$BASE_URL/pokedex/api/pokemons" | node -e '
let data = ""; process.stdin.on("data", chunk => data += chunk).on("end", () => {
  if (!Array.isArray(JSON.parse(data))) process.exit(1);
});'
check_app sistema-matriculas /
curl --silent --show-error --fail "$BASE_URL/sistema-matriculas/login" | grep -q "root"
curl --silent --show-error --fail "$BASE_URL/sistema-matriculas/aluno" | grep -q "root"
code="$(curl --silent -o /dev/null -w '%{http_code}' "$BASE_URL/sistema-matriculas/api/auth/me")"
[ "$code" = "401" ] || { echo "API de matrículas sem autenticação deveria responder 401, recebeu $code" >&2; exit 1; }
echo "Rotas das aplicações JVM e autenticação de matrículas: OK"

echo "==> Medindo duas JVMs simultâneas (Clima e AuraLogin)"
curl --silent --show-error --fail -X POST "$BASE_URL/_api/apps/trabalho1-clima/stop" >/dev/null
curl --silent --show-error --fail -X POST "$BASE_URL/_api/apps/trabalho2-auralogin/stop" >/dev/null
curl --silent --show-error --fail -X POST "$BASE_URL/_api/apps/trabalho1-clima/start" >/dev/null
wait_app trabalho1-clima
curl --silent --show-error --fail -X POST "$BASE_URL/_api/apps/trabalho2-auralogin/start" >/dev/null
wait_app trabalho2-auralogin

curl --silent --fail "$BASE_URL/_status" | node -e '
let data = ""; process.stdin.on("data", chunk => data += chunk).on("end", () => {
  const status = JSON.parse(data);
  const active = status.apps.filter(app => app.estado === "no-ar" && app.tipo !== "estatico");
  console.log(`RSS somado das aplicações: ${status.rssTotalMb} MB (limite ${status.memLimitMb} MB).`);
  if (status.rssTotalMb > status.memLimitMb || active.length < 2) {
    console.warn("Aviso: duas JVMs excederam o limite ou não permaneceram ativas. Configure MAX_APPS=1 no plano Free.");
  }
});'

echo "Testes concluídos. O container será removido ao sair."
