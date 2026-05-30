import Link from "next/link";
import { notFound } from "next/navigation";

import { requireStorePage } from "@/lib/auth/require-store-page";
import { ProductForm } from "@/app/(store)/loja/produtos/_components/product-form";
import type { Product, ProductImage } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, store } = await requireStorePage();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("store_id", store.id)
    .maybeSingle<Product>();
  if (!product) notFound();

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("position", { ascending: true });

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
          Editar peça
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          {product.name}
        </h2>
      </header>

      <ProductForm
        storeId={store.id}
        product={product}
        images={(images ?? []) as ProductImage[]}
      />
    </section>
  );
}
