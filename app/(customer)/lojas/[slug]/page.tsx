import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";

import { getProductsByStore } from "@/lib/products/queries";
import { getStoreBySlug } from "@/lib/store/queries";
import { storeImageUrl } from "@/lib/store/image-url";
import { getFavoritesContext } from "@/lib/favorites/context";
import { ProductCard } from "@/app/(customer)/_components/product-card";

const PRIORITY_IMAGE_COUNT = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Loja não encontrada — Dressy" };
  return {
    title: `${store.name} — Dressy`,
    description:
      store.description ??
      `Peças selecionadas por ${store.name} no marketplace da Dressy.`,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const [products, { isCustomer, favoriteIds }] = await Promise.all([
    getProductsByStore(store.id),
    getFavoritesContext(),
  ]);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-8">
        <Link
          href="/marketplace"
          className="hover:text-primary transition-colors"
        >
          Marketplace
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground truncate max-w-[50vw]">
          {store.name}
        </span>
      </nav>

      {/* Banner */}
      <div className="relative aspect-[16/6] md:aspect-[5/1.4] w-full overflow-hidden rounded-2xl bg-secondary/40">
        {store.banner_url ? (
          <Image
            src={storeImageUrl(store.banner_url)}
            alt={`Banner de ${store.name}`}
            fill
            priority
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-secondary/40 to-secondary" />
        )}
      </div>

      {/* Cabeçalho da loja: logo sobreposta ao banner */}
      <header className="relative -mt-12 md:-mt-16 px-1 md:px-6 flex flex-col md:flex-row md:items-end gap-5 md:gap-7">
        <div className="relative size-24 md:size-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-sm">
          {store.logo_url ? (
            <Image
              src={storeImageUrl(store.logo_url)}
              alt={`Logo de ${store.name}`}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/40">
              <span className="font-heading italic text-3xl md:text-4xl text-muted-foreground/60">
                {store.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 md:pb-2">
          <span className="text-[11px] uppercase tracking-[0.28em] text-primary">
            @{store.slug}
          </span>
          <h1
            className="font-heading text-secondary-foreground leading-[1] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
          >
            {store.name}
          </h1>
          {!store.offers_delivery && (
            <span className="inline-flex w-fit items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-secondary-foreground bg-secondary/50 rounded-full px-3 py-1 mt-1">
              <MapPin className="size-3" strokeWidth={1.5} />
              Somente retirada
            </span>
          )}
        </div>
      </header>

      {store.description && (
        <p className="mt-6 px-1 md:px-6 max-w-2xl text-secondary-foreground leading-relaxed">
          {store.description}
        </p>
      )}

      <div className="pb-6 border-b border-border mt-10 mb-10">
        <span className="text-xs uppercase tracking-[0.24em] text-secondary-foreground">
          {products.length} {products.length === 1 ? "peça" : "peças"}{" "}
          disponíveis
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground italic font-heading text-lg py-20 text-center">
          Esta loja ainda não tem peças disponíveis. Volte em breve ✦
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < PRIORITY_IMAGE_COUNT}
              favorited={isCustomer ? favoriteIds.has(product.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
