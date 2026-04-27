"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const role = formData.get("role");

  if (!email || !password || !name) return { error: "Preencha todos os campos." };
  if (role !== "customer" && role !== "merchant") return { error: "Perfil inválido." };

  const { error } = await supabase.auth.signUp({
    email: email as string,
    password: password as string,
    options: {
      data: {
        name: name as string,
        role,
      },
    },
  });

  if (error) return { error: error.message };

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) return { error: "Preencha todos os campos." };

  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  if (error) return { error: error.message };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
