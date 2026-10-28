# Histórias de Usuário

Personas: **Cliente** (usuário individual) e **Agente** (Empresa ou Banco).

| # | História | Critérios de aceite |
|---|----------|---------------------|
| US01 | Como **visitante**, quero me cadastrar informando nome, login, senha e tipo de conta, para poder usar o sistema. | Login único; senha ≥ 6 caracteres; senha armazenada com BCrypt. |
| US02 | Como **usuário cadastrado**, quero fazer login com usuário e senha, para acessar o sistema. | Sem login, nenhuma rota `/api/**` (exceto login/cadastro) responde; telas redirecionam para `/login`. |
| US03 | Como **cliente**, quero cadastrar meus dados (RG, CPF, nome, endereço, profissão e até 3 rendimentos com entidade empregadora), para que meus pedidos possam ser analisados. | CPF válido e único; no máximo 3 rendimentos. |
| US04 | Como **cliente**, quero consultar, alterar e excluir meu cadastro. | Só o próprio cliente altera/exclui; exclusão bloqueada se houver pedidos. |
| US05 | Como **cliente**, quero introduzir um pedido de aluguel informando período e dados do automóvel (matrícula, ano, marca, modelo, placa e proprietário), para solicitar o aluguel. | Exige cadastro de cliente; data final ≥ inicial; pedido nasce com status *Em análise*. |
| US06 | Como **cliente**, quero consultar meus pedidos e o status de cada um. | Cliente vê apenas os próprios pedidos. |
| US07 | Como **cliente**, quero modificar um pedido enquanto estiver *Em análise*. | Após avaliação, cliente não modifica mais. |
| US08 | Como **cliente**, quero cancelar um pedido *Em análise* ou *Aprovado*. | Status muda para *Cancelado*. |
| US09 | Como **agente**, quero listar e consultar todos os pedidos e clientes, para análise. | Agentes têm acesso de leitura a todos. |
| US10 | Como **agente**, quero modificar pedidos (*Em análise* ou *Aprovado*). | Pedidos rejeitados, contratados ou cancelados são imutáveis. |
| US11 | Como **agente**, quero avaliar financeiramente um pedido *Em análise* com parecer positivo ou negativo. | Parecer obrigatório; positivo → *Aprovado*, negativo → *Rejeitado*. |
| US12 | Como **agente**, quero executar o contrato de um pedido *Aprovado*. | Status muda para *Contrato executado*. |
| US13 | Como **banco**, quero conceder um contrato de crédito associado a um pedido. | Valor, juros e prazo informados; somente papel BANCO. |
