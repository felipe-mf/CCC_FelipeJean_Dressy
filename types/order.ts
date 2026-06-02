export type OrderStatus = "pending" | "completed" | "cancelled" | "expired";

// 'online' = pagamento pelo app; 'in_store' = pagamento na loja física.
export type PaymentMethod = "online" | "in_store";

export type PaymentStatus = "pending" | "paid";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  // Código de 4 dígitos que o cliente recebe no pedido; o lojista informa para
  // concluir a venda (vale para ambos os métodos de pagamento).
  pickup_code: string;
  total: number;
  // Definido apenas para 'in_store' (created_at + 5 dias).
  expires_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithCustomer extends Order {
  customer_name: string | null;
}

export interface OrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
  customer_name: string | null;
}
