import { isProductImageFresh } from "@/lib/priceFreshness.generated";

export type ProductImageLike = {
  asin?: string;
  heroImage?: string;
};

const AMAZON_IMAGE_HOSTS = new Set([
  "m.media-amazon.com",
  "images-na.ssl-images-amazon.com",
]);

export function isAmazonHostedProductImage(url?: string): boolean {
  if (!url) return false;
  try {
    return AMAZON_IMAGE_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function getRenderableProductImage(product?: ProductImageLike): string | undefined {
  const url = product?.heroImage;
  if (!url) return undefined;
  return isAmazonHostedProductImage(url) && !isProductImageFresh(product?.asin) ? undefined : url;
}
