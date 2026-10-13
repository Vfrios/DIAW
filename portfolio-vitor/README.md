# Portfólio — Vitor Rios

Portfólio profissional desenvolvido com Java, Spring Boot e React. O site apresenta minha trajetória, projetos, experiências e canais de contato, com conteúdo em português e inglês.

## Links

- **Site:** [diaw-gvp0.onrender.com](https://diaw-gvp0.onrender.com)
- **Código-fonte:** [Vfrios/DIAW — portfolio-vitor](https://github.com/Vfrios/DIAW/tree/main/portfolio-vitor)
- **LinkedIn:** [vitor-rios-dev](https://www.linkedin.com/in/vitor-rios-dev)
- **GitHub:** [Vfrios](https://github.com/Vfrios)

## Funcionalidades

- Navegação entre as páginas Sobre mim, Projetos, Experiências e Contato.
- Conteúdo da interface em português e inglês.
- Projetos apresentados com descrição, tecnologias, repositório e imagem.
- Formulário de contato com validação dos campos e envio por e-mail.
- Layout responsivo para telas grandes e dispositivos móveis.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Back-end | Java 21, Spring Boot 3.5, Maven |
| Front-end | React 19, Vite 7, React Router 7 |
| Estilização e ícones | CSS, lucide-react |
| E-mail | Spring Mail |
| Hospedagem | Docker, Render |

## Executar localmente

**Pré-requisitos:** JDK 21 e Maven 3.9 ou superior. O Maven instala o Node.js usado para compilar o front-end.

Na raiz do repositório `DIAW`, execute:

```powershell
mvn -f portfolio-vitor/pom.xml spring-boot:run
```

Se o terminal já estiver na pasta `portfolio-vitor`, execute:

```powershell
mvn spring-boot:run
```

Depois, acesse [http://localhost:8080](http://localhost:8080).

O envio do formulário de contato depende de credenciais SMTP fornecidas ao ambiente de execução. Elas não são necessárias para iniciar o site e não devem ser adicionadas ao repositório.

## Conteúdo e API

Os textos, links, projetos e experiências são mantidos em `src/main/resources/portfolio.json`. O front-end carrega esse conteúdo pela API `GET /api/portfolio`.

O formulário envia os dados para `POST /api/contact`. O back-end valida os campos antes de encaminhar a mensagem por e-mail.

## Estrutura

```text
portfolio-vitor/
├── frontend/                         # Aplicação React e arquivos estáticos
├── src/main/java/                    # Aplicação Spring Boot e endpoints
├── src/main/resources/
│   ├── application.properties        # Configurações padrão do Spring
│   └── portfolio.json               # Conteúdo do portfólio
├── Dockerfile
├── render.yaml
└── pom.xml
```

## Implantação

O projeto está hospedado no Render usando Docker. A configuração de implantação está em `render.yaml`.
