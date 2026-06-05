const BUCKET = "product-images";

export function productImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

// Caminho da imagem de capa: a de menor `position`. Null quando não há imagens.
export function coverPath(
  images: { path: string; position: number }[] | null,
): string | null {
  const sorted = [...(images ?? [])].sort((a, b) => a.position - b.position);
  return sorted[0]?.path ?? null;
}
