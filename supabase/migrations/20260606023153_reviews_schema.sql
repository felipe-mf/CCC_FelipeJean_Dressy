-- Avaliações de produto. Um customer avalia uma peça que comprou, vinculada ao
-- pedido em que a comprou. Modelo de domínio: USER ──< REVIEW >── PRODUCT.
--
-- Regras de negócio:
--   * Só é possível avaliar uma peça de um pedido próprio já 'completed' (o
--     lojista confirmou a retirada com o pickup_code) — garante que o cliente
--     recebeu a peça antes de avaliar.
--   * Uma avaliação por peça por pedido (unique (order_id, product_id)).
--   * Leitura é pública: a aba do lojista, o dashboard e o catálogo consomem
--     as avaliações.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_customer_id_idx on public.reviews(customer_id);
create index reviews_order_id_idx on public.reviews(order_id);

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

-- Leitura pública das avaliações.
create policy "reviews_select_public"
  on public.reviews for select
  using (true);

-- Inserção: o próprio customer, e somente para uma peça que consta em um pedido
-- dele já concluído.
create policy "reviews_insert_own_completed_order"
  on public.reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = reviews.order_id
        and o.customer_id = auth.uid()
        and o.status = 'completed'
        and oi.product_id = reviews.product_id
    )
  );

-- Edição e remoção: apenas o autor da avaliação.
create policy "reviews_update_own"
  on public.reviews for update
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "reviews_delete_own"
  on public.reviews for delete
  using (customer_id = auth.uid());
