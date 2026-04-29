import { signOut } from "@/lib/auth/actions";
import { SidebarShell } from "@/app/(store)/_components/sidebar-shell";
import { SidebarNav } from "@/app/(store)/_components/sidebar-nav";
import type { Store } from "@/types";

interface StoreSidebarProps {
  store: Store | null;
  merchantName: string | null;
}

export function StoreSidebar({ store, merchantName }: StoreSidebarProps) {
  const initials = store
    ? store.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "D";

  return (
    <SidebarShell>
      {/* Store info */}
      <div className="relative z-10 px-5 py-5 border-b border-white/10">
        <span className="text-[10px] uppercase tracking-[0.32em] text-primary flex items-center gap-2 mb-3">
          <span aria-hidden>✦</span>
          Minha Loja
        </span>

        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#F5F0E8]/8 border border-white/10 flex items-center justify-center shrink-0">
            <span className="font-heading text-sm text-[#F5F0E8]/80">
              {initials}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-heading text-[#F5F0E8]/90 text-sm leading-tight truncate">
              {store?.name ?? "Sem loja"}
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5 ${
                store?.is_active ? "text-primary" : "text-[#F5F0E8]/30"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${store?.is_active ? "bg-primary" : "bg-[#F5F0E8]/20"}`}
              />
              {store?.is_active ? "Ativa" : "Inativa"}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="relative z-10 flex-1 px-3 py-4">
        <SidebarNav />
      </div>

      {/* Footer */}
      <div className="relative z-10 px-5 py-5 border-t border-white/10">
        <div className="flex flex-col gap-3">
          {merchantName && (
            <span className="text-[11px] text-[#F5F0E8]/40 truncate">
              {merchantName}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="text-[11px] uppercase tracking-[0.28em] text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60 transition-colors"
            >
              Sair →
            </button>
          </form>
        </div>
      </div>
    </SidebarShell>
  );
}
