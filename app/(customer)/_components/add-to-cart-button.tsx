"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";

import { addToCart } from "@/lib/cart/actions";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  function handleClick() {
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      if ("error" in result) {
        setFeedback({ ok: false, msg: result.error });
      } else {
        setFeedback({ ok: true, msg: "Peça adicionada ao carrinho ✦" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="group flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-heading text-lg hover:bg-[#A84E1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingBag className="size-5" strokeWidth={1.5} />
        <span>
          {disabled
            ? "Esgotado"
            : pending
              ? "Adicionando…"
              : "Adicionar ao carrinho"}
        </span>
      </button>

      {feedback && (
        <p
          className={`text-sm font-heading italic border-l-2 pl-3 ${
            feedback.ok
              ? "text-primary border-primary"
              : "text-destructive border-destructive"
          }`}
        >
          {feedback.msg}
          {feedback.ok && (
            <>
              {" "}
              <Link href="/carrinho" className="underline">
                Ver carrinho
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
