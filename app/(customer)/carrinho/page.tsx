import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { formatBRL } from "@/lib/format";
import { getCart } from "@/lib/cart/queries";
import { CartItemRow } from "@/app/(customer)/carrinho/_components/cart-item-row";
import type { CartItemWithProduct } from "@/types";

export const metadata = {
  title: "Carrinho — Dressy",
};

function groupByStore(
  items: CartItemWithProduct[],
): { storeId: string; storeName: string; items: CartItemWithProduct[] }[] {
  const map = new Map<string, CartItemWithProduct[]>();
  for (const item of items) {
    const arr = map.get(item.store_id) ?? [];
    arr.push(item);
    map.set(item.store_id, arr);
  }
  return [...map.entries()].map(([storeId, storeItems]) => ({
    storeId,
    storeName: storeItems[0].store_name,
    items: storeItems,
  }));
}

export default async function CartPage() {
  const items = await getCart();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const groups = groupByStore(items);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <span className="text-xs uppercase tracking-[0.32em] text-primary">
          Sua sacola
        </span>
        <h1
          className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          Carrinho
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <ShoppingBag
            className="size-10 text-muted-foreground/50"
            strokeWidth={1.25}
          />
          <p className="text-muted-foreground italic font-heading text-lg">
            Seu carrinho está vazio.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-heading text-lg hover:bg-[#A84E1F] transition-colors"
          >
            Explorar o marketplace →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <section className="lg:col-span-8 flex flex-col gap-10">
            {groups.map((group) => (
              <div key={group.storeId} className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground pb-3 border-b border-border">
                  {group.storeName}
                </span>
                <div className="divide-y divide-border">
                  {group.items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-col gap-5 rounded-2xl bg-surface border border-border p-6">
              <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
                Resumo
              </span>
              <div className="flex items-center justify-between text-sm text-secondary-foreground">
                <span>
                  {totalItems} {totalItems === 1 ? "item" : "itens"}
                </span>
                <span>{formatBRL(total)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-heading text-lg text-secondary-foreground">
                  Total
                </span>
                <span className="font-heading text-2xl text-foreground">
                  {formatBRL(total)}
                </span>
              </div>
              {groups.length > 1 && (
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Peças de lojas diferentes geram pedidos separados, cada um com
                  seu código de retirada.
                </p>
              )}
              <Link
                href="/checkout"
                className="group flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-heading text-lg hover:bg-[#A84E1F] transition-colors"
              >
                Finalizar compra
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/marketplace"
                className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                Continuar comprando
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
