"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Copy } from "lucide-react";

import { simulateOrderPayment } from "@/lib/orders/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import type { PaymentStatus } from "@/types";

interface PixPaymentProps {
  orderId: string;
  brCode: string;
  qrImage: string;
  expiresAt: string;
  // Vem do componente servidor para evitar checar NODE_ENV no cliente.
  canSimulate: boolean;
  // Estado atual da cobrança vindo do servidor. Quando vira "paid" o componente
  // troca para um card de confirmação no lugar do QR — sem refresh visível e
  // sem desmontar antes do usuário ver o feedback.
  paymentStatus: PaymentStatus;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PixPayment({
  orderId,
  brCode,
  qrImage,
  expiresAt,
  canSimulate,
  paymentStatus,
}: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(
    () => new Date(expiresAt).getTime() - Date.now(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Confirmação otimista — vira true assim que a action retorna sucesso. Cobre
  // a janela entre o retorno da action e o re-render do componente servidor.
  const [optimisticPaid, setOptimisticPaid] = useState(false);

  useEffect(() => {
    if (paymentStatus === "paid" || optimisticPaid) return;
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, paymentStatus, optimisticPaid]);

  const paid = paymentStatus === "paid" || optimisticPaid;
  const expired = !paid && remaining <= 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não consegui copiar. Selecione e copie manualmente.");
    }
  }

  function handleSimulate() {
    setError(null);
    startTransition(async () => {
      const result = await simulateOrderPayment(orderId);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setOptimisticPaid(true);
    });
  }

  // Estado de pagamento confirmado — card limpo, em verde, sem countdown.
  if (paid) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-6 mb-10">
        <div className="shrink-0 rounded-full bg-emerald-100 p-2">
          <CheckCircle2 className="size-5 text-emerald-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.28em] text-emerald-800">
            Pagamento confirmado
          </span>
          <p className="text-sm text-emerald-900 leading-snug max-w-md">
            Recebemos seu Pix. Agora apresente o código de retirada abaixo na
            loja — a venda é finalizada quando o lojista confirmar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-primary bg-primary-light/40 p-6 mb-10">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
          Pagamento Pix
        </span>
        <span className="text-sm text-secondary-foreground">
          {expired
            ? "O Pix expirou. Faça um novo pedido para gerar uma cobrança nova."
            : `Pague em até ${formatRemaining(remaining)} para garantir a peça.`}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative size-48 shrink-0 overflow-hidden rounded-xl bg-surface border border-border">
          <Image
            src={qrImage}
            alt="QR Code Pix"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>

        <div className="flex flex-col gap-3 flex-1 w-full">
          <label className="text-[11px] uppercase tracking-[0.28em] text-secondary-foreground">
            Pix copia e cola
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
            <code className="text-xs text-foreground break-all flex-1 leading-relaxed">
              {brCode}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs text-secondary-foreground hover:bg-surface/60 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copiar
                </>
              )}
            </button>
          </div>

          {canSimulate && !expired && (
            <SubmitButton
              pending={pending}
              type="button"
              onClick={handleSimulate}
              className="self-start inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:bg-[#A84E1F] transition-colors disabled:opacity-70"
            >
              {pending ? "Confirmando…" : "Pagar"}
            </SubmitButton>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
