import Link from "next/link";

import { requireStorePage } from "@/lib/auth/require-store-page";
import {
  ProductsListTable,
  type ProductRow,
} from "@/app/(store)/loja/produtos/_components/products-list-table";
import type { Product } from "@/types";

export default async function ProductsPage() {
  const { supabase, store } = await requireStorePage();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(path, position)")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  type Row = Product & {
    product_images: { path: string; position: number }[] | null;
  };
  const rows: ProductRow[] = ((products ?? []) as Row[]).map(
    ({ product_images, ...product }) => {
      const cover = [...(product_images ?? [])].sort(
        (a, b) => a.position - b.position,
      )[0];
      return { ...product, cover_path: cover?.path ?? null };
    },
  );

  return (
    <section className="flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
            Produtos
          </span>
          <h2
            className="font-heading tracking-[-0.02em] leading-[0.98]"
            style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
          >
            Sua <em className="italic">vitrine</em>.
          </h2>
          <p className="text-muted-foreground leading-relaxed pt-1">
            Cadastre peças, organize sua curadoria e controle a disponibilidade
            no marketplace.
          </p>
        </div>

        <Link
          href="/loja/produtos/novo"
          className="group inline-flex items-center justify-between gap-3 bg-primary text-primary-foreground px-6 py-4 font-heading text-lg hover:bg-[#A84E1F] transition-colors rounded-xl shrink-0"
        >
          <span>Nova peça</span>
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </header>

      <ProductsListTable products={rows} />
    </section>
  );
}
