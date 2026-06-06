import { requireStorePage } from "@/lib/auth/require-store-page";
import { getStoreReviews } from "@/lib/reviews/queries";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewsList } from "@/app/(store)/loja/avaliacoes/_components/reviews-list";
import type { RatingValue } from "@/types";

const STARS: RatingValue[] = [5, 4, 3, 2, 1];

export default async function ReviewsPage() {
  const { store } = await requireStorePage();
  const { reviews, stats } = await getStoreReviews(store.id);

  return (
    <section className="flex flex-col gap-10 py-6">
      <header className="flex flex-col gap-3 max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.32em] text-primary">
          Avaliações
        </span>
        <h2
          className="font-heading tracking-[-0.02em] leading-[0.98]"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
        >
          O que dizem sobre <em className="italic">suas peças</em>.
        </h2>
        <p className="text-muted-foreground leading-relaxed pt-1">
          Acompanhe as avaliações e comentários dos clientes sobre os produtos
          da sua loja.
        </p>
      </header>

      {stats.total > 0 && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center gap-2 bg-card border border-border rounded-2xl py-8">
            <span className="font-heading text-5xl text-foreground leading-none">
              {stats.average.toFixed(1)}
            </span>
            <StarRating value={stats.average} size={18} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {stats.total}{" "}
              {stats.total === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>

          <div className="col-span-12 md:col-span-8 flex flex-col justify-center gap-2 bg-card border border-border rounded-2xl px-6 py-6">
            {STARS.map((star) => {
              const count = stats.distribution[star];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-text-secondary w-6 shrink-0">
                    {star}
                    <StarRating value={1} max={1} size={12} />
                  </span>
                  <span className="relative h-2 flex-1 rounded-full bg-surface-alt overflow-hidden">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="text-xs text-muted-foreground w-6 text-right shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ReviewsList reviews={reviews} stats={stats} />
    </section>
  );
}
