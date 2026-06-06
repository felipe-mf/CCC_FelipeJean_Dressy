export interface Review {
  id: string;
  customer_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

// Avaliação enriquecida para a aba do lojista.
export interface StoreReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  product_name: string;
  customer_name: string | null;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<RatingValue, number>;
}
