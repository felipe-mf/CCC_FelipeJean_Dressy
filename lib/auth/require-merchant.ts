import { createClient } from "@/lib/supabase/server";

export type MerchantSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

export async function requireMerchant(): Promise<
  MerchantSession | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };
  if (user.user_metadata?.role !== "merchant") {
    return { error: "Apenas lojistas podem gerenciar a loja." };
  }
  return { supabase, userId: user.id };
}
