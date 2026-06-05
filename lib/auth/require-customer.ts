import { createClient } from "@/lib/supabase/server";

export type CustomerSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

export async function requireCustomer(): Promise<
  CustomerSession | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };
  if (user.user_metadata?.role !== "customer") {
    return { error: "Apenas clientes podem realizar esta ação." };
  }
  return { supabase, userId: user.id };
}
