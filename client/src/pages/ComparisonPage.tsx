// PauseAndFlourish.com - Comparison Page

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Trophy, ExternalLink, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { StarRatingDisplay } from "@/components/ProductCard";
import { comparisons, getProductById, amazonLink } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "@/pages/MenopauseQuiz";

// Menopause stage metadata for contextual tips
const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  "early-perimenopause":  { label: "Early Perimenopause",  color: "#2D7D6F", bg: "#F0FAF8" },
  "late-perimenopause":   { label: "Late Perimenopause",   color: "#3D8B7A", bg: "#E8F7F4" },
  "active-menopause":     { label: "Active Menopause",     color: "#C4722A", bg: "#FFF8EE" },
  "early-postmenopause":  { label: "Early Postmenopause",  color: "#7B6EA8", bg: "#F5F0FF" },
  "late-postmenopause":   { label: "Late Postmenopause",   color: "#2D7D6F", bg: "#F0FAF8" },
};

// Contextual tips per menopause stage per product category
const CATEGORY_TIPS: Record<string, Record<string, string>> = {
  "early-perimenopause": {
    "Multi-Symptom Supplements": "In early perimenopause, milder formulas with black cohosh or phytoestrogens are a good starting point before symptoms intensify.",
    "Sleep & Mood Support": "Sleep disruption often starts before hot flashes — a magnesium or L-theanine option is a gentle first step.",
    "Hot Flash & Cooling": "Cooling products are worth having on hand even before hot flashes peak — early investment pays off.",
    "Bone & Joint Health": "Starting calcium and vitamin D supplementation early in perimenopause provides the longest protective window.",
    default: "Early perimenopause is the ideal time to build a proactive wellness routine — the gentler, foundational option is usually the right starting point.",
  },
  "late-perimenopause": {
    "Multi-Symptom Supplements": "Late perimenopause brings intensifying symptoms — look for the more comprehensive multi-symptom formula in this comparison.",
    "Sleep & Mood Support": "Sleep issues peak in late perimenopause — the option with stronger sleep-onset support will make the biggest difference.",
    "Hot Flash & Cooling": "Hot flashes are most frequent now — prioritize the option with faster, longer-lasting cooling relief.",
    "Bone & Joint Health": "Bone density loss accelerates in late perimenopause — the option with higher elemental calcium and D3 is the stronger choice.",
    default: "Late perimenopause demands more targeted relief — the more comprehensive or higher-potency option is usually the better fit.",
  },
  "active-menopause": {
    "Multi-Symptom Supplements": "Active menopause calls for full-spectrum support — look for the formula addressing hot flashes, mood, and sleep together.",
    "Sleep & Mood Support": "Mood and sleep are closely linked at this stage — the option addressing both simultaneously offers the most value.",
    "Hot Flash & Cooling": "Hot flashes are at their most disruptive now — the option with the broadest cooling coverage wins.",
    "Vaginal & Intimate Health": "Vaginal dryness typically begins in active menopause — the longer-lasting moisturizer is the more practical choice.",
    default: "Active menopause requires comprehensive support across multiple symptoms — the more complete solution is usually the better investment.",
  },
  "early-postmenopause": {
    "Vaginal & Intimate Health": "Vaginal atrophy continues post-menopause — the option with hyaluronic acid or longer-lasting moisture is the stronger choice.",
    "Menopause Skincare": "Collagen loss accelerates post-menopause — the option with retinol or collagen-stimulating ingredients will deliver more visible results.",
    "Bone & Joint Health": "Bone protection remains critical in early postmenopause — the option with the highest bioavailable calcium wins.",
    "Cognitive & Energy Support": "Brain fog often persists post-menopause — the nootropic or adaptogen with the strongest clinical evidence is the better pick.",
    default: "Early postmenopause is about rebuilding and protecting — the option with the strongest long-term protective benefits is usually the right choice.",
  },
  "late-postmenopause": {
    "Bone & Joint Health": "Long-term bone health is the top priority — the option with the most comprehensive mineral and vitamin D3/K2 profile wins.",
    "Cognitive & Energy Support": "Cognitive support becomes increasingly important — look for the option with the strongest evidence for long-term brain health.",
    "Menopause Skincare": "Skin continues to thin post-menopause — the option with the most intensive collagen and barrier-support ingredients is the better choice.",
    "Fitness & Pelvic Health": "Muscle preservation and pelvic floor strength are key at this stage — the option supporting both is the more complete solution.",
    default: "Late postmenopause calls for long-term protective strategies — the option with the strongest evidence for longevity and vitality is usually the better fit.",
  },
};

function ComparisonQuizBanner({ category }: { category: string }) {
  const [savedStage, setSavedStage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUIZ_RESULT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stage) setSavedStage(parsed?.stage);
      }
    } catch {}
  }, []);

  if (dismissed) return null;

  const meta = savedStage ? STAGE_META[savedStage] : null;
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
            Your stage: {meta.label}
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
          <span className="font-semibold" style={{ color: "#2D7D6F" }}>Not sure which is right for your menopause stage?</span>
          {" "}Take our 2-minute quiz to get a personalized recommendation.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href="/quiz">
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
          <Link href="/"><span className="font-body text-sm cursor-pointer hover:text-teal-700" style={{ color: "#B8A99A" }}>Home</span></Link>
          <span style={{ color: "#B8A99A" }}>/</span>
          <Link href="/comparisons"><span className="font-body text-sm cursor-pointer hover:text-teal-700" style={{ color: "#B8A99A" }}>Comparisons</span></Link>
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
