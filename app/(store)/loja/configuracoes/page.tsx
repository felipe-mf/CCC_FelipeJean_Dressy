import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EditStoreForm } from "@/app/(store)/loja/configuracoes/_components/edit-store-form";
import type { Store } from "@/types";

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle<Store>();
  if (!store) redirect("/loja/criar");

  return (
    <section className="max-w-xl w-full mx-auto flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
          Configurações
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          Ajuste sua <em className="italic">vitrine</em>.
        </h2>
        <p className="text-muted-foreground leading-relaxed pt-1">
          Atualize o nome, a descrição, as imagens e a visibilidade da sua loja.
          O endereço público (@{store.slug}) é gerado a partir do nome e muda ao
          renomear a loja.
        </p>
      </header>

      <EditStoreForm store={store} />

      <p className="text-sm text-muted-foreground">
        Tudo certo?{" "}
        <Link
          href="/loja/dashboard"
          className="font-heading text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary transition-colors"
        >
          Voltar ao painel →
        </Link>
      </p>
    </section>
  );
}
