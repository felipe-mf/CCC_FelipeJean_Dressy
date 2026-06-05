import Image from "next/image";

import { productImageUrl } from "@/lib/products/image-url";

// Imagem de produto com fallback: quando não há `path`, mostra a inicial do
// nome num bloco neutro. Renderiza dentro de um container `relative` do pai
// (que define o aspect ratio e eventuais overlays).
export function ProductImage({
  path,
  alt,
  name,
  sizes,
  priority = false,
  className = "object-cover",
  fallbackClassName = "text-2xl",
}: {
  path: string | null;
  alt: string;
  name: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fallbackClassName?: string;
}) {
  if (!path) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span
          className={`font-heading italic text-muted-foreground/50 ${fallbackClassName}`}
        >
          {name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={productImageUrl(path)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
