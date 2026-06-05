"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { removeCartItem, updateCartItem } from "@/lib/cart/actions";
import { formatBRL } from "@/lib/format";
import { ProductImage } from "@/components/shared/product-image";
import type { CartItemWithProduct } from "@/types";

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const [pending, startTransition] = useTransition();

  function setQuantity(quantity: number) {
    if (quantity < 1) return;
    startTransition(async () => {
      await updateCartItem(item.id, quantity);
    });
  }

  function remove() {
    startTransition(async () => {
      await removeCartItem(item.id);
    });
  }

  const atMax = item.quantity >= item.stock;

  return (
    <div
      className={`flex gap-4 py-5 transition-opacity ${pending ? "opacity-50" : ""}`}
    >
      <Link
        href={`/produto/${item.product_id}`}
        className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40"
      >
        <ProductImage
          path={item.image_path}
          alt={item.name}
          name={item.name}
          sizes="80px"
          fallbackClassName="text-lg"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/produto/${item.product_id}`}
          className="font-heading text-lg leading-tight text-secondary-foreground hover:text-primary transition-colors"
        >
          {item.name}
        </Link>
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {item.store_name}
          {item.size ? ` · Tam. ${item.size}` : ""}
        </span>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
            <button
              type="button"
              onClick={() => setQuantity(item.quantity - 1)}
              disabled={pending || item.quantity <= 1}
              aria-label="Diminuir quantidade"
              className="text-secondary-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <Minus className="size-3.5" strokeWidth={1.5} />
            </button>
            <span className="min-w-4 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.quantity + 1)}
              disabled={pending || atMax}
              aria-label="Aumentar quantidade"
              className="text-secondary-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="size-3.5" strokeWidth={1.5} />
            Remover
          </button>
        </div>
        {atMax && (
          <span className="text-[11px] text-warning font-heading italic">
            Quantidade máxima em estoque.
          </span>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        <span className="font-medium text-foreground">
          {formatBRL(item.price * item.quantity)}
        </span>
        {item.quantity > 1 && (
          <span className="text-[11px] text-muted-foreground">
            {formatBRL(item.price)} cada
          </span>
        )}
      </div>
    </div>
  );
}
