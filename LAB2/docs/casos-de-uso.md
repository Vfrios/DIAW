# Diagrama de Casos de Uso

```mermaid
flowchart LR
    V([Visitante])
    C([Cliente])
    A([Agente<br/>Empresa ou Banco])
    B([Banco])

    subgraph Sistema de Aluguel de Carros
        UC1((Cadastrar-se))
        UC2((Autenticar - Login))
        UC3((Gerenciar cadastro<br/>de cliente - CRUD))
        UC4((Introduzir pedido<br/>de aluguel))
        UC5((Consultar pedidos<br/>e status))
        UC6((Modificar pedido))
        UC7((Cancelar pedido))
        UC8((Avaliar pedido<br/>financeiramente))
        UC9((Executar contrato))
        UC10((Conceder contrato<br/>de crédito))
        UC11((Consultar clientes))
    end

    V --- UC1
    C --- UC2
    A --- UC2
    C --- UC3
    C --- UC4
    C --- UC5
    C --- UC6
    C --- UC7
    A --- UC5
    A --- UC6
    A --- UC8
    A --- UC9
    A --- UC11
    B --- UC10
    B -. é um .-> A
```

## Descrição resumida

| Caso de uso | Ator | Pré-condição | Resultado |
|-------------|------|--------------|-----------|
| Cadastrar-se | Visitante | — | Usuário criado (CLIENTE, EMPRESA ou BANCO). |
| Autenticar | Cliente, Agente | Usuário cadastrado | Token de acesso emitido. |
| Gerenciar cadastro de cliente | Cliente | Autenticado | Cliente criado/consultado/alterado/excluído. |
| Introduzir pedido | Cliente | Cadastro de cliente completo | Pedido *Em análise*. |
| Consultar pedidos e status | Cliente, Agente | Autenticado | Lista/detalhe de pedidos. |
| Modificar pedido | Cliente (*Em análise*), Agente (*Em análise*/*Aprovado*) | Pedido existente | Dados atualizados. |
| Cancelar pedido | Cliente | Pedido *Em análise*/*Aprovado* | Pedido *Cancelado*. |
| Avaliar pedido | Agente | Pedido *Em análise* | *Aprovado* ou *Rejeitado* + parecer. |
| Executar contrato | Agente | Pedido *Aprovado* | Pedido *Contrato executado*. |
| Conceder crédito | Banco | Pedido não cancelado/rejeitado | Contrato de crédito associado. |
