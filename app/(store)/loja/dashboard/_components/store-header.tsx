import type { Store } from "@/types";

export function StoreHeader({ store }: { store: Store }) {
  const initials = store.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
      <div className="shrink-0 size-16 sm:size-20 rounded-2xl border-2 border-border bg-accent flex items-center justify-center">
        <span className="font-heading text-2xl tracking-[-0.04em] text-secondary-foreground">
          {initials}
        </span>
      </div>

      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-[11px] uppercase tracking-[0.28em] text-primary flex items-center gap-2">
          <span aria-hidden>✦</span>
          Minha Loja
        </span>
        <h1
          className="font-heading tracking-[-0.03em] leading-none text-foreground truncate"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          {store.name}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">@{store.slug}</span>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
              store.is_active
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${store.is_active ? "bg-primary" : "bg-muted-foreground"}`}
            />
            {store.is_active ? "Ativa" : "Inativa"}
          </span>
        </div>
      </div>

      <div className="ml-auto shrink-0 hidden md:block">
        <button className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-primary transition-colors">
          Editar loja →
        </button>
      </div>
    </div>
  );
}
