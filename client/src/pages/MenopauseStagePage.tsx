// PauseAndFlourish.com — Menopause Stage Page
// Displays products, symptoms, and guidance for a specific menopause stage

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowRight, BookOpen, ChevronRight, Trophy } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { allProducts, comparisons, getProductById } from "@/lib/products";
import { menopauseStages } from "@/lib/menopauseStages";
import { getStageMatchedResearch } from "@/lib/researchRoutes";
import { getRenderableProductImage } from "@/lib/productImageFreshness";
import { VerifiedAmazonCta, currentPriceNumber } from "@/components/ProductCommerce";
import { MoonMark, STAGE_VISUAL } from "@/components/StageMark";
import { updateDocumentMeta, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";
import ProductImage from "@/components/ProductImage";

export default function MenopauseStagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<"default" | "score" | "price-asc" | "price-desc">("default");

  const stage = menopauseStages.find((s) => s.slug === slug);

  useEffect(() => {
    if (!stage) return;
    updateDocumentMeta({
      title: `${stage.name} Products & Guide | PauseAndFlourish`,
      description: `Expert-reviewed products and guidance for ${stage.name}. ${stage.description}`,
      keywords: `${stage.name.toLowerCase()} products, ${stage.name.toLowerCase()} supplements, menopause ${stage.slug} guide`,
      canonical: `https://pauseandflourish.com/stage/${stage.slug}`,
    });
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", url: "https://pauseandflourish.com/" },
      { name: "Stage Guide", url: "https://pauseandflourish.com/quiz" },
      { name: stage.name, url: `https://pauseandflourish.com/stage/${stage.slug}` },
    ]);
    injectStructuredData(breadcrumbSchema, "breadcrumb-schema");
  }, [stage]);

  if (!stage) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display font-bold text-3xl mb-4" style={{ color: "var(--pf-ink)" }}>Stage Not Found</h1>
          <p className="font-body text-base mb-8" style={{ color: "var(--pf-soft-ink)" }}>We couldn't find that menopause stage. Try taking our quiz to find yours.</p>
          <Link href="/quiz">
            <button className="font-label font-semibold px-6 py-3 rounded-sm" style={{ backgroundColor: "var(--pf-primary)", color: "var(--pf-paper)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Take the Quiz</button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const stageProducts = allProducts.filter((p) => p.stages.includes(stage.slug));

  const sorted = [...stageProducts].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "price-asc") return currentPriceNumber(a.price) - currentPriceNumber(b.price);
    if (sortBy === "price-desc") return currentPriceNumber(b.price) - currentPriceNumber(a.price);
    return (b.editorPick ? 1 : 0) - (a.editorPick ? 1 : 0);
  });

  const otherStages = menopauseStages.filter((s) => s.slug !== stage.slug);
  const visual = STAGE_VISUAL[stage.id] ?? STAGE_VISUAL["active-menopause"];
  const topPick = [...stageProducts].sort((a, b) => (b.editorPick ? 1 : 0) - (a.editorPick ? 1 : 0) || b.score - a.score)[0];
  const research = getStageMatchedResearch([stage.id], 3);
  const stageIds = new Set(stageProducts.map((p) => p.id));
  const relatedComparisons = comparisons.filter((c) => c.productIds.some((id) => stageIds.has(id))).slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-14" style={{ backgroundColor: visual.tint }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-xs font-label" style={{ color: "var(--pf-soft)" }}>
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span>Menopause Stages</span>
            <ChevronRight size={12} />
            <span style={{ color: stage.accentColor }}>{stage.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <MoonMark phase={visual.phase} size={64} />
                <div>
                  <p className="font-label font-semibold text-xs mb-1" style={{ color: stage.accentColor, letterSpacing: "0.15em", textTransform: "uppercase" }}>Menopause Stage Guide · {stage.ageRange}</p>
                  <h1 className="font-display font-bold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--pf-ink)" }}>{stage.name}</h1>
                </div>
              </div>
              <p className="font-display text-lg leading-snug mb-3" style={{ color: "var(--pf-primary)" }}>{visual.now}</p>
              <p className="font-body text-base leading-relaxed mb-6" style={{ color: "var(--pf-soft-ink)" }}>{stage.description}</p>
              <Link href="/quiz">
                <button className="font-label font-semibold text-xs px-5 py-3 rounded-sm border transition-colors" style={{ color: stage.accentColor, borderColor: stage.accentColor, backgroundColor: "transparent", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Not sure this is your stage? Take the quiz
                </button>
              </Link>
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-sm p-6 border" style={{ borderColor: `${stage.accentColor}33` }}>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: "1.1rem", color: "var(--pf-ink)" }}>Common Symptoms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stage.primarySymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.accentColor }} />
                    <span className="font-body text-sm" style={{ color: "var(--pf-soft-ink)" }}>{symptom}</span>
                  </div>
                ))}
              </div>
              {stage.keyFocus && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--pf-line)" }}>
                  <p className="font-label font-semibold text-xs mb-2" style={{ color: stage.accentColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>Key Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.keyFocus.map((focus) => (
                      <span key={focus} className="font-body text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${stage.accentColor}15`, color: stage.accentColor }}>{focus}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Start here: the one pick for this stage */}
      {topPick && (
        <section className="py-12 border-t" style={{ borderColor: "var(--pf-line)" }}>
          <div className="container">
            <p className="section-label mb-1">Start here</p>
            <h2 className="font-display font-bold mb-6" style={{ fontSize: "1.8rem", color: "var(--pf-ink)" }}>Our top pick for {stage.name.toLowerCase()}</h2>
            <div className="product-card grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 rounded-sm border p-6" style={{ borderColor: "var(--pf-accent)", background: "#fff" }}>
              <div className="h-52 flex items-center justify-center rounded-sm" style={{ background: "var(--pf-tint)" }}>
                {getRenderableProductImage(topPick) ? <ProductImage product={topPick} className="max-h-full max-w-full object-contain p-4" sizes="240px" eager /> : <span className="font-body text-xs" style={{ color: "var(--pf-muted)" }} data-image-free="listing image not yet available for this product">No image</span>}
              </div>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 self-start font-label text-xs font-bold px-3 py-1 rounded-sm mb-3" style={{ background: "var(--pf-accent)", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}><Trophy size={12} /> {topPick.editorPick ? "Editor's pick" : "Highest score"} · {topPick.score}/10</span>
                <p className="section-label text-xs mb-1">{topPick.brand} · {topPick.category}</p>
                <h3 className="font-display font-bold leading-snug mb-2" style={{ fontSize: "1.4rem", color: "var(--pf-ink)" }}>{topPick.name}</h3>
                <p className="font-body leading-relaxed mb-2" style={{ color: "var(--pf-ink)" }}>{topPick.verdict}</p>
                <p className="font-body text-sm mb-5" style={{ color: "var(--pf-soft-ink)" }}>Best for {topPick.bestFor.replace(/\.$/, "").replace(/^./, (ch) => ch.toLowerCase())}.</p>
                <div className="mt-auto flex flex-wrap gap-3">
                  <VerifiedAmazonCta product={topPick} label="Check Price on Amazon" />
                  <Link href={`/review/${topPick.slug}`}><button className="font-label font-semibold text-xs px-5 py-3 rounded-sm border" style={{ color: "var(--pf-primary)", borderColor: "var(--pf-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Read the full review</button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What the research says for this stage */}
      {research.length > 0 && (
        <section className="py-12 border-t" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-panel)" }}>
          <div className="container">
            <div className="flex items-end justify-between gap-6 mb-6">
              <div>
                <p className="section-label mb-1">What the research says</p>
                <h2 className="font-display font-bold" style={{ fontSize: "1.8rem", color: "var(--pf-ink)" }}>Evidence for {stage.name.toLowerCase()}</h2>
              </div>
              <Link href="/news-and-articles"><span className="font-label font-semibold text-xs inline-flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--pf-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Research library <ArrowRight size={14} /></span></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {research.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block rounded-sm p-5 border transition-all hover:shadow-md" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-paper)" }}>
                  <div className="flex items-center gap-2 mb-3"><BookOpen size={14} style={{ color: "var(--pf-primary)" }} /><span className="font-label text-[0.62rem] uppercase font-semibold" style={{ color: "var(--pf-primary)", letterSpacing: "0.1em" }}>{r.study_type}</span></div>
                  <h3 className="font-display font-semibold leading-snug mb-2" style={{ fontSize: "1.05rem", color: "var(--pf-ink)" }}>{r.headline}</h3>
                  <p className="font-body text-sm leading-relaxed mb-3" style={{ color: "var(--pf-soft-ink)" }}>{r.takeaway}</p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: "var(--pf-soft)" }}>{r.citation}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-14">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="section-label mb-1">Curated for {stage.name}</p>
              <h2 className="font-display font-bold" style={{ fontSize: "1.8rem", color: "var(--pf-ink)" }}>
                {sorted.length} Recommended Product{sorted.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="stage-sort" className="font-label text-xs" style={{ color: "var(--pf-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sort:</label>
              <select
                id="stage-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="font-body text-sm border rounded-sm px-3 py-1.5"
                style={{ borderColor: "var(--pf-line)", color: "var(--pf-ink)", backgroundColor: "var(--pf-paper)" }}
              >
                <option value="default">Editor's Choice</option>
                <option value="score">Highest Score</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display font-bold text-xl mb-3" style={{ color: "var(--pf-ink)" }}>No products yet for this stage</p>
              <p className="font-body text-sm mb-6" style={{ color: "var(--pf-soft)" }}>We're adding more reviews regularly. Check back soon.</p>
              <Link href="/reviews">
                <button className="font-label font-semibold text-xs px-5 py-3 rounded-sm" style={{ backgroundColor: "var(--pf-primary)", color: "var(--pf-paper)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Browse All Reviews</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Head-to-heads that include this stage's products */}
      {relatedComparisons.length > 0 && (
        <section className="py-12 border-t" style={{ borderColor: "var(--pf-line)" }}>
          <div className="container">
            <p className="section-label mb-1">Head-to-head</p>
            <h2 className="font-display font-bold mb-6" style={{ fontSize: "1.8rem", color: "var(--pf-ink)" }}>Comparisons for this stage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedComparisons.map((c) => {
                const w = getProductById(c.winnerId ?? c.winner);
                const img = w ? getRenderableProductImage(w) : undefined;
                return (
                  <Link key={c.id} href={`/comparison/${c.slug}`}>
                    <div className="product-card h-full rounded-sm border p-5 cursor-pointer transition-all hover:shadow-md" style={{ borderColor: "var(--pf-line)", background: "#fff" }}>
                      <div className="h-28 flex items-center justify-center mb-4 rounded-sm" style={{ background: "var(--pf-tint)" }}>
                        {img && w ? <ProductImage product={w} className="max-h-full max-w-full object-contain p-3" sizes="200px" /> : <span className="font-body text-xs" style={{ color: "var(--pf-muted)" }} data-image-free="listing image not yet available for this product">No image</span>}
                      </div>
                      <p className="font-display font-semibold leading-snug mb-2" style={{ fontSize: "1.05rem", color: "var(--pf-ink)" }}>{c.title}</p>
                      <p className="font-body text-xs" style={{ color: "var(--pf-soft-ink)" }}>Winner: <strong style={{ color: "var(--pf-accent)" }}>{w?.name}</strong></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Other Stages */}
      <section className="py-12 border-t" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-tint)" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold" style={{ fontSize: "1.4rem", color: "var(--pf-ink)" }}>Explore Other Stages</h2>
            <Link href="/quiz">
              <button className="font-label font-semibold text-xs flex items-center gap-1" style={{ color: "var(--pf-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Find My Stage <ArrowRight size={13} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {otherStages.map((s) => (
              <Link key={s.id} href={`/stage/${s.slug}`}>
                <div className="p-4 rounded-sm cursor-pointer transition-all hover:shadow-md border" style={{ backgroundColor: (STAGE_VISUAL[s.id] ?? STAGE_VISUAL["active-menopause"]).tint, borderColor: `${s.accentColor}33` }}>
                  <div className="mb-2"><MoonMark phase={(STAGE_VISUAL[s.id] ?? STAGE_VISUAL["active-menopause"]).phase} size={32} /></div>
                  <p className="font-display font-semibold text-sm leading-tight" style={{ color: "var(--pf-ink)" }}>{s.name}</p>
                  <p className="font-body text-xs mt-1" style={{ color: "var(--pf-soft)" }}>{s.ageRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup variant="inline" />
    </SiteLayout>
  );
}
