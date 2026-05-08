import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CreateStoreForm } from "@/app/(store)/loja/criar/_components/create-store-form";

export default async function CreateStorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) redirect("/loja/dashboard");

  return (
    <section className="max-w-xl w-full mx-auto flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
          Capítulo II
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          Sua <em className="italic">vitrine</em> começa aqui.
        </h2>
        <p className="text-muted-foreground leading-relaxed pt-1">
          Dê um nome à sua loja e, se quiser, descreva a curadoria. Você poderá
          editar logo, banner e descrição depois.
        </p>
      </header>

      <CreateStoreForm />

      <p className="text-sm text-muted-foreground">
        Mudou de ideia?{" "}
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
