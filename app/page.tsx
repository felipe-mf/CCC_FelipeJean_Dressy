import Link from "next/link";

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

const tickerItems = [
  "Moda circular",
  "IA que escuta estilo",
  "Brechós curados",
  "Closet virtual",
  "Compra consciente",
  "Autoria pessoal",
];

const chapters = [
  {
    n: "01",
    title: "Retrato de estilo",
    body: "Um questionário breve e fotos do seu guarda-roupa atual. A Dressy aprende sua paleta, silhuetas preferidas e hábitos antes de sugerir qualquer coisa.",
    tag: "Perfil",
  },
  {
    n: "02",
    title: "Curadoria por IA",
    body: "A inteligência artificial lê o retrato e cruza com o acervo das lojas parceiras. Nada de vitrine aleatória — cada sugestão tem motivo.",
    tag: "Inteligência",
  },
  {
    n: "03",
    title: "Compras com memória",
    body: "Peças viram parte do seu closet virtual. O histórico informa futuras recomendações, evitando repetições e compras impulsivas.",
    tag: "Ritual",
  },
];

function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center gap-12 px-6">
      {tickerItems.map((item, i) => (
        <span key={i} className="flex items-center gap-12">
          <span>{item}</span>
          <span className="text-primary">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="border-y border-border bg-secondary/40 overflow-hidden">
      <div
        className="flex whitespace-nowrap py-5 font-heading italic text-2xl md:text-3xl text-secondary-foreground"
        style={{ animation: "dressy-marquee 45s linear infinite" }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="relative bg-background text-foreground font-sans min-h-screen flex flex-col flex-1 w-full overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.12] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_SVG }}
      />

      <div className="relative z-10 flex flex-col">
        <div className="px-6 md:px-12 lg:px-20 pt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span className="flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            Est. 2026
          </span>
          <span className="hidden md:inline">Vol. 01 / Outono ’26</span>
          <span className="flex items-center gap-6">
            <Link
              href="/signin"
              className="hover:text-primary transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="text-primary hover:opacity-80 transition-opacity"
            >
              Criar conta
            </Link>
          </span>
        </div>

        <hr className="border-border mt-6 mx-6 md:mx-12 lg:mx-20" />

        <div className="px-6 md:px-12 lg:px-20 py-2 flex items-baseline justify-between gap-4">
          <h1
            className="font-heading text-secondary-foreground tracking-[-0.055em] leading-[0.82]"
            style={{ fontSize: "clamp(4.5rem, 22vw, 26rem)" }}
          >
            Dressy
          </h1>
          <span className="hidden lg:block font-heading italic text-xl text-secondary-foreground self-end pb-6">
            — nº 01
          </span>
        </div>

        <hr className="border-border mx-6 md:mx-12 lg:mx-20" />

        <section className="grid md:grid-cols-12 gap-8 md:gap-12 px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <div className="md:col-span-7 flex flex-col gap-8">
            <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
              <span>✦</span>
              Dossiê de abertura
            </span>
            <h2
              className="font-heading leading-[0.95] tracking-[-0.025em] text-foreground text-balance"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)" }}
            >
              Um guarda-roupa <br />
              com <em className="italic text-primary">intenção</em> —<br />
              uma curadoria <br />
              com <em className="italic">memória</em>.
            </h2>
          </div>

          <div className="md:col-span-5 md:col-start-8 flex flex-col gap-6 md:pt-24">
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-md">
              A Dressy reúne brechós curados, lojas locais e vendedores
              independentes num só lugar. Responda ao questionário de estilo,
              envie fotos do seu closet e receba recomendações traçadas por uma
              inteligência que lê contexto — não só tendência.
            </p>

            <div className="flex flex-col pt-6 border-t border-border">
              <Link
                href="/signup"
                className="group flex items-center justify-between font-heading text-2xl text-foreground border-b border-border py-5 hover:text-primary transition-colors"
              >
                <span>Criar uma conta</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
              <Link
                href="/signin"
                className="group flex items-center justify-between text-xs uppercase tracking-[0.28em] text-secondary-foreground py-4 hover:text-primary transition-colors"
              >
                <span>Já sou parte</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        <Ticker />

        <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex flex-col gap-4 max-w-2xl">
              <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
                <span>✦</span>
                Método
              </span>
              <h3
                className="font-heading tracking-[-0.02em] leading-[0.95]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
              >
                Três capítulos até o <em className="italic">seu</em> estilo.
              </h3>
            </div>
            <p className="md:max-w-sm text-muted-foreground leading-relaxed">
              Cada passo nasce de uma conversa entre você, sua história de
              roupas e a inteligência artificial — uma inteligência treinada
              para ler estilo, não só tendência.
            </p>
          </div>

          <div className="flex flex-col">
            {chapters.map((chapter) => (
              <div
                key={chapter.n}
                className="grid md:grid-cols-12 gap-4 md:gap-6 py-10 md:py-12 border-t border-border items-baseline"
              >
                <span className="md:col-span-2 font-heading italic text-primary leading-none text-6xl md:text-7xl lg:text-8xl">
                  {chapter.n}
                </span>
                <h4 className="md:col-span-4 font-heading text-3xl md:text-4xl tracking-[-0.02em] text-secondary-foreground">
                  {chapter.title}
                </h4>
                <p className="md:col-span-5 md:col-start-7 text-muted-foreground text-base md:text-lg leading-relaxed">
                  {chapter.body}
                </p>
                <span className="md:col-span-1 md:col-start-12 text-xs uppercase tracking-[0.28em] text-secondary-foreground md:text-right">
                  {chapter.tag}
                </span>
              </div>
            ))}
            <hr className="border-border" />
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
          <div className="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
            <span className="font-heading text-7xl md:text-8xl text-primary leading-none -mb-6 select-none">
              “
            </span>
            <blockquote
              className="font-heading italic leading-[1.1] text-secondary-foreground text-balance"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.75rem)" }}
            >
              Vestir-se é a última forma pessoal de autoria. A Dressy devolve o
              rascunho às suas mãos.
            </blockquote>
            <cite className="not-italic text-xs uppercase tracking-[0.32em] text-secondary-foreground">
              — Manifesto Dressy
            </cite>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-20 pb-20">
          <div className="grid md:grid-cols-12 gap-6 md:gap-8">
            <article className="md:col-span-7 border-t border-b-2 border-border py-12 flex flex-col gap-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em]">
                <span className="text-primary">I. Compradoras</span>
                <span className="text-secondary-foreground">Customer</span>
              </div>
              <h4
                className="font-heading tracking-[-0.02em] leading-[1.02]"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                Um closet que <em className="italic">pensa junto</em> com você.
              </h4>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Catálogo curado, closet virtual, histórico de pedidos e
                recomendações que nascem do seu próprio jeito — não de
                tendências de momento.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 self-start pt-2 pb-2 border-b border-foreground font-heading text-lg hover:text-primary hover:border-primary transition-colors"
              >
                <span>Começar a explorar</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </article>

            <article className="md:col-span-5 md:mt-16 bg-accent/60 border-t border-b-2 border-border px-6 md:px-8 py-12 flex flex-col gap-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em]">
                <span className="text-primary">II. Lojistas</span>
                <span className="text-secondary-foreground">Merchant</span>
              </div>
              <h4
                className="font-heading tracking-[-0.02em] leading-[1.02]"
                style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)" }}
              >
                Para brechós com <em className="italic">alma editorial</em>.
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Painel de gestão, vitrine estética e acesso a um público que
                busca moda com significado.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 self-start pt-2 pb-2 border-b border-foreground font-heading text-lg hover:text-primary hover:border-primary transition-colors"
              >
                <span>Cadastrar loja</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </article>
          </div>
        </section>

        <section className="px-6 md:px-12 lg:px-20 py-28 md:py-36 border-t border-border">
          <div className="flex flex-col gap-10">
            <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
              <span>✦</span>
              Próximo capítulo
            </span>
            <h3
              className="font-heading leading-[0.9] tracking-[-0.035em] text-foreground text-balance"
              style={{ fontSize: "clamp(3rem, 9vw, 10rem)" }}
            >
              Comece um <em className="italic text-primary">guarda-roupa</em>
              <br />
              que te pertence.
            </h3>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 pt-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-4 bg-primary text-primary-foreground px-8 py-5 font-heading text-xl hover:bg-[#A84E1F] transition-colors"
              >
                <span>Criar conta grátis</span>
                <span className="transition-transform group-hover:translate-x-2">
                  →
                </span>
              </Link>
              <Link
                href="/signin"
                className="font-heading text-xl underline underline-offset-[10px] decoration-1 hover:text-primary transition-colors"
              >
                ou entrar — <em className="italic">já sou membro</em>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-6 md:px-12 lg:px-20 pt-20 pb-10 bg-secondary/30">
          <div className="grid md:grid-cols-12 gap-8 pb-16">
            <div className="md:col-span-6 flex flex-col gap-4">
              <span
                className="font-heading text-secondary-foreground leading-[0.82] tracking-[-0.05em]"
                style={{ fontSize: "clamp(3.5rem, 12vw, 11rem)" }}
              >
                Dressy
              </span>
              <p className="italic font-heading text-muted-foreground max-w-sm text-lg">
                Moda circular com memória, curadoria e afeto.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 text-sm">
              <span className="text-[11px] uppercase tracking-[0.28em] text-primary mb-2">
                Acessar
              </span>
              <Link
                href="/signin"
                className="hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="hover:text-primary transition-colors"
              >
                Criar conta
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
              <span className="text-muted-foreground">
                contato@dressy.com.br
              </span>
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
        </footer>
      </div>
    </main>
  );
}
