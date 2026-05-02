// PauseAndFlourish.com - Comparison Page

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Trophy, ExternalLink, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { StarRatingDisplay } from "@/components/ProductCard";
import { comparisons, getProductById, amazonLink } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "@/pages/MenopauseQuiz";

// Hair type metadata for contextual tips
const HAIR_META: Record<string, { label: string; color: string; bg: string }> = {
  fine:            { label: "Fine Hair",          color: "#6B4E9B", bg: "#F5F0FF" },
  thick:           { label: "Thick Hair",         color: "#2C6B2F", bg: "#EDFAEE" },
  curly:           { label: "Curly Hair",         color: "#C4722A", bg: "#FFF8EE" },
  coarse:          { label: "Coarse Hair",        color: "#8B4513", bg: "#FFF5EE" },
  dry:             { label: "Dry Hair",           color: "#C0392B", bg: "#FFF5F5" },
  normal:          { label: "Normal Hair",        color: "#2C6B2F", bg: "#EDFAEE" },
  "color-treated": { label: "Color-Treated Hair", color: "#2D7D6F", bg: "#F0FAF8" },
};

// Contextual tips per menopause stage per product category
const CATEGORY_TIPS: Record<string, Record<string, string>> = {
  fine: {
    "Shampoo & Conditioner": "Fine hair benefits most from lightweight, volumizing formulas — look for the option with fewer heavy silicones.",
    "Hair Masks & Treatments": "For fine hair, a lighter rinse-out mask beats a heavy leave-in — less weight means more lift.",
    "Serums & Oils": "Fine hair needs just a drop — choose the lighter-weight oil to avoid limpness.",
    "Styling Tools": "Fine hair is heat-sensitive — the tool with adjustable lower heat settings is the safer pick.",
    default: "Fine hair tends to weigh down easily — the lighter-formula or lower-heat option is usually the better fit.",
  },
  thick: {
    "Shampoo & Conditioner": "Thick hair needs deeper moisture — look for the richer, more hydrating formula in this comparison.",
    "Hair Masks & Treatments": "Thick hair thrives with intensive masks — the heavier treatment option will penetrate better.",
    "Serums & Oils": "Thick hair can handle richer oils — the heavier option in this comparison will tame frizz more effectively.",
    "Styling Tools": "Thick hair needs more power — the higher-wattage or higher-heat tool will cut drying time significantly.",
    default: "Thick hair needs more product and more heat — the more powerful or richer option is usually the better fit.",
  },
  curly: {
    "Shampoo & Conditioner": "Curly hair craves moisture and curl definition — look for the sulfate-free, hydrating option.",
    "Hair Masks & Treatments": "Curly hair benefits from deep conditioning — the more intensive mask will enhance curl pattern and reduce frizz.",
    "Serums & Oils": "Curly hair needs frizz control and shine — choose the oil with better humidity resistance.",
    "Styling Tools": "Curly hair benefits from diffusers and lower heat — look for the tool with a diffuser attachment or ionic technology.",
    default: "Curly hair needs extra moisture and gentle heat — the more hydrating or lower-heat option tends to win for curls.",
  },
  coarse: {
    "Shampoo & Conditioner": "Coarse hair needs smoothing and moisture — the richer, more emollient formula will tame texture better.",
    "Hair Masks & Treatments": "Coarse hair responds well to protein-rich treatments — look for the option with keratin or protein in its formula.",
    "Serums & Oils": "Coarse hair needs a heavier oil to smooth the cuticle — the richer serum will deliver better results.",
    "Styling Tools": "Coarse hair needs high heat and ionic technology to smooth — the higher-powered tool is the better pick.",
    default: "Coarse hair needs smoothing power — the more intensive or higher-heat option typically works better.",
  },
  dry: {
    "Shampoo & Conditioner": "Dry hair needs maximum hydration — the more moisturizing formula with fewer sulfates is the clear winner for you.",
    "Hair Masks & Treatments": "Dry hair needs intensive moisture replenishment — the richer, longer-leave-in mask will make the biggest difference.",
    "Serums & Oils": "Dry hair needs a nourishing oil — look for the option richest in fatty acids for lasting moisture.",
    "Styling Tools": "Dry hair is prone to heat damage — the tool with better heat protection or lower temperature settings is the safer choice.",
    default: "Dry hair needs extra moisture and gentle heat — the more hydrating or lower-heat option is usually the better fit.",
  },
  normal: {
    default: "Normal hair is versatile — either option should work well, but the higher-rated one for overall performance is your best bet.",
  },
  "color-treated": {
    "Shampoo & Conditioner": "Color-treated hair needs sulfate-free, color-safe formulas — look for the option specifically designed to protect color.",
    "Hair Masks & Treatments": "Color-treated hair benefits from bond-building treatments — look for the option with Olaplex-style bonding technology.",
    "Serums & Oils": "Color-treated hair needs UV protection and shine — choose the serum with better color-protecting ingredients.",
    "Styling Tools": "Color-treated hair is more fragile — the tool with lower heat settings or infrared technology is the safer pick.",
    default: "Color-treated hair is more fragile — the gentler, more protective option is usually the better fit.",
  },
};

function ComparisonQuizBanner({ category }: { category: string }) {
  const [savedStage, setSavedHairType] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUIZ_RESULT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stage) setSavedHairType(parsed?.stage);
      }
    } catch {}
  }, []);

  if (dismissed) return null;

  const meta = savedStage ? HAIR_META[savedStage] : null;
  const tips = savedStage ? CATEGORY_TIPS[savedStage] : null;
  const tip = tips ? (tips[category] ?? tips["default"]) : null;

  if (meta && tip) {
    // Returning visitor with saved menopause stage — show personalized tip
    return (
      <div
        className="rounded-lg px-5 py-4 mb-8 flex items-start gap-3"
        style={{ backgroundColor: meta.bg, border: `1.5px solid ${meta.color}33` }}
      >
        <Sparkles size={16} className="flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
        <div className="flex-1">
          <p className="font-body font-semibold text-sm mb-0.5" style={{ color: meta.color }}>
            Tip for {meta.label}
          </p>
          <p className="font-body text-sm leading-relaxed" style={{ color: "#4A3A3A" }}>
            {tip}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 hover:opacity-50 transition-opacity mt-0.5"
          style={{ background: "none", border: "none", padding: 0, color: "#8C8C8C", cursor: "pointer" }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    );
  }

  // First-time visitor — invite to take quiz
  return (
    <div
      className="rounded-lg px-5 py-4 mb-8 flex items-center gap-3 justify-between"
      style={{ backgroundColor: "#EDF5F3", border: "1.5px solid #D4EBE7" }}
    >
      <div className="flex items-center gap-3">
        <Sparkles size={15} className="flex-shrink-0" style={{ color: "#2D7D6F" }} />
        <p className="font-body text-sm" style={{ color: "#4A3A3A" }}>
          <span className="font-semibold" style={{ color: "#2D7D6F" }}>Not sure which is right for your hair?</span>
          {" "}Take our 2-minute quiz to get a personalized recommendation.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href="/hair-quiz">
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded font-body font-semibold text-xs cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4" }}
          >
            Take Quiz <ArrowRight size={11} />
          </span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="hover:opacity-50 transition-opacity"
          style={{ background: "none", border: "none", padding: 0, color: "#8C8C8C", cursor: "pointer" }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  const comparison = comparisons.find(c => c.slug === slug);
  const product1 = comparison ? getProductById(comparison.product1Id) : undefined;
  const product2 = comparison ? getProductById(comparison.product2Id) : undefined;

  useEffect(() => {
    if (comparison) {
      updateDocumentMeta({
        title: `${comparison.title} | PauseAndFlourish`,
        description: `${comparison.subtitle}. ${comparison.verdict.substring(0, 150)}`,
        canonical: `https://pauseandflourish.com/comparison/${comparison.slug}`,
        ogType: "article",
      });
    }
  }, [comparison]);

  if (!comparison || !product1 || !product2) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl" style={{ color: "#2C2C2C" }}>Comparison Not Found</h1>
          <Link href="/comparisons"><button className="btn-primary mt-6 rounded-sm px-6 py-3">All Comparisons</button></Link>
        </div>
      </SiteLayout>
    );
  }

  const winner = comparison.winnerId === product1.id ? product1 : product2;
  const runnerUp = comparison.winnerId === product1.id ? product2 : product1;

  return (
    <SiteLayout>
      <div className="container py-10 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/"><span className="font-body text-sm cursor-pointer hover:text-red-800" style={{ color: "#B8A99A" }}>Home</span></Link>
          <span style={{ color: "#B8A99A" }}>/</span>
          <Link href="/comparisons"><span className="font-body text-sm cursor-pointer hover:text-red-800" style={{ color: "#B8A99A" }}>Comparisons</span></Link>
          <span style={{ color: "#B8A99A" }}>/</span>
          <span className="font-body text-sm" style={{ color: "#2C2C2C" }}>{comparison.title}</span>
        </div>

        {/* Header */}
        <p className="section-label mb-2">{comparison.category} · Head-to-Head</p>
        <h1 className="font-display font-bold mb-3 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}>
          {comparison.title}
        </h1>
        <p className="font-body text-lg mb-6" style={{ color: "#6C6C6C" }}>{comparison.subtitle}</p>
        <hr className="editorial-rule w-16 mb-10" />

        {/* Quiz-aware contextual banner */}
        <ComparisonQuizBanner category={comparison.category} />

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {[product1, product2].map((product) => {
            const isWinner = product.id === comparison.winnerId;
            return (
              <div key={product.id} className={`rounded-sm overflow-hidden border-2 ${isWinner ? "comparison-winner" : ""}`}
                style={{ borderColor: isWinner ? "#C4722A" : "#D4EBE7" }}>
                {isWinner && (
                  <div className="flex items-center justify-center gap-2 py-2"
                    style={{ backgroundColor: "#C4722A" }}>
                    <Trophy size={14} style={{ color: "white" }} />
                    <span className="font-label font-bold text-xs" style={{ color: "white", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Our Winner
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="h-40 flex items-center justify-center mb-4 rounded-sm" style={{ backgroundColor: "#EDF5F3" }}>
                    <img
                      src={product.heroImage}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop`;
                      }}
                    />
                  </div>
                  <p className="section-label text-xs mb-1">{product.brand}</p>
                  <h3 className="font-display font-bold mb-2 leading-snug" style={{ fontSize: "1.1rem", color: "#2C2C2C" }}>
                    {product.name}
                  </h3>
                  <StarRatingDisplay rating={product.rating} reviewCount={product.reviewCount} />
                  <p className="font-label font-bold mt-3 mb-4" style={{ color: "#2D7D6F", fontSize: "1.3rem" }}>
                    {product.priceDisplay}
                  </p>
                  <div className="space-y-1 mb-4">
                    {product.pros.slice(0, 3).map((pro, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#4CAF50" }} />
                        <span className="font-body text-xs" style={{ color: "#2C2C2C" }}>{pro}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 mb-5">
                    {product.cons.slice(0, 2).map((con, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#E53935" }} />
                        <span className="font-body text-xs" style={{ color: "#6C6C6C" }}>{con}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={amazonLink(product.asin)}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="btn-amazon rounded-sm w-full flex items-center justify-center gap-2 py-2.5 text-xs"
                  >
                    View on Amazon <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner Explanation */}
        <div className="p-6 rounded-sm mb-8" style={{ backgroundColor: "#EDF5F3", border: "2px solid #C4722A" }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} style={{ color: "#C4722A" }} />
            <p className="section-label">Why {winner.name} Wins</p>
          </div>
          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>{comparison.winnerReason}</p>
        </div>

        {/* Full Verdict */}
        <div className="mb-8">
          <h2 className="font-display font-bold mb-4" style={{ fontSize: "1.8rem", color: "#2C2C2C" }}>Our Full Verdict</h2>
          <p className="font-body text-lg leading-relaxed" style={{ color: "#2C2C2C" }}>{comparison.verdict}</p>
        </div>

        {/* Bottom CTAs */}
        <div className="grid grid-cols-2 gap-4 pt-8 border-t" style={{ borderColor: "#D4EBE7" }}>
          {[winner, runnerUp].map((product, i) => (
            <div key={product.id} className="p-4 rounded-sm border" style={{ borderColor: "#D4EBE7" }}>
              <p className="section-label text-xs mb-1">{i === 0 ? "🏆 Winner" : "Runner-Up"}</p>
              <p className="font-body font-semibold text-sm mb-2" style={{ color: "#2C2C2C" }}>{product.name}</p>
              <p className="font-label font-bold mb-3" style={{ color: "#2D7D6F" }}>{product.priceDisplay}</p>
              <div className="flex gap-2">
                <Link href={`/review/${product.slug}`}>
                  <button className="btn-primary text-xs py-2 px-3 rounded-sm">Review</button>
                </Link>
                <a href={amazonLink(product.asin)} target="_blank" rel="noopener noreferrer nofollow"
                  className="btn-amazon text-xs py-2 px-3 rounded-sm inline-flex items-center gap-1">
                  Amazon <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="font-body text-xs mt-6" style={{ color: "#B8A99A" }}>
          Published: {new Date(comparison.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · 
          Prices subject to change. Amazon affiliate links - we earn a commission at no extra cost to you.
        </p>
      </div>
    </SiteLayout>
  );
}
