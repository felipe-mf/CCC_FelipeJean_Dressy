import Link from "next/link";

import { CONDITION_LABELS } from "@/lib/products/constants";
import { formatBRL } from "@/lib/format";
import { ProductImage } from "@/components/shared/product-image";
import type { ProductListItem } from "@/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductListItem;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/produto/${product.id}`}
      className="group flex flex-col gap-3 transition-all"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/40">
        <ProductImage
          path={product.image_path}
          alt={product.name}
          name={product.name}
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 bg-background/90 text-secondary-foreground text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
          {CONDITION_LABELS[product.condition]}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {product.store_name}
        </span>
        <h3 className="font-heading text-lg leading-tight text-secondary-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-foreground font-medium">
            {formatBRL(product.price)}
          </span>
          {product.size && (
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Tam. {product.size}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
