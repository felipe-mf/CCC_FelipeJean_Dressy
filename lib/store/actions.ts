"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const RESERVED_SLUGS = [
  "admin",
  "api",
  "loja",
  "dashboard",
  "criar",
  "signin",
  "signup",
  "app",
];

const MAX_NAME = 80;
const MAX_TEXT = 500;

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

function fallbackSlug(base: string) {
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// Slug a partir do nome; null quando o resultado é vazio ou reservado, deixando
// o caller decidir um fallback em vez de violar o CHECK do banco.
function slugFromName(name: string): string | null {
  const base = slugify(name);
  return base && !RESERVED_SLUGS.includes(base) ? base : null;
}

type MerchantSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

async function requireMerchant(): Promise<MerchantSession | { error: string }> {
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

function validateUrl(
  value: string | null,
  label: string,
): { value: string | null } | { error: string } {
  if (!value) return { value: null };
  if (!/^https?:\/\//i.test(value)) {
    return { error: `${label} deve começar com http:// ou https://.` };
  }
  if (value.length > MAX_TEXT) {
    return { error: `${label} deve ter no máximo ${MAX_TEXT} caracteres.` };
  }
  return { value };
}

export async function createStore(formData: FormData) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const name = (formData.get("name") as string | null)?.trim();
  const description =
    (formData.get("description") as string | null)?.trim() || null;

  if (!name || name.length < 2 || name.length > MAX_NAME) {
    return { error: `Informe um nome entre 2 e ${MAX_NAME} caracteres.` };
  }
  if (description && description.length > MAX_TEXT) {
    return { error: `A descrição deve ter no máximo ${MAX_TEXT} caracteres.` };
  }

  const base = slugFromName(name);
  const payload = { owner_id: userId, name, description, is_active: true };

  let { error } = await supabase
    .from("stores")
    .insert({ ...payload, slug: base ?? fallbackSlug("loja") });

  if (error?.code === "23505") {
    const { data: existing } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();
    if (existing) redirect("/loja/dashboard");

    ({ error } = await supabase
      .from("stores")
      .insert({ ...payload, slug: fallbackSlug(base ?? "loja") }));
  }

  if (error) return { error: error.message };

  revalidatePath("/loja/dashboard");
  redirect("/loja/dashboard");
}

export async function updateStore(formData: FormData) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const name = (formData.get("name") as string | null)?.trim();
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const logoUrl = (formData.get("logo_url") as string | null)?.trim() || null;
  const bannerUrl =
    (formData.get("banner_url") as string | null)?.trim() || null;
  const isActive = formData.get("is_active") === "on";

  if (!name || name.length < 2 || name.length > MAX_NAME) {
    return { error: `Informe um nome entre 2 e ${MAX_NAME} caracteres.` };
  }
  if (description && description.length > MAX_TEXT) {
    return { error: `A descrição deve ter no máximo ${MAX_TEXT} caracteres.` };
  }

  const logo = validateUrl(logoUrl, "A logo");
  if ("error" in logo) return logo;
  const banner = validateUrl(bannerUrl, "O banner");
  if ("error" in banner) return banner;

  const { data: current } = await supabase
    .from("stores")
    .select("name")
    .eq("owner_id", userId)
    .maybeSingle<{ name: string }>();
  if (!current) return { error: "Loja não encontrada." };

  const payload = {
    name,
    description,
    logo_url: logo.value,
    banner_url: banner.value,
    is_active: isActive,
  };

  // Slug só é recalculado quando o nome muda — mantém o endereço público
  // estável em edições de descrição, imagens ou visibilidade.
  const slug = current.name !== name ? slugFromName(name) : null;

  let { error } = await supabase
    .from("stores")
    .update(slug ? { ...payload, slug } : payload)
    .eq("owner_id", userId);

  if (error?.code === "23505" && slug) {
    ({ error } = await supabase
      .from("stores")
      .update({ ...payload, slug: fallbackSlug(slug) })
      .eq("owner_id", userId));
  }

  if (error) return { error: error.message };

  revalidatePath("/loja/dashboard");
  revalidatePath("/loja/configuracoes");
  return { success: true };
}
