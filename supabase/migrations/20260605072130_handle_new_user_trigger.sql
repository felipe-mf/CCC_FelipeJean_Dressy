-- Cria o profile automaticamente quando um usuário se cadastra em auth.users.
-- O AGENTS.md registra que triggers em `auth.users` NÃO são puxados por
-- `db pull` — então a versão local nunca teve este trigger, e signup/seed locais
-- não criavam `profiles`. Esta migration estabelece o trigger no schema versionado.
--
-- Idempotência: `create or replace function` + `on conflict (id) do nothing`
-- tornam a operação segura no remoto, que já possui o trigger criado à mão. Se
-- dois triggers dispararem (nomes diferentes), o segundo insert vira no-op em vez
-- de violar a PK de profiles.

create or replace function public.handle_new_user() returns trigger
  language plpgsql
  security definer
  set search_path to ''
  as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
