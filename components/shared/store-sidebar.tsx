import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { SidebarNav } from "./sidebar-nav";
import type { Store } from "@/types";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.65  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

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
    <aside className="relative w-64 min-h-screen bg-[#2C1A0E] flex flex-col shrink-0 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN }}
      />

      {/* Logo */}
      <div className="relative z-10 px-5 pt-7 pb-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="font-heading text-sm font-bold text-primary-foreground leading-none">
              D
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#F5F0E8]/50">
            Dressy
          </span>
        </Link>
      </div>

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
    </aside>
  );
}
