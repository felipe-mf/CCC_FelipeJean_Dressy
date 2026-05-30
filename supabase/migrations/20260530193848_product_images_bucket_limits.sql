-- Reforça limites de upload no bucket `product-images`: tamanho máximo e tipos
-- permitidos, como guarda server-side no próprio Storage. Complementa a RLS de
-- ownership por store_id. As imagens são enviadas direto do navegador, então
-- esta é a barreira de validação no servidor para tamanho/formato.

update storage.buckets
set
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'product-images';
