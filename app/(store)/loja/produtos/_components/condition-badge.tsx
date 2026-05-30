import type { ProductCondition } from "@/types";

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Novo",
  like_new: "Seminovo",
  good: "Bom",
  fair: "Regular",
};

const CONDITION_COLORS: Record<ProductCondition, string> = {
  new: "text-primary",
  like_new: "text-secondary-foreground",
  good: "text-muted-foreground",
  fair: "text-muted-foreground/60",
};

export function ConditionBadge({ condition }: { condition: ProductCondition }) {
  return (
    <span
      className={`text-[11px] uppercase tracking-[0.15em] ${CONDITION_COLORS[condition]}`}
    >
      {CONDITION_LABELS[condition]}
    </span>
  );
}
