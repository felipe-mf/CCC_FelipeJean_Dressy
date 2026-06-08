import Link from "next/link";

import type { Product, ProductCondition } from "@/types";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Novo",
  like_new: "Seminovo",
  good: "Bom",
  fair: "Regular",
};

const CONDITION_COLORS: Record<ProductCondition, string> = {
  new: "text-primary",
  like_new: "text-secondary-foreground",
  good: "text-muted-foreground",
  fair: "text-muted-foreground/60",
};

export function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          Produtos Recentes
        </span>
        <span className="text-[11px] uppercase tracking-[0.28em] text-primary">
          {products.length} itens
        </span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-2xl font-heading italic text-muted-foreground/40">
            —
          </span>
          <p className="text-sm text-muted-foreground text-center">
            Nenhum produto cadastrado ainda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/loja/produtos/${product.id}`}
              className="flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="font-heading text-foreground leading-tight line-clamp-1">
                  {product.name}
                </span>
                {product.brand && (
                  <span className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.15em]">
                    {product.brand}
                  </span>
                )}
              </div>

              <span className="font-heading text-foreground hidden sm:flex shrink-0">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>

              <span
                className={`text-[11px] uppercase tracking-[0.15em] hidden md:flex shrink-0 ${CONDITION_COLORS[product.condition]}`}
              >
                {CONDITION_LABELS[product.condition]}
              </span>

              <span className="inline-flex items-center gap-1.5 shrink-0">
                <span
                  className={`size-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                />
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {product.is_active ? "Ativo" : "Inativo"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
