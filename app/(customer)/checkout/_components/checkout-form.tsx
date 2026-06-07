"use client";

import Link from "next/link";
import { useState } from "react";
import { Store, Truck } from "lucide-react";

import { formatAddressLines, formatBRL } from "@/lib/format";
import { placeOrder } from "@/lib/orders/actions";
import { FulfillmentOption } from "@/app/(customer)/checkout/_components/fulfillment-option";
import { SubmitButton } from "@/components/ui/submit-button";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import type { Address, PaymentMethod } from "@/types";

// Uma loja do carrinho no checkout. Cada loja vira um pedido próprio e tem sua
// própria escolha entrega/retirada, limitada pelo que a loja permite.
export interface CheckoutStoreGroup {
  store_id: string;
  store_name: string;
  offers_delivery: boolean;
  subtotal: number;
}

export function CheckoutForm({
  addresses,
  storeGroups,
}: {
  addresses: Address[];
  storeGroups: CheckoutStoreGroup[];
}) {
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const hasAddress = addresses.length > 0;

  // Padrão por loja: entrega quando a loja entrega E o cliente tem endereço;
  // caso contrário, retirada.
  const [methods, setMethods] = useState<Record<string, PaymentMethod>>(() =>
    Object.fromEntries(
      storeGroups.map((g) => [
        g.store_id,
        g.offers_delivery && hasAddress ? "online" : "in_store",
      ]),
    ),
  );
  const [addressId, setAddressId] = useState<string | undefined>(
    defaultAddress?.id,
  );
  const [error, setError] = useState<string | null>(null);

  const anyDelivery = Object.values(methods).some((m) => m === "online");

  function setMethod(storeId: string, method: PaymentMethod) {
    setMethods((prev) => ({ ...prev, [storeId]: method }));
  }

  const { pending, action } = useGuardedSubmit(async (formData) => {
    setError(null);
    formData.set("methods", JSON.stringify(methods));
    // placeOrder redireciona em caso de sucesso; só retorna em caso de erro.
    const result = await placeOrder(formData);
    if (result && "error" in result) setError(result.error);
  });

  return (
    <form action={action} className="flex flex-col gap-10">
      {/* Recebimento por loja */}
      <div className="flex flex-col gap-8">
        {storeGroups.map((group) => {
          const method = methods[group.store_id];
          return (
            <fieldset key={group.store_id} className="flex flex-col gap-4">
              <legend className="flex items-baseline justify-between w-full mb-3">
                <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
                  {group.store_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBRL(group.subtotal)}
                </span>
              </legend>

              {group.offers_delivery ? (
                <div className="flex flex-col gap-4">
                  <FulfillmentOption
                    icon={Truck}
                    title="Entrega no endereço"
                    description="Pagamento pelo app · você recebe um código de confirmação."
                    selected={method === "online"}
                    onSelect={() => setMethod(group.store_id, "online")}
                  />
                  <FulfillmentOption
                    icon={Store}
                    title="Retirada na loja"
                    description="Reserva por 5 dias · pague e retire na loja com o código."
                    selected={method === "in_store"}
                    onSelect={() => setMethod(group.store_id, "in_store")}
                  />
                </div>
              ) : (
                <FulfillmentOption
                  icon={Store}
                  title="Retirada na loja"
                  description="Esta loja só faz retirada. Reserva por 5 dias · pague e retire na loja com o código."
                />
              )}
            </fieldset>
          );
        })}
      </div>

      {/* Endereço de entrega — só quando alguma loja será entregue */}
      {anyDelivery && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground mb-2">
            Endereço de entrega
          </legend>

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground font-heading italic">
              Você ainda não tem endereços.{" "}
              <Link href="/perfil" className="text-primary underline">
                Cadastrar no perfil
              </Link>{" "}
              ou escolha retirada na loja.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => {
                const { line1, line2 } = formatAddressLines(addr);
                return (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      addressId === addr.id
                        ? "border-primary bg-primary-light/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address_id"
                      value={addr.id}
                      checked={addressId === addr.id}
                      onChange={() => setAddressId(addr.id)}
                      className="mt-1 accent-[#C2622A]"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-secondary-foreground">
                        {addr.label} · {addr.recipient_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {line1} · {line2}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      )}

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}

      <SubmitButton
        pending={pending}
        disabled={anyDelivery && addresses.length === 0}
        className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-lg"
        trailing={
          <span className="transition-transform group-hover:translate-x-1">→</span>
        }
      >
        {pending ? "Finalizando…" : "Confirmar pedido"}
      </SubmitButton>
    </form>
  );
}
