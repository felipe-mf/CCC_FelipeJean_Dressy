-- Integração AbacatePay (Pix). Pedidos com `payment_method = 'online'` passam a
-- receber um QR Code Pix gerado pela AbacatePay (Checkout Transparente, v2).
-- A Server Action faz a chamada à AbacatePay logo após o `place_order` e
-- preenche estas colunas no pedido recém-criado.
--
-- Regras de domínio:
--   * Pedido 'online' aguardando Pix expira em 30 minutos (substitui a regra
--     antiga de só expirar pedidos 'in_store' em 5 dias).
--   * Quando o Pix é confirmado (botão "Simular pagamento" em dev, webhook em
--     produção), `payment_status` vira 'paid' — mas a venda só conclui quando
--     o lojista informar o `pickup_code`, igual ao fluxo 'in_store'.
--   * Pedidos com `payment_status = 'paid'` NUNCA expiram, mesmo que
--     `expires_at` já tenha passado (o cron filtra por `payment_status`).

alter table public.orders
  add column abacate_billing_id text,
  add column pix_br_code text,
  add column pix_qr_image text,
  add column pix_expires_at timestamptz;

-- Lookup por ID da cobrança AbacatePay (usado pelo webhook e pelo botão de
-- simular pagamento). Parcial porque a coluna só é preenchida em pedidos
-- online — não faz sentido indexar nulos.
create unique index orders_abacate_billing_id_key
  on public.orders(abacate_billing_id)
  where abacate_billing_id is not null;


-- Substitui `set_order_expiry`: 'in_store' continua com 5 dias, 'online' passa
-- a expirar em 30 minutos (janela padrão do Pix gerado pela AbacatePay).
create or replace function public.set_order_expiry() returns trigger
  language plpgsql
  set search_path to ''
  as $$
begin
  if new.expires_at is null then
    if new.payment_method = 'in_store' then
      new.expires_at = new.created_at + interval '5 days';
    elsif new.payment_method = 'online' then
      new.expires_at = new.created_at + interval '30 minutes';
    end if;
  end if;
  return new;
end;
$$;


-- Substitui o cron antigo para também expirar pedidos 'online' não pagos. O
-- filtro `payment_status = 'pending'` garante que um pedido online já pago
-- (aguardando o lojista entregar) jamais é expirado.
select cron.unschedule('expire-instore-orders');

select cron.schedule(
  'expire-pending-orders',
  '*/5 * * * *',
  $$
    update public.orders
      set status = 'expired'
      where status = 'pending'
        and payment_status = 'pending'
        and expires_at is not null
        and expires_at < now();
  $$
);
