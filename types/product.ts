export type ProductCondition = "new" | "like_new" | "good" | "fair";

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  condition: ProductCondition;
  size: string | null;
  brand: string | null;
  is_active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}
