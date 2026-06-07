// Monta a URL pública de um objeto em qualquer bucket público do Supabase
// Storage. Centraliza o formato da URL para que mudanças (CDN, signing) fiquem
// num só lugar; helpers por bucket (productImageUrl, storeImageUrl) delegam aqui.
export function imageBucketUrl(bucket: string, path: string | null): string {
  if (!path) return "";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
