-- Checkout por loja: o cliente escolhe entrega ou retirada para CADA loja do
-- carrinho (respeitando o que a loja permite). A assinatura muda de
-- (text, uuid) para (jsonb, uuid), recebendo um mapa { "<store_id>": método }.
-- Por isso a função antiga é removida e recriada (drop + create).
--
-- Enforcement no banco: se o método de uma loja for 'online' (entrega), a loja
-- precisa ter `offers_delivery = true`. Isso impede que um cliente burle a UI e
-- force entrega numa loja que só faz retirada.
--
-- Mantém o restante do comportamento atual: um pedido por loja, reserva de
-- estoque via trigger `reserve_stock`, e atomicidade (qualquer falha desfaz a
-- transação inteira). SECURITY DEFINER pelo mesmo motivo da versão anterior.

drop function if exists public.place_order(text, uuid);

create function public.place_order(
  p_methods jsonb,
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
  v_method text;
  v_order uuid;
  v_total numeric(10, 2);
  v_order_ids uuid[] := '{}';
begin
  if v_user is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  if p_methods is null or jsonb_typeof(p_methods) <> 'object' then
    raise exception 'Métodos de recebimento inválidos' using errcode = '22023';
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
    v_method := p_methods ->> v_store::text;

    if v_method is null or v_method not in ('online', 'in_store') then
      raise exception 'Método de recebimento inválido' using errcode = '22023';
    end if;

    -- A loja precisa permitir entrega para aceitar método 'online'.
    if v_method = 'online'
       and not coalesce(
         (select offers_delivery from public.stores where id = v_store),
         false
       ) then
      raise exception 'Esta loja não faz entrega' using errcode = '22023';
    end if;

    -- Entrega exige endereço.
    if v_method = 'online' and p_address_id is null then
      raise exception 'Endereço obrigatório para entrega' using errcode = '22023';
    end if;

    select coalesce(sum(p.price * ci.quantity), 0) into v_total
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart and p.store_id = v_store;

    insert into public.orders (customer_id, store_id, payment_method, address_id, total)
    values (
      v_user,
      v_store,
      v_method,
      case when v_method = 'online' then p_address_id else null end,
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

revoke all on function public.place_order(jsonb, uuid) from public, anon;
grant execute on function public.place_order(jsonb, uuid) to authenticated;
