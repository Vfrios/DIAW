# Clima API — Belo Horizonte (Spring Boot)

API REST desenvolvida em **Java + Spring Boot** que consulta a previsão do
tempo de **Belo Horizonte - MG** consumindo a API externa gratuita
[Open-Meteo](https://open-meteo.com/), e disponibiliza os dados processados
em um endpoint próprio, em formato JSON.

A **Open-Meteo** foi escolhida porque é gratuita e **não exige API Key**
para o uso feito neste projeto, o que simplifica a configuração.

**Demonstração no Render:** [Abrir API de Clima](https://diaw-completo.onrender.com/#trabalho1-clima). No menu, clique em **Iniciar e abrir**; a primeira inicialização pode levar alguns instantes.

## Tecnologias

- Java 17
- Spring Boot 3.3 (Spring Web)
- Maven
- RestTemplate para consumo da API externa
- Open-Meteo (API pública de dados meteorológicos)

## Estrutura do projeto

```text
src/main/java/
├── ClimaApiApplication.java     # classe principal
├── controller/
│   └── ClimaController.java     # endpoints REST
├── service/
│   └── ClimaService.java        # integração com a Open-Meteo e regras de negócio
├── dto/
│   ├── ClimaResponse.java       # objeto de resposta da nossa API
│   └── OpenMeteoResponse.java   # mapeamento da resposta da API externa
└── exception/
    ├── ClimaIndisponivelException.java
    └── GlobalExceptionHandler.java  # tratamento de erros da API externa
```

## Integrantes do projeto

  -Brayan Mendes de Carvalho
  -Vitor de Freitas Rios
