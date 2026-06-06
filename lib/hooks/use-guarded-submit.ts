"use client";

import { useRef, useTransition } from "react";

/**
 * Envolve um handler de submit garantindo que ele nunca rode em paralelo e
 * expondo um `pending` confiável para a UI.
 *
 * A trava é um `useRef` (síncrono): o segundo clique é barrado imediatamente,
 * antes mesmo do re-render que desabilita o botão — fechando a janela de corrida
 * que permitia publicar/criar o mesmo registro várias vezes em cliques rápidos.
 *
 * O `pending` vem de `useTransition`: fica verdadeiro durante toda a transição,
 * inclusive enquanto um `redirect()` da Server Action navega para a próxima
 * página. Com `useState` manual o `pending` voltava a `false` assim que a action
 * resolvia (antes da navegação pintar), e o botão parecia nunca ter carregado.
 */
export function useGuardedSubmit(
  handler: (formData: FormData) => Promise<void>,
) {
  const [pending, startTransition] = useTransition();
  const locked = useRef(false);

  function action(formData: FormData) {
    if (locked.current) return;
    locked.current = true;
    startTransition(async () => {
      try {
        await handler(formData);
      } finally {
        locked.current = false;
      }
    });
  }

  return { pending, action };
}
