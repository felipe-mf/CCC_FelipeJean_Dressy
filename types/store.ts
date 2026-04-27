export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  reviewCount: number;
}
