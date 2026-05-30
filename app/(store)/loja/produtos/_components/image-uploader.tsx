"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { productImageUrl } from "@/lib/products/image-url";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES as MAX_BYTES,
  MAX_IMAGES_PER_PRODUCT as MAX_IMAGES,
} from "@/lib/products/constants";
import type { ProductImage } from "@/types";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_IMAGE_TYPES);

type Preview = { id: string; file: File; url: string };

export function ImageUploader({
  existing = [],
}: {
  existing?: ProductImage[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kept, setKept] = useState<ProductImage[]>(existing);
  const [removed, setRemoved] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const totalCount = kept.length + previews.length;

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const next: Preview[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPE_SET.has(file.type)) {
        setError("Formato não suportado. Use JPG, PNG, WEBP ou AVIF.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Cada imagem deve ter no máximo 5MB.");
        continue;
      }
      if (totalCount + next.length >= MAX_IMAGES) {
        setError(`No máximo ${MAX_IMAGES} imagens por produto.`);
        break;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      });
    }
    if (next.length > 0) {
      setPreviews((prev) => [...prev, ...next]);
      syncInput([...previews, ...next]);
    }
  }

  function syncInput(list: Preview[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    list.forEach((p) => dt.items.add(p.file));
    inputRef.current.files = dt.files;
  }

  function removePreview(id: string) {
    const target = previews.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    const next = previews.filter((p) => p.id !== id);
    setPreviews(next);
    syncInput(next);
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

        {previews.map((p) => (
          <figure
            key={p.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/30 bg-surface-alt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="absolute inset-0 size-full object-cover" />
            <button
              type="button"
              onClick={() => removePreview(p.id)}
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

        {totalCount < MAX_IMAGES && (
          <label
            className="aspect-[3/4] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-surface-alt/40 transition-colors text-center px-4"
          >
            <span className="font-heading text-3xl text-muted-foreground/60">+</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Adicionar
            </span>
            <input
              ref={inputRef}
              type="file"
              name="images"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
        )}
      </div>

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
