import Link from "next/link";

import { getUserFavorites } from "@/lib/favorites/queries";
import { ProductCard } from "@/app/(customer)/_components/product-card";

export const metadata = {
  title: "Meu closet — Dressy",
  description:
    "Suas peças favoritas guardadas para depois — curadas por você no marketplace da Dressy.",
};

const PRIORITY_IMAGE_COUNT = 4;

export default async function ClosetPage() {
  const favorites = await getUserFavorites();

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <header className="flex flex-col gap-4 max-w-3xl mb-14 md:mb-20">
        <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
          <span>✦</span>
          Seu closet
        </span>
        <h1
          className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
        >
          Peças <em className="italic text-primary">guardadas</em> para
          <br /> voltar com calma.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed pt-2">
          Tudo que você favoritou no marketplace vive aqui. Volte quando quiser
          decidir, comparar tamanhos ou só admirar a curadoria que está
          montando.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center max-w-md mx-auto">
          <span className="font-heading italic text-2xl text-secondary-foreground">
            Seu closet está em branco ✦
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Toque no coração nas peças que despertarem seu interesse e elas
            aparecem por aqui.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading hover:bg-primary/90 transition-colors"
          >
            Explorar marketplace
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pb-6 border-b border-border mb-10">
            <span className="text-xs uppercase tracking-[0.24em] text-secondary-foreground">
              {favorites.length}{" "}
              {favorites.length === 1 ? "peça guardada" : "peças guardadas"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {favorites.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < PRIORITY_IMAGE_COUNT}
                favorited={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
