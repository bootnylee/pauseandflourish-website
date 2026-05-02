// PauseAndFlourish.com — Home Page
import { Link } from "wouter";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import ComparisonCard from "@/components/ComparisonCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { categories, getEditorPicks, comparisons, allProducts } from "@/lib/products";
import { menopauseStages } from "@/lib/menopauseStages";
import { useEffect, useState } from "react";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "./MenopauseQuiz";
import { RECENTLY_VIEWED_KEY } from "./ProductReview";

const STAGE_META: Record<string, { label: string; tagline: string; color: string; bg: string }> = {
  "early-perimenopause": { label: "Early Perimenopause", tagline: "Cycle changes, mild symptoms, and building your foundation.", color: "#2D7D6F", bg: "#E8F5F2" },
  "late-perimenopause": { label: "Late Perimenopause", tagline: "Hot flashes, sleep disruption, and mood shifts intensify.", color: "#5B4A8A", bg: "#F0ECFF" },
  "active-menopause": { label: "Active Menopause", tagline: "12 months without a period — managing the full transition.", color: "#1A6B8A", bg: "#E8F4FA" },
  "early-postmenopause": { label: "Early Postmenopause", tagline: "Symptoms stabilize — focus on long-term health.", color: "#7A5C1E", bg: "#FFF8E7" },
  "late-postmenopause": { label: "Late Postmenopause", tagline: "Thriving in your next chapter with confidence.", color: "#2C6B2F", bg: "#EDFAEE" },
};

function RecentlyViewedSection() {
  const [recentProducts, setRecentProducts] = useState<typeof allProducts>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        const slugs: string[] = JSON.parse(raw);
        const products = slugs.map(slug => allProducts.find(p => p.slug === slug)).filter((p): p is (typeof allProducts)[number] => p !== undefined);
        setRecentProducts(products);
      }
    } catch {}
  }, []);
  if (recentProducts.length === 0) return null;
  return (
    <section className="py-14 border-b" style={{ borderColor: "#E8DDD0" }}>
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} style={{ color: "#C4722A" }} />
              <p className="section-label">Your Browsing History</p>
            </div>
            <h2 className="font-display font-bold" style={{ fontSize: "2rem", color: "#2C2C2C" }}>Recently Viewed</h2>
          </div>
          <Link href="/reviews"><button className="font-label font-semibold text-xs flex items-center gap-1 transition-colors" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>All Reviews <ArrowRight size={14} /></button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (<ProductCard key={product.id} product={product} variant="default" />))}
        </div>
      </div>
    </section>
  );
}

function QuizCtaSection() {
  const [savedResult, setSavedResult] = useState<{ stage: string; topProducts: string[] } | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) { try { setSavedResult(JSON.parse(saved)); } catch {} }
  }, []);

  if (savedResult?.stage && STAGE_META[savedResult.stage]) {
    const meta = STAGE_META[savedResult.stage];
    const topProducts = allProducts.filter(p => p.stages.includes(savedResult.stage)).slice(0, 3);
    return (
      <section className="py-16 px-6" style={{ backgroundColor: meta.bg }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} style={{ color: meta.color }} />
                <p className="font-label font-semibold text-xs" style={{ color: meta.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>Your Personalized Stage</p>
              </div>
              <h2 className="font-display font-bold" style={{ fontSize: "1.75rem", color: "#2C2C2C" }}>{meta.label}</h2>
              <p className="font-body text-sm mt-1" style={{ color: "#5C5C5C" }}>{meta.tagline}</p>
            </div>
            <Link href={`/stage/${savedResult.stage}`}>
              <button className="font-label font-semibold text-xs px-5 py-3 rounded-sm transition-colors whitespace-nowrap" style={{ backgroundColor: meta.color, color: "#FAF7F4", letterSpacing: "0.08em", textTransform: "uppercase" }}>View My Stage Guide</button>
            </Link>
          </div>
          {topProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topProducts.map(product => (<ProductCard key={product.id} product={product} variant="compact" />))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6" style={{ backgroundColor: "#E8F5F2" }}>
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-label font-semibold text-xs mb-3" style={{ color: "#2D7D6F", letterSpacing: "0.15em", textTransform: "uppercase" }}>Personalized Guidance</p>
        <h2 className="font-display font-bold mb-4" style={{ fontSize: "2rem", color: "#2C2C2C" }}>Where Are You in Your Journey?</h2>
        <p className="font-body text-base mb-8 leading-relaxed" style={{ color: "#5C5C5C" }}>Take our 2-minute quiz to identify your menopause stage and get personalized product recommendations, symptom guides, and expert content tailored to exactly where you are.</p>
        <Link href="/quiz">
          <button className="font-label font-semibold px-8 py-4 rounded-sm transition-colors" style={{ backgroundColor: "#2D7D6F", color: "#FAF7F4", letterSpacing: "0.08em", textTransform: "uppercase" }}>Find My Menopause Stage</button>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const editorPicks = getEditorPicks();
  const featuredComparisons = comparisons.slice(0, 3);
  const recentReviews = allProducts.slice(0, 6);

  useEffect(() => {
    updateDocumentMeta({
      title: "PauseAndFlourish — Menopause & Perimenopause Product Reviews",
      description: "Expert reviews of menopause supplements, cooling products, sleep aids, and wellness tools. Evidence-based guidance for every stage of the transition.",
      keywords: "menopause supplements, perimenopause products, hot flash relief, menopause sleep aids, menopause skincare",
      canonical: "https://www.pauseandflourish.com/",
    });
  }, []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#FAF7F4" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[520px]">
            <div className="flex flex-col justify-center py-16 pr-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px" style={{ backgroundColor: "#C4722A" }} />
                <p className="font-label font-semibold text-xs" style={{ color: "#C4722A", letterSpacing: "0.18em", textTransform: "uppercase" }}>Evidence-Based Menopause Wellness</p>
              </div>
              <h1 className="font-display font-bold leading-tight mb-6" style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "#2C2C2C", lineHeight: "1.15" }}>
                Navigate Menopause{" "}<span style={{ color: "#2D7D6F" }}>With Confidence</span>
              </h1>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "#5C5C5C", maxWidth: "480px" }}>
                We research and review the supplements, cooling products, sleep aids, and wellness tools that actually work — so you can make informed decisions at every stage of your transition.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/reviews">
                  <button className="font-label font-semibold text-sm px-6 py-3 rounded-sm transition-colors" style={{ backgroundColor: "#2D7D6F", color: "#FAF7F4", letterSpacing: "0.06em" }}>Browse All Reviews</button>
                </Link>
                <Link href="/quiz">
                  <button className="font-label font-semibold text-sm px-6 py-3 rounded-sm transition-colors border" style={{ color: "#2D7D6F", borderColor: "#2D7D6F", backgroundColor: "transparent", letterSpacing: "0.06em" }}>Find My Stage</button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80" alt="Woman confidently navigating menopause wellness" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center top" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #FAF7F4 0%, transparent 20%)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 border-y" style={{ borderColor: "#E8DDD0", backgroundColor: "#F5F0EA" }}>
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[{ label: "Products Reviewed", value: "22+" }, { label: "Categories Covered", value: "8" }, { label: "Amazon Reviews Analyzed", value: "400K+" }, { label: "Stages Addressed", value: "5" }].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold" style={{ fontSize: "1.5rem", color: "#2D7D6F" }}>{stat.value}</p>
                <p className="font-label text-xs" style={{ color: "#8C8C8C", letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Picks */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Tested & Recommended</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>{"Editor's Picks"}</h2>
            </div>
            <Link href="/reviews"><button className="font-label font-semibold text-xs flex items-center gap-1 transition-colors" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>All Reviews <ArrowRight size={14} /></button></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorPicks.slice(0, 6).map(product => (<ProductCard key={product.id} product={product} variant="featured" />))}
          </div>
        </div>
      </section>

      {/* Comparisons */}
      <section className="py-16 border-t" style={{ borderColor: "#E8DDD0", backgroundColor: "#F5F0EA" }}>
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Head-to-Head</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>Product Comparisons</h2>
            </div>
            <Link href="/comparisons"><button className="font-label font-semibold text-xs flex items-center gap-1 transition-colors" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>All Comparisons <ArrowRight size={14} /></button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredComparisons.map(comparison => (<ComparisonCard key={comparison.id} comparison={comparison} />))}
          </div>
        </div>
      </section>

      {/* Brand Statement */}
      <section className="py-16 border-y" style={{ borderColor: "#E8DDD0" }}>
        <div className="container max-w-3xl mx-auto text-center">
          <blockquote className="font-display font-medium italic leading-relaxed" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#2C2C2C" }}>
            {"\"Every woman deserves honest, evidence-based guidance through menopause — not confusion, not shame, not guesswork.\""}
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <hr className="editorial-rule w-12" />
            <p className="font-label font-semibold text-xs" style={{ color: "#2D7D6F", letterSpacing: "0.15em", textTransform: "uppercase" }}>The PauseAndFlourish Editorial Team</p>
            <hr className="editorial-rule w-12" />
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Latest from the Lab</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>Recent Reviews</h2>
            </div>
            <Link href="/reviews"><button className="font-label font-semibold text-xs flex items-center gap-1 transition-colors" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>View All <ArrowRight size={14} /></button></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReviews.map(product => (<ProductCard key={product.id} product={product} variant="default" />))}
          </div>
        </div>
      </section>

      {/* Stage Guide */}
      <section className="py-14 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FAF7F4" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#C4722A" }} />
                <p className="font-label font-semibold text-xs" style={{ color: "#C4722A", letterSpacing: "0.12em", textTransform: "uppercase" }}>Personalized Guides</p>
              </div>
              <h2 className="font-display font-bold" style={{ fontSize: "1.75rem", color: "#2C2C2C" }}>Find Products for Your Stage</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {menopauseStages.map(stage => (
              <Link key={stage.id} href={`/stage/${stage.slug}`}>
                <div className="p-4 rounded-sm cursor-pointer transition-all hover:shadow-md group" style={{ backgroundColor: stage.bg, border: `1px solid ${stage.color}33` }}>
                  <span className="text-2xl mb-2 block">{stage.icon}</span>
                  <p className="font-display font-semibold leading-tight group-hover:opacity-80 transition-opacity" style={{ fontSize: "0.9rem", color: "#2C2C2C" }}>{stage.name}</p>
                  <p className="font-body text-xs mt-1" style={{ color: "#8C8C8C" }}>{stage.ageRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <p className="section-label mb-1">Browse by Need</p>
            <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>Product Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <div className="p-5 rounded-sm cursor-pointer transition-all hover:shadow-md group border" style={{ backgroundColor: cat.bg, borderColor: `${cat.color}33` }}>
                  <span className="text-2xl mb-3 block">{cat.icon}</span>
                  <p className="font-display font-semibold leading-tight mb-1" style={{ fontSize: "0.95rem", color: "#2C2C2C" }}>{cat.name}</p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: "#8C8C8C" }}>{cat.description.split(" ").slice(0, 8).join(" ")}...</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewedSection />
      <QuizCtaSection />
      <NewsletterSignup variant="banner" />
    </SiteLayout>
  );
}
