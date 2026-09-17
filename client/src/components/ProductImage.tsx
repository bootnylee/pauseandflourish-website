// PauseAndFlourish.com — product image with responsive delivery (PF-OVERHAUL-0917 Phase D).
//
// The local library stores one 900px JPEG per product. Thumbnails were pulling the full file for a 112px
// slot (Lighthouse: ~900 KiB wasted per page). Local library paths get a srcset of Netlify Image CDN
// variants (webp, 160–900px); remote (fresh Amazon) images are used as-is. The plain src stays the
// library file, so the image-coverage gate and non-Netlify hosts still see a real picture.
import { getRenderableProductImage, type ProductImageLike } from "@/lib/productImageFreshness";

const WIDTHS = [160, 240, 320, 480, 640, 900];

export function productImageSrcSet(src: string | undefined): string | undefined {
  if (!src || !src.startsWith("/images/products/")) return undefined;
  return WIDTHS.map((w) => `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp&q=80 ${w}w`).join(", ");
}

export default function ProductImage({ product, alt, className = "", sizes = "(max-width: 640px) 60vw, 240px", eager = false }: { product: ProductImageLike & { name?: string }; alt?: string; className?: string; sizes?: string; eager?: boolean }) {
  const src = getRenderableProductImage(product);
  if (!src) return null;
  return <img src={src} srcSet={productImageSrcSet(src)} sizes={sizes} alt={alt ?? product.name ?? ""} className={className} loading={eager ? "eager" : "lazy"} decoding="async" width={900} height={900} style={{ height: "auto", maxHeight: "100%" }} />;
}
