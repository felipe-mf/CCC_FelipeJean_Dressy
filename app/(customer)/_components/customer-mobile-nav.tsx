"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Package, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/marketplace", label: "Marketplace", icon: Home },
  { href: "/closet", label: "Closet", icon: Heart },
  { href: "/pedidos", label: "Pedidos", icon: Package },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function CustomerMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Navegação principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-secondary-foreground hover:text-primary"
                }`}
              >
                <Icon className="size-5" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-wide">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
