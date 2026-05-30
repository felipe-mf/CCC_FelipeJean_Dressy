import Link from "next/link";

import { requireStorePage } from "@/lib/auth/require-store-page";
import { ProductForm } from "@/app/(store)/loja/produtos/_components/product-form";

export default async function NewProductPage() {
  const { store } = await requireStorePage();

  return (
    <section className="max-w-xl w-full mx-auto flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-3">
        <Link
          href="/loja/produtos"
          className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          ← Produtos
        </Link>
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
          Nova peça
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          Conte sobre a <em className="italic">peça</em>.
        </h2>
        <p className="text-muted-foreground leading-relaxed pt-1">
          Capriche nos detalhes — boas fotos e descrição clara fazem a peça
          encontrar a pessoa certa.
        </p>
      </header>

      <ProductForm storeId={store.id} />
    </section>
  );
}
