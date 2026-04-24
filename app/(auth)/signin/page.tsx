"use client";

import { signIn } from "@/lib/auth/actions";
import { useState } from "react";
import Link from "next/link";

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await signIn(formData);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-background text-foreground font-sans">
      <aside className="relative hidden md:flex flex-col justify-between p-12 lg:p-16 bg-accent/50 border-r border-border overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
          style={{ backgroundImage: GRAIN_SVG }}
        />

        <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          <span className="flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            Dressy · nº 01
          </span>
          <span>Acesso</span>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <span className="text-xs uppercase tracking-[0.32em] text-primary flex items-center gap-3">
            <span>✦</span>
            Bem-vinda de volta
          </span>
          <h1
            className="font-heading leading-[0.88] tracking-[-0.04em] text-secondary-foreground"
            style={{ fontSize: "clamp(4rem, 9vw, 8rem)" }}
          >
            Entrar.
          </h1>
          <p className="font-heading italic text-2xl lg:text-3xl leading-[1.2] text-secondary-foreground max-w-md">
            “De volta ao rascunho — seu closet continua exatamente como você
            deixou.”
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground pt-6 border-t border-border">
          <span>Vol. 01 / Outono ’26</span>
          <Link href="/" className="hover:text-primary transition-colors">
            ← Voltar à capa
          </Link>
        </div>
      </aside>

      <section className="flex flex-col justify-between p-8 md:p-12 lg:p-16">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground md:hidden mb-10">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Dressy
          </Link>
          <span>Acesso</span>
        </div>

        <div className="max-w-md w-full mx-auto flex flex-col gap-10 py-6">
          <header className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
              Capítulo II
            </span>
            <h2
              className="font-heading tracking-[-0.02em] leading-[0.98]"
              style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
            >
              Retome seu <em className="italic">estilo</em>.
            </h2>
            <p className="text-muted-foreground leading-relaxed pt-1">
              Entre com suas credenciais para abrir seu closet virtual,
              pedidos e recomendações.
            </p>
          </header>

          <form action={handleSubmit} className="flex flex-col gap-8">
            <FieldInput label="Email" name="email" type="email" autoComplete="email" required index="01" />
            <FieldInput label="Senha" name="password" type="password" autoComplete="current-password" required index="02" />

            {error && (
              <p className="text-sm text-destructive border-l-2 border-destructive pl-3 font-heading italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="group inline-flex items-center justify-between bg-primary text-primary-foreground px-6 py-5 font-heading text-xl hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{pending ? "Entrando…" : "Entrar na Dressy"}</span>
              <span className="transition-transform group-hover:translate-x-2">
                →
              </span>
            </button>
          </form>

          <div className="flex items-center gap-4 pt-2">
            <hr className="flex-1 border-border" />
            <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
              ou
            </span>
            <hr className="flex-1 border-border" />
          </div>

          <p className="text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link
              href="/signup"
              className="font-heading text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary transition-colors"
            >
              Comece um guarda-roupa →
            </Link>
          </p>
        </div>

        <footer className="hidden md:flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground pt-10 border-t border-border">
          <span>© {new Date().getFullYear()} Dressy</span>
          <span>Moda circular com memória</span>
        </footer>
      </section>
    </main>
  );
}

function FieldInput({
  label,
  name,
  type,
  autoComplete,
  required,
  index,
  minLength,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  index: string;
  minLength?: number;
}) {
  return (
    <label className="group flex flex-col gap-2">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
        <span>{label}</span>
        <span className="text-primary font-heading not-italic">{index}</span>
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full bg-transparent border-0 border-b border-border py-3 font-heading text-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
      />
    </label>
  );
}
