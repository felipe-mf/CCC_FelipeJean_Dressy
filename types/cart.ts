import type { ProductCondition } from "@/types/product";

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Item do carrinho enriquecido com dados do produto e da loja para exibição e
// para o agrupamento por loja no carrinho/checkout.
export interface CartItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  stock: number;
  size: string | null;
  condition: ProductCondition;
  image_path: string | null;
  store_id: string;
  store_name: string;
  store_slug: string;
  // Se a loja faz entregas — controla as opções de recebimento no checkout.
  store_offers_delivery: boolean;
}
