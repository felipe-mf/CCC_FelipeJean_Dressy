import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { formatAddressLines, formatBRL, formatDateTime } from "@/lib/format";
import { getCustomerOrder } from "@/lib/orders/queries";
import { getOrderReviews } from "@/lib/reviews/queries";
import {
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
} from "@/components/shared/order-status-badge";
import { ProductImage } from "@/components/shared/product-image";
import { ReviewForm } from "@/app/(customer)/pedidos/[id]/_components/review-form";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getCustomerOrder(id);
  if (!order) notFound();

  const isPending = order.status === "pending";
  const isCompleted = order.status === "completed";
  const reviews = isCompleted ? await getOrderReviews(id) : {};
  const deliveryLines =
    order.payment_method === "online" && order.delivery_address
      ? formatAddressLines(order.delivery_address)
      : null;

  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 max-w-4xl">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-10">
        <Link href="/pedidos" className="hover:text-primary transition-colors">
          Meus pedidos
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground">
          #{order.id.slice(0, 8)}
        </span>
      </nav>

      <header className="flex flex-col gap-3 mb-10">
        <div className="flex items-center gap-3">
          <h1
            className="font-heading tracking-[-0.02em] leading-tight text-secondary-foreground"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {order.store_name}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-sm text-muted-foreground">
          Pedido realizado em {formatDateTime(order.created_at)}
        </span>
      </header>

      {/* Código de retirada em destaque */}
      <div
        className={`flex flex-col gap-2 rounded-2xl border p-6 mb-10 ${
          isPending
            ? "border-primary bg-primary-light/40"
            : "border-border bg-surface"
        }`}
      >
        <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          Código de retirada
        </span>
        <span className="font-heading text-5xl tracking-[0.3em] text-primary">
          {order.pickup_code}
        </span>
        <p className="text-xs text-muted-foreground max-w-md leading-snug">
          {isPending
            ? "Informe este código na loja para concluir a compra. A venda só é finalizada com ele."
            : "Este pedido já foi finalizado."}
        </p>
      </div>

      {/* Itens */}
      <section className="flex flex-col gap-1 mb-10">
        <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground pb-3 border-b border-border">
          Itens
        </span>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-4">
                <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                  <ProductImage
                    path={item.image_path}
                    alt={item.name}
                    name={item.name}
                    sizes="64px"
                    fallbackClassName="text-base"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-secondary-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity}× {formatBRL(item.unit_price)}
                    {item.size ? ` · Tam. ${item.size}` : ""}
                  </span>
                </div>
                <span className="text-sm text-foreground whitespace-nowrap">
                  {formatBRL(item.unit_price * item.quantity)}
                </span>
              </div>
              {isCompleted && (
                <div className="pl-20">
                  <ReviewForm
                    orderId={order.id}
                    productId={item.product_id}
                    existing={reviews[item.product_id]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Resumo */}
      <div className="flex flex-col gap-3 rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center justify-between text-sm text-secondary-foreground">
          <span>Forma de recebimento</span>
          <span>{PAYMENT_METHOD_LABEL[order.payment_method]}</span>
        </div>
        {deliveryLines && (
          <div className="flex items-start justify-between gap-6 text-sm text-secondary-foreground border-t border-border pt-3">
            <span className="shrink-0">Entrega</span>
            <span className="text-right text-muted-foreground">
              {deliveryLines.line1}
              <br />
              {deliveryLines.line2}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-heading text-lg text-secondary-foreground">
            Total
          </span>
          <span className="font-heading text-2xl text-foreground">
            {formatBRL(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
