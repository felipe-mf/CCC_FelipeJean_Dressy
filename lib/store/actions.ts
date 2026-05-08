"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function createStore(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  if (user.user_metadata?.role !== "merchant") {
    return { error: "Apenas lojistas podem criar uma loja." };
  }

  const name = (formData.get("name") as string | null)?.trim();
  const description =
    (formData.get("description") as string | null)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Informe um nome com pelo menos 2 caracteres." };
  }

  const base = slugify(name) || "loja";
  const payload = { owner_id: user.id, name, description, is_active: true };

  let { error } = await supabase
    .from("stores")
    .insert({ ...payload, slug: base });

  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (existing) redirect("/loja/dashboard");

    const fallbackSlug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    ({ error } = await supabase
      .from("stores")
      .insert({ ...payload, slug: fallbackSlug }));
  }

  if (error) return { error: error.message };

  revalidatePath("/loja/dashboard");
  redirect("/loja/dashboard");
}
