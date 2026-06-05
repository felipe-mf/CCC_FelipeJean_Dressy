import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types";

// Endereços do usuário autenticado, com o padrão primeiro.
export async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Address[];
}
