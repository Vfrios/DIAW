# Diagrama de Pacotes (Visão Lógica - Arquitetura MVC)

```mermaid
flowchart TB
    subgraph FE["Front-end - React + Vite"]
        direction TB
        pages["pages (View)"]
        components["components"]
        context["context (AuthContext)"]
        services["services (api.js)"]
        pages --> components
        pages --> context
        pages --> services
        context --> services
    end

    subgraph BE["Back-end - Spring Boot (MVC)"]
        direction TB
        controller["controller (C)"]
        service["service (regras de negócio)"]
        repository["repository"]
        model["model (M)"]
        dto["dto (View JSON)"]
        security["security (login/token)"]
        config["config"]
        exception["exception"]
        controller --> service
        controller --> dto
        service --> repository
        service --> model
        service --> dto
        repository --> model
        config --> security
        controller --> exception
        service --> exception
    end

    DB[("Supabase<br/>PostgreSQL")]

    services -- "HTTP/JSON + Bearer token" --> controller
    repository -- "JPA / JDBC" --> DB
```

## Subsistemas (conforme o enunciado)

1. **Gestão de pedidos e contratos** – `controller`, `service`, `repository` e `model` do back-end (clientes, automóveis, pedidos, contratos de crédito).
2. **Construção dinâmica das páginas web** – front-end React (`pages`, `components`), que monta as telas a partir dos dados da API.
