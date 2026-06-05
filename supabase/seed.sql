-- Seed de desenvolvimento local. Roda apenas em `npm run db:reset` (não vai ao
-- remoto via `db:push`). Popula um catálogo mínimo para o marketplace renderizar
-- e permite testar os fluxos de merchant e customer ponta a ponta.
--
-- Usuários demo (senha: dressy123):
--   merchant -> demo.loja@dressy.test
--   customer -> demo.cliente@dressy.test
-- Os profiles são criados pelo trigger on_auth_user_created a partir do
-- raw_user_meta_data abaixo.

-- ── Usuários ────────────────────────────────────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'demo.loja@dressy.test',
    extensions.crypt('dressy123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Brechó Demo","role":"merchant"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'demo.cliente@dressy.test',
    extensions.crypt('dressy123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Cliente Demo","role":"customer"}',
    now(), now()
  );

-- Identidade de e-mail (necessária para login por senha funcionar localmente).
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at,
  created_at, updated_at
) values
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo.loja@dressy.test"}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"demo.cliente@dressy.test"}',
    'email', now(), now(), now()
  );

-- ── Loja ────────────────────────────────────────────────────────────────────
insert into public.stores (id, owner_id, name, slug, description, is_active)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Brechó Demo',
  'brecho-demo',
  'Curadoria demonstrativa de peças para desenvolvimento.',
  true
);

-- ── Categorias ──────────────────────────────────────────────────────────────
insert into public.categories (name, slug) values
  ('Vestidos', 'vestidos'),
  ('Calças', 'calcas'),
  ('Camisas', 'camisas'),
  ('Jaquetas', 'jaquetas'),
  ('Tricô', 'trico'),
  ('Calçados', 'calcados');

-- ── Produtos ────────────────────────────────────────────────────────────────
insert into public.products
  (id, store_id, name, description, price, condition, size, brand, stock, is_active)
values
  ('44444444-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   'Blazer cropped em linho', 'Blazer estruturado em linho natural com forro de algodão.',
   289.00, 'like_new', 'M', 'Lume', 1, true),
  ('44444444-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333',
   'Camisa oversized vintage', 'Camisa de algodão pesado, costura francesa, anos 90.',
   124.90, 'good', 'G', null, 1, true),
  ('44444444-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'Calça pantalona alfaiataria', 'Pantalona em lã fria com pregas frontais e bolso italiano.',
   219.00, 'like_new', '38', 'Lume', 2, true),
  ('44444444-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
   'Vestido midi com babado', 'Vestido midi em viscose, manga curta, babado na barra.',
   178.00, 'new', 'P', 'Paula', 3, true),
  ('44444444-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333',
   'Jaqueta jeans desbotada', 'Jaqueta jeans com lavagem natural e detalhes desfiados.',
   159.00, 'good', 'M', 'Levi''s', 1, true),
  ('44444444-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333',
   'Tricô off-white gola alta', 'Tricô de algodão pima com gola alta e mangas bufantes.',
   142.50, 'like_new', 'M', null, 2, true),
  ('44444444-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333',
   'Saia plissada midi', 'Saia plissada em tecido encorpado, cintura alta.',
   98.00, 'fair', '40', null, 1, true),
  ('44444444-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333',
   'Bota coturno couro castanho', 'Coturno em couro legítimo castanho, solado tratorado.',
   245.00, 'good', '37', 'Cravo & Canela', 1, true);

-- ── Vínculos produto↔categoria ──────────────────────────────────────────────
insert into public.product_categories (product_id, category_id)
select p.id, c.id
from (values
  ('44444444-0000-0000-0000-000000000001'::uuid, 'jaquetas'),
  ('44444444-0000-0000-0000-000000000002'::uuid, 'camisas'),
  ('44444444-0000-0000-0000-000000000003'::uuid, 'calcas'),
  ('44444444-0000-0000-0000-000000000004'::uuid, 'vestidos'),
  ('44444444-0000-0000-0000-000000000005'::uuid, 'jaquetas'),
  ('44444444-0000-0000-0000-000000000006'::uuid, 'trico'),
  ('44444444-0000-0000-0000-000000000007'::uuid, 'vestidos'),
  ('44444444-0000-0000-0000-000000000008'::uuid, 'calcados')
) as p(id, cat_slug)
join public.categories c on c.slug = p.cat_slug;
