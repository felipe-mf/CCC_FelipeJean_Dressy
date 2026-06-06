-- Corrige imagens duplicadas: o formulário de edição reenviava o mesmo path,
-- criando múltiplas linhas em product_images apontando para o mesmo objeto.
-- Isso quebrava a galeria do produto (key duplicada por path) e duplicava a
-- pré-visualização no painel do lojista.

-- 1. Remove linhas duplicadas (mesmo product_id + path), mantendo a de menor
--    position (e, em empate, menor id).
delete from public.product_images a
using public.product_images b
where a.product_id = b.product_id
  and a.path = b.path
  and (a.position, a.id) > (b.position, b.id);

-- 2. Impede que a mesma imagem seja vinculada duas vezes ao mesmo produto.
create unique index product_images_product_id_path_key
  on public.product_images (product_id, path);
