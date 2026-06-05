"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/lib/auth/require-customer";

const MAX_NAME = 120;
const MAX_URL = 500;

export async function updateProfile(formData: FormData) {
  const session = await requireCustomer();
  if ("error" in session) return session;
  const { supabase, userId } = session;

  const name = (formData.get("name") as string | null)?.trim();
  if (!name || name.length < 2 || name.length > MAX_NAME) {
    return { error: `Informe um nome entre 2 e ${MAX_NAME} caracteres.` };
  }

  const avatarUrl = (formData.get("avatar_url") as string | null)?.trim() || null;
  if (avatarUrl) {
    if (!/^https?:\/\//i.test(avatarUrl)) {
      return { error: "O avatar deve começar com http:// ou https://." };
    }
    if (avatarUrl.length > MAX_URL) {
      return { error: `O avatar deve ter no máximo ${MAX_URL} caracteres.` };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name, avatar_url: avatarUrl })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/perfil");
  return { success: true };
}
