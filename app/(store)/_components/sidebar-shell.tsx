"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const SidebarCloseContext = createContext<() => void>(() => {});

export function useSidebarClose() {
  return useContext(SidebarCloseContext);
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.65  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export function SidebarShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <SidebarCloseContext.Provider value={close}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 size-10 rounded-xl bg-[#2C1A0E] text-[#F5F0E8]/80 flex items-center justify-center shadow-lg hover:text-[#F5F0E8] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          onClick={close}
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          aria-hidden
        />
      )}

      <aside
        className={`bg-[#2C1A0E] flex flex-col overflow-hidden shrink-0
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200
          md:relative md:w-64 md:min-h-screen md:translate-x-0 md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: GRAIN }}
        />

        {/* Logo */}
        <div className="relative z-10 px-5 pt-7 pb-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" onClick={close} className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="font-heading text-sm font-bold text-primary-foreground leading-none">
                D
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#F5F0E8]/50">
              Dressy
            </span>
          </Link>
          <button
            type="button"
            onClick={close}
            className="md:hidden text-[#F5F0E8]/60 hover:text-[#F5F0E8]/90 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {children}
      </aside>
    </SidebarCloseContext.Provider>
  );
}
