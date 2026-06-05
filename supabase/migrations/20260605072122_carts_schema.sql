-- Carrinho do customer. Um carrinho por usuário (1:1 com profiles); os itens
-- referenciam produtos do marketplace. Apenas o dono lê e escreve no próprio
-- carrinho e seus itens — merchants não têm acesso.

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

alter table public.carts enable row level security;

create policy "carts_select_own"
  on public.carts for select
  using (user_id = auth.uid());

create policy "carts_insert_own"
  on public.carts for insert
  with check (user_id = auth.uid());

create policy "carts_update_own"
  on public.carts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "carts_delete_own"
  on public.carts for delete
  using (user_id = auth.uid());


-- Itens do carrinho. `unique(cart_id, product_id)` garante que um produto
-- aparece uma única vez por carrinho — a quantidade é ajustada na própria linha.
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index cart_items_cart_id_idx on public.cart_items(cart_id);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

alter table public.cart_items enable row level security;

create policy "cart_items_select_own"
  on public.cart_items for select
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

create policy "cart_items_update_own"
  on public.cart_items for update
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );

create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = auth.uid()
    )
  );
