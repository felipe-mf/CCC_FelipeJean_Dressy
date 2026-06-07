import { imageBucketUrl } from "@/lib/image-url";

export function storeImageUrl(value: string | null): string {
  return imageBucketUrl("store-images", value);
}
