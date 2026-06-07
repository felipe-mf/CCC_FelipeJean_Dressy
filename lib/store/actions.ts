"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireMerchant } from "@/lib/auth/require-merchant";

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

// O arquivo é enviado direto ao Storage no cliente; a action recebe apenas o
// path e confirma que ele pertence à loja (prefixo <store_id>/), barrando paths
// adulterados que tentariam apontar para a pasta de outra loja.
function validateStoreImagePath(
  value: string | null,
  storeId: string,
  label: string,
): { value: string | null } | { error: string } {
  if (!value) return { value: null };
  if (value.length > MAX_TEXT) {
    return { error: `${label} deve ter no máximo ${MAX_TEXT} caracteres.` };
  }
  if (!value.startsWith(`${storeId}/`)) {
    return { error: `${label}: caminho de imagem inválido.` };
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
  const logoPath = (formData.get("logo_url") as string | null)?.trim() || null;
  const bannerPath =
    (formData.get("banner_url") as string | null)?.trim() || null;
  const isActive = formData.get("is_active") === "on";
  const offersDelivery = formData.get("offers_delivery") === "on";

  if (!name || name.length < 2 || name.length > MAX_NAME) {
    return { error: `Informe um nome entre 2 e ${MAX_NAME} caracteres.` };
  }
  if (description && description.length > MAX_TEXT) {
    return { error: `A descrição deve ter no máximo ${MAX_TEXT} caracteres.` };
  }

  const { data: current } = await supabase
    .from("stores")
    .select("id, name, logo_url, banner_url")
    .eq("owner_id", userId)
    .maybeSingle<{
      id: string;
      name: string;
      logo_url: string | null;
      banner_url: string | null;
    }>();
  if (!current) return { error: "Loja não encontrada." };

  const logo = validateStoreImagePath(logoPath, current.id, "A logo");
  if ("error" in logo) return logo;
  const banner = validateStoreImagePath(bannerPath, current.id, "O banner");
  if ("error" in banner) return banner;

  const payload = {
    name,
    description,
    logo_url: logo.value,
    banner_url: banner.value,
    is_active: isActive,
    offers_delivery: offersDelivery,
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

  // Remove do Storage as imagens antigas que foram trocadas ou removidas,
  // evitando arquivos órfãos no bucket.
  const orphans = [
    current.logo_url !== logo.value ? current.logo_url : null,
    current.banner_url !== banner.value ? current.banner_url : null,
  ].filter((p): p is string => Boolean(p));
  if (orphans.length > 0) {
    await supabase.storage.from("store-images").remove(orphans);
  }

  revalidatePath("/loja/dashboard");
  revalidatePath("/loja/configuracoes");
  return { success: true };
}
