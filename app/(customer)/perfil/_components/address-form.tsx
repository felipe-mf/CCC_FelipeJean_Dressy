"use client";

import { useState } from "react";

import { createAddress, updateAddress } from "@/lib/addresses/actions";
import { Spinner } from "@/components/ui/spinner";
import { submitButtonState } from "@/components/ui/submit-button-label";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import type { Address } from "@/types";

function Field({
  label,
  name,
  defaultValue,
  required = true,
  maxLength,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-[10px] uppercase tracking-[0.24em] text-secondary-foreground">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
      />
    </label>
  );
}

export function AddressForm({
  address,
  onDone,
  onCancel,
}: {
  address?: Address;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const { pending, action: handleSubmit } = useGuardedSubmit(
    async (formData) => {
      setError(null);
      const result = address
        ? await updateAddress(address.id, formData)
        : await createAddress(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onDone();
    },
  );

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Rótulo"
          name="label"
          maxLength={40}
          defaultValue={address?.label}
          placeholder="Casa"
        />
        <Field
          label="Quem recebe"
          name="recipient_name"
          maxLength={120}
          defaultValue={address?.recipient_name}
        />
        <Field
          label="CEP"
          name="postal_code"
          defaultValue={address?.postal_code}
          placeholder="00000-000"
        />
        <Field
          label="UF"
          name="state"
          maxLength={2}
          defaultValue={address?.state}
          placeholder="SP"
        />
        <Field
          label="Rua"
          name="street"
          maxLength={160}
          defaultValue={address?.street}
          className="sm:col-span-2"
        />
        <Field
          label="Número"
          name="number"
          maxLength={20}
          defaultValue={address?.number}
        />
        <Field
          label="Complemento"
          name="complement"
          required={false}
          maxLength={80}
          defaultValue={address?.complement ?? ""}
          placeholder="Apto 12"
        />
        <Field
          label="Bairro"
          name="district"
          maxLength={80}
          defaultValue={address?.district}
        />
        <Field
          label="Cidade"
          name="city"
          maxLength={80}
          defaultValue={address?.city}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="is_default"
          defaultChecked={address?.is_default}
          className="size-4 accent-[#C2622A]"
        />
        <span className="text-xs text-secondary-foreground">
          Usar como endereço padrão
        </span>
      </label>

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading ${submitButtonState(pending)}`}
        >
          {pending && <Spinner className="size-4" />}
          {pending ? "Salvando…" : address ? "Salvar" : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
