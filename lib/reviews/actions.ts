"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/require-customer";

// Cria a avaliação de uma peça de um pedido concluído do próprio customer. A
// elegibilidade (pedido 'completed' e que contém o produto) é garantida pela
// RLS de INSERT; aqui validamos a nota e o comentário na borda.
export async function submitReview(input: {
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { error: "Selecione uma nota de 1 a 5." };
  }

  const comment = input.comment.trim().slice(0, 1000) || null;

  const { error } = await supabase.from("reviews").insert({
    customer_id: userId,
    order_id: input.orderId,
    product_id: input.productId,
    rating: input.rating,
    comment,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Você já avaliou esta peça." };
    }
    return { error: "Não foi possível enviar a avaliação." };
  }

  revalidatePath(`/pedidos/${input.orderId}`);
  revalidatePath("/loja/avaliacoes");
  revalidatePath("/loja/dashboard");
  return { success: true };
}
