export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "stripe" | "pix";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string | null;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod;
  payment_id: string | null;
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
  payment_method: PaymentMethod | null;
  created_at: string;
  customer_name: string | null;
}
