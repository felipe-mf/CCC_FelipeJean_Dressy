-- Liga o pedido ao endereço de entrega escolhido no checkout. Nullable: pedidos
-- 'in_store' (retirada na loja) podem não ter endereço. `on delete set null`
-- preserva o histórico do pedido se o endereço for removido do perfil depois.
--
-- As policies de `orders` já cobrem o acesso (customer dono / merchant da loja);
-- esta coluna não exige nova policy.

alter table public.orders
  add column address_id uuid references public.addresses(id) on delete set null;
