# Um serviço Render para os projetos de DIAW

Este deploy publica o menu e os oito projetos num único Web Service Docker. O Nginx entrega o menu e a Pokédex estática; o orquestrador inicia os projetos Spring somente quando alguém seleciona **Iniciar e abrir**. Assim, o container não mantém as JVMs ligadas sem uso.

**Serviço publicado:** [https://diaw-completo.onrender.com](https://diaw-completo.onrender.com). Abra um projeto pelo menu; as aplicações Spring iniciam sob demanda.

As páginas HTML das aplicações incluem um botão fixo **Voltar ao menu**, inclusive a Pokédex, para retornar à tela de escolha sem depender da navegação do navegador.

Os projetos fonte não são alterados: o Docker build trabalha em cópias temporárias e adapta nelas os caminhos para `/<slug>/`. Para desenvolver localmente, continuam valendo os comandos originais de cada projeto.

| Projeto | Rota pública | Runtime |
|---|---|---|
| Perfil dos Candidatos TSE (`ATV1B`) | `/atv1b/` | Spring Boot, Java 25 |
| DriveNow (`LAB2`) | `/lab2/` | Spring Boot + React, Java 25 |
| Pokédex React | `/pokedex-react/` | React estático |
| Pokédex Full Stack (`pokedex`) | `/pokedex/` | Spring Boot + React, Java 17, MongoDB |
| Sistema de Matrículas | `/sistema-matriculas/` | Spring Boot + React, Java 25, MongoDB |
| Portfólio | `/portfolio/` | Spring Boot + React, Java 21 |
| API de clima | `/trabalho1-clima/` | Spring Boot, Java 17 |
| AuraLogin | `/trabalho2-auralogin/` | Spring Boot, Java 17 |

## Configuração do Render

Configure `POKEDEX_MONGODB_URI` com a URI completa do Atlas incluindo o banco `pokedex`, e `MATRICULAS_MONGODB_URI` incluindo o banco `sistema_matriculas`. As aplicações podem usar o mesmo cluster com bancos separados. Libere no Atlas o acesso de rede necessário para o Render e não publique as URIs no Git.

Os frontends novos são compilados dentro da imagem e incorporados aos respectivos JARs. Assets, APIs e rotas do React respeitam o subcaminho de cada projeto. Os dados de demonstração são criados na primeira inicialização de um banco vazio.

Conecte o repositório ao Blueprint da raiz (`render.yaml`) e use:

- Serviço: `diaw-completo`
- Branch: `main`
- Runtime: Docker
- Dockerfile: `./Dockerfile`
- Região: Oregon
- Plano inicial: Free
- Health check: `/healthz`
- Root Directory: em branco

Cadastre em **Environment Variables** os valores reais do seu Supabase para `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`. Cadastre também uma `JWT_SECRET` aleatória, longa e exclusiva, além de `MAIL_USERNAME`, `MAIL_PASSWORD` e `MAIL_TO` para habilitar o formulário de contato do portfólio. Os segredos não ficam no manifesto nem na imagem.

## Variáveis de execução

| Variável | Padrão | Uso |
|---|---:|---|
| `MODO` | `sob-demanda` | `sob-demanda` inicia cada JVM no clique e permite encerramento por ociosidade. `sempre-ligado` tenta iniciar todas as JVMs no boot e desativa o encerramento por ociosidade. |
| `MAX_APPS` | `2` | Máximo de processos de aplicações ativos simultaneamente no modo sob demanda; ao exceder, substitui o mais antigo (FIFO). |
| `MEM_LIMIT_MB` | `360` | Limite de RSS somado das aplicações monitoradas, mantendo margem para Nginx e Node no plano Free. Se excedido, encerra as mais antigas. |
| `IDLE_MINUTOS` | `10` | Minutos sem requisições para encerrar uma aplicação ociosa. |

O Free possui apenas 512 MB de RAM. O heap das JVMs é limitado individualmente no manifesto, mas o RSS inclui memória nativa, metaspace e threads. `MEM_LIMIT_MB=360` reserva espaço para o Nginx e o Node; `MAX_APPS=2` permite dois processos apenas quando o RSS cabe no limite. Se o guard-rail encerrar aplicações ou o container reiniciar, use `MAX_APPS=1`. O modo `sempre-ligado` não é recomendado no plano Free.

## Projetos no manifesto

`projetos.json` é a fonte de verdade de slugs, pastas, build, Java, artefatos, portas e variáveis. A apresentação do menu está em `apresentacao.json`; se um projeto novo não tiver uma entrada ali, o gerador usa título, tipo e tecnologia do manifesto.

Tipos aceitos: `spring`, `spring-react`, `estatico` e `custom`. Java 17, 21 e 25 têm etapas de build e JRE preparadas na imagem. Portas nulas são atribuídas deterministicamente, começando em 9001.

## Adicionar um projeto

1. Crie a pasta na raiz e coloque nela os arquivos fonte e de build.
2. Acrescente uma entrada com slug, pasta, tipo, comando `build` e, para Spring, versão Java, artefato, porta, memória e health check em `projetos.json`.
3. Ajuste o `env` e liste apenas os nomes de segredos em `envSecretas`; cadastre os valores pelo painel do Render.
4. Opcionalmente acrescente os textos do menu em `apresentacao.json`; o gerador tem campos padrão se isso for omitido.
5. Execute `sh deploy/testar.sh`, faça commit e push. O build valida o manifesto e gera o menu, as portas e o roteamento.

Para `spring-react`, `frontendBuild` pode compilar o front antes do Maven. Em `custom`, declare `start` e `healthcheck`; o comando roda dentro da cópia do projeto. Nunca inclua segredos em `build`, `start` ou no manifesto.

## Diagnóstico

- `GET /healthz`: saúde do serviço principal.
- `GET /_status`: modo, limite, RSS total e estado de cada projeto. Não retorna logs nem variáveis de ambiente.
- Os logs do Render são prefixados com `[slug]` para identificar a aplicação.
- Os endpoints `POST /_api/apps/<slug>/start` e `POST /_api/apps/<slug>/stop` aceitam somente slugs do manifesto e aplicam limite de chamadas por IP.
- O menu informa estados de inicialização/encerramento e atualiza o status por polling. O tempo de acordar o container Free e iniciar uma JVM é normal.

## Decisões de implementação

- Nginx é a única porta pública; cada backend recebe uma porta interna determinística para simplificar o roteamento.
- A fila FIFO é serializada pelo orquestrador para evitar duas inicializações simultâneas ultrapassarem `MAX_APPS`.
- `custom` copia apenas a pasta do projeto para a imagem; não exige editar Nginx ou Dockerfile para cada nova entrada.
- `projetos.modelo.json` é um exemplo em JSONC (com comentários); o manifesto de produção `projetos.json` é JSON válido.
