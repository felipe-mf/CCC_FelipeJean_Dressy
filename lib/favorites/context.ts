import { createClient } from "@/lib/supabase/server";

// Retorna o set de produtos favoritados e se o usuário atual é customer (única
// situação em que o botão de favoritar faz sentido). Usado nas páginas que
// listam produtos para decidir se renderizam o coração e em que estado.
export async function getFavoritesContext(): Promise<{
  isCustomer: boolean;
  favoriteIds: Set<string>;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "customer") {
    return { isCustomer: false, favoriteIds: new Set() };
  }

  const { data } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", user.id);

  return {
    isCustomer: true,
    favoriteIds: new Set((data ?? []).map((row) => row.product_id)),
  };
}
