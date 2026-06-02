-- Pedidos do marketplace. Um pedido pertence a UMA loja (merchant) e a UM
-- customer. O checkout do cliente divide o carrinho por loja. Tanto customers
-- quanto merchants usam estas tabelas; a separação de acesso fica na RLS.
--
-- Regras de negócio:
--   * Pagamento: 'online' (pelo app) ou 'in_store' (na loja física). A
--     integração de pagamento em si é feita à parte (AbacatePay).
--   * A venda só conclui quando o lojista informa o `pickup_code` de 4 dígitos
--     que o cliente recebeu no momento do pedido (vale para ambos os métodos).
--   * Pedidos 'in_store' ficam reservados por 5 dias (`expires_at`); se não
--     concluídos, um job pg_cron os marca como 'expired' e o estoque volta.
--   * Reserva de estoque é garantida no banco (trigger), evitando que duas
--     pessoas reservem a mesma peça simultaneamente.

-- Gera um código de retirada de 4 dígitos (0000–9999). Usado como default para
-- que pedidos inseridos manualmente também recebam um código.
create function public.generate_pickup_code() returns text
  language sql
  volatile
  set search_path to ''
  as $$
  select lpad((floor(random() * 10000))::int::text, 4, '0');
$$;


create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  store_id uuid not null references public.stores(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled', 'expired')),
  payment_method text not null
    check (payment_method in ('online', 'in_store')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  pickup_code text not null default public.generate_pickup_code()
    check (pickup_code ~ '^[0-9]{4}$'),
  total numeric(10, 2) not null default 0 check (total >= 0),
  expires_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_store_id_idx on public.orders(store_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index orders_expires_at_idx on public.orders(expires_at);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();


-- Define o prazo de 5 dias para pedidos 'in_store' assim que são criados.
create function public.set_order_expiry() returns trigger
  language plpgsql
  set search_path to ''
  as $$
begin
  if new.payment_method = 'in_store' and new.expires_at is null then
    new.expires_at = new.created_at + interval '5 days';
  end if;
  return new;
end;
$$;

create trigger orders_set_expiry
before insert on public.orders
for each row execute function public.set_order_expiry();


create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);


-- Reserva de estoque: ao inserir um item, baixa o estoque do produto de forma
-- atômica. O `where stock >= quantity` trava a linha do produto; se duas
-- reservas concorrerem pela última peça, a segunda não encontra estoque e falha.
create function public.reserve_stock() returns trigger
  language plpgsql
  set search_path to ''
  as $$
begin
  update public.products
    set stock = stock - new.quantity
    where id = new.product_id and stock >= new.quantity;
  if not found then
    raise exception 'Estoque insuficiente para o produto %', new.product_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger order_items_reserve_stock
after insert on public.order_items
for each row execute function public.reserve_stock();


-- Devolve o estoque quando um pedido sai de 'pending' para 'cancelled' ou
-- 'expired'. Em 'completed' nada muda — a peça foi vendida.
create function public.release_stock_on_cancel() returns trigger
  language plpgsql
  set search_path to ''
  as $$
begin
  if old.status = 'pending'
     and new.status in ('cancelled', 'expired') then
    update public.products p
      set stock = p.stock + oi.quantity
      from public.order_items oi
      where oi.order_id = new.id and p.id = oi.product_id;
  end if;
  return new;
end;
$$;

create trigger orders_release_stock_on_cancel
after update on public.orders
for each row execute function public.release_stock_on_cancel();


-- RLS: customer vê/cria os próprios pedidos; merchant vê e gerencia os pedidos
-- da própria loja (concluir com código, cancelar).
alter table public.orders enable row level security;

create policy "orders_select_customer_or_merchant"
  on public.orders for select
  using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );

create policy "orders_insert_own_customer"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "orders_update_own_store"
  on public.orders for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = orders.store_id and s.owner_id = auth.uid()
    )
  );


alter table public.order_items enable row level security;

create policy "order_items_select_customer_or_merchant"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.customer_id = auth.uid()
          or exists (
            select 1 from public.stores s
            where s.id = o.store_id and s.owner_id = auth.uid()
          )
        )
    )
  );

create policy "order_items_insert_own_customer"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );


-- Expiração agendada: marca pedidos 'in_store' vencidos como 'expired'. O
-- update dispara `release_stock_on_cancel`, devolvendo o estoque. O job roda
-- como superusuário, ignorando a RLS.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'expire-instore-orders',
  '*/30 * * * *',
  $$
    update public.orders
      set status = 'expired'
      where status = 'pending'
        and payment_method = 'in_store'
        and expires_at is not null
        and expires_at < now();
  $$
);
