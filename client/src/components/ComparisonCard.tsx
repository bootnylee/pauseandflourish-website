// PauseAndFlourish.com - Comparison Card Component

import { Link } from "wouter";
import { Trophy, ExternalLink } from "lucide-react";
import { type Comparison, getProductById, amazonLink } from "@/lib/products";
import { isProductPriceFresh } from "@/lib/priceFreshness.generated";
import { getRenderableProductImage } from "@/lib/productImageFreshness";
import { VerifiedAmazonCta } from "@/components/ProductCommerce";

interface ComparisonCardProps {
  comparison: Comparison;
  variant?: "default" | "featured";
}

export default function ComparisonCard({ comparison, variant = "default" }: ComparisonCardProps) {
  const product1 = getProductById(comparison.product1Id ?? comparison.productIds[0]);
  const product2 = getProductById(comparison.product2Id ?? comparison.productIds[1]);

  if (!product1 || !product2) return null;

  const winnerId = comparison.winnerId ?? comparison.winner;
  const winner = winnerId === product1.id ? product1 : product2;
  const loser = winnerId === product1.id ? product2 : product1;
  const winnerImage = getRenderableProductImage(winner);
  const loserImage = getRenderableProductImage(loser);

  return (
    <div className="product-card rounded-sm overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-tint-2)" }}>
        <p className="section-label text-xs mb-1">{comparison.category ?? "Menopause Supplements"}</p>
        <Link href={`/comparison/${comparison.slug}`}>
          <h3 className="font-display font-bold leading-snug hover:text-teal-700 transition-colors cursor-pointer"
            style={{ fontSize: variant === "featured" ? "1.3rem" : "1.1rem", color: "var(--pf-ink)" }}>
            {comparison.title}
          </h3>
        </Link>
        <p className="font-body text-sm mt-1" style={{ color: "var(--pf-soft)" }}>{comparison.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-0">
        {/* Winner */}
        <div className="p-4 border-r" style={{ borderColor: "var(--pf-line)", backgroundColor: "#FFFAF5" }}>
          <div className="flex items-center gap-1 mb-2">
            <Trophy size={12} style={{ color: "var(--pf-accent)" }} />
            <span className="font-label font-bold text-xs" style={{ color: "var(--pf-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Winner
            </span>
          </div>
          {winnerImage ? (
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded overflow-hidden">
              <img src={winnerImage} alt={winner.name} className="w-full h-full object-contain p-1" />
            </div>
          ) : null}
          <p className="font-body text-xs font-semibold text-center leading-tight" style={{ color: "var(--pf-ink)" }}>
            {winner.name}
          </p>
          {isProductPriceFresh(winner.asin) && winner.priceDisplay ? (
            <p className="font-label font-bold text-center mt-1" style={{ color: "var(--pf-primary)", fontSize: "0.85rem" }}>
              {winner.priceDisplay}
            </p>
          ) : (
            <div className="mt-2 text-center"><VerifiedAmazonCta product={winner} compact /></div>
          )}
        </div>

        {/* Runner-up */}
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="font-label font-bold text-xs" style={{ color: "var(--pf-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Runner-Up
            </span>
          </div>
          {loserImage ? (
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded overflow-hidden">
              <img src={loserImage} alt={loser.name} className="w-full h-full object-contain p-1" />
            </div>
          ) : null}
          <p className="font-body text-xs font-semibold text-center leading-tight" style={{ color: "var(--pf-soft-ink)" }}>
            {loser.name}
          </p>
          {isProductPriceFresh(loser.asin) && loser.priceDisplay ? (
            <p className="font-label font-bold text-center mt-1" style={{ color: "var(--pf-muted)", fontSize: "0.85rem" }}>
              {loser.priceDisplay}
            </p>
          ) : (
            <div className="mt-2 text-center"><VerifiedAmazonCta product={loser} compact /></div>
          )}
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--pf-line)" }}>
        <p className="font-body text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--pf-soft-ink)" }}>
          {comparison.winnerReason ?? comparison.summary}
        </p>
        <Link href={`/comparison/${comparison.slug}`}>
          <button className="btn-primary text-xs py-2 px-4 rounded-sm mt-3 w-full">
            Read Full Comparison
          </button>
        </Link>
      </div>
    </div>
  );
}
