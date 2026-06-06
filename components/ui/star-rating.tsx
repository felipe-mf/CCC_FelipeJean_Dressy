import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  // Nota a exibir; aceita frações (ex.: 4.3) para a média da loja.
  value: number;
  max?: number;
  // Tamanho em px de cada estrela.
  size?: number;
  className?: string;
}

// Exibição (read-only) de uma nota em estrelas. Suporta preenchimento parcial
// via clip, útil para médias fracionárias. Para o seletor interativo, ver o
// review-form do customer.
export function StarRating({
  value,
  max = 5,
  size = 16,
  className,
}: StarRatingProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} de ${max} estrelas`}
    >
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              className="absolute inset-0 text-primary/25"
              style={{ width: size, height: size }}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-primary fill-primary"
                style={{ width: size, height: size }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
