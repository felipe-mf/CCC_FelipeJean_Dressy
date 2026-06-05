import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

import { formatBRL, formatDate } from "@/lib/format";
import { getCustomerOrders } from "@/lib/orders/queries";
import {
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
} from "@/components/shared/order-status-badge";

export const metadata = {
  title: "Meus pedidos — Dressy",
};

export default async function OrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <span className="text-xs uppercase tracking-[0.32em] text-primary">
          Histórico
        </span>
        <h1
          className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          Meus pedidos
        </h1>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <Package
            className="size-10 text-muted-foreground/50"
            strokeWidth={1.25}
          />
          <p className="text-muted-foreground italic font-heading text-lg">
            Você ainda não fez nenhum pedido.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-heading text-lg hover:bg-[#A84E1F] transition-colors"
          >
            Explorar o marketplace →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border border-t border-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedidos/${order.id}`}
              className="group flex items-center gap-6 py-6 hover:bg-surface/60 transition-colors -mx-4 px-4 rounded-xl"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-lg text-secondary-foreground group-hover:text-primary transition-colors">
                    {order.store_name}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(order.created_at)} · {order.item_count}{" "}
                  {order.item_count === 1 ? "peça" : "peças"} ·{" "}
                  {PAYMENT_METHOD_LABEL[order.payment_method]}
                </span>
                {order.status === "pending" && (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-primary">
                    Código de retirada: {order.pickup_code}
                  </span>
                )}
              </div>
              <span className="font-heading text-xl text-foreground whitespace-nowrap">
                {formatBRL(order.total)}
              </span>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
