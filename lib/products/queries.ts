import { coverPath } from "@/lib/products/image-url";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductDetail, ProductListItem } from "@/types";

export type MarketplaceSort = "recent" | "price_asc" | "price_desc";

type StoreEmbed = { name: string; slug: string };
type ImageEmbed = { path: string; position: number };

type ProductListRow = Pick<
  Product,
  "id" | "name" | "price" | "condition" | "size"
> & {
  stores: StoreEmbed;
  product_images: ImageEmbed[] | null;
};

// Colunas comuns a todas as listagens de produto (card do marketplace,
// loja e relacionados). Mantenha em sincronia com ProductListRow.
const PRODUCT_LIST_SELECT =
  "id, name, price, condition, size, stores!inner(name, slug), product_images(path, position)";

function mapToProductListItem(p: ProductListRow): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    condition: p.condition,
    size: p.size,
    store_name: p.stores.name,
    store_slug: p.stores.slug,
    image_path: coverPath(p.product_images),
  };
}

// Converte o resultado de uma listagem em ProductListItem[], tratando
// erro/ausência de dados como lista vazia.
function toProductListItems(result: {
  data: unknown;
  error: unknown;
}): ProductListItem[] {
  if (result.error || !result.data) return [];
  return (result.data as ProductListRow[]).map(mapToProductListItem);
}

// Produtos ativos do marketplace, ordenados conforme a escolha do usuário.
// Público (RLS permite SELECT de produtos ativos para anônimos e autenticados).
export async function getMarketplaceProducts(
  sort: MarketplaceSort = "recent",
): Promise<ProductListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc")
    query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  return toProductListItems(await query);
}

// Detalhe de um produto ativo, com loja e todas as imagens ordenadas.
export async function getProductById(
  id: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, stores!inner(name, slug), product_images(path, position)")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  const { stores, product_images, ...product } = data as unknown as Product & {
    stores: StoreEmbed;
    product_images: ImageEmbed[] | null;
  };

  const images = [...(product_images ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  return {
    ...product,
    store_name: stores.name,
    store_slug: stores.slug,
    images,
  };
}

// Todas as peças ativas de uma loja, ordenadas das mais recentes às antigas.
// Usada na página pública da loja (/lojas/[slug]).
export async function getProductsByStore(
  storeId: string,
): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const result = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return toProductListItems(result);
}

// Outras peças ativas da mesma loja, para a seção de relacionados.
export async function getRelatedProducts(
  storeId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const result = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .eq("store_id", storeId)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return toProductListItems(result);
}
