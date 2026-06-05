"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/require-customer";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type AddressFields = {
  label: string;
  recipient_name: string;
  postal_code: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  is_default: boolean;
};

function parseFields(formData: FormData): AddressFields | { error: string } {
  const label = (formData.get("label") as string | null)?.trim();
  if (!label || label.length > 40) {
    return { error: "Informe um rótulo de até 40 caracteres (ex: Casa)." };
  }

  const recipient_name = (
    formData.get("recipient_name") as string | null
  )?.trim();
  if (!recipient_name || recipient_name.length < 2 || recipient_name.length > 120) {
    return { error: "Informe o nome de quem recebe (2 a 120 caracteres)." };
  }

  const postal_code = (formData.get("postal_code") as string | null)?.trim();
  if (!postal_code || !/^[0-9]{5}-?[0-9]{3}$/.test(postal_code)) {
    return { error: "CEP inválido. Use o formato 00000-000." };
  }

  const street = (formData.get("street") as string | null)?.trim();
  if (!street || street.length < 2 || street.length > 160) {
    return { error: "Informe a rua (2 a 160 caracteres)." };
  }

  const number = (formData.get("number") as string | null)?.trim();
  if (!number || number.length > 20) {
    return { error: "Informe o número (até 20 caracteres)." };
  }

  const complement =
    (formData.get("complement") as string | null)?.trim() || null;
  if (complement && complement.length > 80) {
    return { error: "O complemento deve ter no máximo 80 caracteres." };
  }

  const district = (formData.get("district") as string | null)?.trim();
  if (!district || district.length < 2 || district.length > 80) {
    return { error: "Informe o bairro (2 a 80 caracteres)." };
  }

  const city = (formData.get("city") as string | null)?.trim();
  if (!city || city.length < 2 || city.length > 80) {
    return { error: "Informe a cidade (2 a 80 caracteres)." };
  }

  const state = (formData.get("state") as string | null)?.trim().toUpperCase();
  if (!state || !/^[A-Z]{2}$/.test(state)) {
    return { error: "Informe a UF com 2 letras (ex: SP)." };
  }

  const is_default = formData.get("is_default") === "on";

  return {
    label,
    recipient_name,
    postal_code,
    street,
    number,
    complement,
    district,
    city,
    state,
    is_default,
  };
}

// Zera a marcação de padrão dos demais endereços do usuário. O índice único
// parcial `addresses_one_default_per_user_idx` exige no máximo um padrão.
async function clearDefault(
  supabase: SupabaseServerClient,
  userId: string,
  exceptId?: string,
): Promise<void> {
  let query = supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);
  if (exceptId) query = query.neq("id", exceptId);
  await query;
}

export async function createAddress(formData: FormData) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const fields = parseFields(formData);
  if ("error" in fields) return fields;

  // Se for o primeiro endereço, torna-o padrão automaticamente.
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  const isFirst = (count ?? 0) === 0;
  const makeDefault = fields.is_default || isFirst;

  if (makeDefault) await clearDefault(supabase, userId);

  const { error } = await supabase
    .from("addresses")
    .insert({ ...fields, user_id: userId, is_default: makeDefault });
  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateAddress(addressId: string, formData: FormData) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  if (!addressId) return { error: "Endereço inválido." };

  const fields = parseFields(formData);
  if ("error" in fields) return fields;

  if (fields.is_default) await clearDefault(supabase, userId, addressId);

  const { data, error } = await supabase
    .from("addresses")
    .update(fields)
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Endereço não encontrado." };

  revalidatePath("/perfil");
  revalidatePath("/checkout");
  return { success: true };
}

export async function setDefaultAddress(addressId: string) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  if (!addressId) return { error: "Endereço inválido." };

  await clearDefault(supabase, userId, addressId);

  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Endereço não encontrado." };

  revalidatePath("/perfil");
  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteAddress(addressId: string) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  if (!addressId) return { error: "Endereço inválido." };

  const { data, error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Endereço não encontrado." };

  revalidatePath("/perfil");
  revalidatePath("/checkout");
  return { success: true };
}
