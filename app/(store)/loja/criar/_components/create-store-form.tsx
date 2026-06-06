"use client";

import { useState } from "react";
import { FieldInput } from "@/components/ui/field-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import { createStore } from "@/lib/store/actions";

export function CreateStoreForm() {
  const [error, setError] = useState<string | null>(null);

  const { pending, action } = useGuardedSubmit(async (formData) => {
    setError(null);
    const result = await createStore(formData);
    if (result?.error) setError(result.error);
  });

  return (
    <form action={action} className="flex flex-col gap-8">
      <FieldInput
        label="Nome da loja"
        name="name"
        type="text"
        autoComplete="organization"
        required
        minLength={2}
        maxLength={80}
        index="01"
        hint="É como sua vitrine vai aparecer no catálogo."
      />

      <label className="group flex flex-col gap-2">
        <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span>Descrição</span>
          <span className="text-primary font-heading not-italic">02</span>
        </span>
        <textarea
          name="description"
          rows={4}
          maxLength={500}
          className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Conte em poucas linhas o estilo e a curadoria da sua loja."
        />
        <span className="text-xs text-muted-foreground italic font-heading">
          Opcional — pode editar depois.
        </span>
      </label>

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}

      <SubmitButton
        pending={pending}
        className="inline-flex items-center justify-between px-6 py-5 text-xl rounded-xl"
        trailing={
          <span className="transition-transform group-hover:translate-x-2">
            →
          </span>
        }
      >
        {pending ? "Abrindo vitrine…" : "Abrir minha vitrine"}
      </SubmitButton>
    </form>
  );
}
