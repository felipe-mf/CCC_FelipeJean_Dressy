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

// Produto na listagem do marketplace: campos da vitrine + loja + caminho da
// imagem de capa (1ª posição), que pode ser nulo quando não há imagem.
export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  condition: ProductCondition;
  size: string | null;
  store_name: string;
  store_slug: string;
  image_path: string | null;
}

// Produto na página de detalhe: o registro completo + dados da loja + todas as
// imagens já ordenadas por posição.
export interface ProductDetail extends Product {
  store_name: string;
  store_slug: string;
  images: { path: string; position: number }[];
}
