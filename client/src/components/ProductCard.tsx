// PauseAndFlourish.com - Product Card Component
// Design: Refined Magazine Meets Bold Lifestyle
// Features: Editor's Pick badge, Price Drop badge, Star ratings, Amazon affiliate links

import { Link } from "wouter";
import { ExternalLink, Star, TrendingDown, Flame, Sparkles } from "lucide-react";
import { type Product } from "@/lib/products";
import { isProductPriceFresh } from "@/lib/priceFreshness.generated";
import { getRenderableProductImage } from "@/lib/productImageFreshness";
import { getPriceBadge, type PriceBadge } from "@/lib/priceHistory";
import { trackAffiliateClick } from "@/lib/analytics";
import { VerifiedAmazonCta, hasVerifiedAsin } from "@/components/ProductCommerce";

// Returns true if the product was published within the last 14 days
function isNewThisWeek(publishDate: string): boolean {
  const published = new Date(publishDate);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

/**
 * Renders either the live numeric price (when fresh) or a 'Check price on Amazon'
 * affiliate link (when stale or missing). Used in all three card variants.
 * Note: PF uses price as a string (e.g. "$29.99"), so we check for empty/missing.
 */
function PriceDisplay({
  product,
  fontSize = "1rem",
  color = "#2D7D6F",
}: {
  product: Product;
  fontSize?: string;
  color?: string;
}) {
  if (isProductPriceFresh(product.asin) && product.priceDisplay) {
    return (
      <span className="font-label font-bold block" style={{ color, fontSize }}>
        {product.priceDisplay}
      </span>
    );
  }
  return hasVerifiedAsin(product.asin) ? (
    <span className="font-body text-xs block" style={{ color }}>Price unavailable</span>
  ) : (
    <span className="font-body text-xs block" style={{ color: "#8C8C8C" }}>No verified link</span>
  );
}

// ─── New This Week Badge ──────────────────────────────────────────────────────
function NewBadge({ size = "sm" }: { size?: "sm" | "xs" }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-label font-semibold rounded-sm"
      style={{
        backgroundColor: "#2D6A4F",
        color: "#FFF",
        fontSize: size === "xs" ? "0.62rem" : "0.68rem",
        padding: size === "xs" ? "2px 6px" : "3px 8px",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      <Sparkles size={size === "xs" ? 8 : 9} />
      New
    </span>
  );
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
}

// ─── Price Drop Badge Component ───────────────────────────────────────────────
function PriceDropBadge({ badge, size = "sm" }: { badge: PriceBadge; size?: "sm" | "xs" }) {
  if (!badge) return null;

  const isAllTimeLow = badge.type === "all-time-low";
  const isPriceDrop = badge.type === "price-drop";

  const bg = isAllTimeLow
    ? "#C4722A"
    : isPriceDrop
    ? "#2D7D6F"
    : "#4A7C59";

  const Icon = isAllTimeLow ? Flame : TrendingDown;

  return (
    <span
      className="inline-flex items-center gap-1 font-label font-semibold rounded-sm"
      style={{
        backgroundColor: bg,
        color: "#FFF",
        fontSize: size === "xs" ? "0.65rem" : "0.7rem",
        padding: size === "xs" ? "2px 6px" : "3px 8px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      <Icon size={size === "xs" ? 9 : 10} />
      {badge.label}
    </span>
  );
}

// ─── Main ProductCard Component ───────────────────────────────────────────────
export default function ProductCard({
  product,
  variant = "default",
}: ProductCardProps) {
  const priceBadge = getPriceBadge(product.asin, Number(String(product.price).replace(/[^0-9.]/g, "")) || 0);
  const isNew = isNewThisWeek(product.publishDate);
  const productImage = getRenderableProductImage(product);

  if (variant === "compact") {
    return (
      <div className="product-card flex gap-4 p-4 rounded-sm relative">
        {isNew && (
          <div className="absolute top-2 right-2">
            <NewBadge size="xs" />
          </div>
        )}
        {productImage ? (
          <div
            className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-sm"
            style={{ backgroundColor: "#EDF5F3" }}
          >
            <img src={productImage} alt={product.name} className="w-full h-full object-contain" />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="section-label text-xs mb-1">{product.brand}</p>
          <Link href={`/review/${product.slug}`}>
            <h3
              className="font-display font-semibold leading-tight mb-1 hover:text-teal-700 transition-colors cursor-pointer"
              style={{ fontSize: "1rem", color: "#2C2C2C" }}
            >
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-col gap-0.5">
              <PriceDisplay product={product} fontSize="0.9rem" />
              {isProductPriceFresh(product.asin) && priceBadge && <PriceDropBadge badge={priceBadge} size="xs" />}
            </div>
              <VerifiedAmazonCta product={product} label="Check Price on Amazon" compact />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className="product-card rounded-sm overflow-hidden group">
        {productImage ? (
          <div
            className="relative overflow-hidden"
            style={{ height: "220px", backgroundColor: "#EDF5F3" }}
          >
            <img src={productImage} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.editorPick && <span className="editor-pick-badge text-xs px-2 py-1">Editor's Pick</span>}
              {isNew && <NewBadge />}
              {isProductPriceFresh(product.asin) && priceBadge && <PriceDropBadge badge={priceBadge} />}
            </div>
          </div>
        ) : null}
        <div className="p-5">
          <p className="section-label text-xs mb-1">{product.brand}</p>
          <Link href={`/review/${product.slug}`}>
            <h3
              className="font-display font-semibold mb-2 hover:text-teal-700 transition-colors cursor-pointer leading-snug"
              style={{ fontSize: "1.1rem", color: "#2C2C2C" }}
            >
              {product.name}
            </h3>
          </Link>
          <p
            className="font-body text-sm mt-2 line-clamp-2 leading-relaxed"
            style={{ color: "#6C6C6C" }}
          >
            {product.shortDescription}
          </p>
          <div
            className="flex items-center justify-between mt-4 pt-4 border-t"
            style={{ borderColor: "#F0E8DE" }}
          >
            <div>
              <PriceDisplay product={product} fontSize="1.1rem" />
              {isProductPriceFresh(product.asin) && (
                <p
                  className="font-body text-xs mt-0.5"
                  style={{ color: "#B8A99A" }}
                >
                  on Amazon
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/review/${product.slug}`}>
                <button className="btn-primary text-xs py-2 px-3 rounded-sm">
                  Read Review
                </button>
              </Link>
              <VerifiedAmazonCta product={product} label="Check Price on Amazon" compact />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div className="product-card rounded-sm overflow-hidden group">
      {productImage ? (
        <div
          className="relative overflow-hidden"
          style={{ height: "180px", backgroundColor: "#EDF5F3" }}
        >
          <img src={productImage} alt={product.name} className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.editorPick && <span className="editor-pick-badge text-xs px-2 py-0.5">Editor's Pick</span>}
            {isNew && <NewBadge size="xs" />}
            {isProductPriceFresh(product.asin) && priceBadge && <PriceDropBadge badge={priceBadge} size="xs" />}
          </div>
        </div>
      ) : null}
      <div className="p-4">
        <p className="section-label text-xs mb-1">{product.brand}</p>
        <Link href={`/review/${product.slug}`}>
          <h3
            className="font-display font-semibold mb-1 hover:text-teal-700 transition-colors cursor-pointer leading-snug"
            style={{ fontSize: "1rem", color: "#2C2C2C" }}
          >
            {product.name}
          </h3>
        </Link>
        <div
          className="flex items-center justify-between mt-3 pt-3 border-t"
          style={{ borderColor: "#F0E8DE" }}
        >
          <div>
            <PriceDisplay product={product} />
            {isProductPriceFresh(product.asin) && priceBadge && (
              <div className="mt-0.5">
                <PriceDropBadge badge={priceBadge} size="xs" />
              </div>
            )}
          </div>
              <VerifiedAmazonCta product={product} label="Check Price on Amazon" compact />
        </div>
      </div>
    </div>
  );
}
