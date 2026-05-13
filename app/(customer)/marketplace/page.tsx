import { mockProducts } from "@/lib/mocks/products";
import { ProductCard } from "@/app/(customer)/_components/product-card";

export const metadata = {
  title: "Marketplace — Dressy",
  description:
    "Descubra peças únicas curadas por brechós, lojas locais e vendedores formalizados.",
};

export default function MarketplacePage() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <header className="flex flex-col gap-4 max-w-3xl mb-14 md:mb-20">
        <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
          <span>✦</span>
          Edição corrente
        </span>
        <h1
          className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
        >
          Peças com <em className="italic text-primary">história</em>,
          <br /> curadoria com intenção.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed pt-2">
          Um recorte das lojas parceiras desta semana — brechós, alfaiatarias e
          ateliês independentes. Filtre por estilo, tamanho ou condição.
        </p>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border mb-10">
        <span className="text-xs uppercase tracking-[0.24em] text-secondary-foreground">
          {mockProducts.length} peças disponíveis
        </span>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Ordenar:</span>
          <button className="text-secondary-foreground hover:text-primary transition-colors">
            Mais recentes
          </button>
          <span aria-hidden>·</span>
          <button className="hover:text-primary transition-colors">
            Menor preço
          </button>
          <span aria-hidden>·</span>
          <button className="hover:text-primary transition-colors">
            Maior preço
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
