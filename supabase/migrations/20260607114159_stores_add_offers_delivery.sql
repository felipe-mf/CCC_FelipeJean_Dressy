-- Cada loja declara se faz entregas ou se atende apenas por retirada na loja.
-- Padrão `false`: a loja só faz retirada até ativar entrega explicitamente nas
-- configurações. A policy `stores_update_own` já cobre a coluna nova, então não
-- há mudança de RLS.
alter table public.stores
  add column offers_delivery boolean not null default false;
