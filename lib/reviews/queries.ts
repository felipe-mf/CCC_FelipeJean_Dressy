import { createClient } from "@/lib/supabase/server";
import type { RatingValue, Review, ReviewStats, StoreReview } from "@/types";

// Avaliações que o customer autenticado já fez num pedido, indexadas por
// product_id — usado para saber quais itens do pedido já foram avaliados.
export async function getOrderReviews(
  orderId: string,
): Promise<Record<string, Review>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .eq("customer_id", user.id);

  if (error || !data) return {};

  const byProduct: Record<string, Review> = {};
  for (const review of data as Review[]) {
    byProduct[review.product_id] = review;
  }
  return byProduct;
}

function emptyStats(): ReviewStats {
  return {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

// Avaliações das peças de uma loja, com resumo estatístico. Para a aba do
// lojista. Filtra as reviews pela loja via embed da FK product->store numa
// única query (mesmo padrão do dashboard).
export async function getStoreReviews(
  storeId: string,
): Promise<{ reviews: StoreReview[]; stats: ReviewStats }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, products!inner(name, store_id), profiles!inner(name)",
    )
    .eq("products.store_id", storeId)
    .order("created_at", { ascending: false });

  if (error || !data) return { reviews: [], stats: emptyStats() };

  type Row = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    products: { name: string };
    profiles: { name: string | null };
  };

  const reviews: StoreReview[] = (data as unknown as Row[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    product_name: r.products.name,
    customer_name: r.profiles.name,
  }));

  const stats = emptyStats();
  stats.total = reviews.length;
  for (const r of reviews) {
    stats.distribution[r.rating as RatingValue] += 1;
  }
  stats.average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, stats };
}
