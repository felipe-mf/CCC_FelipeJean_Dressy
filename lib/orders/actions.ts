"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCustomer } from "@/lib/auth/require-customer";
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

// Checkout do customer. Delega à função `place_order` no banco, que cria um
// pedido por loja e reserva o estoque numa única transação atômica.
export async function placeOrder(formData: FormData) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase } = session;

  const paymentMethod = formData.get("payment_method");
  if (paymentMethod !== "online" && paymentMethod !== "in_store") {
    return { error: "Selecione um método de pagamento." };
  }

  const addressId = (formData.get("address_id") as string | null) || null;
  if (paymentMethod === "online" && !addressId) {
    return { error: "Selecione um endereço de entrega." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_payment_method: paymentMethod,
    p_address_id: addressId,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("Estoque insuficiente")) {
      return { error: "Uma das peças ficou sem estoque. Revise o carrinho." };
    }
    if (msg.includes("Carrinho vazio")) {
      return { error: "Seu carrinho está vazio." };
    }
    if (msg.includes("Endereço inválido")) {
      return { error: "Endereço inválido." };
    }
    return { error: msg || "Falha ao finalizar o pedido." };
  }

  const orderIds = (data as string[] | null) ?? [];

  revalidatePath("/pedidos");
  revalidatePath("/carrinho");
  revalidatePath("/loja/pedidos");
  revalidatePath("/loja/dashboard");

  if (orderIds.length === 1) redirect(`/pedidos/${orderIds[0]}`);
  redirect("/pedidos");
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
