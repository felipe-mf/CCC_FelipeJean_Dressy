-- Checkout do customer numa única transação. O carrinho pode conter peças de
-- várias lojas; como cada `order` pertence a UMA loja, dividimos o carrinho por
-- loja e criamos um pedido para cada uma. A inserção dos `order_items` dispara o
-- trigger `reserve_stock`, que baixa o estoque atomicamente — se faltar estoque
-- para qualquer item, a exceção propaga e TODA a transação é desfeita (nenhum
-- pedido parcial, nenhum estoque perdido).
--
-- SECURITY DEFINER: roda como dono (ignora RLS), necessário porque a RLS de
-- `orders` só permite UPDATE pelo lojista — um rollback no nível da aplicação
-- pelo customer seria bloqueado. A segurança é mantida escopando tudo a
-- `auth.uid()`: o customer só consegue transacionar o próprio carrinho/endereço.

create function public.place_order(
  p_payment_method text,
  p_address_id uuid default null
) returns uuid[]
  language plpgsql
  security definer
  set search_path to ''
  as $$
declare
  v_user uuid := auth.uid();
  v_cart uuid;
  v_store uuid;
  v_order uuid;
  v_total numeric(10, 2);
  v_order_ids uuid[] := '{}';
begin
  if v_user is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  if p_payment_method not in ('online', 'in_store') then
    raise exception 'Método de pagamento inválido' using errcode = '22023';
  end if;

  if p_address_id is not null
     and not exists (
       select 1 from public.addresses a
       where a.id = p_address_id and a.user_id = v_user
     ) then
    raise exception 'Endereço inválido' using errcode = '22023';
  end if;

  select id into v_cart from public.carts where user_id = v_user;
  if v_cart is null
     or not exists (select 1 from public.cart_items where cart_id = v_cart) then
    raise exception 'Carrinho vazio' using errcode = 'P0002';
  end if;

  -- Um pedido por loja presente no carrinho.
  for v_store in
    select distinct p.store_id
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart
  loop
    select coalesce(sum(p.price * ci.quantity), 0) into v_total
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart and p.store_id = v_store;

    insert into public.orders (customer_id, store_id, payment_method, address_id, total)
    values (
      v_user,
      v_store,
      p_payment_method,
      case when p_payment_method = 'online' then p_address_id else null end,
      v_total
    )
    returning id into v_order;

    -- Dispara reserve_stock por item; estoque insuficiente aborta a transação.
    insert into public.order_items (order_id, product_id, quantity, unit_price)
    select v_order, ci.product_id, ci.quantity, p.price
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart and p.store_id = v_store;

    v_order_ids := array_append(v_order_ids, v_order);
  end loop;

  delete from public.cart_items where cart_id = v_cart;

  return v_order_ids;
end;
$$;

revoke all on function public.place_order(text, uuid) from public, anon;
grant execute on function public.place_order(text, uuid) to authenticated;
