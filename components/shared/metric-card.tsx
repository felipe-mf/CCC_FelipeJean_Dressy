import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  eyebrow?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  eyebrow,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`relative bg-card border border-border rounded-2xl p-6 flex flex-col justify-between gap-6 overflow-hidden ${className}`}
    >
      <div className="flex items-start justify-between">
        {eyebrow ? (
          <span className="text-[11px] uppercase tracking-[0.28em] text-primary flex items-center gap-2">
            <span aria-hidden>✦</span>
            {eyebrow}
          </span>
        ) : (
          <span />
        )}
        <Icon className="size-4 text-primary opacity-40 shrink-0" />
      </div>

      <div className="flex flex-col gap-1.5">
        <span
          className="font-heading tracking-[-0.04em] leading-none text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          {value}
        </span>
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
