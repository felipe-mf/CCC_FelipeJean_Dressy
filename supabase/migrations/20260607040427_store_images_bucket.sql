-- Storage: bucket público para logo e banner da loja. Leitura aberta;
-- escrita restrita ao merchant dono da loja (path = <store_id>/...).
-- Espelha as policies de 'product-images'.

insert into storage.buckets (id, name, public)
values ('store-images', 'store-images', true)
on conflict (id) do nothing;

update storage.buckets
set
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'store-images';

create policy "store_images_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'store-images');

create policy "store_images_storage_insert_own_store"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'store-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );

create policy "store_images_storage_update_own_store"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'store-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );

create policy "store_images_storage_delete_own_store"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'store-images'
    and exists (
      select 1 from public.stores s
      where s.owner_id = auth.uid()
        and s.id::text = split_part(storage.objects.name, '/', 1)
    )
  );
