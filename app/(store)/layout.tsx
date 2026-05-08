import { StoreSidebar } from "@/app/(store)/_components/store-sidebar";
import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let store: Store | null = null;
  let merchantName: string | null = null;

  if (user) {
    const [storeRes, profileRes] = await Promise.all([
      supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle(),
      supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    store = storeRes.data;
    merchantName = profileRes.data?.name ?? null;
  }

  return (
    <div className="min-h-screen md:flex bg-background">
      <StoreSidebar store={store} merchantName={merchantName} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 pt-20 pb-8 md:p-12">{children}</main>
      </div>
    </div>
  );
}
