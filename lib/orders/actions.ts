"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCustomer } from "@/lib/auth/require-customer";
import { requireMerchant } from "@/lib/auth/require-merchant";
import {
  createPixCharge,
  simulatePixPayment,
} from "@/lib/payments/abacatepay";

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

  // O cliente escolhe entrega/retirada por loja: { "<store_id>": método }.
  const rawMethods = formData.get("methods");
  let methods: Record<string, unknown>;
  let values: unknown[];
  try {
    const parsed = JSON.parse(typeof rawMethods === "string" ? rawMethods : "");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("inválido");
    }
    values = Object.values(parsed);
    if (
      values.length === 0 ||
      !values.every((m) => m === "online" || m === "in_store")
    ) {
      throw new Error("inválido");
    }
    methods = parsed as Record<string, unknown>;
  } catch {
    return { error: "Selecione como receber cada loja." };
  }

  const addressId = (formData.get("address_id") as string | null) || null;
  if (values.includes("online") && !addressId) {
    return { error: "Selecione um endereço de entrega." };
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_methods: methods,
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
    if (msg.includes("Esta loja não faz entrega")) {
      return {
        error: "Uma das lojas só faz retirada. Revise as opções de recebimento.",
      };
    }
    return { error: msg || "Falha ao finalizar o pedido." };
  }

  const orderIds = (data as string[] | null) ?? [];

  // Gera cobranças Pix para os pedidos 'online' recém-criados. Se qualquer
  // chamada à AbacatePay falhar, cancelamos todos os pedidos do checkout — o
  // trigger devolve o estoque. Mantemos a transação "tudo ou nada" do ponto
  // de vista do cliente (não faz sentido um pedido pago e outro sem QR).
  if (orderIds.length > 0) {
    const { data: created } = await supabase
      .from("orders")
      .select("id, total, payment_method")
      .in("id", orderIds);

    const onlineOrders = (created ?? []).filter(
      (o) => o.payment_method === "online",
    );

    for (const order of onlineOrders) {
      try {
        const charge = await createPixCharge({
          // AbacatePay espera centavos; total no banco é numeric(10,2).
          amount: Math.round(Number(order.total) * 100),
          expiresIn: 30 * 60,
          description: `Pedido Dressy #${order.id.slice(0, 8)}`,
          metadata: { order_id: order.id },
        });

        const { error: updateError } = await supabase.rpc(
          "attach_pix_charge",
          {
            p_order_id: order.id,
            p_billing_id: charge.id,
            p_br_code: charge.brCode,
            p_qr_image: charge.brCodeBase64,
            p_expires_at: charge.expiresAt,
          },
        );

        if (updateError) throw new Error(updateError.message);
      } catch (err) {
        await supabase.rpc("cancel_own_pending_orders", {
          p_order_ids: orderIds,
        });

        return {
          error:
            err instanceof Error
              ? `Falha ao gerar Pix: ${err.message}`
              : "Falha ao gerar Pix.",
        };
      }
    }
  }

  revalidatePath("/pedidos");
  revalidatePath("/carrinho");
  revalidatePath("/loja/pedidos");
  revalidatePath("/loja/dashboard");

  if (orderIds.length === 1) redirect(`/pedidos/${orderIds[0]}`);
  redirect("/pedidos");
}

// Simula o pagamento Pix do pedido na AbacatePay (sandbox/devMode) e marca o
// pedido como pago. Habilitado quando `NEXT_PUBLIC_ALLOW_PIX_SIMULATION=1`
// (qualquer ambiente, inclusive produção). Como a API key da AbacatePay é
// sandbox e o endpoint /simulate-payment só responde para cobranças em
// devMode, isso não conclui nenhum Pix real — é seguro deixar ligado no
// deploy enquanto o MVP não tem webhook.
export async function simulateOrderPayment(orderId: string) {
  if (process.env.NEXT_PUBLIC_ALLOW_PIX_SIMULATION !== "1") {
    return { error: "Simulação de pagamento desabilitada." };
  }

  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const { data: order } = await supabase
    .from("orders")
    .select("id, abacate_billing_id, payment_method, payment_status, status")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .maybeSingle<{
      id: string;
      abacate_billing_id: string | null;
      payment_method: "online" | "in_store";
      payment_status: "pending" | "paid";
      status: "pending" | "completed" | "cancelled" | "expired";
    }>();

  if (!order) return { error: "Pedido não encontrado." };
  if (order.payment_method !== "online") {
    return { error: "Este pedido não é pago online." };
  }
  if (order.status !== "pending") {
    return { error: "Este pedido não está mais pendente." };
  }
  if (order.payment_status === "paid") {
    return { error: "Pedido já foi pago." };
  }
  if (!order.abacate_billing_id) {
    return { error: "Cobrança Pix não encontrada para este pedido." };
  }

  try {
    await simulatePixPayment(order.abacate_billing_id);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Falha ao simular pagamento: ${err.message}`
          : "Falha ao simular pagamento.",
    };
  }

  // Sem webhook por enquanto: marcamos pago direto após a AbacatePay confirmar
  // a simulação. Quando houver webhook, esta linha sai e o webhook assume.
  // RPC SECURITY DEFINER porque a RLS não autoriza customer a fazer UPDATE.
  const { error } = await supabase.rpc("mark_order_paid", {
    p_order_id: orderId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/pedidos");
  revalidatePath("/loja/pedidos");
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
