"use server";

import { revalidatePath } from "next/cache";

import { requireMerchant } from "@/lib/auth/require-merchant";

type StoreRef = { id: string };
type OrderRef = { id: string; status: string; pickup_code: string };

async function resolveStore(
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >,
  userId: string,
): Promise<StoreRef | { error: string }> {
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle<StoreRef>();
  if (!store) return { error: "Loja não encontrada." };
  return store;
}

// Conclui a venda: o lojista informa o código de 4 dígitos que o cliente
// recebeu no pedido. Vale para ambos os métodos de pagamento.
export async function confirmSale(orderId: string, code: string) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const cleanCode = code.trim();
  if (!/^[0-9]{4}$/.test(cleanCode)) {
    return { error: "Informe o código de 4 dígitos." };
  }

  const store = await resolveStore(supabase, userId);
  if ("error" in store) return store;

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, pickup_code")
    .eq("id", orderId)
    .eq("store_id", store.id)
    .maybeSingle<OrderRef>();
  if (!order) return { error: "Pedido não encontrado." };
  if (order.status !== "pending") {
    return { error: "Este pedido não está mais pendente." };
  }
  if (order.pickup_code !== cleanCode) {
    return { error: "Código incorreto." };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "completed",
      payment_status: "paid",
      completed_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("store_id", store.id)
    .eq("status", "pending");
  if (error) return { error: error.message };

  revalidatePath("/loja/pedidos");
  revalidatePath("/loja/dashboard");
  return { success: true };
}

// Cancela um pedido pendente. O trigger do banco devolve o estoque das peças
// reservadas ao marketplace.
export async function cancelOrder(orderId: string) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const store = await resolveStore(supabase, userId);
  if ("error" in store) return store;

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("store_id", store.id)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Pedido não encontrado ou já finalizado." };
  }

  revalidatePath("/loja/pedidos");
  revalidatePath("/loja/dashboard");
  return { success: true };
}
