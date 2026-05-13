import Link from "next/link";

export function CustomerFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30 mt-24">
      <div className="px-6 md:px-12 lg:px-20 pt-16 pb-10">
        <div className="grid md:grid-cols-12 gap-8 pb-12">
          <div className="md:col-span-6 flex flex-col gap-4">
            <span
              className="font-heading text-secondary-foreground leading-[0.85] tracking-[-0.05em]"
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              Dressy
            </span>
            <p className="italic font-heading text-muted-foreground max-w-sm text-lg">
              Moda circular com memória, curadoria e afeto.
            </p>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 text-sm">
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary mb-2">
              Comprar
            </span>
            <Link href="/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/closet" className="hover:text-primary transition-colors">
              Meu closet
            </Link>
            <Link href="/pedidos" className="hover:text-primary transition-colors">
              Pedidos
            </Link>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 text-sm">
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary mb-2">
              Editorial
            </span>
            <span className="text-muted-foreground">Manifesto</span>
            <span className="text-muted-foreground">Curadoria</span>
            <span className="text-muted-foreground">Processo</span>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 text-sm">
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary mb-2">
              Contato
            </span>
            <span className="text-muted-foreground">contato@dressy.com.br</span>
            <span className="text-muted-foreground">Passo Fundo, BR</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-border text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span>© {year} Dressy — todos os direitos reservados</span>
          <span className="flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            Vol. 01 / MMXXVI
          </span>
        </div>
      </div>
    </footer>
  );
}
