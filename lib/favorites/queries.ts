import { coverPath } from "@/lib/products/image-url";
import { createClient } from "@/lib/supabase/server";
import type { ProductCondition, ProductListItem } from "@/types";

type FavoriteRow = {
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    condition: ProductCondition;
    size: string | null;
    is_active: boolean;
    stores: { name: string; slug: string };
    product_images: { path: string; position: number }[] | null;
  };
};

// Produtos favoritados pelo usuário autenticado, do mais recente para o mais
// antigo. Só consideramos produtos ativos — peças inativas/excluídas somem do
// closet automaticamente. A RLS já garante o filtro por dono, mas o `eq` por
// `user_id` mantém a query explícita.
export async function getUserFavorites(): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(
      "product_id, created_at, products!inner(id, name, price, condition, size, is_active, stores!inner(name, slug), product_images(path, position))",
    )
    .eq("user_id", user.id)
    .eq("products.is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as FavoriteRow[]).map((row) => ({
    id: row.products.id,
    name: row.products.name,
    price: row.products.price,
    condition: row.products.condition,
    size: row.products.size,
    store_name: row.products.stores.name,
    store_slug: row.products.stores.slug,
    image_path: coverPath(row.products.product_images),
  }));
}

