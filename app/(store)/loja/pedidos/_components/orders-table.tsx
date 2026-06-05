"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Clock } from "lucide-react";

import { cancelOrder, confirmSale } from "@/lib/orders/actions";
import { productImageUrl } from "@/lib/products/image-url";
import {
  OrderStatusBadge,
  PAYMENT_METHOD_LABEL,
} from "@/components/shared/order-status-badge";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export interface OrderItemRow {
  name: string;
  quantity: number;
  unit_price: number;
  cover_path: string | null;
}

export interface OrderRow {
  id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  expires_at: string | null;
  created_at: string;
  customer_name: string | null;
  items: OrderItemRow[];
}

type Filter = "pending" | "completed" | "archived";

const FILTERS: { key: Filter; label: string; match: OrderStatus[] }[] = [
  { key: "pending", label: "Pendentes", match: ["pending"] },
  { key: "completed", label: "Concluídos", match: ["completed"] },
  { key: "archived", label: "Cancelados", match: ["cancelled", "expired"] },
];

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function expiryLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Prazo esgotado";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "Expira amanhã" : `Expira em ${days} dias`;
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [filter, setFilter] = useState<Filter>("pending");

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      pending: 0,
      completed: 0,
      archived: 0,
    };
    for (const order of orders) {
      for (const f of FILTERS) {
        if (f.match.includes(order.status)) map[f.key] += 1;
      }
    }
    return map;
  }, [orders]);

  const active = FILTERS.find((f) => f.key === filter)!;
  const visible = orders.filter((o) => active.match.includes(o.status));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const isActive = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "bg-secondary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={isActive ? "text-primary-foreground/70" : "text-primary"}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-2xl font-heading italic text-muted-foreground/40">
            —
          </span>
          <p className="text-sm text-muted-foreground text-center">
            Nenhum pedido {active.label.toLowerCase()} no momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const shortId = order.id.slice(-6).toUpperCase();
  const expiry =
    order.status === "pending" && order.payment_method === "in_store"
      ? expiryLabel(order.expires_at)
      : null;

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmSale(order.id, code);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleCancel() {
    if (!confirm(`Cancelar o pedido #${shortId}? A peça volta ao marketplace.`))
      return;
    setError(null);
    startTransition(async () => {
      const result = await cancelOrder(order.id);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <article
      className={`bg-card border border-border rounded-2xl overflow-hidden transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-heading italic text-primary">#{shortId}</span>
          {order.customer_name && (
            <span className="text-sm text-foreground truncate">
              {order.customer_name}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
            {new Date(order.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-secondary border border-border rounded-full px-2 py-0.5">
            {PAYMENT_METHOD_LABEL[order.payment_method]}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <div className="flex flex-col divide-y divide-border">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3">
            <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-surface-alt border border-border">
              {item.cover_path ? (
                <Image
                  src={productImageUrl(item.cover_path)}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-heading italic">
                  —
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-heading text-foreground leading-tight line-clamp-1">
                {item.name}
              </span>
              <span className="text-[11px] text-muted-foreground/70">
                {item.quantity} × {brl(item.unit_price)}
              </span>
            </div>
            <span className="font-heading text-sm text-foreground shrink-0">
              {brl(item.unit_price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <footer className="flex flex-col gap-3 px-6 py-4 border-t border-border bg-surface/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-text-secondary">
            {expiry && (
              <span className="inline-flex items-center gap-1.5 text-warning">
                <Clock className="size-3.5" />
                {expiry}
              </span>
            )}
          </div>
          <span className="font-heading text-lg text-foreground">
            {brl(order.total)}
          </span>
        </div>

        {order.status === "pending" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="0000"
                aria-label="Código de confirmação"
                className="w-24 bg-surface border border-border rounded-xl px-3 py-2 text-center font-heading text-lg tracking-[0.3em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending || code.length !== 4}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-heading hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Concluir venda
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="inline-flex items-center gap-2 border border-border text-text-secondary px-5 py-2.5 rounded-xl hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
            {error && (
              <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
                {error}
              </p>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
