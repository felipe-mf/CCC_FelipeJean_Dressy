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
  // Endereço de entrega escolhido no checkout; nulo em retirada na loja ou se o
  // endereço foi removido do perfil depois.
  address_id: string | null;
  // 'in_store' = created_at + 5 dias; 'online' = created_at + 30 min.
  expires_at: string | null;
  // Cobrança Pix na AbacatePay (Checkout Transparente). Preenchido na criação
  // do pedido 'online'; nulo em 'in_store'.
  abacate_billing_id: string | null;
  // EMV BR Code (copia-e-cola).
  pix_br_code: string | null;
  // PNG do QR Code em base64 (já com prefixo data:image/png;base64,).
  pix_qr_image: string | null;
  pix_expires_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Endereço de entrega de um pedido (snapshot exibido nas telas de pedido).
// Presente apenas em pedidos com entrega ('online').
export interface OrderAddress {
  recipient_name: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
}

// Item de pedido enriquecido com dados do produto para a visão do customer.
export interface OrderItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  name: string;
  size: string | null;
  image_path: string | null;
}

// Pedido na listagem "Meus pedidos" do customer.
export interface CustomerOrderRow {
  id: string;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  pickup_code: string;
  created_at: string;
  store_name: string;
  store_slug: string;
  item_count: number;
}

// Pedido detalhado do customer (com itens e loja).
export interface CustomerOrderDetail extends Order {
  store_name: string;
  store_slug: string;
  // Endereço de entrega — presente apenas em pedidos 'online'.
  delivery_address: OrderAddress | null;
  items: OrderItemWithProduct[];
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
