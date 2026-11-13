/* =====================================================================
   DIAW 2026.2 — cadastro das tarefas exibidas no menu (index.html)

   COMO ADICIONAR UMA TAREFA NOVA
   1. Copie o bloco MODELO que está no fim deste arquivo.
   2. Cole dentro da lista DIAW_TAREFAS e preencha os campos.
   3. Pronto: ela aparece no menu, na busca e nos filtros sozinha.

   Para preparar uma tarefa sem mostrá-la ainda, use  visivel: false.
   Todos os campos são opcionais, menos id, rotulo, titulo e pasta.
   O que não for preenchido simplesmente não aparece na tela.
   ===================================================================== */

window.DIAW_CONFIG = {
  titulo: "Trabalhos de DIAW",
  curso: "Engenharia de Software, PUC Minas",
  periodo: "2026.2",
  repositorio: "https://github.com/Vfrios/DIAW",
  branch: "main"
};

window.DIAW_TAREFAS = [

  {
    id: "pokedex",
    visivel: true,
    rotulo: "Atividade 04",
    titulo: "Pokédex Full Stack",
    tipo: "Full-stack",
    resumo: "Pokédex com API Spring Boot, interface React e dados persistidos no MongoDB.",
    pasta: "pokedex",
    demo: {
      url: "https://diaw-completo.onrender.com/#pokedex",
      aviso: "Abra no menu online e clique em Iniciar e abrir."
    },
    tecnologias: ["Java 17", "Spring Boot 3.3", "React 18", "Vite 5", "MongoDB Atlas"],
    requisitos: ["Java 17", "Maven", "Node.js", "MongoDB Atlas"],
    executar: [
      { titulo: "Backend", comando: "cd pokedex/backend && mvn spring-boot:run" },
      { titulo: "Frontend", comando: "cd pokedex/frontend && npm install && npm run dev" }
    ],
    local: "http://localhost:5173",
    documentos: [{ nome: "README do projeto", caminho: "README.md" }]
  },

  {
    id: "sistema-matriculas",
    visivel: true,
    rotulo: "Laboratório 03",
    titulo: "Sistema de Matrículas",
    tipo: "Full-stack",
    resumo: "Gestão de cursos, disciplinas, períodos e matrículas com acesso de aluno, professor e secretaria.",
    pasta: "sistema-matriculas",
    demo: {
      url: "https://diaw-completo.onrender.com/#sistema-matriculas",
      aviso: "Abra no menu online e clique em Iniciar e abrir."
    },
    tecnologias: ["Java 25", "Spring Boot 4.0", "React 19", "Vite 7", "MongoDB Atlas"],
    requisitos: ["Java 25", "Maven", "Node.js", "MongoDB Atlas"],
    executar: [
      { titulo: "Backend", comando: "cd sistema-matriculas/backend && mvn spring-boot:run" },
      { titulo: "Frontend", comando: "cd sistema-matriculas/frontend && npm install && npm run dev" }
    ],
    local: "http://localhost:5173",
    acesso: {
      usuario: "secretaria",
      senha: "secretaria123",
      nota: "Professor: prof.aramuni / prof123. Aluno: aluno1 / aluno123."
    },
    documentos: [{ nome: "README do projeto", caminho: "README.md" }]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "clima",
    visivel: true,
    rotulo: "Trabalho 1",
    titulo: "API de Clima de Belo Horizonte",
    tipo: "API REST",
    resumo:
      "API REST em Spring Boot que consulta a previsão do tempo de Belo Horizonte na Open-Meteo, " +
      "uma API pública que não exige chave, e devolve os dados já tratados em JSON.",
    pasta: "Trabalho 1 - API CLIMA",
    demo: {
      url: "https://diaw-completo.onrender.com/#trabalho1-clima",
      aviso: "Abra o projeto no menu online e clique em Iniciar e abrir. No plano gratuito, a primeira abertura pode levar alguns instantes."
    },
    tecnologias: ["Java 17", "Spring Boot 3.3", "Maven", "RestTemplate", "Open-Meteo"],
    integrantes: ["Brayan Mendes de Carvalho", "Vitor de Freitas Rios"],
    requisitos: ["Java 17", "Maven"],
    executar: [
      { titulo: "Entre na pasta do projeto", comando: 'cd "Trabalho 1 - API CLIMA"' },
      { titulo: "Inicie a aplicação", comando: "mvn spring-boot:run" }
    ],
    local: "http://localhost:8080",
    endpoints: [
      { metodo: "GET", caminho: "/clima", descricao: "Clima atual de Belo Horizonte, a cidade padrão da atividade.", abrir: true },
      { metodo: "GET", caminho: "/clima/belo-horizonte", descricao: "O mesmo resultado, com o nome da cidade explícito.", abrir: true },
      { metodo: "GET", caminho: "/clima/cidade?nome=Rio%20de%20Janeiro&latitude=-22.9068&longitude=-43.1729", descricao: "Desafio extra: clima de outra cidade, informando nome e coordenadas.", abrir: true }
    ],
    documentos: [
      { nome: "README do projeto", caminho: "README.md" }
    ],
    estrutura: [
      { caminho: "src/main/java/controller", descricao: "Endpoints REST (ClimaController)" },
      { caminho: "src/main/java/service", descricao: "Integração com a Open-Meteo e regras de negócio" },
      { caminho: "src/main/java/dto", descricao: "Objetos de resposta da API e da API externa" },
      { caminho: "src/main/java/exception", descricao: "Tratamento de erros quando a API externa falha" }
    ],
    observacoes: [
      "Precisa de internet para consultar a Open-Meteo."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "auralogin",
    visivel: true,
    rotulo: "Trabalho 2",
    titulo: "AuraLogin: login e cadastro",
    tipo: "Web MVC",
    resumo:
      "Aplicação de login, cadastro e recuperação de senha com Spring Security. " +
      "As senhas são guardadas com BCrypt e os dados ficam num banco H2 em memória.",
    pasta: "Trabalho2 - AuraLogin",
    demo: {
      url: "https://diaw-completo.onrender.com/#trabalho2-auralogin",
      aviso: "Abra o projeto no menu online e clique em Iniciar e abrir. No plano gratuito, a primeira abertura pode levar alguns instantes."
    },
    tecnologias: ["Java 17", "Spring Boot 3.3", "Spring Security", "Spring Data JPA", "H2", "Thymeleaf", "BCrypt"],
    integrantes: ["Vitor de Freitas Rios", "Brayan Mendes de Carvalho"],
    requisitos: ["Java 17", "Maven"],
    executar: [
      { titulo: "Entre na pasta do projeto", comando: 'cd "Trabalho2 - AuraLogin"' },
      { titulo: "Inicie a aplicação", comando: "mvn spring-boot:run" }
    ],
    local: "http://localhost:8080",
    abrirEm: "/login",
    acesso: {
      usuario: "demo",
      senha: "demo1234",
      nota: "Usuário criado automaticamente na inicialização. Também dá para criar uma conta nova em “Criar conta”."
    },
    endpoints: [
      { metodo: "GET", caminho: "/login", descricao: "Tela de login.", abrir: true },
      { metodo: "GET", caminho: "/register", descricao: "Tela de cadastro.", abrir: true },
      { metodo: "GET", caminho: "/recoverpassword", descricao: "Tela de recuperação de senha.", abrir: true },
      { metodo: "GET", caminho: "/home", descricao: "Área protegida, só para quem está logado.", abrir: true },
      { metodo: "POST", caminho: "/logout", descricao: "Encerra a sessão." }
    ],
    documentos: [
      { nome: "README do projeto", caminho: "README.md" }
    ],
    estrutura: [
      { caminho: "src/main/java/auralogin/config", descricao: "Configuração do Spring Security" },
      { caminho: "src/main/java/auralogin/controller", descricao: "Login, cadastro, recuperação e home" },
      { caminho: "src/main/java/auralogin/model", descricao: "Entidade User" },
      { caminho: "src/main/java/auralogin/repository", descricao: "Acesso ao banco (JPA)" },
      { caminho: "src/main/java/auralogin/service", descricao: "Carregamento do usuário para autenticação" },
      { caminho: "src/main/resources/templates", descricao: "Telas em Thymeleaf" }
    ],
    observacoes: [
      "O banco H2 fica em memória: os cadastros somem quando a aplicação reinicia.",
      "A recuperação de senha é simulada. Nenhum e-mail é enviado de verdade."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "candidatos",
    visivel: true,
    rotulo: "AV1 (B)",
    titulo: "Candidatos TSE: perfil dos candidatos",
    tipo: "Web MVC",
    resumo:
      "Lê o CSV de candidatos do TSE (Minas Gerais, 2026) e mostra o perfil de cada um numa tela única, " +
      "com a foto oficial e filtros por gênero, escolaridade e faixa etária.",
    pasta: "ATV1B",
    demo: {
      url: "https://diaw-completo.onrender.com/#atv1b",
      aviso: "Abra o projeto no menu online e clique em Iniciar e abrir. No plano gratuito, a primeira abertura pode levar alguns instantes."
    },
    tecnologias: ["Java 25", "Spring Boot 3.5", "Thymeleaf", "opencsv", "Maven"],
    requisitos: ["Java 25", "Maven"],
    executar: [
      { titulo: "Entre na pasta do projeto", comando: "cd ATV1B" },
      { titulo: "Inicie a aplicação", comando: "mvn spring-boot:run" }
    ],
    local: "http://localhost:8080",
    abrirEm: "/",
    endpoints: [
      { metodo: "GET", caminho: "/", descricao: "Tela única. Aceita os filtros genero, escolaridade, idadeMin e idadeMax.", abrir: true },
      { metodo: "GET", caminho: "/?genero=FEMININO&escolaridade=SUPERIOR+COMPLETO&idadeMin=30&idadeMax=45", descricao: "Exemplo com todos os filtros combinados.", abrir: true }
    ],
    documentos: [
      { nome: "Enunciado da AV1 (PDF)", caminho: "AV1_DIAW_B.pdf" },
      { nome: "README do projeto", caminho: "README.md" },
      { nome: "Captura da tela inicial", caminho: "prints/index.png" }
    ],
    captura: { caminho: "prints/index.png", legenda: "Tela única: filtros à esquerda e cards dos candidatos à direita." },
    estrutura: [
      { caminho: "src/main/java/com/example/CandidatosTSE", descricao: "application, controller, model e service" },
      { caminho: "src/main/resources/data/candidatos", descricao: "CSV oficial do TSE (candidatos de MG, 2026)" },
      { caminho: "src/main/resources/static/images/candidatos", descricao: "Fotos oficiais dos candidatos" },
      { caminho: "src/main/resources/templates/index.html", descricao: "Tela com painel de filtros e lista" },
      { caminho: "prints", descricao: "Captura de tela da aplicação" }
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "pokedex-react",
    visivel: true,
    rotulo: "Atividade 03",
    titulo: "Pokédex React",
    tipo: "Aplicação web",
    resumo:
      "Pokédex interativa com busca, filtro por tipo, detalhes e atributos dos 151 Pokémon, " +
      "área de treinadores e favoritos.",
    pasta: "pokedex-react",
    demo: {
      url: "https://diaw-completo.onrender.com/#pokedex-react",
      aviso: "A Pokédex é servida como aplicação estática e abre diretamente no menu online."
    },
    tecnologias: ["React", "Vite", "JavaScript"],
    integrantes: ["Vitor Rios", "Brayan Mendes"],
    requisitos: ["Node.js"],
    executar: [
      { titulo: "Entre na pasta do projeto", comando: "cd pokedex-react" },
      { titulo: "Instale as dependências", comando: "npm install" },
      { titulo: "Inicie a aplicação", comando: "npm run dev" }
    ],
    local: "http://localhost:5173",
    abrirEm: "/",
    documentos: [
      { nome: "README do projeto", caminho: "README.md" }
    ],
    estrutura: [
      { caminho: "src/components", descricao: "Componentes da interface" },
      { caminho: "src/data/pokedex-data.json", descricao: "Dados locais dos Pokémon e treinadores" }
    ],
    observacoes: [
      "As imagens são carregadas da PokéAPI; os dados locais continuam disponíveis sem internet."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "portfolio",
    visivel: true,
    rotulo: "Portfólio",
    titulo: "Portfólio profissional de Vitor Rios",
    tipo: "Full-stack",
    resumo:
      "Site de portfólio em português e inglês, com páginas Sobre mim, Projetos, Experiências e Contato. " +
      "O formulário de contato valida os campos e envia a mensagem por e-mail.",
    pasta: "portfolio-vitor",
    demo: {
      url: "https://diaw-completo.onrender.com/#portfolio",
      aviso: "Abra o projeto no menu online e clique em Iniciar e abrir. No plano gratuito, a primeira abertura pode levar alguns instantes."
    },
    tecnologias: ["Java 21", "Spring Boot 3.5", "React 19", "Vite 7", "React Router 7", "Spring Mail", "Docker", "Render"],
    integrantes: ["Vitor de Freitas Rios"],
    requisitos: ["JDK 21", "Maven 3.9 ou superior"],
    executar: [
      { titulo: "Na raiz do repositório DIAW, inicie a aplicação", comando: "mvn -f portfolio-vitor/pom.xml spring-boot:run", nota: "O Maven instala sozinho o Node.js usado para compilar o front-end." }
    ],
    local: "http://localhost:8080",
    abrirEm: "/",
    endpoints: [
      { metodo: "GET", caminho: "/api/portfolio", descricao: "Textos, projetos e experiências do portfólio, lidos de portfolio.json.", abrir: true },
      { metodo: "POST", caminho: "/api/contact", descricao: "Valida e envia a mensagem do formulário de contato." }
    ],
    documentos: [
      { nome: "README do projeto", caminho: "README.md" }
    ],
    estrutura: [
      { caminho: "frontend", descricao: "Aplicação React e arquivos estáticos" },
      { caminho: "src/main/java", descricao: "Aplicação Spring Boot e endpoints" },
      { caminho: "src/main/resources/portfolio.json", descricao: "Conteúdo do portfólio" },
      { caminho: "Dockerfile e render.yaml", descricao: "Publicação no Render" }
    ],
    observacoes: [
      "O envio do formulário de contato depende de credenciais SMTP no ambiente. Para só ver o site, elas não são necessárias."
    ]
  },

  /* ------------------------------------------------------------------ */
  {
    id: "lab2",
    visivel: true,
    rotulo: "Laboratório 02",
    titulo: "DriveNow: sistema de aluguel de carros",
    tipo: "Full-stack",
    resumo:
      "Sistema web de gestão de aluguéis. Clientes criam e acompanham pedidos; empresas e bancos avaliam, " +
      "executam contratos e concedem crédito. Login com JWT, CRUD de cliente e banco no Supabase.",
    pasta: "LAB2",
    demo: {
      url: "https://diaw-completo.onrender.com/#lab2",
      aviso: "Abra o projeto no menu online e clique em Iniciar e abrir. No plano gratuito, a primeira abertura pode levar alguns instantes."
    },
    tecnologias: ["Java 25", "Spring Boot 4.0", "React 19", "Vite 7", "Supabase (PostgreSQL)", "JWT", "Maven", "pnpm"],
    integrantes: ["Vitor de Freitas Rios"],
    requisitos: ["JDK 25", "Maven 3.9 ou superior", "Node.js 20.19 ou superior", "pnpm", "Projeto Supabase configurado em backend/.env"],
    executar: [
      { titulo: "Entre na pasta do projeto", comando: "cd LAB2" },
      { titulo: "Instale as dependências", comando: "pnpm install" },
      { titulo: "Inicie back-end e front-end juntos", comando: "pnpm dev", nota: "Use Ctrl+C para encerrar os dois." }
    ],
    local: "http://localhost:5173",
    abrirEm: "/",
    roteiro: [
      "Cadastre uma conta Cliente e complete o cadastro (CPF, RG, endereço, profissão, rendimentos).",
      "Crie um pedido de aluguel. Ele nasce com o status Em análise.",
      "Saia e cadastre uma conta Banco (ou Empresa), abra o pedido, registre o parecer e execute o contrato.",
      "Volte como cliente e veja o status atualizado."
    ],
    endpoints: [
      { metodo: "POST", caminho: "/api/auth/register e /api/auth/login", descricao: "Cadastro e login, com token JWT." },
      { metodo: "GET", caminho: "/api/clientes", descricao: "CRUD de cliente (consultar, criar, alterar e excluir)." },
      { metodo: "GET", caminho: "/api/pedidos", descricao: "Pedidos de aluguel: criar, modificar, consultar, cancelar, avaliar e contratar." }
    ],
    documentos: [
      { nome: "README do projeto", caminho: "README.md" },
      { nome: "Casos de uso", caminho: "docs/casos-de-uso.md" },
      { nome: "Histórias de usuário", caminho: "docs/historias-de-usuario.md" },
      { nome: "Diagrama de classes", caminho: "docs/diagrama-de-classes.md" },
      { nome: "Diagrama de pacotes", caminho: "docs/diagrama-de-pacotes.md" },
      { nome: "Script de segurança do Supabase (RLS)", caminho: "docs/supabase-rls.sql" }
    ],
    estrutura: [
      { caminho: "backend", descricao: "Spring Boot: model, controller, service, repository e security" },
      { caminho: "frontend", descricao: "React + Vite: pages, components, context e services" },
      { caminho: "docs", descricao: "Modelagem UML e script do banco" },
      { caminho: "Dockerfile e render.yaml", descricao: "Publicação no Render" }
    ],
    observacoes: [
      "O banco é externo (Supabase), então rodar localmente exige internet."
    ]
  }

  /* ------------------------------------------------------------------
     MODELO PARA UMA TAREFA NOVA (copie, cole acima e preencha)

  ,{
    id: "nome-curto-sem-espaco",       // vira o link  index.html#nome-curto-sem-espaco
    visivel: true,                     // false = fica preparada, mas não aparece no menu
    rotulo: "Trabalho 3",
    titulo: "Nome da tarefa",
    tipo: "API REST",                  // agrupa nos filtros: "API REST", "Full-stack"...
    resumo: "Uma ou duas frases dizendo o que a tarefa entrega.",
    pasta: "Trabalho3 - NomeDaPasta",  // nome exato da pasta na raiz do repositório
    demo: { url: "https://...", aviso: "Opcional." },
    tecnologias: ["Java 21", "Spring Boot 3.5"],
    integrantes: ["Nome Sobrenome"],
    requisitos: ["Java 21", "Maven"],
    executar: [
      { titulo: "Entre na pasta", comando: 'cd "Trabalho3 - NomeDaPasta"' },
      { titulo: "Inicie", comando: "mvn spring-boot:run", nota: "Opcional." }
    ],
    local: "http://localhost:8080",    // endereço local depois de executar
    abrirEm: "/",                      // página inicial dentro do endereço local
    acesso: { usuario: "demo", senha: "demo1234", nota: "Opcional." },
    roteiro: ["Passo 1 para testar", "Passo 2 para testar"],
    endpoints: [
      { metodo: "GET", caminho: "/exemplo", descricao: "O que faz.", abrir: true }
    ],
    documentos: [
      { nome: "README do projeto", caminho: "README.md" },
      { nome: "Enunciado (PDF)", caminho: "enunciado.pdf" }
    ],
    captura: { caminho: "prints/index.png", legenda: "Opcional." },
    estrutura: [
      { caminho: "src/main/java", descricao: "Código do back-end" }
    ],
    observacoes: ["Algo que o professor deve saber antes de avaliar."]
  }

     ------------------------------------------------------------------ */
];
