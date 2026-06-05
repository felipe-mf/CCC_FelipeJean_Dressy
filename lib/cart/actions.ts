"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/require-customer";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_QUANTITY = 99;

// Garante que o customer tem um carrinho, criando-o sob demanda. Retorna o id.
async function getOrCreateCart(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string | { error: string }> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single<{ id: string }>();
  if (error || !created) {
    return { error: error?.message ?? "Falha ao criar o carrinho." };
  }
  return created.id;
}

export async function addToCart(productId: string, quantity = 1) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const qty = Math.trunc(quantity);
  if (!productId || !Number.isInteger(qty) || qty < 1) {
    return { error: "Quantidade inválida." };
  }

  // Confirma que o produto existe, está ativo e tem estoque.
  const { data: product } = await supabase
    .from("products")
    .select("id, stock, is_active")
    .eq("id", productId)
    .maybeSingle<{ id: string; stock: number; is_active: boolean }>();
  if (!product || !product.is_active) {
    return { error: "Produto indisponível." };
  }
  if (product.stock < 1) {
    return { error: "Produto esgotado." };
  }

  const cartId = await getOrCreateCart(supabase, userId);
  if (typeof cartId !== "string") return cartId;

  // Soma à quantidade existente, respeitando o estoque disponível.
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle<{ id: string; quantity: number }>();

  const target = Math.min(
    (existingItem?.quantity ?? 0) + qty,
    product.stock,
    MAX_QUANTITY,
  );

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: target })
      .eq("id", existingItem.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity: target });
    if (error) return { error: error.message };
  }

  revalidatePath("/carrinho");
  return { success: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const qty = Math.trunc(quantity);
  if (!itemId || !Number.isInteger(qty) || qty < 1) {
    return { error: "Quantidade inválida." };
  }

  // Resolve o item garantindo que pertence ao carrinho do usuário e lê o estoque.
  const { data: item } = await supabase
    .from("cart_items")
    .select("id, products!inner(stock), carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", userId)
    .maybeSingle<{ id: string; products: { stock: number } }>();
  if (!item) return { error: "Item não encontrado." };

  const target = Math.min(qty, item.products.stock, MAX_QUANTITY);

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: target })
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/carrinho");
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase } = session;

  if (!itemId) return { error: "Item inválido." };

  // A RLS restringe o delete aos itens do próprio carrinho.
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/carrinho");
  return { success: true };
}

export async function clearCart() {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();
  if (!cart) return { success: true };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);
  if (error) return { error: error.message };

  revalidatePath("/carrinho");
  return { success: true };
}
