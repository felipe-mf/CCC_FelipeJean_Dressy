"use client";

import { signUp } from "@/lib/auth/actions";
import { useState } from "react";
import Link from "next/link";

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await signUp(formData);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <main className="min-h-screen grid md:grid-cols-[5fr_7fr] bg-background text-foreground font-sans">
      <aside className="relative hidden md:flex flex-col justify-between p-12 lg:p-16 bg-primary text-primary-foreground overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_SVG }}
        />

        <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] opacity-80">
          <span className="flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-primary-foreground" />
            Dressy · nº 01
          </span>
          <span>Novo capítulo</span>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <span className="text-xs uppercase tracking-[0.32em] opacity-80 flex items-center gap-3">
            <span>✦</span>
            Primeira página
          </span>
          <h1
            className="font-heading leading-[0.86] tracking-[-0.045em]"
            style={{ fontSize: "clamp(4rem, 10vw, 9rem)" }}
          >
            Começar.
          </h1>
          <p className="font-heading italic text-2xl lg:text-3xl leading-[1.2] opacity-90 max-w-md">
            “Todo guarda-roupa começa com uma escolha. A Dressy anota cada uma
            delas para você.”
          </p>
          <ul className="flex flex-col gap-3 text-sm opacity-90 pt-4 border-t border-primary-foreground/20">
            {[
              "Questionário de estilo personalizado",
              "Closet virtual com histórico",
              "Curadoria por Claude",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-[0.35em] size-1.5 shrink-0 rounded-full bg-primary-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] opacity-80 pt-6 border-t border-primary-foreground/20">
          <span>Vol. 01 / Outono ’26</span>
          <Link
            href="/"
            className="hover:opacity-100 transition-opacity"
          >
            ← Voltar à capa
          </Link>
        </div>
      </aside>

      <section className="flex flex-col justify-between p-8 md:p-12 lg:p-16">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground md:hidden mb-10">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Dressy
          </Link>
          <span>Cadastro</span>
        </div>

        <div className="max-w-xl w-full mx-auto flex flex-col gap-10 py-6">
          <header className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
              Capítulo I
            </span>
            <h2
              className="font-heading tracking-[-0.02em] leading-[0.98]"
              style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
            >
              Escreva o seu <em className="italic">primeiro</em> capítulo.
            </h2>
            <p className="text-muted-foreground leading-relaxed pt-1">
              Três dados, uma escolha de papel, e um closet começa a tomar
              forma.
            </p>
          </header>

          <form action={handleSubmit} className="flex flex-col gap-8">
            <FieldInput
              label="Nome completo"
              name="name"
              type="text"
              autoComplete="name"
              required
              index="01"
            />
            <FieldInput
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              index="02"
            />
            <FieldInput
              label="Senha"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              index="03"
              hint="Mínimo de 6 caracteres"
            />

            <fieldset className="flex flex-col gap-4 pt-2">
              <legend className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-secondary-foreground w-full">
                <span>Papel na Dressy</span>
                <span className="text-primary font-heading">04</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RoleTile
                  value="customer"
                  roman="I."
                  title="Compradora"
                  body="Explorar catálogo, montar closet virtual e receber recomendações."
                  defaultChecked
                />
                <RoleTile
                  value="merchant"
                  roman="II."
                  title="Lojista"
                  body="Vender peças curadas e gerir sua vitrine editorial."
                />
              </div>
            </fieldset>

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
              <span>{pending ? "Criando conta…" : "Abrir minha conta"}</span>
              <span className="transition-transform group-hover:translate-x-2">
                →
              </span>
            </button>
          </form>

          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/signin"
              className="font-heading text-foreground underline underline-offset-[6px] decoration-1 hover:text-primary transition-colors"
            >
              Entrar →
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
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  index: string;
  minLength?: number;
  hint?: string;
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
      {hint && (
        <span className="text-xs text-muted-foreground italic font-heading">
          {hint}
        </span>
      )}
    </label>
  );
}

function RoleTile({
  value,
  roman,
  title,
  body,
  defaultChecked,
}: {
  value: string;
  roman: string;
  title: string;
  body: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="relative cursor-pointer group">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div className="h-full flex flex-col gap-2 border border-border p-5 bg-card transition-all group-has-[:checked]:border-primary group-has-[:checked]:bg-accent/60 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
        <div className="flex items-center justify-between">
          <span className="font-heading italic text-primary">{roman}</span>
          <span className="size-3 rounded-full border border-border group-has-[:checked]:bg-primary group-has-[:checked]:border-primary transition-colors" />
        </div>
        <span className="font-heading text-xl text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">
          {body}
        </span>
      </div>
    </label>
  );
}
