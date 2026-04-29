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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-6 py-3 font-normal">
                Nome
              </th>
              <th className="text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal hidden sm:table-cell">
                Preço
              </th>
              <th className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal hidden md:table-cell">
                Cond.
              </th>
              <th className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-6 py-3 font-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                  i % 2 === 1 ? "bg-muted/10" : ""
                }`}
              >
                <td className="px-6 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading text-foreground leading-tight line-clamp-1">
                      {product.name}
                    </span>
                    {product.brand && (
                      <span className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.15em]">
                        {product.brand}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                  <span className="font-heading text-foreground">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center hidden md:table-cell">
                  <span
                    className={`text-[11px] uppercase tracking-[0.15em] ${CONDITION_COLORS[product.condition]}`}
                  >
                    {CONDITION_LABELS[product.condition]}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                    />
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      {product.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
