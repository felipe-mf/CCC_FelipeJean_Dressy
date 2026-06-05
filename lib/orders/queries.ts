import { coverPath } from "@/lib/products/image-url";
import { createClient } from "@/lib/supabase/server";
import type {
  CustomerOrderDetail,
  CustomerOrderRow,
  Order,
  OrderItemWithProduct,
} from "@/types";

type StoreEmbed = { name: string; slug: string };

// Pedidos do customer autenticado, mais recentes primeiro.
export async function getCustomerOrders(): Promise<CustomerOrderRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total, payment_method, pickup_code, created_at, stores!inner(name, slug), order_items(id)",
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  type Row = Pick<
    Order,
    "id" | "status" | "total" | "payment_method" | "pickup_code" | "created_at"
  > & {
    stores: StoreEmbed;
    order_items: { id: string }[] | null;
  };

  return (data as unknown as Row[]).map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total,
    payment_method: o.payment_method,
    pickup_code: o.pickup_code,
    created_at: o.created_at,
    store_name: o.stores.name,
    store_slug: o.stores.slug,
    item_count: (o.order_items ?? []).length,
  }));
}

// Detalhe de um pedido do customer, com itens e produtos.
export async function getCustomerOrder(
  id: string,
): Promise<CustomerOrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, stores!inner(name, slug), order_items(id, product_id, quantity, unit_price, products!inner(name, size, product_images(path, position)))",
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  type ItemRow = {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    products: {
      name: string;
      size: string | null;
      product_images: { path: string; position: number }[] | null;
    };
  };

  const { stores, order_items, ...order } = data as unknown as Order & {
    stores: StoreEmbed;
    order_items: ItemRow[] | null;
  };

  const items: OrderItemWithProduct[] = (order_items ?? []).map((it) => ({
    id: it.id,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    name: it.products.name,
    size: it.products.size,
    image_path: coverPath(it.products.product_images),
  }));

  return {
    ...order,
    store_name: stores.name,
    store_slug: stores.slug,
    items,
  };
}
