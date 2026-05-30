"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireMerchant } from "@/lib/auth/require-merchant";
import {
  MAX_IMAGES_PER_PRODUCT,
  PRODUCT_CONDITIONS,
} from "@/lib/products/constants";
import type { createClient } from "@/lib/supabase/server";
import type { ProductCondition } from "@/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_NAME = 120;
const MAX_DESCRIPTION = 2000;
const MAX_SIZE = 40;
const MAX_BRAND = 80;
const BUCKET = "product-images";

type ProductFields = {
  name: string;
  description: string | null;
  price: number;
  condition: ProductCondition;
  size: string | null;
  brand: string | null;
  stock: number;
  is_active: boolean;
};

function parseFields(formData: FormData): ProductFields | { error: string } {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name || name.length < 2 || name.length > MAX_NAME) {
    return { error: `Informe um nome entre 2 e ${MAX_NAME} caracteres.` };
  }

  const description =
    (formData.get("description") as string | null)?.trim() || null;
  if (description && description.length > MAX_DESCRIPTION) {
    return {
      error: `A descrição deve ter no máximo ${MAX_DESCRIPTION} caracteres.`,
    };
  }

  const priceRaw = (formData.get("price") as string | null)?.replace(",", ".");
  const price = priceRaw ? Number(priceRaw) : NaN;
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Informe um preço válido (≥ 0)." };
  }

  const condition = formData.get("condition") as ProductCondition | null;
  if (!condition || !PRODUCT_CONDITIONS.includes(condition)) {
    return { error: "Selecione uma condição válida." };
  }

  const size = (formData.get("size") as string | null)?.trim() || null;
  if (size && size.length > MAX_SIZE) {
    return { error: `O tamanho deve ter no máximo ${MAX_SIZE} caracteres.` };
  }

  const brand = (formData.get("brand") as string | null)?.trim() || null;
  if (brand && brand.length > MAX_BRAND) {
    return { error: `A marca deve ter no máximo ${MAX_BRAND} caracteres.` };
  }

  const stockRaw = formData.get("stock") as string | null;
  const stock = stockRaw ? Number(stockRaw) : 0;
  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Informe um estoque válido (inteiro ≥ 0)." };
  }

  const is_active = formData.get("is_active") === "on";

  return {
    name,
    description,
    price: Math.round(price * 100) / 100,
    condition,
    size,
    brand,
    stock,
    is_active,
  };
}

// As imagens já foram enviadas ao Storage pelo navegador (upload direto, para
// não trafegar os bytes pela Server Action). Aqui só recebemos os caminhos —
// validamos que cada um pertence à loja do lojista (prefixo `<store_id>/`),
// já que a policy de Storage garante o mesmo na escrita do objeto.
function collectImagePaths(
  formData: FormData,
  storeId: string,
): string[] | { error: string } {
  const paths = formData
    .getAll("image_paths")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  for (const path of paths) {
    if (!path.startsWith(`${storeId}/`)) {
      return { error: "Imagem inválida para esta loja." };
    }
  }
  return paths;
}

export async function createProduct(formData: FormData) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const fields = parseFields(formData);
  if ("error" in fields) return fields;

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle<{ id: string }>();
  if (!store) return { error: "Crie uma loja antes de cadastrar produtos." };

  const paths = collectImagePaths(formData, store.id);
  if (!Array.isArray(paths)) return paths;
  if (paths.length > MAX_IMAGES_PER_PRODUCT) {
    return { error: `No máximo ${MAX_IMAGES_PER_PRODUCT} imagens por produto.` };
  }

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({ ...fields, store_id: store.id })
    .select("id")
    .single<{ id: string }>();
  if (insertError || !product) {
    await removeStorageObjects(supabase, paths);
    return { error: insertError?.message ?? "Falha ao criar produto." };
  }

  const rowError = await insertImageRows(supabase, product.id, paths, 0);
  if (rowError) {
    await supabase.from("products").delete().eq("id", product.id);
    await removeStorageObjects(supabase, paths);
    return { error: rowError };
  }

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/dashboard");
  redirect("/loja/produtos");
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const fields = parseFields(formData);
  if ("error" in fields) return fields;

  const { data: product } = await supabase
    .from("products")
    .select("id, store_id, stores!inner(owner_id)")
    .eq("id", productId)
    .maybeSingle<{
      id: string;
      store_id: string;
      stores: { owner_id: string };
    }>();
  if (!product || product.stores.owner_id !== userId) {
    return { error: "Produto não encontrado." };
  }

  const removePaths = formData
    .getAll("remove_images")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  const newPaths = collectImagePaths(formData, product.store_id);
  if (!Array.isArray(newPaths)) return newPaths;

  const { data: existingImages } = await supabase
    .from("product_images")
    .select("id, path, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  const kept = (existingImages ?? []).filter(
    (img) => !removePaths.includes(img.path),
  );
  if (kept.length + newPaths.length > MAX_IMAGES_PER_PRODUCT) {
    return { error: `No máximo ${MAX_IMAGES_PER_PRODUCT} imagens por produto.` };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update(fields)
    .eq("id", productId);
  if (updateError) return { error: updateError.message };

  if (removePaths.length > 0) {
    await supabase.storage.from(BUCKET).remove(removePaths);
    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .in("path", removePaths);
  }

  const nextPosition =
    kept.length > 0 ? Math.max(...kept.map((i) => i.position)) + 1 : 0;
  const rowError = await insertImageRows(
    supabase,
    productId,
    newPaths,
    nextPosition,
  );
  if (rowError) return { error: rowError };

  revalidatePath("/loja/produtos");
  revalidatePath(`/loja/produtos/${productId}`);
  revalidatePath("/loja/dashboard");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase } = session;

  const { data: images } = await supabase
    .from("product_images")
    .select("path")
    .eq("product_id", productId);

  const paths = (images ?? []).map((i) => i.path);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Produto não encontrado." };

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/dashboard");
  return { success: true };
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
) {
  const session = await requireMerchant();
  if ("error" in session) return session;
  const { supabase } = session;

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Produto não encontrado." };

  revalidatePath("/loja/produtos");
  revalidatePath("/loja/dashboard");
  return { success: true };
}

async function insertImageRows(
  supabase: SupabaseServerClient,
  productId: string,
  paths: string[],
  startPosition: number,
): Promise<string | null> {
  if (paths.length === 0) return null;

  const rows = paths.map((path, idx) => ({
    product_id: productId,
    path,
    position: startPosition + idx,
  }));

  const { error } = await supabase.from("product_images").insert(rows);
  if (error) return `Falha ao registrar imagem: ${error.message}`;
  return null;
}

async function removeStorageObjects(
  supabase: SupabaseServerClient,
  paths: string[],
): Promise<void> {
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}
