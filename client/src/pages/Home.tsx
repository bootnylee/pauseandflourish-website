// PauseAndFlourish.com - Home Page
// Design: Refined Magazine Meets Bold Lifestyle
// Hero: Split-screen with editorial headline and product photography

import { Link } from "wouter";
import { ArrowRight, Sparkles, RefreshCw, Clock } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import ComparisonCard from "@/components/ComparisonCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { categories, getEditorPicks, comparisons, allProducts } from "@/lib/products";
import { hairTypes } from "@/lib/hairTypes";
import { useEffect, useState } from "react";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "./HairQuiz";
import { RECENTLY_VIEWED_KEY } from "./ProductReview";

const HAIR_TYPE_META: Record<string, { label: string; tagline: string; color: string; bg: string }> = {
  fine:           { label: "Fine Hair",          tagline: "Light, weightless formulas that add volume without drag.",        color: "#8B6914", bg: "#FFF8E7" },
  thick:          { label: "Thick Hair",          tagline: "Rich, smoothing products that tame and define your density.",    color: "#5C3D8F", bg: "#F5F0FF" },
  curly:          { label: "Curly Hair",          tagline: "Moisture-first picks that enhance curl definition and bounce.",  color: "#1A6B4A", bg: "#EDFAF3" },
  coarse:         { label: "Coarse Hair",         tagline: "Deeply nourishing treatments that soften and strengthen.",       color: "#7A3B1E", bg: "#FFF3EE" },
  dry:            { label: "Dry Hair",            tagline: "Intense hydration heroes that restore softness and shine.",      color: "#1A5C8B", bg: "#EEF6FF" },
  normal:         { label: "Normal Hair",         tagline: "Balanced, everyday essentials that keep your hair at its best.", color: "#2C6B2F", bg: "#EDFAEE" },
  "color-treated":{ label: "Color-Treated Hair", tagline: "Color-safe formulas that protect vibrancy and prevent fade.",    color: "#8B1A2F", bg: "#FFF5F7" },
};

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663596051047/8Zc7R6kvi3WyqwPfKsGujc/hero_banner-mpcLHZ6E4Ht3HkvUJsAi4e.webp";

// ─── Recently Viewed Section ─────────────────────────────────────────────────
function RecentlyViewedSection() {
  const [recentProducts, setRecentProducts] = useState<typeof allProducts>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) {
        const slugs: string[] = JSON.parse(raw);
        const products = slugs
          .map(slug => allProducts.find(p => p.slug === slug))
          .filter((p): p is (typeof allProducts)[number] => p !== undefined);
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
              <Clock size={14} style={{ color: "#D4822A" }} />
              <p className="section-label">Your Browsing History</p>
            </div>
            <h2 className="font-display font-bold" style={{ fontSize: "2rem", color: "#2C2C2C" }}>
              Recently Viewed
            </h2>
          </div>
          <Link href="/reviews">
            <button className="font-label font-semibold text-xs flex items-center gap-1 hover:text-red-800 transition-colors"
              style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              All Reviews <ArrowRight size={14} />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (
            <ProductCard key={product.id} product={product} variant="default" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Personalized Quiz CTA ────────────────────────────────────────────────────
function QuizCtaSection() {
  const [savedResult, setSavedResult] = useState<{ primary: string; topProducts: string[] } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) {
      try { setSavedResult(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Returning visitor: personalized card
  if (savedResult?.primary && HAIR_TYPE_META[savedResult.primary]) {
    const meta = HAIR_TYPE_META[savedResult.primary];
    const topProducts = allProducts
      .filter(p => Array.isArray(p.hairTypes) && p.hairTypes.includes(savedResult.primary))
      .slice(0, 3);

    return (
      <section className="py-16 px-6" style={{ backgroundColor: meta.bg }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: meta.color, letterSpacing: "0.18em" }}>
                Welcome Back
              </p>
              <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#2C2C2C" }}>
                Your {meta.label} Picks
              </h2>
              <p className="font-body text-sm mt-2" style={{ color: "#6B5B4E" }}>{meta.tagline}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href={`/hair-type/${savedResult.primary}`}>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-body font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: meta.color, color: "#FDF6EE" }}
                >
                  <Sparkles size={14} /> View All {meta.label} Products
                </button>
              </Link>
              <Link href="/hair-quiz">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded font-body text-sm transition-all duration-200 hover:opacity-80"
                  style={{ border: `1.5px solid ${meta.color}`, color: meta.color, backgroundColor: "transparent" }}
                >
                  <RefreshCw size={13} /> Retake Quiz
                </button>
              </Link>
            </div>
          </div>
          {topProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {topProducts.map(p => (
                <ProductCard key={p.id} product={p} variant="default" />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // First-time visitor: generic quiz CTA
  return (
    <section className="py-16 px-6" style={{ background: "linear-gradient(135deg, #2C1810 0%, #8B1A2F 60%, #5C2D44 100%)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-body text-xs tracking-widest uppercase mb-3" style={{ color: "#D4822A", letterSpacing: "0.18em" }}>
          Personalized Recommendations
        </p>
        <h2 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#FDF6EE" }}>
          Not Sure What Your Hair Needs?
        </h2>
        <p className="font-body text-base mb-8 leading-relaxed" style={{ color: "rgba(253,246,238,0.75)", maxWidth: "520px", margin: "0 auto 2rem" }}>
          Take our 2-minute hair type quiz and get personalized product recommendations matched to your exact hair profile.
        </p>
        <Link href="/hair-quiz">
          <button
            className="inline-flex items-center gap-2 px-10 py-4 rounded font-body font-semibold text-base transition-all duration-200 hover:opacity-90 hover:gap-3"
            style={{ backgroundColor: "#D4822A", color: "#FDF6EE", letterSpacing: "0.06em" }}
          >
            Take the Hair Type Quiz <ArrowRight size={18} />
          </button>
        </Link>
        <p className="font-body text-xs mt-4" style={{ color: "rgba(253,246,238,0.45)" }}>8 questions · 2 minutes · No sign-up required</p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mt-8 pt-6" style={{ borderTop: "1px solid rgba(253,246,238,0.12)" }}>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#D4822A" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="font-body text-xs" style={{ color: "rgba(253,246,238,0.55)" }}>
            Trusted by <span style={{ color: "rgba(253,246,238,0.85)", fontWeight: 600 }}>12,400+ women</span> who found their perfect hair routine
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    updateDocumentMeta({
      title: "PauseAndFlourish - Expert Hair Product Reviews & Recommendations",
      description: "Expert hair product reviews, head-to-head comparisons, and recommendations for the best shampoos, conditioners, hair masks, serums, and styling tools for women.",
      keywords: "hair product reviews, best shampoo, best conditioner, hair mask, hair serum, hair dryer reviews, flat iron, curling iron, hair care women",
      canonical: "https://pauseandflourish.com/",
      ogImage: HERO_IMAGE,
    });
  }, []);

  const editorPicks = getEditorPicks().slice(0, 4);
  const featuredComparisons = comparisons.slice(0, 3);
  const recentReviews = allProducts.filter(p => !p.editorPick).slice(0, 6);

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: "560px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: "560px" }}>
          {/* Left: Editorial Text */}
          <div className="flex flex-col justify-center px-8 py-16 lg:px-16 lg:py-20"
            style={{ backgroundColor: "#FDF6EE" }}>
            <p className="section-label mb-4 animate-fade-in-up">The Hair Authority for Women</p>
            <h1 className="font-display font-bold leading-none mb-6 animate-fade-in-up-delay-1"
              style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "#2C2C2C", lineHeight: "0.95" }}>
              Beautiful Hair<br />
              <span style={{ color: "#8B1A2F" }}>Starts With</span><br />
              Better Choices
            </h1>
            <hr className="editorial-rule w-16 mb-6 animate-fade-in-up-delay-2" />
            <p className="font-body text-lg leading-relaxed mb-8 animate-fade-in-up-delay-2"
              style={{ color: "#6C6C6C", maxWidth: "420px" }}>
              We test every product so you don't have to. Expert reviews, honest comparisons, and curated recommendations for every hair type.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up-delay-3">
              <Link href="/reviews">
                <button className="btn-primary rounded-sm px-6 py-3 flex items-center gap-2">
                  Explore Reviews <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/comparisons">
                <button className="rounded-sm px-6 py-3 font-label font-semibold text-sm flex items-center gap-2 border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#8B1A2F", color: "#8B1A2F", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Head-to-Head
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative overflow-hidden" style={{ minHeight: "400px" }}>
            <img
              src={HERO_IMAGE}
              alt="Luxury hair care products and beautiful hair"
              className="w-full h-full object-cover"
              style={{ minHeight: "400px" }}
            />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(to right, #FDF6EE 0%, transparent 15%)"
            }} />
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="py-12 border-y" style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label mb-1">Browse by Category</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2rem", color: "#2C2C2C" }}>
                Find Your Perfect Match
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <div className="group cursor-pointer text-center">
                  <div className="relative overflow-hidden rounded-sm mb-3" style={{ height: "120px", backgroundColor: "#F5EBE0" }}>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop`;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(139,26,47,0.15)" }}>
                      <span style={{ fontSize: "2rem" }}>{cat.icon}</span>
                    </div>
                  </div>
                  <p className="font-label font-semibold text-xs leading-tight group-hover:text-red-800 transition-colors"
                    style={{ color: "#2C2C2C", letterSpacing: "0.05em" }}>
                    {cat.name}
                  </p>
                  <p className="font-body text-xs mt-0.5" style={{ color: "#B8A99A" }}>
                    {cat.type === "product" ? "Hair Products" : "Styling Tools"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Tested & Approved</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>
                Editor's Picks
              </h2>
            </div>
            <Link href="/reviews">
              <button className="font-label font-semibold text-xs flex items-center gap-1 hover:text-red-800 transition-colors"
                style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                All Reviews <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorPicks.map((product) => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Comparisons */}
      <section className="py-16" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Head-to-Head</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>
                Product Comparisons
              </h2>
            </div>
            <Link href="/comparisons">
              <button className="font-label font-semibold text-xs flex items-center gap-1 hover:text-red-800 transition-colors"
                style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                All Comparisons <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredComparisons.map((comparison) => (
              <ComparisonCard key={comparison.id} comparison={comparison} />
            ))}
          </div>
        </div>
      </section>

      {/* Pull Quote / Brand Statement */}
      <section className="py-16 border-y" style={{ borderColor: "#E8DDD0" }}>
        <div className="container max-w-3xl mx-auto text-center">
          <blockquote className="font-display font-medium italic leading-relaxed"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#2C2C2C" }}>
            "We believe every woman deserves to know exactly what she's putting on her hair - and whether it's actually worth it."
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <hr className="editorial-rule w-12" />
            <p className="font-label font-semibold text-xs" style={{ color: "#8B1A2F", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              The PauseAndFlourish Editorial Team
            </p>
            <hr className="editorial-rule w-12" />
          </div>
        </div>
      </section>

      {/* Recent Reviews Grid */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-1">Latest from the Lab</p>
              <h2 className="font-display font-bold" style={{ fontSize: "2.2rem", color: "#2C2C2C" }}>
                Recent Reviews
              </h2>
            </div>
            <Link href="/reviews">
              <button className="font-label font-semibold text-xs flex items-center gap-1 hover:text-red-800 transition-colors"
                style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReviews.map((product) => (
              <ProductCard key={product.id} product={product} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Hair Type Guide Section */}
      <section className="py-14 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#D4822A" }} />
                <p className="font-label font-semibold text-xs" style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}>Personalized Guides</p>
              </div>
              <h2 className="font-display font-bold" style={{ fontSize: "1.75rem", color: "#2C2C2C" }}>Find Products for Your Hair Type</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {hairTypes.map(ht => (
              <Link key={ht.id} href={`/hair-type/${ht.slug}`}>
                <div className="p-4 rounded-sm cursor-pointer transition-all hover:shadow-md group"
                  style={{ backgroundColor: "#FDF6EE", border: "1px solid #E8DDD0" }}>
                  <span className="text-2xl mb-2 block">{ht.icon}</span>
                  <p className="font-display font-semibold leading-tight group-hover:text-red-800 transition-colors"
                    style={{ fontSize: "0.9rem", color: "#2C2C2C" }}>{ht.name}</p>
                  <p className="font-body text-xs mt-1" style={{ color: "#B8A99A" }}>{ht.tagline.split(' ').slice(0,4).join(' ')}…</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed — only shown to returning visitors who have browsed products */}
      <RecentlyViewedSection />

      {/* Hair Quiz CTA — personalized for returning visitors */}
      <QuizCtaSection />

      {/* Newsletter Signup */}
      <NewsletterSignup variant="banner" />
    </SiteLayout>
  );
}
