// Pause & Flourish — Home (identity v2, 2026-09-17)
// Spine of the page: the five stages. Everything else hangs off them.
import { Link } from "wouter";
import { ArrowRight, Clock, Sparkles, BookOpen } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { categories, getEditorPicks, comparisons, allProducts, getProductById, getProductsByStage, type Product, type Comparison } from "@/lib/products";
import { menopauseStages } from "@/lib/menopauseStages";
import { researchArticles } from "@/lib/researchArticles";
import { getRenderableProductImage } from "@/lib/productImageFreshness";
import { hasVerifiedAsin, VerifiedAmazonCta } from "@/components/ProductCommerce";
import { useEffect, useState } from "react";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "./MenopauseQuiz";
import { RECENTLY_VIEWED_KEY } from "./ProductReview";

// ─── Stage visuals: one lunar-phase mark per stage, one short "what changes now" ─
const STAGE_VISUAL: Record<string, { phase: number; now: string; tint: string }> = {
  "early-perimenopause": { phase: 0.15, now: "Cycles start to shift. Sleep and mood move first.", tint: "var(--pf-tint-2)" },
  "late-perimenopause": { phase: 0.4, now: "Hot flashes and night sweats arrive. Sleep needs help.", tint: "var(--pf-accent-tint)" },
  "active-menopause": { phase: 0.5, now: "Twelve months without a period. The full transition.", tint: "var(--pf-tint)" },
  "early-postmenopause": { phase: 0.7, now: "Symptoms settle. Bone, heart and skin take the lead.", tint: "var(--pf-paper-deep)" },
  "late-postmenopause": { phase: 0.95, now: "A steadier chapter. Strength, sleep and long-term health.", tint: "var(--pf-tint-2)" },
};

function MoonMark({ phase, size = 44 }: { phase: number; size?: number }) {
  // phase 0 = new moon, 0.5 = full, 1 = new again. Lit fraction f; a paper-coloured
  // disc slides across the primary disc inside a clip so the crescent grows then wanes.
  const r = size / 2 - 2;
  const f = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const shift = (phase <= 0.5 ? 1 : -1) * 2 * r * (1 - f); // the paper disc is the lit part; it overlaps f of the primary disc
  const id = `moon-${Math.round(phase * 100)}-${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs><clipPath id={id}><circle cx={size / 2} cy={size / 2} r={r} /></clipPath></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--pf-primary)" />
      {f > 0.02 && <circle cx={size / 2 + shift} cy={size / 2} r={r} fill="var(--pf-paper)" clipPath={`url(#${id})`} />}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pf-primary)" strokeWidth="1.5" />
    </svg>
  );
}

function newestFirst<T extends { publishDate: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

function SectionHead({ label, title, href, cta }: { label: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div>
        <p className="section-label mb-1">{label}</p>
        <h2 className="font-display font-semibold" style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.3rem)", color: "var(--pf-ink)" }}>{title}</h2>
      </div>
      {href && cta ? (
        <Link href={href}><span className="font-label font-semibold text-xs inline-flex items-center gap-1 whitespace-nowrap" style={{ color: "var(--pf-primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{cta} <ArrowRight size={14} /></span></Link>
      ) : null}
    </div>
  );
}

// ─── Hero: the promise, the quiz, and the real work (product imagery, not stock) ─
function Hero({ picks }: { picks: Product[] }) {
  const tiles = picks.length >= 6 ? picks.slice(3, 6) : picks.slice(0, 3);
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--pf-paper)" }}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-14 lg:py-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: "var(--pf-accent)" }} />
              <p className="font-label font-semibold text-xs" style={{ color: "var(--pf-accent)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Evidence-based menopause guidance</p>
            </div>
            <h1 className="font-display font-semibold mb-6" style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.6rem)", color: "var(--pf-ink)", lineHeight: 1.08, letterSpacing: "-0.015em" }}>
              Know your stage.<br />Choose what actually helps.
            </h1>
            <p className="font-body text-lg leading-relaxed mb-8" style={{ color: "var(--pf-soft-ink)", maxWidth: "520px" }}>
              Reviews, comparisons and a research library for every stage of perimenopause and menopause. Sorted by where you are, not by what sells.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quiz"><button className="btn-primary rounded-sm" style={{ fontSize: "0.85rem" }}>Find my stage · 2 min</button></Link>
              <Link href="/reviews"><button className="font-label font-semibold text-sm px-6 py-3 rounded-sm border transition-colors" style={{ color: "var(--pf-primary)", borderColor: "var(--pf-primary)", backgroundColor: "transparent", letterSpacing: "0.06em" }}>Browse reviews</button></Link>
            </div>
            <p className="font-body text-xs mt-6" style={{ color: "var(--pf-soft)" }}>{allProducts.length} products reviewed · {comparisons.length} head-to-head comparisons · {researchArticles.length} cited studies</p>
          </div>
          <div className="lg:col-span-6 hidden lg:block">
            <div className="grid grid-cols-3 gap-4 items-end">
              {tiles.map((p, i) => {
                const img = getRenderableProductImage(p);
                return (
                  <Link key={p.id} href={`/review/${p.slug}`}>
                    <div className="rounded-sm overflow-hidden flex flex-col" style={{ backgroundColor: i === 1 ? "var(--pf-accent-tint)" : "var(--pf-tint)", marginTop: i === 1 ? 0 : 36, transform: i === 1 ? "translateY(-12px)" : undefined }}>
                      <div className="flex items-center justify-center p-6" style={{ height: 210 }}>
                        {img ? <img src={img} alt={p.name} className="max-h-full max-w-full object-contain" loading="eager" /> : null}
                      </div>
                      <div className="px-4 pb-4">
                        <p className="font-label text-[0.62rem] font-semibold uppercase" style={{ color: "var(--pf-accent)", letterSpacing: "0.1em" }}>Editor's pick</p>
                        <p className="font-body text-sm font-semibold leading-snug mt-1" style={{ color: "var(--pf-ink)" }}>{p.name}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stage spine ────────────────────────────────────────────────────────────────
function StageSpine() {
  // One distinct top pick per stage: best score, editor picks first, no repeats across the row.
  const used = new Set<string>();
  const stagePicks: Record<string, Product | undefined> = {};
  for (const stage of menopauseStages) {
    const ranked = [...getProductsByStage(stage.slug)].sort((x, y) => Number(y.editorPick) - Number(x.editorPick) || y.score - x.score);
    const pick = ranked.find(p => !used.has(p.id)) ?? ranked[0];
    if (pick) used.add(pick.id);
    stagePicks[stage.id] = pick;
  }
  return (
    <section className="py-16 border-y" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-panel)" }}>
      <div className="container">
        <SectionHead label="Start here" title="Where are you in the transition?" href="/quiz" cta="Take the 2-minute quiz" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {menopauseStages.map(stage => {
            const v = STAGE_VISUAL[stage.id] ?? STAGE_VISUAL["active-menopause"];
            const top = stagePicks[stage.id];
            const img = top ? getRenderableProductImage(top) : undefined;
            return (
              <Link key={stage.id} href={`/stage/${stage.slug}`}>
                <div className="h-full rounded-sm p-5 flex flex-col gap-4 transition-all hover:shadow-md group" style={{ backgroundColor: v.tint, border: "1px solid var(--pf-line)" }}>
                  <div className="flex items-center justify-between">
                    <MoonMark phase={v.phase} />
                    <span className="font-label text-[0.62rem] font-semibold uppercase" style={{ color: "var(--pf-soft)", letterSpacing: "0.1em" }}>{stage.ageRange}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold leading-tight" style={{ fontSize: "1.25rem", color: "var(--pf-ink)" }}>{stage.name}</h3>
                    <p className="font-body text-sm mt-2 leading-relaxed" style={{ color: "var(--pf-soft-ink)" }}>{v.now}</p>
                  </div>
                  {top ? (
                    <div className="mt-auto pt-4 flex items-center gap-3 border-t" style={{ borderColor: "var(--pf-line)" }}>
                      <div className="w-12 h-12 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: "var(--pf-panel)" }}>
                        {img ? <img src={img} alt="" className="max-w-full max-h-full object-contain" loading="lazy" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="font-label text-[0.6rem] font-semibold uppercase" style={{ color: "var(--pf-primary)", letterSpacing: "0.1em" }}>Top pick</p>
                        <p className="font-body text-xs font-semibold leading-snug truncate" style={{ color: "var(--pf-ink)" }}>{top.name}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Featured comparison as a real table ───────────────────────────────────────
function FeaturedComparison({ comparison }: { comparison: Comparison }) {
  const a = getProductById(comparison.productIds[0]);
  const b = getProductById(comparison.productIds[1]);
  if (!a || !b) return null;
  const winnerId = comparison.winnerId ?? comparison.winner;
  const rows: Array<[string, (p: Product) => string]> = [
    ["Best for", p => p.bestFor],
    ["Our score", p => `${p.score}/10`],
    ["Editor's pick", p => p.editorPick ? "Yes" : "No"],
    ["Category", p => p.category],
  ];
  const Cell = ({ p }: { p: Product }) => {
    const img = getRenderableProductImage(p); const win = p.id === winnerId;
    return (
      <div className="flex flex-col items-center text-center gap-3 p-4">
        <div className="w-28 h-28 rounded-sm flex items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--pf-tint-2)" }}>
          {img ? <img src={img} alt={p.name} className="max-w-full max-h-full object-contain" loading="lazy" /> : null}
        </div>
        {win ? <span className="editor-pick-badge rounded-sm" style={{ backgroundColor: "var(--pf-primary)" }}>Winner</span> : <span className="font-label text-[0.65rem] uppercase font-semibold" style={{ color: "var(--pf-soft)", letterSpacing: "0.1em" }}>Runner-up</span>}
        <Link href={`/review/${p.slug}`}><span className="font-display font-semibold leading-tight" style={{ fontSize: "1.05rem", color: "var(--pf-ink)" }}>{p.name}</span></Link>
        {hasVerifiedAsin(p.asin) ? <VerifiedAmazonCta product={p} label="Check price" compact /> : null}
      </div>
    );
  };
  return (
    <section className="py-16" style={{ backgroundColor: "var(--pf-tint)" }}>
      <div className="container">
        <SectionHead label="Head-to-head" title={comparison.title} href="/comparisons" cta={`All ${comparisons.length} comparisons`} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 rounded-sm overflow-hidden border" style={{ backgroundColor: "var(--pf-panel)", borderColor: "var(--pf-line)" }}>
            <div className="grid grid-cols-2 border-b" style={{ borderColor: "var(--pf-line)" }}>
              <Cell p={a} /><Cell p={b} />
            </div>
            <table className="w-full text-sm">
              <tbody>
                {rows.map(([label, fn]) => (
                  <tr key={label} className="border-b last:border-b-0" style={{ borderColor: "var(--pf-line)" }}>
                    <th scope="row" className="text-left font-label text-[0.68rem] uppercase font-semibold px-4 py-3 w-32" style={{ color: "var(--pf-soft)", letterSpacing: "0.1em" }}>{label}</th>
                    <td className="px-4 py-3 font-body" style={{ color: "var(--pf-ink)" }}>{fn(a)}</td>
                    <td className="px-4 py-3 font-body border-l" style={{ color: "var(--pf-ink)", borderColor: "var(--pf-line)" }}>{fn(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:col-span-4">
            <p className="section-label mb-2">The verdict</p>
            <p className="font-display text-xl leading-snug mb-4" style={{ color: "var(--pf-ink)" }}>{comparison.winnerReason || comparison.summary}</p>
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "var(--pf-soft-ink)" }}>{comparison.subtitle}</p>
            <Link href={`/comparison/${comparison.slug}`}><span className="btn-primary rounded-sm inline-block" style={{ fontSize: "0.78rem" }}>Read the full comparison</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Research strip ─────────────────────────────────────────────────────────────
function ResearchStrip() {
  const latest = [...researchArticles].sort((x, y) => y.date_added.localeCompare(x.date_added)).slice(0, 3);
  return (
    <section className="py-16 border-t" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-panel)" }}>
      <div className="container">
        <SectionHead label="What the research says" title="Every recommendation cites its source" href="/news-and-articles" cta="Research library" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map(r => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block rounded-sm p-5 border transition-all hover:shadow-md" style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-paper)" }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: "var(--pf-primary)" }} />
                <span className="font-label text-[0.62rem] uppercase font-semibold" style={{ color: "var(--pf-primary)", letterSpacing: "0.1em" }}>{r.study_type}</span>
              </div>
              <h3 className="font-display font-semibold leading-snug mb-2" style={{ fontSize: "1.1rem", color: "var(--pf-ink)" }}>{r.headline}</h3>
              <p className="font-body text-sm leading-relaxed mb-3" style={{ color: "var(--pf-soft-ink)" }}>{r.takeaway}</p>
              <p className="font-body text-xs leading-relaxed" style={{ color: "var(--pf-soft)" }}>{r.citation}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentlyViewedSection() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        const slugs: string[] = JSON.parse(raw);
        setRecentProducts(slugs.map(slug => allProducts.find(p => p.slug === slug)).filter((p): p is Product => p !== undefined));
      }
    } catch {}
  }, []);
  if (recentProducts.length === 0) return null;
  return (
    <section className="py-14 border-t" style={{ borderColor: "var(--pf-line)" }}>
      <div className="container">
        <div className="flex items-center gap-2 mb-1"><Clock size={14} style={{ color: "var(--pf-accent)" }} /><p className="section-label">Your browsing history</p></div>
        <h2 className="font-display font-semibold mb-6" style={{ fontSize: "1.8rem", color: "var(--pf-ink)" }}>Recently viewed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (<ProductCard key={product.id} product={product} variant="default" />))}
        </div>
      </div>
    </section>
  );
}

function SavedStageSection() {
  const [saved, setSaved] = useState<{ stage: string } | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem(QUIZ_RESULT_KEY);
    if (raw) { try { setSaved(JSON.parse(raw)); } catch {} }
  }, []);
  const stage = saved ? menopauseStages.find(s => s.id === saved.stage) : undefined;
  if (!stage) return null;
  const v = STAGE_VISUAL[stage.id];
  const top = newestFirst(getProductsByStage(stage.slug)).slice(0, 3);
  return (
    <section className="py-14" style={{ backgroundColor: v?.tint ?? "var(--pf-tint)" }}>
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <MoonMark phase={v?.phase ?? 0.5} size={52} />
            <div>
              <div className="flex items-center gap-2 mb-1"><Sparkles size={14} style={{ color: "var(--pf-accent)" }} /><p className="section-label">Your stage</p></div>
              <h2 className="font-display font-semibold" style={{ fontSize: "1.75rem", color: "var(--pf-ink)" }}>{stage.name}</h2>
            </div>
          </div>
          <Link href={`/stage/${stage.slug}`}><span className="btn-primary rounded-sm inline-block" style={{ fontSize: "0.78rem" }}>Open my stage guide</span></Link>
        </div>
        {top.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{top.map(p => <ProductCard key={p.id} product={p} variant="compact" />)}</div>}
      </div>
    </section>
  );
}

export default function Home() {
  const editorPicks = newestFirst(getEditorPicks());
  const featured = newestFirst(comparisons.filter((c): c is Comparison & { publishDate: string } => Boolean(c.publishDate)))[0] ?? comparisons[0];
  const recentReviews = newestFirst(allProducts).slice(0, 6);

  useEffect(() => {
    updateDocumentMeta({
      title: "Pause & Flourish — Menopause & Perimenopause Product Reviews",
      description: "Evidence-based reviews of menopause supplements, cooling products, sleep aids and skincare, organised by stage of the transition. Every recommendation cites its research.",
      keywords: "menopause supplements, perimenopause products, hot flash relief, menopause sleep aids, menopause skincare",
      canonical: "https://pauseandflourish.com/",
    });
  }, []);

  return (
    <SiteLayout>
      <Hero picks={editorPicks} />
      <SavedStageSection />
      <StageSpine />

      <section className="py-16">
        <div className="container">
          <SectionHead label="Tested & recommended" title="Editor's picks" href="/reviews" cta="All reviews" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorPicks.slice(0, 3).map(product => (<ProductCard key={product.id} product={product} variant="featured" />))}
          </div>
        </div>
      </section>

      {featured ? <FeaturedComparison comparison={featured} /> : null}

      <section className="py-16">
        <div className="container">
          <SectionHead label="Latest" title="Recent reviews" href="/reviews" cta="View all" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReviews.map(product => (<ProductCard key={product.id} product={product} variant="compact" />))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            <span className="font-label text-[0.65rem] uppercase font-semibold self-center mr-2" style={{ color: "var(--pf-soft)", letterSpacing: "0.1em" }}>Browse by need</span>
            {categories.map(cat => (
              <Link key={cat.id} href={`/category/${cat.slug}`}><span className="inline-block font-body text-sm px-3 py-1.5 rounded-sm border transition-colors hover:bg-[var(--pf-tint)]" style={{ borderColor: "var(--pf-line)", color: "var(--pf-ink)" }}>{cat.name}</span></Link>
            ))}
          </div>
        </div>
      </section>

      <ResearchStrip />
      <RecentlyViewedSection />
      <NewsletterSignup variant="banner" />
    </SiteLayout>
  );
}
