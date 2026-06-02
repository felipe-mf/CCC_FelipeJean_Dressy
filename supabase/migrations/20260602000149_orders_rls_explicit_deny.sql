-- Completa as policies de `orders` e `order_items` para cobrir todos os
-- comandos (regra do projeto: SELECT, INSERT, UPDATE e DELETE explícitos).
--
-- A intenção de negócio é que pedidos e itens sejam imutáveis por DELETE e
-- que itens não sejam editados após criados: o histórico de venda não pode ser
-- apagado nem adulterado. Sem policy o comando já é negado por padrão sob RLS,
-- mas aqui tornamos a negação explícita com `using (false)` para deixar a
-- decisão registrada no schema, em vez de implícita pela ausência de policy.

create policy "orders_delete_none"
  on public.orders for delete
  using (false);

create policy "order_items_update_none"
  on public.order_items for update
  using (false);

create policy "order_items_delete_none"
  on public.order_items for delete
  using (false);
