import { requireStorePage } from "@/lib/auth/require-store-page";
import {
  OrdersTable,
  type OrderRow,
} from "@/app/(store)/loja/pedidos/_components/orders-table";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

interface OrderQueryRow {
  id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  expires_at: string | null;
  created_at: string;
  profiles: { name: string | null } | null;
  order_items:
    | {
        quantity: number;
        unit_price: number;
        products: {
          name: string;
          product_images: { path: string; position: number }[] | null;
        } | null;
      }[]
    | null;
}

export default async function OrdersPage() {
  const { supabase, store } = await requireStorePage();

  const { data } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      payment_method,
      payment_status,
      total,
      expires_at,
      created_at,
      profiles!orders_customer_id_fkey ( name ),
      order_items (
        quantity,
        unit_price,
        products (
          name,
          product_images ( path, position )
        )
      )
    `,
    )
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const orders: OrderRow[] = ((data ?? []) as unknown as OrderQueryRow[]).map(
    (order) => ({
      id: order.id,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      total: Number(order.total),
      expires_at: order.expires_at,
      created_at: order.created_at,
      customer_name: order.profiles?.name ?? null,
      items: (order.order_items ?? []).map((item) => {
        const cover = [...(item.products?.product_images ?? [])].sort(
          (a, b) => a.position - b.position,
        )[0];
        return {
          name: item.products?.name ?? "Peça removida",
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          cover_path: cover?.path ?? null,
        };
      }),
    }),
  );

  return (
    <section className="flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-3 max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
          Pedidos
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          Vendas em <em className="italic">andamento</em>.
        </h2>
        <p className="text-muted-foreground leading-relaxed pt-1">
          Acompanhe os pedidos recebidos. Para concluir uma venda, informe o
          código de 4 dígitos que o cliente apresenta na retirada.
        </p>
      </header>

      <OrdersTable orders={orders} />
    </section>
  );
}
