// PauseAndFlourish.com - Comparison Card Component

import { Link } from "wouter";
import { Trophy, ExternalLink } from "lucide-react";
import { type Comparison, getProductById, amazonLink } from "@/lib/products";
import { StarRatingDisplay } from "./ProductCard";

interface ComparisonCardProps {
  comparison: Comparison;
  variant?: "default" | "featured";
}

export default function ComparisonCard({ comparison, variant = "default" }: ComparisonCardProps) {
  const product1 = getProductById(comparison.product1Id);
  const product2 = getProductById(comparison.product2Id);

  if (!product1 || !product2) return null;

  const winner = comparison.winnerId === product1.id ? product1 : product2;
  const loser = comparison.winnerId === product1.id ? product2 : product1;

  return (
    <div className="product-card rounded-sm overflow-hidden">
      <div className="p-4 border-b" style={{ borderColor: "#F0E8DE", backgroundColor: "#F0FAF8" }}>
        <p className="section-label text-xs mb-1">{comparison.category}</p>
        <Link href={`/comparison/${comparison.slug}`}>
          <h3 className="font-display font-bold leading-snug hover:text-red-800 transition-colors cursor-pointer"
            style={{ fontSize: variant === "featured" ? "1.3rem" : "1.1rem", color: "#2C2C2C" }}>
            {comparison.title}
          </h3>
        </Link>
        <p className="font-body text-sm mt-1" style={{ color: "#8C8C8C" }}>{comparison.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-0">
        {/* Winner */}
        <div className="p-4 border-r" style={{ borderColor: "#F0E8DE", backgroundColor: "#FFFAF5" }}>
          <div className="flex items-center gap-1 mb-2">
            <Trophy size={12} style={{ color: "#C4722A" }} />
            <span className="font-label font-bold text-xs" style={{ color: "#C4722A", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Winner
            </span>
          </div>
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded overflow-hidden">
            <img
              src={winner.heroImage}
              alt={winner.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop`;
              }}
            />
          </div>
          <p className="font-body text-xs font-semibold text-center leading-tight" style={{ color: "#2C2C2C" }}>
            {winner.name}
          </p>
          <p className="font-label font-bold text-center mt-1" style={{ color: "#2D7D6F", fontSize: "0.85rem" }}>
            {winner.priceDisplay}
          </p>
        </div>

        {/* Runner-up */}
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="font-label font-bold text-xs" style={{ color: "#B8A99A", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Runner-Up
            </span>
          </div>
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded overflow-hidden">
            <img
              src={loser.heroImage}
              alt={loser.name}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop`;
              }}
            />
          </div>
          <p className="font-body text-xs font-semibold text-center leading-tight" style={{ color: "#6C6C6C" }}>
            {loser.name}
          </p>
          <p className="font-label font-bold text-center mt-1" style={{ color: "#B8A99A", fontSize: "0.85rem" }}>
            {loser.priceDisplay}
          </p>
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: "#F0E8DE" }}>
        <p className="font-body text-sm line-clamp-2 leading-relaxed" style={{ color: "#6C6C6C" }}>
          {comparison.winnerReason}
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
