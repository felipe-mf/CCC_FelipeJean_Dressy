import type { ProductCondition } from "@/types";

// Limites compartilhados entre o formulário (cliente) e a Server Action
// (autoridade da validação). Manter num único módulo evita divergência.
export const MAX_IMAGES_PER_PRODUCT = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const PRODUCT_CONDITIONS: readonly ProductCondition[] = [
  "new",
  "like_new",
  "good",
  "fair",
];
