import { redirect } from "next/navigation";

import { formatBRL } from "@/lib/format";
import { getAddresses } from "@/lib/addresses/queries";
import { getCart } from "@/lib/cart/queries";
import { CheckoutForm } from "@/app/(customer)/checkout/_components/checkout-form";

export const metadata = {
  title: "Checkout — Dressy",
};

export default async function CheckoutPage() {
  const [items, addresses] = await Promise.all([getCart(), getAddresses()]);
  if (items.length === 0) redirect("/carrinho");

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <span className="text-xs uppercase tracking-[0.32em] text-primary">
          Quase lá
        </span>
        <h1
          className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          Checkout
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <section className="lg:col-span-7">
          <CheckoutForm addresses={addresses} />
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div className="flex flex-col gap-4 rounded-2xl bg-surface border border-border p-6">
            <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
              Seu pedido
            </span>
            <div className="flex flex-col divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-sm text-secondary-foreground">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="text-sm text-foreground whitespace-nowrap">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-heading text-lg text-secondary-foreground">
                Total
              </span>
              <span className="font-heading text-2xl text-foreground">
                {formatBRL(total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
