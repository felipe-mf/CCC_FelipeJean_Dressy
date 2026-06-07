"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteProduct, toggleProductActive } from "@/lib/products/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { productImageUrl } from "@/lib/products/image-url";
import { ConditionBadge } from "@/app/(store)/loja/produtos/_components/condition-badge";
import type { Product } from "@/types";

export type ProductRow = Product & { cover_path: string | null };

export function ProductsListTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.brand ?? ""].some((v) => v.toLowerCase().includes(q)),
    );
  }, [products, query]);

  function handleToggle(product: ProductRow) {
    setError(null);
    setPendingId(product.id);
    startTransition(async () => {
      const result = await toggleProductActive(product.id, !product.is_active);
      setPendingId(null);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDelete(product: ProductRow) {
    setError(null);
    setPendingId(product.id);
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      setPendingId(null);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou marca…"
          className="flex-1 bg-transparent border-0 border-b border-border py-3 font-heading text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
        />
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
          {error}
        </p>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-2xl font-heading italic text-muted-foreground/40">
              —
            </span>
            <p className="text-sm text-muted-foreground text-center">
              {query
                ? "Nenhuma peça encontrada com esse termo."
                : "Nenhum produto cadastrado ainda."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-6 py-3 font-normal">
                  Peça
                </th>
                <th className="text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal hidden sm:table-cell">
                  Preço
                </th>
                <th className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal hidden md:table-cell">
                  Cond.
                </th>
                <th className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal hidden lg:table-cell">
                  Estoque
                </th>
                <th className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 py-3 font-normal">
                  Status
                </th>
                <th className="text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-6 py-3 font-normal">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const busy = pendingId === product.id;
                return (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/loja/produtos/${product.id}`)}
                    className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                      busy ? "opacity-60" : ""
                    } ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-surface-alt border border-border">
                          {product.cover_path ? (
                            <Image
                              src={productImageUrl(product.cover_path)}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-heading italic">
                              —
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <Link
                            href={`/loja/produtos/${product.id}`}
                            className="font-heading text-foreground leading-tight line-clamp-1 hover:text-primary transition-colors"
                          >
                            {product.name}
                          </Link>
                          {product.brand && (
                            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.15em]">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="font-heading text-foreground">
                        {product.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <ConditionBadge condition={product.condition} />
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell text-muted-foreground">
                      {product.stock}
                    </td>
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(product)}
                        disabled={busy}
                        aria-label={
                          product.is_active
                            ? "Desativar produto"
                            : "Ativar produto"
                        }
                        className="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity disabled:cursor-not-allowed"
                      >
                        <span
                          className={`size-1.5 rounded-full ${product.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                        />
                        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                          {product.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </button>
                    </td>
                    <td
                      className="px-6 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/loja/produtos/${product.id}`}
                          aria-label="Editar"
                          className="size-8 inline-flex items-center justify-center rounded-lg hover:bg-surface-alt text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <ConfirmDialog
                          title={`Excluir "${product.name}"?`}
                          description="Esta ação não pode ser desfeita."
                          confirmLabel="Excluir"
                          destructive
                          onConfirm={() => handleDelete(product)}
                          trigger={
                            <button
                              type="button"
                              disabled={busy}
                              aria-label="Excluir"
                              className="size-8 inline-flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:cursor-not-allowed"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
