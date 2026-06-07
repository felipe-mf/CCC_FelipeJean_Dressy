-- A action `placeOrder` precisa preencher os dados da cobrança Pix
-- (`abacate_billing_id`, `pix_br_code`, `pix_qr_image`, `pix_expires_at`) no
-- pedido recém-criado. Mas a RLS de `orders` só permite UPDATE ao merchant
-- dono da loja — o customer não tem permissão de mexer no próprio pedido após
-- criado, e por isso o update da action era silenciosamente bloqueado.
--
-- Esta função `attach_pix_charge` é o canal autorizado: SECURITY DEFINER,
-- valida que `auth.uid()` é o customer do pedido, que o pedido ainda está
-- pendente, é 'online' e ainda não tem cobrança vinculada. Garante que a
-- function não pode ser usada para "trocar" o Pix de um pedido depois.

create function public.attach_pix_charge(
  p_order_id uuid,
  p_billing_id text,
  p_br_code text,
  p_qr_image text,
  p_expires_at timestamptz
) returns void
  language plpgsql
  security definer
  set search_path to ''
  as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  update public.orders
    set abacate_billing_id = p_billing_id,
        pix_br_code = p_br_code,
        pix_qr_image = p_qr_image,
        pix_expires_at = p_expires_at
    where id = p_order_id
      and customer_id = v_user
      and payment_method = 'online'
      and status = 'pending'
      and abacate_billing_id is null;

  if not found then
    raise exception 'Pedido inválido para vincular cobrança Pix'
      using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.attach_pix_charge(uuid, text, text, text, timestamptz)
  from public, anon;
grant execute on function public.attach_pix_charge(uuid, text, text, text, timestamptz)
  to authenticated;


-- Mesma motivação: o customer não tem UPDATE em `orders` via RLS, então não
-- consegue marcar o próprio pedido como pago após confirmar o Pix. Esta
-- function é o canal autorizado, validando posse e que o pedido está em
-- estado coerente para virar 'paid'. Quando integrarmos webhook, ele usa
-- service role e ignora esta função.

create function public.mark_order_paid(p_order_id uuid) returns void
  language plpgsql
  security definer
  set search_path to ''
  as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  update public.orders
    set payment_status = 'paid'
    where id = p_order_id
      and customer_id = v_user
      and payment_method = 'online'
      and status = 'pending'
      and payment_status = 'pending'
      and abacate_billing_id is not null;

  if not found then
    raise exception 'Pedido inválido para marcar como pago'
      using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.mark_order_paid(uuid) from public, anon;
grant execute on function public.mark_order_paid(uuid) to authenticated;


-- Cancelamento "soft" pelo próprio customer quando a integração de pagamento
-- falha logo após o `place_order` (ex.: AbacatePay retorna erro ao gerar Pix).
-- A trigger `release_stock_on_cancel` devolve o estoque. Limita a pedidos
-- ainda pendentes do próprio customer — não substitui o cancelamento via
-- merchant (que é regido pela policy normal).

create function public.cancel_own_pending_orders(p_order_ids uuid[])
  returns void
  language plpgsql
  security definer
  set search_path to ''
  as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  update public.orders
    set status = 'cancelled',
        cancelled_at = now()
    where id = any(p_order_ids)
      and customer_id = v_user
      and status = 'pending';
end;
$$;

revoke all on function public.cancel_own_pending_orders(uuid[])
  from public, anon;
grant execute on function public.cancel_own_pending_orders(uuid[])
  to authenticated;
