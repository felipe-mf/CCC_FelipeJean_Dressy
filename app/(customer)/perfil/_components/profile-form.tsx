"use client";

import { useState } from "react";

import { FieldInput } from "@/components/ui/field-input";
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
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    setPending(true);
    const result = await updateProfile(formData);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

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

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-between gap-3 bg-primary text-primary-foreground px-6 py-4 font-heading text-lg hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
      >
        <span>{pending ? "Salvando…" : "Salvar perfil"}</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
