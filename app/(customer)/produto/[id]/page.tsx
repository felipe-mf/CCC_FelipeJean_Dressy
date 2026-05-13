import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Heart, ShoppingBag, Truck, Undo2 } from "lucide-react";

import { conditionLabels, getMockProductById, mockProducts } from "@/lib/mocks/products";
import { ProductCard } from "@/app/(customer)/_components/product-card";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getMockProductById(id);
  if (!product) return { title: "Peça não encontrada — Dressy" };
  return {
    title: `${product.name} — ${product.store_name} | Dressy`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getMockProductById(id);
  if (!product) notFound();

  const related = mockProducts
    .filter((p) => p.id !== product.id && p.store_id === product.store_id)
    .slice(0, 4);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-10">
        <Link href="/marketplace" className="hover:text-primary transition-colors">
          Marketplace
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/loja/${product.store_slug}`} className="hover:text-primary transition-colors">
          {product.store_name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-secondary-foreground truncate max-w-[40vw]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/40">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
            <span className="absolute top-4 left-4 bg-background/90 text-secondary-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
              {conditionLabels[product.condition]}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl bg-secondary/40 ring-1 ring-border"
              >
                <Image
                  src={product.image_url}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover opacity-90"
                />
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Link
              href={`/loja/${product.store_slug}`}
              className="text-[11px] uppercase tracking-[0.28em] text-primary hover:opacity-80 transition-opacity"
            >
              {product.store_name}
            </Link>
            <h1
              className="font-heading text-secondary-foreground leading-[1] tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 4.2vw, 3rem)" }}
            >
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-heading text-3xl text-foreground">
                {priceFormatter.format(product.price)}
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
              <dd className="text-sm text-secondary-foreground">{product.size ?? "Único"}</dd>
            </div>
            <div className="flex flex-col gap-1 pt-4">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Condição
              </dt>
              <dd className="text-sm text-secondary-foreground">
                {conditionLabels[product.condition]}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Marca
              </dt>
              <dd className="text-sm text-secondary-foreground">{product.brand ?? "Sem marca"}</dd>
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

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              disabled={product.stock === 0}
              className="group flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-heading text-lg hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} />
              <span>{product.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 border border-border text-secondary-foreground px-6 py-4 rounded-xl text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <Heart className="size-4" strokeWidth={1.5} />
              <span>Salvar no closet</span>
            </button>
          </div>

          {product.description && (
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <span className="text-[10px] uppercase tracking-[0.28em] text-primary">
                Sobre a peça
              </span>
              <p className="text-secondary-foreground leading-relaxed">{product.description}</p>
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
            <Link
              href={`/loja/${product.store_slug}`}
              className="text-xs uppercase tracking-[0.24em] text-secondary-foreground hover:text-primary transition-colors hidden sm:inline-flex items-center gap-2"
            >
              Ver vitrine completa
              <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
