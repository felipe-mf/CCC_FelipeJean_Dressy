-- Favoritos do customer. Wishlist simples: cada par (user_id, product_id) é
-- único e representa que aquele usuário marcou aquele produto como favorito.
-- Modelo: USER ──< FAVORITE >── PRODUCT.
--
-- Apenas o dono lê e escreve nos próprios favoritos; merchants não têm acesso.
-- A leitura pública de produtos continua valendo na tabela `products` — aqui
-- só guardamos o vínculo, sem expor preferências de outros usuários.

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index favorites_user_id_idx on public.favorites(user_id);
create index favorites_product_id_idx on public.favorites(product_id);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete
  using (user_id = auth.uid());
