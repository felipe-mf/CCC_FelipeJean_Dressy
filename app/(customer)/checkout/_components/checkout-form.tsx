"use client";

import Link from "next/link";
import { useState } from "react";
import { Store, Truck } from "lucide-react";

import { placeOrder } from "@/lib/orders/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import type { Address, PaymentMethod } from "@/types";

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const [method, setMethod] = useState<PaymentMethod>(
    addresses.length > 0 ? "online" : "in_store",
  );
  const [addressId, setAddressId] = useState<string | undefined>(
    defaultAddress?.id,
  );
  const [error, setError] = useState<string | null>(null);

  const { pending, action } = useGuardedSubmit(async (formData) => {
    setError(null);
    // placeOrder redireciona em caso de sucesso; só retorna em caso de erro.
    const result = await placeOrder(formData);
    if (result && "error" in result) setError(result.error);
  });

  return (
    <form action={action} className="flex flex-col gap-10">
      {/* Método de entrega/pagamento */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground mb-3">
          Como você quer receber
        </legend>
        <input type="hidden" name="payment_method" value={method} />

        <button
          type="button"
          onClick={() => setMethod("online")}
          className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors ${
            method === "online"
              ? "border-primary bg-primary-light/40"
              : "border-border hover:border-primary/50"
          }`}
        >
          <Truck className="size-5 mt-0.5 text-primary" strokeWidth={1.5} />
          <span className="flex flex-col gap-1">
            <span className="font-heading text-lg text-secondary-foreground">
              Entrega no endereço
            </span>
            <span className="text-xs text-muted-foreground">
              Pagamento pelo app · você recebe um código de confirmação.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMethod("in_store")}
          className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors ${
            method === "in_store"
              ? "border-primary bg-primary-light/40"
              : "border-border hover:border-primary/50"
          }`}
        >
          <Store className="size-5 mt-0.5 text-primary" strokeWidth={1.5} />
          <span className="flex flex-col gap-1">
            <span className="font-heading text-lg text-secondary-foreground">
              Retirada na loja
            </span>
            <span className="text-xs text-muted-foreground">
              Reserva por 5 dias · pague e retire na loja com o código.
            </span>
          </span>
        </button>
      </fieldset>

      {/* Endereço de entrega (só para entrega) */}
      {method === "online" && (
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
              {addresses.map((addr) => (
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
                      {addr.street}, {addr.number}
                      {addr.complement ? ` — ${addr.complement}` : ""} ·{" "}
                      {addr.district}, {addr.city}/{addr.state} ·{" "}
                      {addr.postal_code}
                    </span>
                  </span>
                </label>
              ))}
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
        disabled={method === "online" && addresses.length === 0}
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
