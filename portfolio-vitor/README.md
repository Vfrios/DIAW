# Portfólio Profissional — Vitor Rios

Site de portfólio com **Java (Spring Boot)** no back-end e **React** no front-end, desenvolvido para o Laboratório 01 de DIAW (PUC Minas).

## 🔗 Links

- Site publicado: _(adicionar o link após o deploy)_
- Repositório: _(adicionar o link do GitHub)_
- Protótipos no Figma: _(adicionar o link)_
- LinkedIn: https://www.linkedin.com/in/vitor-rios-dev · GitHub: https://github.com/Vfrios

## 📌 Sobre o projeto

O site tem quatro páginas, acessadas por um menu lateral (no celular vira um menu retrátil):

| Página | O que mostra |
| --- | --- |
| **Sobre mim** | Apresentação, formação, área de atuação, interesses e objetivo — em português e inglês (botão PT/EN) |
| **Projetos** | Timeline do mais antigo ao mais recente, com descrição, tecnologias, link do GitHub e imagem/GIF |
| **Experiências** | Instituição, atividade, período e descrição |
| **Contato** | Ícones de e-mail, LinkedIn, GitHub (e WhatsApp, se preenchido) + formulário que envia e-mail |

Todo o conteúdo fica em um único arquivo, `src/main/resources/portfolio.json`, e o React o consome pela API `GET /api/portfolio`.

## 🛠️ Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Back-end | Java 21, Spring Boot 3.5, Maven |
| Front-end | React 19, Vite 7, React Router 7 (HashRouter), CSS puro |
| Ícones | lucide-react |
| E-mail | Spring Mail (SMTP do Gmail) |
| Hospedagem | Docker + Render |

### Dependências

**Back-end** (`pom.xml`): `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-mail`, `frontend-maven-plugin` (compila o React durante o build do Maven).

**Front-end** (`frontend/package.json`): `react`, `react-dom`, `react-router-dom`, `lucide-react`, `vite`, `@vitejs/plugin-react`.

## 🏗️ Arquitetura

```
Navegador ──► Spring Boot (porta 8080)
               ├── /            → site React compilado (arquivos estáticos)
               ├── /api/portfolio → conteúdo (portfolio.json)
               └── /api/contact   → valida o formulário e envia e-mail via SMTP
```

O Maven compila o React e coloca o resultado em `target/classes/static`. Por isso **um único comando** sobe back-end e front-end juntos.

## 📁 Estrutura de pastas

```
portfolio-vitor/
├── config/
│   ├── application.properties          # credenciais locais (NÃO vai para o Git)
│   └── application.properties.example  # modelo
├── frontend/
│   ├── public/projects/                # imagens/GIFs dos projetos
│   ├── src/
│   │   ├── pages/                      # About, Projects, Experiences, Contact
│   │   ├── App.jsx                     # layout, menu e rotas
│   │   ├── i18n.js                     # textos PT/EN da interface
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── src/main/
│   ├── java/br/com/vitorrios/portfolio/
│   │   ├── PortfolioApplication.java
│   │   ├── PortfolioController.java    # GET /api/portfolio
│   │   ├── ContactController.java      # POST /api/contact
│   │   └── ContactRequest.java         # validação do formulário
│   └── resources/
│       ├── application.properties
│       └── portfolio.json              # conteúdo do site
├── Dockerfile
├── render.yaml
└── pom.xml
```

## ▶️ Como executar localmente

**Requisitos:** JDK 21 e Maven 3.9+ (o Node.js é baixado automaticamente pelo Maven).

1. Clone o repositório e entre na pasta.
2. Copie `config/application.properties.example` para `config/application.properties` e preencha:
   ```properties
   spring.mail.username=seu_email@gmail.com
   spring.mail.password=senha_de_app_do_google_sem_espacos
   portfolio.contact.to=seu_email@gmail.com
   ```
   A senha é uma **Senha de app** do Google (exige verificação em duas etapas): https://myaccount.google.com/apppasswords
3. Em **um único terminal**, na raiz do projeto:
   ```bash
   mvn spring-boot:run
   ```
4. Abra http://localhost:8080

> Na primeira execução o Maven baixa o Node e as dependências do React (leva alguns minutos). Para pular a etapa do front quando só alterou Java: `mvn spring-boot:run -Dskip.npm -Dskip.installnodenpm`.

### Editando o conteúdo

Altere `src/main/resources/portfolio.json` (textos PT/EN, projetos, experiências, links) e reinicie. Coloque prints/GIFs em `frontend/public/projects/` e aponte o caminho no campo `image` do projeto.

## ☁️ Deploy (Render)

1. Suba o projeto para o GitHub (o arquivo `config/application.properties` já está no `.gitignore`).
2. No Render: **New → Web Service** → conecte o repositório → runtime **Docker** (ou **Blueprint**, usando o `render.yaml`).
3. Em *Environment*, crie as variáveis:

| Variável | Valor |
| --- | --- |
| `MAIL_USERNAME` | e-mail Gmail remetente |
| `MAIL_PASSWORD` | senha de app do Google (sem espaços) |
| `MAIL_TO` | e-mail que recebe as mensagens |

4. Após o deploy, teste a navegação, o idioma e o envio do formulário, e cole o link na seção **Links**.

## 🖼️ Protótipos e demonstração

_(Adicionar aqui as imagens dos wireframes do Figma e os prints/GIFs do site funcionando.)_

## 📚 Referências

- [React](https://react.dev/) · [Vite](https://vite.dev/) · [Spring Boot](https://docs.spring.io/spring-boot/) · [Lucide](https://lucide.dev/)

## 👤 Autor

Vitor Rios — PUC Minas (Tecnologia da Informação).

## 🙏 Agradecimentos

Ao professor João Paulo Carneiro Aramuni, pela proposta do laboratório e pelo modelo de README.
