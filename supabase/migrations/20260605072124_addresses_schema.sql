-- Endereços de entrega do customer. Cada usuário pode ter vários endereços;
-- no máximo um marcado como padrão (índice único parcial). Usados no checkout.

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 2 and 120),
  postal_code text not null check (postal_code ~ '^[0-9]{5}-?[0-9]{3}$'),
  street text not null check (char_length(street) between 2 and 160),
  number text not null check (char_length(number) between 1 and 20),
  complement text check (complement is null or char_length(complement) <= 80),
  district text not null check (char_length(district) between 2 and 80),
  city text not null check (char_length(city) between 2 and 80),
  state text not null check (state ~ '^[A-Z]{2}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

-- No máximo um endereço padrão por usuário.
create unique index addresses_one_default_per_user_idx
  on public.addresses(user_id)
  where is_default;

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

create policy "addresses_select_own"
  on public.addresses for select
  using (user_id = auth.uid());

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (user_id = auth.uid());

create policy "addresses_update_own"
  on public.addresses for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_delete_own"
  on public.addresses for delete
  using (user_id = auth.uid());
