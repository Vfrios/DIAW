-- Execute no SQL Editor do Supabase DEPOIS da primeira execucao do back-end
-- (o Hibernate cria as tabelas automaticamente).
--
-- O back-end acessa o banco via JDBC com o usuario "postgres" (ignora RLS).
-- Ativar RLS sem policies bloqueia o acesso direto pela API publica do Supabase
-- (chave "publishable"), garantindo que os dados so sejam acessados pelo Spring Boot.

alter table public.usuario               enable row level security;
alter table public.cliente               enable row level security;
alter table public.cliente_rendimento    enable row level security;
alter table public.automovel             enable row level security;
alter table public.contrato_credito      enable row level security;
alter table public.pedido_aluguel        enable row level security;
