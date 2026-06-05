import type { OrderStatus, PaymentMethod } from "@/types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800" },
  completed: { label: "Concluído", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
  expired: { label: "Expirado", className: "bg-surface-alt text-text-secondary" },
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  online: "App",
  in_store: "Loja física",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
