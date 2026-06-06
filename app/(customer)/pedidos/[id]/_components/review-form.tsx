"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

import { submitReview } from "@/lib/reviews/actions";
import { StarRating } from "@/components/ui/star-rating";
import type { Review } from "@/types";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  // Avaliação já feita para esta peça, se houver.
  existing?: Review;
}

// Avaliação de uma peça de um pedido concluído. Renderiza o estado read-only
// quando a peça já foi avaliada, ou o seletor de estrelas + comentário.
export function ReviewForm({ orderId, productId, existing }: ReviewFormProps) {
  // Avaliação já registrada (vinda do servidor ou recém-enviada). Só guardamos
  // o que é exibido no estado read-only.
  const [done, setDone] = useState<{ rating: number; comment: string | null } | null>(
    existing ? { rating: existing.rating, comment: existing.comment } : null,
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2">
          <StarRating value={done.rating} size={15} />
          <span className="text-[10px] uppercase tracking-[0.18em] text-success">
            Avaliado
          </span>
        </div>
        {done.comment && (
          <p className="text-xs text-text-secondary italic leading-snug">
            “{done.comment}”
          </p>
        )}
      </div>
    );
  }

  function handleSubmit() {
    if (rating < 1) {
      setError("Selecione uma nota de 1 a 5.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReview({
        orderId,
        productId,
        rating,
        comment,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDone({ rating, comment: comment.trim() || null });
    });
  }

  const shown = hover || rating;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            disabled={isPending}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
            className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              className={`size-5 transition-colors ${
                n <= shown
                  ? "text-primary fill-primary"
                  : "text-primary/25"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 1000))}
        disabled={isPending}
        rows={2}
        placeholder="Conte como foi a peça (opcional)"
        className="w-full resize-none bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-heading hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Enviando…" : "Enviar avaliação"}
        </button>
        {error && (
          <span className="text-xs text-destructive font-heading italic">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
