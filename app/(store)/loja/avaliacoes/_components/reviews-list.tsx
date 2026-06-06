"use client";

import { useState } from "react";

import { formatDateTime } from "@/lib/format";
import { StarRating } from "@/components/ui/star-rating";
import type { RatingValue, ReviewStats, StoreReview } from "@/types";

type Filter = "all" | RatingValue;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: 5, label: "5 ★" },
  { key: 4, label: "4 ★" },
  { key: 3, label: "3 ★" },
  { key: 2, label: "2 ★" },
  { key: 1, label: "1 ★" },
];

export function ReviewsList({
  reviews,
  stats,
}: {
  reviews: StoreReview[];
  stats: ReviewStats;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  // Reaproveita a distribuição já calculada no servidor (getStoreReviews).
  const counts: Record<Filter, number> = { all: stats.total, ...stats.distribution };

  const visible =
    filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);

  if (reviews.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-2xl font-heading italic text-muted-foreground/40">
          —
        </span>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Você ainda não recebeu avaliações. Elas aparecem aqui após os clientes
          concluírem os pedidos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const isActive = f.key === filter;
          return (
            <button
              key={String(f.key)}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                isActive
                  ? "bg-secondary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={isActive ? "text-primary-foreground/70" : "text-primary"}
              >
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Nenhuma avaliação com essa nota.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((review) => (
            <article
              key={review.id}
              className="bg-card border border-border rounded-2xl px-6 py-5 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <StarRating value={review.rating} size={15} />
                  <span className="font-heading text-foreground truncate">
                    {review.product_name}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 shrink-0">
                  {formatDateTime(review.created_at)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  “{review.comment}”
                </p>
              )}
              <span className="text-[11px] uppercase tracking-[0.15em] text-text-secondary">
                {review.customer_name ?? "Cliente"}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
