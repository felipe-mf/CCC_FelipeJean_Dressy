import type { OrderRow, OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Aguardando",
    className: "bg-amber-100 text-amber-800",
  },
  paid: {
    label: "Pago",
    className: "bg-blue-100 text-blue-800",
  },
  shipped: {
    label: "Enviado",
    className: "bg-violet-100 text-violet-800",
  },
  delivered: {
    label: "Entregue",
    className: "bg-emerald-100 text-emerald-800",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800",
  },
};

export function OrdersList({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Pedidos Recentes
        </span>
        <span className="text-[11px] uppercase tracking-[0.28em] text-primary">
          {orders.length} pedidos
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-2xl font-heading italic text-muted-foreground/40">
            —
          </span>
          <p className="text-sm text-muted-foreground text-center">
            Nenhum pedido recebido ainda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status];
            const shortId = order.id.slice(-6).toUpperCase();
            return (
              <div
                key={order.id}
                className="flex items-center gap-3 px-6 py-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading italic text-primary text-sm">
                      #{shortId}
                    </span>
                    {order.customer_name && (
                      <span className="text-xs text-muted-foreground truncate">
                        {order.customer_name}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em]">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    {order.payment_method === "pix" ? " · PIX" : " · Cartão"}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="font-heading text-sm text-foreground">
                    {order.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
