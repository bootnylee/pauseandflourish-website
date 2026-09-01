// PauseAndFlourish.com - Comparison Page

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Trophy, CheckCircle, XCircle, Sparkles, ArrowRight } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { comparisons, getProductById, amazonLink } from "@/lib/products";
import { updateDocumentMeta, buildArticleSchema, buildBreadcrumbSchema, buildPersonSchema, injectStructuredData } from "@/lib/seo";
import { getAuthor } from "@/lib/authors";
import { QUIZ_RESULT_KEY } from "@/pages/MenopauseQuiz";
import { ProductComparisonTable, VerifiedAmazonCta, FreshCatalogPrice, catalogIsFresh, currentPriceNumber } from "@/components/ProductCommerce";
import { commerceItemListSchema } from "@/lib/commerceSeo";
import { HealthDisclaimers } from "@/components/HealthDisclaimers";

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
    "Multi-Symptom Supplements": "In early perimenopause, consider discussing any new supplement routine with a qualified healthcare professional and prioritize products that fit your preferences and health history.",
    "Sleep & Mood Support": "Sleep changes can occur during perimenopause; consider practical sleep habits and consult a qualified healthcare professional for persistent concerns.",
    "Hot Flash & Cooling": "Cooling products can be a practical comfort option for people experiencing temperature changes during perimenopause.",
    "Bone & Joint Health": "Bone health is an important long-term consideration; discuss nutrition, movement, and any supplement routine with a qualified healthcare professional.",
    default: "Early perimenopause can be a useful time to build a sustainable wellness routine that reflects your preferences and health history.",
  },
  "late-perimenopause": {
    "Multi-Symptom Supplements": "Late perimenopause can involve changing symptoms; compare ingredients, product format, and your individual preferences before choosing a routine.",
    "Sleep & Mood Support": "If sleep changes are affecting daily life, consider discussing them with a qualified healthcare professional; product format and ingredients may affect personal preference.",
    "Hot Flash & Cooling": "For temperature-related discomfort, compare practical features such as material, portability, and ease of use.",
    "Bone & Joint Health": "Compare ingredient labels, serving format, and your overall nutrition and activity routine when considering bone-health products.",
    default: "Late perimenopause can call for a thoughtful review of the products, routines, and professional support that fit your circumstances.",
  },
  "active-menopause": {
    "Multi-Symptom Supplements": "During active menopause, consider whether a product’s ingredients, format, and cost fit your needs and health history.",
    "Sleep & Mood Support": "Sleep and mood concerns can have many causes; consider professional guidance for persistent or disruptive symptoms.",
    "Hot Flash & Cooling": "Cooling products vary in format and features; choose based on the setting and comfort features that matter to you.",
    "Vaginal & Intimate Health": "Intimate dryness can occur during menopause; choose products based on intended use and seek professional guidance for persistent, severe, or painful symptoms.",
    default: "Active menopause is an opportunity to choose a practical routine that reflects your preferences and qualified healthcare guidance.",
  },
  "early-postmenopause": {
    "Vaginal & Intimate Health": "Intimate tissue changes may continue after menopause; choose products based on intended use and speak with a qualified healthcare professional about persistent, severe, or painful symptoms.",
    "Menopause Skincare": "Skin can change after menopause; compare product ingredients, texture, and your skin’s tolerance when selecting skincare.",
    "Bone & Joint Health": "Bone health remains an important consideration after menopause; discuss nutrition, movement, and supplements with a qualified healthcare professional.",
    "Cognitive & Energy Support": "Concentration and energy can be affected by many factors; seek professional guidance for new, persistent, or concerning changes.",
    default: "Early postmenopause can be a time to review sustainable wellness habits with your preferences and health history in mind.",
  },
  "late-postmenopause": {
    "Bone & Joint Health": "For long-term bone health, consider products as one part of an overall nutrition, movement, and professional-care plan.",
    "Cognitive & Energy Support": "For ongoing cognitive or energy concerns, consider lifestyle factors and seek professional guidance when appropriate.",
    "Menopause Skincare": "Choose skincare based on ingredient tolerance, daily routine, and the appearance goals that matter to you.",
    "Fitness & Pelvic Health": "Fitness and pelvic-health routines should reflect your comfort, goals, and qualified professional guidance when needed.",
    default: "Late postmenopause is an opportunity to maintain sustainable routines that align with your preferences and health history.",
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
  const product1 = comparison ? getProductById(comparison.product1Id ?? comparison.productIds[0]) : undefined;
  const product2 = comparison ? getProductById(comparison.product2Id ?? comparison.productIds[1]) : undefined;

  useEffect(() => {
    if (comparison) {
      updateDocumentMeta({
        title: `${comparison.title} | PauseAndFlourish`,
        description: `${comparison.subtitle}. ${(comparison.verdict ?? comparison.summary).substring(0, 150)}`,
        canonical: `https://pauseandflourish.com/comparison/${comparison.slug}`,
        ogType: "article",
      });

      const compAuthor = getAuthor((comparison as any).authorId || "");

      const articleSchema = buildArticleSchema({
        headline: comparison.title,
        description: `${comparison.subtitle}. ${(comparison.verdict ?? comparison.summary).substring(0, 150)}`,
        datePublished: comparison.publishDate || "2026-01-01",
        url: `https://pauseandflourish.com/comparison/${comparison.slug}`,
      });
      injectStructuredData(articleSchema, "article-schema");

      injectStructuredData(buildPersonSchema({
        name: compAuthor.name,
        role: compAuthor.role,
        url: compAuthor.url,
        id: compAuthor.id,
      }), "person-schema");

      const breadcrumbSchema = buildBreadcrumbSchema([
        { name: "Home", url: "https://pauseandflourish.com/" },
        { name: "Comparisons", url: "https://pauseandflourish.com/comparisons" },
        { name: comparison.title, url: `https://pauseandflourish.com/comparison/${comparison.slug}` },
      ]);
      injectStructuredData(breadcrumbSchema, "breadcrumb-schema");
      if (product1 && product2) {
        injectStructuredData(commerceItemListSchema([product1, product2], compAuthor), "comparison-itemlist-schema");
      }
    }
  }, [comparison, product1, product2]);

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

  const winnerId = comparison.winnerId ?? comparison.winner;
  const winner = winnerId === product1.id ? product1 : product2;
  const runnerUp = winnerId === product1.id ? product2 : product1;

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
        <p className="section-label mb-2">{comparison.category ?? "Menopause Supplements"} · Head-to-Head</p>
        <h1 className="font-display font-bold mb-3 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}>
          {comparison.title}
        </h1>
        <p className="font-body text-lg mb-4" style={{ color: "#6C6C6C" }}>{comparison.subtitle}</p>

        {/* E-E-A-T: Author byline + publish date */}
        {(() => {
          const compAuthorDisplay = getAuthor((comparison as any).authorId || "");
          return (
            <div className="flex flex-wrap items-center gap-3 mb-6 text-xs" style={{ color: "#B8A99A" }}>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>By{" "}
                  <Link href={`/author/${compAuthorDisplay.slug}`}>
                    <a className="font-semibold hover:underline" style={{ color: "#2C2C2C" }}>{compAuthorDisplay.name}</a>
                  </Link>
                  <span className="ml-1">· {compAuthorDisplay.role}</span>
                </span>
              </span>
              {comparison.publishDate && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Published {new Date(comparison.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </span>
                </>
              )}
              <span>·</span>
              <a href="/methodology" className="underline hover:text-teal-700" style={{ color: "#B8A99A" }}>Editorial Methodology</a>
            </div>
          );
        })()}

        <hr className="editorial-rule w-16 mb-10" />

        {/* Quiz-aware contextual banner */}
        <ComparisonQuizBanner category={comparison.category ?? "Menopause Supplements"} />

        <ProductComparisonTable products={[product1, product2]} />

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {[product1, product2].map((product) => {
            const isWinner = product.id === (comparison.winnerId ?? comparison.winner);
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
                  <div className="mt-3 mb-4"><FreshCatalogPrice product={product} className="text-xl" />{(!catalogIsFresh(product) || currentPriceNumber(product.price) <= 0) && <p className="font-body text-xs" style={{ color: "#8C8C8C" }}>Price unavailable</p>}</div>
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
                  <VerifiedAmazonCta product={product} label="Check Price on Amazon" className="w-full" />
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
              <div className="mb-3"><FreshCatalogPrice product={product} />{(!catalogIsFresh(product) || currentPriceNumber(product.price) <= 0) && <span className="font-body text-xs" style={{ color: "#8C8C8C" }}>Price unavailable</span>}</div>
              <div className="flex gap-2">
                <Link href={`/review/${product.slug}`}>
                  <button className="btn-primary text-xs py-2 px-3 rounded-sm">Review</button>
                </Link>
                <VerifiedAmazonCta product={product} label="Check Price on Amazon" compact />
              </div>
            </div>
          ))}
        </div>

        <p className="font-body text-xs mt-6" style={{ color: "#B8A99A" }}>
          Published: {new Date(comparison.publishDate ?? "2026-05-02").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · 
          Prices subject to change. Amazon affiliate links - we earn a commission at no extra cost to you.
        </p>

        <HealthDisclaimers showDshea={product1.isDietarySupplement || product2.isDietarySupplement} />
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden" style={{ background: "rgba(250,253,252,0.97)", borderTop: "1px solid #D4EBE7" }}>
          <VerifiedAmazonCta product={winner} label="View picks on Amazon" className="w-full" />
        </div>
      </div>
    </SiteLayout>
  );
}
