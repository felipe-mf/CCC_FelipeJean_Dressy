// Cliente HTTP da AbacatePay (v2 — Checkout Transparente Pix). Cobre só o que o
// fluxo de checkout do customer precisa: criar cobrança, simular pagamento (dev)
// e consultar status. Outros recursos (assinaturas, payouts, cupons) ficam de
// fora até existir caso de uso. Ver ABACATEPAY.md na raiz para a referência.
//
// IMPORTANTE: este módulo é server-only. Nunca importar de Client Components —
// a API key vazaria no bundle. Use apenas em Server Actions e Route Handlers.
// (Não usamos o pacote `server-only` pois não está no projeto; a convenção é
// manter este arquivo fora de qualquer componente marcado com 'use client'.)

const API_URL = process.env.ABACATEPAY_API_URL ?? "https://api.abacatepay.com/v2";

function getApiKey(): string {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) {
    throw new Error("ABACATEPAY_API_KEY não configurada no ambiente.");
  }
  return key;
}

// Envelope padrão da AbacatePay: { data, error, success }.
interface AbacateResponse<T> {
  data: T | null;
  error: string | null;
  // success aparece em algumas rotas; tratamos como opcional.
  success?: boolean;
}

async function request<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; query?: Record<string, string> },
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  let payload: AbacateResponse<T>;
  try {
    payload = (await res.json()) as AbacateResponse<T>;
  } catch {
    throw new Error(`AbacatePay respondeu sem JSON válido (HTTP ${res.status}).`);
  }

  if (!res.ok || payload.error) {
    throw new Error(
      payload.error ?? `Falha na AbacatePay (HTTP ${res.status}).`,
    );
  }
  if (payload.data === null) {
    throw new Error("AbacatePay retornou data nula.");
  }
  return payload.data;
}

// Status do Pix conforme documentação AbacatePay. Mantemos a união local para
// não acoplar o resto do código ao texto cru da API.
export type AbacatePixStatus =
  | "PENDING"
  | "EXPIRED"
  | "CANCELLED"
  | "PAID"
  | "REFUNDED";

export interface AbacatePixCharge {
  id: string;
  amount: number;
  status: AbacatePixStatus;
  // Copia-e-cola do Pix (EMV BR Code).
  brCode: string;
  // PNG do QR Code em base64 (já vem com prefixo `data:image/png;base64,`).
  brCodeBase64: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePixChargeInput {
  // Valor total em centavos.
  amount: number;
  // Janela de validade em segundos. Default da AbacatePay é alto demais para
  // marketplace; passamos 30 min para casar com `pix_expires_at` no banco.
  expiresIn?: number;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    taxId?: string;
    cellphone?: string;
  };
  // Para correlacionar webhook → pedido sem depender só do billingId.
  metadata?: Record<string, string>;
}

// POST /transparents/create — gera QR Pix imediato (sem redirect). O body é
// `{ method: "PIX", data: {...} }`: `method` é o discriminador da união
// PIX/Boleto na validação do servidor.
export function createPixCharge(
  input: CreatePixChargeInput,
): Promise<AbacatePixCharge> {
  return request<AbacatePixCharge>("/transparents/create", {
    method: "POST",
    body: { method: "PIX", data: input },
  });
}

// POST /transparents/simulate-payment — força "pago" em dev/sandbox. Em
// produção a AbacatePay rejeita; só usar atrás de um guard de ambiente.
export function simulatePixPayment(
  billingId: string,
): Promise<AbacatePixCharge> {
  return request<AbacatePixCharge>("/transparents/simulate-payment", {
    method: "POST",
    query: { id: billingId },
  });
}

// GET /transparents/check — consulta status atual da cobrança.
export function getPixCharge(billingId: string): Promise<AbacatePixCharge> {
  return request<AbacatePixCharge>("/transparents/check", {
    method: "GET",
    query: { id: billingId },
  });
}
