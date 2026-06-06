"use client";

import { useState } from "react";

import { FieldInput } from "@/components/ui/field-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import { updateProfile } from "@/lib/profile/actions";

export function ProfileForm({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { pending, action: handleSubmit } = useGuardedSubmit(
    async (formData) => {
      setError(null);
      setSaved(false);
      const result = await updateProfile(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(true);
    },
  );

  return (
    <form
      action={handleSubmit}
      onChange={() => setSaved(false)}
      className="flex flex-col gap-8"
    >
      <FieldInput
        label="Nome"
        name="name"
        type="text"
        autoComplete="name"
        required
        minLength={2}
        maxLength={120}
        index="01"
        defaultValue={name}
      />

      <FieldInput
        label="Avatar (URL)"
        name="avatar_url"
        type="url"
        maxLength={500}
        index="02"
        defaultValue={avatarUrl ?? ""}
        hint="Endereço de uma imagem (https://…). Opcional."
      />

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-primary border-l-2 border-primary pl-3 font-heading italic">
          Perfil atualizado ✦
        </p>
      )}

      <SubmitButton
        pending={pending}
        className="inline-flex items-center justify-between gap-3 px-6 py-4 text-lg rounded-xl"
        trailing={
          <span className="transition-transform group-hover:translate-x-1">→</span>
        }
      >
        {pending ? "Salvando…" : "Salvar perfil"}
      </SubmitButton>
    </form>
  );
}
