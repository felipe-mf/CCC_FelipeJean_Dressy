"use client";

import { useState } from "react";

import { FieldInput } from "@/components/ui/field-input";
import { createProduct, updateProduct } from "@/lib/products/actions";
import { PRODUCT_CONDITIONS } from "@/lib/products/constants";
import { CONDITION_LABELS } from "@/app/(store)/loja/produtos/_components/condition-badge";
import { ImageUploader } from "@/app/(store)/loja/produtos/_components/image-uploader";
import type { Product, ProductImage } from "@/types";

export function ProductForm({
  storeId,
  product,
  images = [],
}: {
  storeId: string;
  product?: Product;
  images?: ProductImage[];
}) {
  const editing = Boolean(product);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    setPending(true);
    const result = editing
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);
    setPending(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    if (editing) setSaved(true);
  }

  return (
    <form
      action={handleSubmit}
      onChange={() => setSaved(false)}
      className="flex flex-col gap-8"
    >
      <FieldInput
        label="Nome da peça"
        name="name"
        type="text"
        required
        minLength={2}
        maxLength={120}
        index="01"
        defaultValue={product?.name}
        hint="Como ela aparecerá no marketplace."
      />

      <label className="group flex flex-col gap-2">
        <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span>Descrição</span>
          <span className="text-primary font-heading not-italic">02</span>
        </span>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={product?.description ?? ""}
          className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Conte a história da peça — caimento, tecido, ocasiões."
        />
        <span className="text-xs text-muted-foreground italic font-heading">
          Opcional — até 2000 caracteres.
        </span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FieldInput
          label="Preço (R$)"
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          inputMode="decimal"
          index="03"
          defaultValue={product ? String(product.price) : ""}
          hint="Use ponto para decimais. Ex.: 89.90"
        />

        <FieldInput
          label="Estoque"
          name="stock"
          type="number"
          required
          min={0}
          step={1}
          inputMode="numeric"
          index="04"
          defaultValue={product ? String(product.stock) : "1"}
          hint="Quantidade disponível desta peça."
        />
      </div>

      <label className="group flex flex-col gap-2">
        <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span>Condição</span>
          <span className="text-primary font-heading not-italic">05</span>
        </span>
        <select
          name="condition"
          required
          defaultValue={product?.condition ?? "good"}
          className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-xl text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          {PRODUCT_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FieldInput
          label="Tamanho"
          name="size"
          type="text"
          maxLength={40}
          index="06"
          defaultValue={product?.size ?? ""}
          hint="Ex.: P, M, 38, único."
        />

        <FieldInput
          label="Marca"
          name="brand"
          type="text"
          maxLength={80}
          index="07"
          defaultValue={product?.brand ?? ""}
          hint="Opcional."
        />
      </div>

      <ImageUploader
        storeId={storeId}
        existing={images}
        onUploadingChange={setUploading}
      />

      <label className="group flex items-center justify-between gap-4 border-b border-border py-3 cursor-pointer">
        <span className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
            Produto ativo
          </span>
          <span className="text-xs text-muted-foreground italic font-heading">
            Quando desativado, a peça não aparece no marketplace.
          </span>
        </span>
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
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

      <button
        type="submit"
        disabled={pending || uploading}
        className="group inline-flex items-center justify-between bg-primary text-primary-foreground px-6 py-5 font-heading text-xl hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
      >
        <span>
          {uploading
            ? "Enviando imagens…"
            : pending
              ? editing
                ? "Salvando…"
                : "Publicando…"
              : editing
                ? "Salvar alterações"
                : "Publicar peça"}
        </span>
        <span className="transition-transform group-hover:translate-x-2">→</span>
      </button>
    </form>
  );
}
