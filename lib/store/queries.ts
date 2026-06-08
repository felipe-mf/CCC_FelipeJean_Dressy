import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types";

// Loja pública por slug (apenas ativa — RLS já filtra, mas mantemos explícito).
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<Store>();
  return data ?? null;
}
