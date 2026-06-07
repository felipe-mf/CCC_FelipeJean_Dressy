"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { storeImageUrl } from "@/lib/store/image-url";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES as MAX_BYTES,
} from "@/lib/products/constants";

const BUCKET = "store-images";
const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_IMAGE_TYPES);

function extFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/").pop() ?? "bin";
}

export function StoreImageUploader({
  storeId,
  name,
  kind,
  label,
  index,
  existing = null,
  aspect = "aspect-square",
  onUploadingChange,
}: {
  storeId: string;
  name: "logo_url" | "banner_url";
  kind: "logo" | "banner";
  label: string;
  index: string;
  existing?: string | null;
  aspect?: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string | null>(existing);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  async function addFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_TYPE_SET.has(file.type)) {
      setError("Formato não suportado. Use JPG, PNG, WEBP ou AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    const path = `${storeId}/${kind}-${crypto.randomUUID()}.${extFor(file)}`;
    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);

    if (uploadError) {
      setError(`Falha ao enviar imagem: ${uploadError.message}`);
      return;
    }

    // Remove a imagem anterior recém-enviada para não deixar órfãos no Storage.
    // A imagem persistida (existing) é limpa pela Server Action após salvar.
    if (value && value !== existing) {
      await supabase.storage.from(BUCKET).remove([value]);
    }
    setValue(path);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove() {
    if (value && value !== existing) {
      await supabase.storage.from(BUCKET).remove([value]);
    }
    setValue(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
        <span>{label}</span>
        <span className="text-primary font-heading not-italic">{index}</span>
      </span>

      <div className={`relative ${aspect} w-full max-w-md`}>
        {value ? (
          <figure className="relative size-full rounded-xl overflow-hidden border border-border bg-surface-alt">
            <Image
              src={storeImageUrl(value)}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover"
            />
            <button
              type="button"
              onClick={remove}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 size-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </figure>
        ) : uploading ? (
          <div className="size-full rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 bg-surface-alt/40">
            <Spinner className="size-6 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Enviando…
            </span>
          </div>
        ) : (
          <label className="size-full rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-surface-alt/40 transition-colors text-center px-4">
            <span className="font-heading text-3xl text-muted-foreground/60">
              +
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Escolher foto
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => addFile(e.target.files)}
            />
          </label>
        )}
      </div>

      <input type="hidden" name={name} value={value ?? ""} />

      {error && (
        <p className="text-xs text-destructive font-heading italic">{error}</p>
      )}
      <p className="text-xs text-muted-foreground italic font-heading">
        Opcional — JPG, PNG, WEBP ou AVIF, até 5MB.
      </p>
    </div>
  );
}
