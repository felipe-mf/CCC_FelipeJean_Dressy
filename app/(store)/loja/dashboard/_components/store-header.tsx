import Image from "next/image";
import Link from "next/link";

import { StoreAvatar } from "@/app/(store)/_components/store-avatar";
import { storeImageUrl } from "@/lib/store/image-url";
import type { Store } from "@/types";

export function StoreHeader({ store }: { store: Store }) {
  // Sem banner: layout original sobre o fundo bege, sem faixa escura.
  if (!store.banner_url) {
    return (
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <StoreAvatar
          store={store}
          px={80}
          className="shrink-0 size-16 sm:size-20 rounded-2xl border-2 border-border bg-accent overflow-hidden flex items-center justify-center"
          textClassName="font-heading text-2xl tracking-[-0.04em] text-secondary-foreground"
        />

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
            <StatusBadge isActive={store.is_active} />
          </div>
        </div>

        <div className="ml-auto shrink-0 hidden md:block">
          <EditLink className="text-muted-foreground hover:text-primary" />
        </div>
      </div>
    );
  }

  // Com banner: faixa de fundo cobrindo o bloco, header sobreposto. O conteúdo
  // fica no fluxo normal (não absoluto) para o bloco crescer no mobile sem cortar.
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      <Image
        src={storeImageUrl(store.banner_url)}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      {/* Gradiente quente garante legibilidade do header sobreposto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A0E]/80 via-[#2C1A0E]/30 to-transparent" />

      <div className="relative p-4 sm:p-6 pt-24 sm:pt-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
          <StoreAvatar
            store={store}
            px={80}
            className="shrink-0 size-16 sm:size-20 rounded-2xl border-2 border-surface/80 bg-accent overflow-hidden flex items-center justify-center shadow-sm"
            textClassName="font-heading text-2xl tracking-[-0.04em] text-secondary-foreground"
          />

          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-[11px] uppercase tracking-[0.28em] text-primary-light flex items-center gap-2">
              <span aria-hidden>✦</span>
              Minha Loja
            </span>
            <h1
              className="font-heading tracking-[-0.03em] leading-none text-surface truncate"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
            >
              {store.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-surface/80">@{store.slug}</span>
              <StatusBadge isActive={store.is_active} overlay />
            </div>
          </div>

          <div className="ml-auto shrink-0 hidden md:block self-end">
            <EditLink className="text-surface/80 hover:text-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  isActive,
  overlay = false,
}: {
  isActive: boolean;
  overlay?: boolean;
}) {
  const tone = overlay
    ? isActive
      ? "bg-primary/20 text-primary-light border-primary-light/30 backdrop-blur"
      : "bg-background/30 text-surface/70 border-surface/20 backdrop-blur"
    : isActive
      ? "bg-primary/10 text-primary border-primary/20"
      : "bg-muted text-muted-foreground border-border";

  const dot = overlay
    ? isActive
      ? "bg-primary-light"
      : "bg-surface/50"
    : isActive
      ? "bg-primary"
      : "bg-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${tone}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {isActive ? "Ativa" : "Inativa"}
    </span>
  );
}

function EditLink({ className }: { className: string }) {
  return (
    <Link
      href="/loja/configuracoes"
      className={`text-[11px] uppercase tracking-[0.28em] transition-colors ${className}`}
    >
      Editar loja →
    </Link>
  );
}
