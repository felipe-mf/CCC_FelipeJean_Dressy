import { coverPath } from "@/lib/products/image-url";
import { createClient } from "@/lib/supabase/server";
import type { CartItemWithProduct, ProductCondition } from "@/types";

type CartItemRow = {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    name: string;
    price: number;
    stock: number;
    size: string | null;
    condition: ProductCondition;
    store_id: string;
    stores: { name: string; slug: string };
    product_images: { path: string; position: number }[] | null;
  };
};

// Itens do carrinho do usuário autenticado, com dados do produto e da loja.
// A RLS garante que só o dono enxerga o próprio carrinho; o filtro por
// `carts.user_id` evita depender só dela e mantém a query explícita.
export async function getCart(): Promise<CartItemWithProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, product_id, carts!inner(user_id), products!inner(name, price, stock, size, condition, store_id, stores!inner(name, slug), product_images(path, position))",
    )
    .eq("carts.user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as CartItemRow[]).map((item) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    name: item.products.name,
    price: item.products.price,
    stock: item.products.stock,
    size: item.products.size,
    condition: item.products.condition,
    image_path: coverPath(item.products.product_images),
    store_id: item.products.store_id,
    store_name: item.products.stores.name,
    store_slug: item.products.stores.slug,
  }));
}
