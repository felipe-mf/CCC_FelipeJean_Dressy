"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/require-customer";

// Alterna o favorito do produto para o customer autenticado. Se já existe,
// remove; se não, insere. Retorna o estado final (`favorited`) para que o
// cliente confirme o toggle otimista.
export async function toggleFavorite(productId: string) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  if (!productId) return { error: "Produto inválido." };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle<{ id: string }>();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/closet");
    return { favorited: false };
  }

  // Confirma que o produto está ativo antes de favoritar — evita closet com
  // peças que não existem mais no marketplace.
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle<{ id: string }>();
  if (!product) return { error: "Produto indisponível." };

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, product_id: productId });
  if (error) return { error: error.message };

  revalidatePath("/closet");
  return { favorited: true };
}
