import Link from "next/link";
import { Search, Heart, ShoppingBag, UserRound } from "lucide-react";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/closet", label: "Meu closet" },
  { href: "/pedidos", label: "Pedidos" },
];

export function CustomerNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <hr className="border-border mx-6 md:mx-12 lg:mx-20" />

      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between gap-8">
        <Link
          href="/marketplace"
          className="font-heading text-3xl md:text-4xl tracking-[-0.04em] text-secondary-foreground hover:text-primary transition-colors"
        >
          Dressy
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-secondary-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-secondary-foreground">
          <button
            type="button"
            aria-label="Buscar"
            className="hover:text-primary transition-colors"
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/closet"
            aria-label="Closet virtual"
            className="hover:text-primary transition-colors hidden sm:block"
          >
            <Heart className="size-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/perfil"
            aria-label="Minha conta"
            className="hover:text-primary transition-colors hidden sm:block"
          >
            <UserRound className="size-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className="relative hover:text-primary transition-colors"
          >
            <ShoppingBag className="size-5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
