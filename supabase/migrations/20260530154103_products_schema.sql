-- Produtos do marketplace. Pertencem a uma loja (merchant). Customers só leem
-- registros ativos; merchants têm acesso total aos produtos da própria loja.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text check (description is null or char_length(description) <= 2000),
  price numeric(10, 2) not null check (price >= 0),
  condition text not null check (condition in ('new', 'like_new', 'good', 'fair')),
  size text check (size is null or char_length(size) <= 40),
  brand text check (brand is null or char_length(brand) <= 80),
  stock integer not null default 1 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_store_id_idx on public.products(store_id);
create index products_is_active_idx on public.products(is_active);
create index products_created_at_idx on public.products(created_at desc);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

create policy "products_select_public_or_owner"
  on public.products for select
  using (
    is_active = true
    or exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

create policy "products_insert_own_store"
  on public.products for insert
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

create policy "products_update_own_store"
  on public.products for update
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );

create policy "products_delete_own_store"
  on public.products for delete
  using (
    exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.owner_id = auth.uid()
    )
  );


-- Imagens do produto. O `path` é o caminho relativo dentro do bucket
-- `product-images` (convenção: <store_id>/<product_id>/<uuid>.<ext>).

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null check (char_length(path) between 1 and 500),
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now()
);

create index product_images_product_id_position_idx
  on public.product_images(product_id, position);

alter table public.product_images enable row level security;

create policy "product_images_select_public_or_owner"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and (
          p.is_active = true
          or exists (
            select 1 from public.stores s
            where s.id = p.store_id and s.owner_id = auth.uid()
          )
        )
    )
  );

create policy "product_images_insert_own_store"
  on public.product_images for insert
  with check (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

create policy "product_images_update_own_store"
  on public.product_images for update
  using (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );

create policy "product_images_delete_own_store"
  on public.product_images for delete
  using (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_images.product_id and s.owner_id = auth.uid()
    )
  );


-- Categorias e join product_categories. Estrutura mínima para destravar
-- queries do marketplace; popular dados fica fora desta migration.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_public"
  on public.categories for select
  using (true);


create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create index product_categories_category_id_idx
  on public.product_categories(category_id);

alter table public.product_categories enable row level security;

create policy "product_categories_select_public"
  on public.product_categories for select
  using (true);

create policy "product_categories_insert_own_store"
  on public.product_categories for insert
  with check (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_categories.product_id and s.owner_id = auth.uid()
    )
  );

create policy "product_categories_delete_own_store"
  on public.product_categories for delete
  using (
    exists (
      select 1
      from public.products p
      join public.stores s on s.id = p.store_id
      where p.id = product_categories.product_id and s.owner_id = auth.uid()
    )
  );


-- Storage: bucket público para imagens de produto. Leitura aberta;
-- escrita restrita ao merchant dono da loja (path = <store_id>/...).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_storage_insert_own_store"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );

create policy "product_images_storage_update_own_store"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );

create policy "product_images_storage_delete_own_store"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );
