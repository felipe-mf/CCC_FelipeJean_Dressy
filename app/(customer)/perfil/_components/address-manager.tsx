"use client";

import { useState, useTransition } from "react";
import { Plus, Star, Trash2 } from "lucide-react";

import { deleteAddress, setDefaultAddress } from "@/lib/addresses/actions";
import { AddressForm } from "@/app/(customer)/perfil/_components/address-form";
import type { Address } from "@/types";

type Mode = { kind: "list" } | { kind: "add" } | { kind: "edit"; id: string };

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddress(id);
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
    });
  }

  const editing =
    mode.kind === "edit" ? addresses.find((a) => a.id === mode.id) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {addresses.length === 0 && mode.kind === "list" && (
          <p className="text-sm text-muted-foreground italic font-heading">
            Nenhum endereço cadastrado.
          </p>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-opacity ${
              pending ? "opacity-50" : ""
            } ${addr.is_default ? "border-primary/60 bg-primary-light/20" : "border-border"}`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                {addr.label}
                {addr.is_default && (
                  <span className="text-[9px] uppercase tracking-[0.18em] text-primary bg-primary-light/60 px-2 py-0.5 rounded-full">
                    Padrão
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {addr.recipient_name} · {addr.street}, {addr.number}
                {addr.complement ? ` — ${addr.complement}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {addr.district}, {addr.city}/{addr.state} · {addr.postal_code}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {!addr.is_default && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  disabled={pending}
                  title="Tornar padrão"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Star className="size-4" strokeWidth={1.5} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode({ kind: "edit", id: addr.id })}
                disabled={pending}
                className="text-xs text-muted-foreground hover:text-secondary-foreground transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                disabled={pending}
                title="Remover"
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {mode.kind === "add" && (
        <AddressForm
          onDone={() => setMode({ kind: "list" })}
          onCancel={() => setMode({ kind: "list" })}
        />
      )}

      {mode.kind === "edit" && editing && (
        <AddressForm
          address={editing}
          onDone={() => setMode({ kind: "list" })}
          onCancel={() => setMode({ kind: "list" })}
        />
      )}

      {mode.kind === "list" && (
        <button
          type="button"
          onClick={() => setMode({ kind: "add" })}
          className="inline-flex items-center gap-2 self-start text-sm text-primary hover:text-[#A84E1F] transition-colors"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          Adicionar endereço
        </button>
      )}
    </div>
  );
}
