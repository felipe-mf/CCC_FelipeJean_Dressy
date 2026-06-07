"use client";

import type { LucideIcon } from "lucide-react";

// Card de opção de recebimento (entrega/retirada) no checkout. Quando recebe
// `onSelect`, vira um botão selecionável; sem ele, é um informativo estático
// (loja que só faz retirada, sem escolha a fazer).
export function FulfillmentOption({
  icon: Icon,
  title,
  description,
  selected = false,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const className = `flex items-start gap-4 rounded-2xl border p-5 ${
    onSelect
      ? selected
        ? "border-primary bg-primary-light/40 text-left transition-colors"
        : "border-border hover:border-primary/50 text-left transition-colors"
      : "border-border bg-surface"
  }`;

  const content = (
    <>
      <Icon className="size-5 mt-0.5 text-primary" strokeWidth={1.5} />
      <span className="flex flex-col gap-1">
        <span className="font-heading text-lg text-secondary-foreground">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </>
  );

  if (!onSelect) return <div className={className}>{content}</div>;

  return (
    <button type="button" onClick={onSelect} className={className}>
      {content}
    </button>
  );
}
