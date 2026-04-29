"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Settings2,
} from "lucide-react";
import { useSidebarClose } from "@/app/(store)/_components/sidebar-shell";

const NAV_ITEMS = [
  { label: "Visão Geral", href: "/loja/dashboard", icon: LayoutDashboard },
  { label: "Produtos", href: "/loja/produtos", icon: Package },
  { label: "Pedidos", href: "/loja/pedidos", icon: ShoppingBag },
  { label: "Avaliações", href: "/loja/avaliacoes", icon: Star },
  { label: "Configurações", href: "/loja/configuracoes", icon: Settings2 },
];

export function SidebarNav() {
  const pathname = usePathname();
  const close = useSidebarClose();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={close}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
              isActive
                ? "border-l-2 border-primary bg-primary/10 text-primary pl-[10px]"
                : "border-l-2 border-transparent text-[#F5F0E8]/50 hover:text-[#F5F0E8]/90 hover:bg-white/5"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span className="font-sans">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
