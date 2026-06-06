"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { productImageUrl } from "@/lib/products/image-url";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES as MAX_BYTES,
  MAX_IMAGES_PER_PRODUCT as MAX_IMAGES,
} from "@/lib/products/constants";
import type { ProductImage } from "@/types";

const BUCKET = "product-images";
const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_IMAGE_TYPES);

type Uploaded = { id: string; path: string; url: string };

function extFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return file.type.split("/").pop() ?? "bin";
}

export function ImageUploader({
  storeId,
  existing = [],
  onUploadingChange,
}: {
  storeId: string;
  existing?: ProductImage[];
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [kept, setKept] = useState<ProductImage[]>(existing);
  const [removed, setRemoved] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(uploading > 0);
  }, [uploading, onUploadingChange]);

  const totalCount = kept.length + uploaded.length;

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    let slots = MAX_IMAGES - totalCount;
    for (const file of Array.from(files)) {
      if (slots <= 0) {
        setError(`No máximo ${MAX_IMAGES} imagens por produto.`);
        break;
      }
      if (!ALLOWED_TYPE_SET.has(file.type)) {
        setError("Formato não suportado. Use JPG, PNG, WEBP ou AVIF.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Cada imagem deve ter no máximo 5MB.");
        continue;
      }
      slots -= 1;

      const path = `${storeId}/${crypto.randomUUID()}.${extFor(file)}`;
      setUploading((n) => n + 1);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      setUploading((n) => n - 1);

      if (uploadError) {
        setError(`Falha ao enviar imagem: ${uploadError.message}`);
        continue;
      }
      setUploaded((prev) => [
        ...prev,
        { id: crypto.randomUUID(), path, url: productImageUrl(path) },
      ]);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeUploaded(item: Uploaded) {
    setUploaded((prev) => prev.filter((u) => u.id !== item.id));
    await supabase.storage.from(BUCKET).remove([item.path]);
  }

  function removeExisting(path: string) {
    setKept((prev) => prev.filter((img) => img.path !== path));
    setRemoved((prev) => [...prev, path]);
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
        <span>Imagens do produto</span>
        <span className="text-muted-foreground/70">
          {totalCount}/{MAX_IMAGES}
        </span>
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kept.map((img) => (
          <figure
            key={img.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-surface-alt"
          >
            <Image
              src={productImageUrl(img.path)}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeExisting(img.path)}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 size-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </figure>
        ))}

        {uploaded.map((item) => (
          <figure
            key={item.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/30 bg-surface-alt"
          >
            <Image
              src={item.url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeUploaded(item)}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 size-7 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.18em] text-primary bg-background/90 px-2 py-0.5 rounded">
              Nova
            </span>
          </figure>
        ))}

        {uploading > 0 && (
          <div className="aspect-[3/4] rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 bg-surface-alt/40">
            <Spinner className="size-6 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Enviando…
            </span>
          </div>
        )}

        {totalCount < MAX_IMAGES && (
          <label className="aspect-[3/4] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-surface-alt/40 transition-colors text-center px-4">
            <span className="font-heading text-3xl text-muted-foreground/60">
              +
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Adicionar
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {uploaded.map((item) => (
        <input key={item.id} type="hidden" name="image_paths" value={item.path} />
      ))}
      {removed.map((path) => (
        <input key={path} type="hidden" name="remove_images" value={path} />
      ))}

      {error && (
        <p className="text-xs text-destructive font-heading italic">{error}</p>
      )}
      <p className="text-xs text-muted-foreground italic font-heading">
        Até {MAX_IMAGES} imagens, 5MB cada. A primeira é a capa.
      </p>
    </div>
  );
}
