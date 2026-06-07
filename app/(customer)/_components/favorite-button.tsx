"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { toggleFavorite } from "@/lib/favorites/actions";

export function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // O botão é renderizado sobreposto ao Link do card; interceptar evita
    // navegar para o detalhe do produto quando o usuário só quer favoritar.
    event.preventDefault();
    event.stopPropagation();

    const optimistic = !favorited;
    setFavorited(optimistic);

    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if ("error" in result) {
        setFavorited(!optimistic);
        if (result.error === "Não autenticado.") router.push("/signin");
        return;
      }
      setFavorited(result.favorited);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Remover dos favoritos" : "Favoritar peça"}
      aria-pressed={favorited}
      className="absolute top-3 right-3 z-10 grid place-items-center size-9 rounded-full bg-background/85 backdrop-blur-sm text-secondary-foreground hover:bg-background hover:text-primary transition-colors disabled:opacity-60"
    >
      <Heart
        className="size-4 transition-transform group-hover:scale-110"
        strokeWidth={1.5}
        fill={favorited ? "currentColor" : "none"}
      />
    </button>
  );
}
