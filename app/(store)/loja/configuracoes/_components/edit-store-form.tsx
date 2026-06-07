"use client";

import { useState } from "react";
import { FieldInput } from "@/components/ui/field-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { StoreImageUploader } from "@/app/(store)/loja/configuracoes/_components/store-image-uploader";
import { useGuardedSubmit } from "@/lib/hooks/use-guarded-submit";
import { updateStore } from "@/lib/store/actions";
import type { Store } from "@/types";

export function EditStoreForm({ store }: { store: Store }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const uploading = logoUploading || bannerUploading;

  const { pending, action: handleSubmit } = useGuardedSubmit(
    async (formData) => {
      setError(null);
      setSaved(false);
      const result = await updateStore(formData);
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
        label="Nome da loja"
        name="name"
        type="text"
        autoComplete="organization"
        required
        minLength={2}
        maxLength={80}
        index="01"
        defaultValue={store.name}
        hint="O endereço público (@slug) da loja é gerado a partir do nome."
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
          defaultValue={store.description ?? ""}
          className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Conte em poucas linhas o estilo e a curadoria da sua loja."
        />
        <span className="text-xs text-muted-foreground italic font-heading">
          Opcional — até 500 caracteres.
        </span>
      </label>

      <StoreImageUploader
        storeId={store.id}
        name="logo_url"
        kind="logo"
        label="Logo"
        index="03"
        existing={store.logo_url}
        aspect="aspect-square"
        onUploadingChange={setLogoUploading}
      />

      <StoreImageUploader
        storeId={store.id}
        name="banner_url"
        kind="banner"
        label="Banner"
        index="04"
        existing={store.banner_url}
        aspect="aspect-[3/1]"
        onUploadingChange={setBannerUploading}
      />

      <label className="group flex items-center justify-between gap-4 border-b border-border py-3 cursor-pointer">
        <span className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
            Loja ativa
          </span>
          <span className="text-xs text-muted-foreground italic font-heading">
            Quando desativada, sua vitrine não aparece no catálogo.
          </span>
        </span>
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={store.is_active}
          className="size-5 shrink-0 accent-[#C2622A] cursor-pointer"
        />
      </label>

      <label className="group flex items-center justify-between gap-4 border-b border-border py-3 cursor-pointer">
        <span className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
            Faz entregas
          </span>
          <span className="text-xs text-muted-foreground italic font-heading">
            Quando desativado, os clientes só podem retirar na loja.
          </span>
        </span>
        <input
          type="checkbox"
          name="offers_delivery"
          defaultChecked={store.offers_delivery}
          className="size-5 shrink-0 accent-[#C2622A] cursor-pointer"
        />
      </label>

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-primary border-l-2 border-primary pl-3 font-heading italic">
          Alterações salvas ✦
        </p>
      )}

      <SubmitButton
        pending={pending}
        disabled={uploading}
        className="inline-flex items-center justify-between px-6 py-5 text-xl rounded-xl"
        trailing={
          <span className="transition-transform group-hover:translate-x-2">→</span>
        }
      >
        {pending
          ? "Salvando…"
          : uploading
            ? "Enviando imagem…"
            : "Salvar alterações"}
      </SubmitButton>
    </form>
  );
}
