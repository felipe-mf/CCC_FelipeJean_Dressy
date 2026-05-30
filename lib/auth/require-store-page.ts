import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type StorePageContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  store: { id: string };
};

/**
 * Guarda compartilhada das páginas do painel da loja (Server Components).
 * Garante sessão e loja existente, redirecionando quando faltar. A verificação
 * de `role = merchant` acontece no `proxy.ts`; aqui o foco é resolver a loja.
 */
export async function requireStorePage(): Promise<StorePageContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle<{ id: string }>();
  if (!store) redirect("/loja/criar");

  return { supabase, userId: user.id, store };
}
