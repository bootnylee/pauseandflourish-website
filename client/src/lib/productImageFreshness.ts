import { isProductImageFresh } from "@/lib/priceFreshness.generated";
import localImages from "@/lib/productImages.generated.json";

export type ProductImageLike = {
  asin?: string;
  heroImage?: string;
};

const AMAZON_IMAGE_HOSTS = new Set([
  "m.media-amazon.com",
  "images-na.ssl-images-amazon.com",
]);

const LOCAL: Record<string, string> = localImages as Record<string, string>;

export function isAmazonHostedProductImage(url?: string): boolean {
  if (!url) return false;
  try {
    return AMAZON_IMAGE_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Product imagery policy (PF-IMAGES-0917): every product ships a local,
 * manifest-backed copy of its listing image under /images/products/<asin>.jpg
 * (see manifest.json there). A hotlinked Amazon image is used only when there is
 * no local copy AND the price/image sync for that ASIN is fresh — never as a
 * silent fallback, which is what left every card imageless for weeks.
 */
export function getLocalProductImage(asin?: string): string | undefined {
  return asin ? LOCAL[asin] : undefined;
}

export function getRenderableProductImage(product?: ProductImageLike): string | undefined {
  const local = getLocalProductImage(product?.asin);
  if (local) return local;
  const url = product?.heroImage;
  if (!url) return undefined;
  return isAmazonHostedProductImage(url) && !isProductImageFresh(product?.asin) ? undefined : url;
}
