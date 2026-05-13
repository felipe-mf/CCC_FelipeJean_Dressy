import Link from "next/link";
import Image from "next/image";
import type { MockProduct } from "@/lib/mocks/products";
import { conditionLabels } from "@/lib/mocks/products";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductCard({ product }: { product: MockProduct }) {
  return (
    <Link
      href={`/produto/${product.id}`}
      className="group flex flex-col gap-3 transition-all"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/40">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 bg-background/90 text-secondary-foreground text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
          {conditionLabels[product.condition]}
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
            {priceFormatter.format(product.price)}
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
