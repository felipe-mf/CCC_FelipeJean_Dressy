import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { getAddresses } from "@/lib/addresses/queries";
import { ProfileForm } from "@/app/(customer)/perfil/_components/profile-form";
import { AddressManager } from "@/app/(customer)/perfil/_components/address-manager";

export const metadata = {
  title: "Minha conta — Dressy",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const [{ data: profile }, addresses] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle<{ name: string; avatar_url: string | null }>(),
    getAddresses(),
  ]);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 max-w-3xl">
      <header className="flex items-end justify-between gap-4 mb-12">
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.32em] text-primary">
            Sua conta
          </span>
          <h1
            className="font-heading tracking-[-0.025em] leading-[0.95] text-secondary-foreground"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
          >
            Perfil
          </h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors"
          >
            Sair
          </button>
        </form>
      </header>

      <section className="mb-16">
        <ProfileForm
          name={profile?.name ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-t border-border pt-8">
          <h2 className="font-heading text-2xl text-secondary-foreground">
            Endereços
          </h2>
          <p className="text-sm text-muted-foreground">
            Usados na entrega dos seus pedidos.
          </p>
        </div>
        <AddressManager addresses={addresses} />
      </section>
    </div>
  );
}
