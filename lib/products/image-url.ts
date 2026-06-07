import { imageBucketUrl } from "@/lib/image-url";

export function productImageUrl(path: string): string {
  return imageBucketUrl("product-images", path);
}

// Caminho da imagem de capa: a de menor `position`. Null quando não há imagens.
export function coverPath(
  images: { path: string; position: number }[] | null,
): string | null {
  const sorted = [...(images ?? [])].sort((a, b) => a.position - b.position);
  return sorted[0]?.path ?? null;
}
