import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, Undo2 } from "lucide-react";

import { CONDITION_LABELS } from "@/lib/products/constants";
import { formatBRL } from "@/lib/format";
import { getProductById, getRelatedProducts } from "@/lib/products/queries";
import { getFavoritesContext } from "@/lib/favorites/context";
import { AddToCartButton } from "@/app/(customer)/_components/add-to-cart-button";
import { FavoriteButton } from "@/app/(customer)/_components/favorite-button";
import { ProductCard } from "@/app/(customer)/_components/product-card";
import { ProductGallery } from "@/app/(customer)/produto/[id]/_components/product-gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Peça não encontrada — Dressy" };
  return {
    title: `${product.name} — ${product.store_name} | Dressy`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const [related, { isCustomer, favoriteIds }] = await Promise.all([
    getRelatedProducts(product.store_id, product.id),
    getFavoritesContext(),
  ]);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-10">
        <Link href="/marketplace" className="hover:text-primary transition-colors">
          Marketplace
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/lojas/${product.store_slug}`}
          className="text-primary hover:opacity-70 transition-opacity"
        >
          {product.store_name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground truncate max-w-[40vw]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <section className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            name={product.name}
            conditionLabel={CONDITION_LABELS[product.condition]}
          />
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Link
              href={`/lojas/${product.store_slug}`}
              className="w-fit text-[11px] uppercase tracking-[0.28em] text-primary hover:opacity-70 transition-opacity"
            >
              {product.store_name}
            </Link>
            <div className="flex items-start justify-between gap-4">
              <h1
                className="font-heading text-secondary-foreground leading-[1] tracking-[-0.02em]"
                style={{ fontSize: "clamp(2rem, 4.2vw, 3rem)" }}
              >
                {product.name}
              </h1>
              {isCustomer && (
                <FavoriteButton
                  productId={product.id}
                  initialFavorited={favoriteIds.has(product.id)}
                  variant="detail"
                />
              )}
            </div>
            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-heading text-3xl text-foreground">
                {formatBRL(product.price)}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                em até 3x sem juros
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2 border-t border-border">
            <div className="flex flex-col gap-1 pt-4">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Tamanho
              </dt>
              <dd className="text-sm text-secondary-foreground">
                {product.size ?? "Único"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 pt-4">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Condição
              </dt>
              <dd className="text-sm text-secondary-foreground">
                {CONDITION_LABELS[product.condition]}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Marca
              </dt>
              <dd className="text-sm text-secondary-foreground">
                {product.brand ?? "Sem marca"}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Disponibilidade
              </dt>
              <dd className="text-sm text-secondary-foreground">
                {product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}
              </dd>
            </div>
          </dl>

          <div className="pt-2">
            <AddToCartButton productId={product.id} disabled={product.stock === 0} />
          </div>

          {product.description && (
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <span className="text-[10px] uppercase tracking-[0.28em] text-primary">
                Sobre a peça
              </span>
              <p className="text-secondary-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40">
              <Truck className="size-4 mt-0.5 text-primary" strokeWidth={1.5} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary-foreground">
                  Envio em 2 dias
                </span>
                <span className="text-[11px] text-muted-foreground leading-snug">
                  Direto da loja parceira
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40">
              <Undo2 className="size-4 mt-0.5 text-primary" strokeWidth={1.5} />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary-foreground">
                  Troca em 7 dias
                </span>
                <span className="text-[11px] text-muted-foreground leading-snug">
                  Sem custo dentro do prazo
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-24 md:mt-32 pt-12 border-t border-border">
          <div className="flex items-end justify-between gap-6 mb-10">
            <h2
              className="font-heading text-secondary-foreground tracking-[-0.02em] leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
            >
              Mais de <em className="italic text-primary">{product.store_name}</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                favorited={isCustomer ? favoriteIds.has(p.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
