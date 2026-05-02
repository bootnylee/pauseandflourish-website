// PauseAndFlourish.com - Hair Type Page
// Design: Bold magazine aesthetic - Burgundy (#8B1A2F) + Amber (#D4822A) + Cream (#FDF6EE)
// SEO: Optimized for "best hair products for [type] hair" keywords

import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import FilterPanel, {
  FilterState,
  getDefaultFilters,
  hasActiveFilters,
  applyFilters,
} from "@/components/FilterPanel";
import {
  hairTypes,
  getHairTypeBySlug,
  getProductsForHairType,
} from "@/lib/hairTypes";
import { updateDocumentMeta } from "@/lib/seo";
import { ArrowRight, CheckCircle, Lightbulb, ChevronRight, SlidersHorizontal, X, Star, Award } from "lucide-react";
import { categories } from "@/lib/products";

// Map each hair type to its most relevant head-to-head comparison
const HAIR_TYPE_FEATURED_COMPARISON: Record<string, { slug: string; title: string; subtitle: string }> = {
  coarse: {
    slug: "olaplex-no8-vs-moroccanoil-mask",
    title: "Olaplex No. 8 vs. Moroccanoil Intense Hydrating Mask",
    subtitle: "Which deep conditioning mask wins for coarse, resistant hair?",
  },
  dry: {
    slug: "pureology-hydrate-vs-redken-all-soft",
    title: "Pureology Hydrate vs. Redken All Soft",
    subtitle: "Premium moisturizing shampoos head-to-head for dry hair.",
  },
  fine: {
    slug: "bumble-invisible-oil-vs-verb-ghost-oil",
    title: "Bumble and bumble Invisible Oil vs. Verb Ghost Oil",
    subtitle: "Lightweight oils that won't weigh fine hair down — compared.",
  },
  thick: {
    slug: "dyson-supersonic-vs-shark-hyperair",
    title: "Dyson Supersonic vs. Shark HyperAIR",
    subtitle: "Which premium dryer handles thick, dense hair better?",
  },
  curly: {
    slug: "philip-kingsley-elasticizer-vs-christophe-robin-mask",
    title: "Philip Kingsley Elasticizer vs. Christophe Robin Regenerating Mask",
    subtitle: "Pre-shampoo treatment vs. luxury mask for curly hair.",
  },
  normal: {
    slug: "moroccanoil-vs-olaplex-no7-oil",
    title: "Moroccanoil Treatment vs. Olaplex No. 7 Bonding Oil",
    subtitle: "Two iconic finishing oils — which is worth it for normal hair?",
  },
  "color-treated": {
    slug: "joico-color-balance-vs-matrix-biolage-hydrasource",
    title: "Joico Color Balance Purple vs. Matrix Biolage HydraSource",
    subtitle: "Toning vs. hydrating: the right shampoo for color-treated hair.",
  },
};

export default function HairTypePage() {
  const { slug } = useParams<{ slug: string }>();
  const hairType = getHairTypeBySlug(slug || "");
  const allMatchingProducts = getProductsForHairType(slug || "");

  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (hairType) {
      updateDocumentMeta({
        title: hairType.metaTitle,
        description: hairType.metaDescription,
        canonical: `https://pauseandflourish.com/hair-type/${hairType.slug}`,
      });
    }
    setFilters(getDefaultFilters());
  }, [hairType]);

  const filteredProducts = useMemo(
    () => applyFilters(allMatchingProducts, filters),
    [allMatchingProducts, filters]
  );

  // Top 3 highest-rated products for the editorial spotlight (unfiltered, sorted by rating then editorPick)
  const top3Picks = useMemo(() => {
    return [...allMatchingProducts]
      .sort((a, b) => {
        // Editor picks first, then by rating descending
        if (a.editorPick && !b.editorPick) return -1;
        if (!a.editorPick && b.editorPick) return 1;
        return b.rating - a.rating;
      })
      .slice(0, 3);
  }, [allMatchingProducts]);

  const topProducts = filteredProducts.slice(0, 6);
  const anyActive = hasActiveFilters(filters);
  const activeFilterCount =
    (filters.priceMin > 0 || filters.priceMax < 600 ? 1 : 0) +
    filters.hairTypes.length;

  if (!hairType) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4" style={{ color: "#2C2C2C" }}>
            Hair Type Not Found
          </h1>
          <p className="font-body text-lg mb-8" style={{ color: "#6C6C6C" }}>
            We couldn't find that hair type. Browse all our hair type guides below.
          </p>
          <Link href="/reviews">
            <button
              className="px-6 py-3 font-label font-semibold text-xs rounded-sm"
              style={{
                backgroundColor: "#8B1A2F",
                color: "#FDF6EE",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Browse All Reviews
            </button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const relatedTypes = hairTypes.filter((ht) =>
    hairType.relatedHairTypes.includes(ht.slug)
  );

  // Group products by category for the "Shop by Category" section
  const productsByCategory = categories
    .map((cat) => ({
      category: cat,
      products: filteredProducts
        .filter((p) => p.categorySlug === cat.slug)
        .slice(0, 3),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <SiteLayout>
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#1A0A0F", minHeight: "420px" }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${hairType.heroImageUrl})` }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(26,10,15,0.95) 0%, rgba(139,26,47,0.7) 100%)" }} />

        <div className="relative container py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8" aria-label="Breadcrumb">
            <Link href="/">
              <span className="font-label text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: "#D4822A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Home
              </span>
            </Link>
            <ChevronRight size={12} style={{ color: "#D4822A" }} />
            <Link href="/reviews">
              <span className="font-label text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: "#D4822A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Reviews
              </span>
            </Link>
            <ChevronRight size={12} style={{ color: "#D4822A" }} />
            <span className="font-label text-xs font-semibold"
              style={{ color: "#F2C4CE", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {hairType.name}
            </span>
          </nav>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{hairType.icon}</span>
              <span
                className="font-label font-semibold text-xs px-3 py-1 rounded-sm"
                style={{
                  backgroundColor: hairType.accentColor,
                  color: "#FFF",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Hair Type Guide
              </span>
            </div>

            <h1
              className="font-display font-bold mb-4 leading-tight"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "#FDF6EE" }}
            >
              {hairType.name}
            </h1>

            <p
              className="font-body text-lg mb-6 leading-relaxed"
              style={{ color: "#E8D5C0", maxWidth: "560px" }}
            >
              {hairType.tagline}
            </p>

            <div className="flex items-center gap-4">
              <span
                className="font-label font-semibold text-sm"
                style={{ color: "#D4822A" }}
              >
                {allMatchingProducts.length} products reviewed
              </span>
              <span style={{ color: "#6C4A5A" }}>·</span>
              <span
                className="font-label font-semibold text-sm"
                style={{ color: "#D4822A" }}
              >
                Expert tested
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top 3 Editorial Spotlight ── */}
      {top3Picks.length > 0 && (
        <section className="py-14 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FDF6EE" }}>
          <div className="container">
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Award size={16} style={{ color: "#D4822A" }} />
                  <p className="font-label font-semibold text-xs" style={{ color: "#D4822A", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Our Top Picks
                  </p>
                </div>
                <h2 className="font-display font-bold" style={{ fontSize: "1.75rem", color: "#2C2C2C" }}>
                  Best {hairType.name} Products Right Now
                </h2>
                <p className="font-body text-sm mt-1" style={{ color: "#6C6C6C" }}>
                  Hand-tested and ranked by our editors — the three products we'd reach for first.
                </p>
              </div>
              <Link href={`/reviews?hairType=${hairType.id}`}>
                <button className="hidden md:flex items-center gap-2 font-label font-semibold text-xs" style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  See All Products <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {/* Top 3 cards — horizontal editorial layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3Picks.map((product, index) => (
                <Link key={product.id} href={`/review/${product.slug}`}>
                  <div
                    className="group relative flex flex-col h-full rounded-sm overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: index === 0 ? "2px solid #8B1A2F" : "1px solid #E8DDD0",
                      boxShadow: index === 0 ? "0 8px 32px rgba(139,26,47,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center font-label font-bold text-sm"
                      style={{
                        backgroundColor: index === 0 ? "#8B1A2F" : index === 1 ? "#D4822A" : "#B8A99A",
                        color: "#FFF",
                      }}
                    >
                      #{index + 1}
                    </div>

                    {/* Editor's Pick ribbon for #1 */}
                    {index === 0 && (
                      <div
                        className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-sm font-label font-bold text-xs"
                        style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.06em", textTransform: "uppercase" }}
                      >
                        <Award size={10} /> Editor's Pick
                      </div>
                    )}

                    {/* Product image */}
                    <div className="relative overflow-hidden" style={{ height: "200px", backgroundColor: "#F5EBE0" }}>
                      <img
                        src={product.imageUrl || product.amazonImageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5">
                      <p className="font-label font-semibold text-xs mb-1" style={{ color: "#D4822A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {product.category}
                      </p>
                      <h3 className="font-display font-bold mb-1 leading-snug" style={{ fontSize: "1.05rem", color: "#2C2C2C" }}>
                        {product.name}
                      </h3>
                      <p className="font-body text-xs mb-1" style={{ color: "#8B6A5A" }}>
                        {product.brand}
                      </p>
                      {product.bestFor && (
                        <p className="inline-flex items-center gap-1 font-label font-semibold text-xs px-2 py-0.5 rounded-sm mb-3"
                          style={{ backgroundColor: "#FFF8F0", color: "#8B1A2F", border: "1px solid #E8C8B0", letterSpacing: "0.04em" }}>
                          <span style={{ color: "#D4822A" }}>✦</span> Best for: {product.bestFor}
                        </p>
                      )}

                      {/* Rating row */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= Math.round(product.rating) ? "#D4822A" : "none"}
                              style={{ color: "#D4822A" }}
                            />
                          ))}
                        </div>
                        <span className="font-label font-bold text-xs" style={{ color: "#D4822A" }}>{product.rating.toFixed(1)}</span>
                        <span className="font-body text-xs" style={{ color: "#9E8E84" }}>({product.reviewCount.toLocaleString()})</span>
                      </div>

                      <p className="font-body text-sm leading-relaxed flex-1" style={{ color: "#4A4A4A" }}>
                        {product.shortDescription}
                      </p>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "#E8DDD0" }}>
                        <span className="font-display font-bold" style={{ fontSize: "1.1rem", color: "#2C2C2C" }}>
                          {product.priceDisplay}
                        </span>
                        <span
                          className="font-label font-semibold text-xs px-3 py-1.5 rounded-sm transition-colors"
                          style={{
                            backgroundColor: index === 0 ? "#8B1A2F" : "transparent",
                            color: index === 0 ? "#FDF6EE" : "#8B1A2F",
                            border: index === 0 ? "none" : "1px solid #8B1A2F",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          Read Review
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Compare These Two CTA */}
            {HAIR_TYPE_FEATURED_COMPARISON[slug || ""] && (() => {
              const fc = HAIR_TYPE_FEATURED_COMPARISON[slug || ""];
              return (
                <Link href={`/comparison/${fc.slug}`}>
                  <div
                    className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-sm cursor-pointer group transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: "#1A0A0F", border: "1px solid rgba(212,130,42,0.3)" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(212,130,42,0.15)", border: "1px solid rgba(212,130,42,0.4)" }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>⚖️</span>
                      </div>
                      <div>
                        <p className="font-label font-semibold text-xs mb-1" style={{ color: "#D4822A", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Compare These Two
                        </p>
                        <p className="font-display font-bold leading-snug" style={{ fontSize: "1rem", color: "#FDF6EE" }}>
                          {fc.title}
                        </p>
                        <p className="font-body text-xs mt-0.5" style={{ color: "rgba(253,246,238,0.55)" }}>
                          {fc.subtitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 flex items-center gap-2 font-label font-semibold text-xs px-4 py-2 rounded-sm transition-colors"
                      style={{ backgroundColor: "#D4822A", color: "#FFF", letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      Read Comparison <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })()}
          </div>
        </section>
      )}

       {/* ── About This Hair Type ── */}
      <section className="py-14 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Description */}
            <div>
              <p
                className="font-label font-semibold text-xs mb-3"
                style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                Understanding {hairType.name}
              </p>
              <h2
                className="font-display font-bold mb-4"
                style={{ fontSize: "1.75rem", color: "#2C2C2C" }}
              >
                What Makes {hairType.name} Unique
              </h2>
              <p className="font-body text-base leading-relaxed" style={{ color: "#4A4A4A" }}>
                {hairType.description}
              </p>

              {/* Common Challenges */}
              <div className="mt-6">
                <p
                  className="font-label font-semibold text-xs mb-3"
                  style={{ color: "#8B1A2F", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  Common Challenges
                </p>
                <ul className="space-y-2">
                  {hairType.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: "#8B1A2F" }}
                      />
                      <span className="font-body text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>
                        {challenge}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div
              className="rounded-sm p-8"
              style={{ backgroundColor: "#FDF6EE", border: "1px solid #E8DDD0" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb size={18} style={{ color: "#D4822A" }} />
                <p
                  className="font-label font-semibold text-xs"
                  style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  Expert Tips for {hairType.name}
                </p>
              </div>
              <ul className="space-y-4">
                {hairType.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#D4822A" }}
                    />
                    <span className="font-body text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Related Hair Types */}
              {relatedTypes.length > 0 && (
                <div className="mt-8 pt-6 border-t" style={{ borderColor: "#E8DDD0" }}>
                  <p
                    className="font-label font-semibold text-xs mb-3"
                    style={{ color: "#8B1A2F", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    Related Hair Types
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {relatedTypes.map((rt) => (
                      <Link key={rt.id} href={`/hair-type/${rt.slug}`}>
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-label font-semibold rounded-sm cursor-pointer transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: "#FFF",
                            color: "#8B1A2F",
                            border: "1px solid #8B1A2F",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {rt.icon} {rt.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Picks + Filter Sidebar ── */}
      <section className="py-14 border-b" style={{ borderColor: "#E8DDD0" }}>
        <div className="container">

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#D4822A" }} />
                <p className="font-label font-semibold text-xs" style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Editor's Top Picks
                </p>
              </div>
              <h2 className="font-display font-bold" style={{ fontSize: "1.75rem", color: "#2C2C2C" }}>
                Best Products for {hairType.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(v => !v)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-label font-semibold rounded-sm border transition-colors"
                style={{
                  borderColor: showMobileFilters ? "#8B1A2F" : "#D4C5B5",
                  backgroundColor: showMobileFilters ? "#8B1A2F" : "transparent",
                  color: showMobileFilters ? "#FDF6EE" : "#8B1A2F",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                <SlidersHorizontal size={13} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: "#D4822A", color: "#FFF" }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <Link href={`/reviews?hairType=${hairType.id}`}>
                <button className="hidden md:flex items-center gap-2 font-label font-semibold text-xs" style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  See All {allMatchingProducts.length} Products <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* Active filter chips */}
          {anyActive && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs font-body" style={{ color: "#999" }}>Active:</span>
              {(filters.priceMin > 0 || filters.priceMax < 600) && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full" style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE" }}>
                  ${filters.priceMin}–{filters.priceMax >= 600 ? "$600+" : `$${filters.priceMax}`}
                  <button onClick={() => setFilters(f => ({ ...f, priceMin: 0, priceMax: 600 }))}><X size={11} /></button>
                </span>
              )}
              <button onClick={() => setFilters(getDefaultFilters())} className="flex items-center gap-1 text-xs font-label font-semibold" style={{ color: "#D4822A" }}>
                <X size={11} /> Clear All
              </button>
            </div>
          )}

          {/* Sidebar layout */}
          <div className="flex gap-8 items-start">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block flex-shrink-0" style={{ width: "240px" }}>
              <div className="sticky top-[130px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-label font-semibold text-xs" style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}>Filter</h3>
                  {anyActive && (
                    <button onClick={() => setFilters(getDefaultFilters())} className="text-xs font-label font-semibold" style={{ color: "#D4822A" }}>Clear</button>
                  )}
                </div>
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  productCount={filteredProducts.length}
                />
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Mobile filter panel */}
              {showMobileFilters && (
                <div className="lg:hidden mb-6">
                  <FilterPanel filters={filters} onChange={setFilters} productCount={filteredProducts.length} />
                </div>
              )}

              {topProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {topProducts.map((product) => (
                    <ProductCard key={product.id} product={product} variant="featured" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-sm" style={{ backgroundColor: "#FFF8F0", border: "1px solid #E8DDD0" }}>
                  <p className="font-display text-xl font-semibold mb-2" style={{ color: "#2C2C2C" }}>No products match your filters</p>
                  <p className="font-body text-sm mb-4" style={{ color: "#6C6C6C" }}>Try widening your price range.</p>
                  <button onClick={() => setFilters(getDefaultFilters())} className="px-5 py-2.5 font-label font-semibold text-xs rounded-sm" style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.1em", textTransform: "uppercase" }}>Clear Filters</button>
                </div>
              )}

              <div className="mt-8 text-center md:hidden">
                <Link href="/reviews">
                  <button className="inline-flex items-center gap-2 px-6 py-3 font-label font-semibold text-xs rounded-sm" style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    See All {allMatchingProducts.length} Products <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      {productsByCategory.length > 0 && (
        <section className="py-14 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#8B1A2F" }} />
              <p
                className="font-label font-semibold text-xs"
                style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                Shop by Category
              </p>
            </div>
            <h2
              className="font-display font-bold mb-8"
              style={{ fontSize: "1.75rem", color: "#2C2C2C" }}
            >
              {hairType.name} Products by Category
            </h2>

            <div className="space-y-12">
              {productsByCategory.map(({ category, products }) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <h3
                        className="font-display font-semibold"
                        style={{ fontSize: "1.2rem", color: "#2C2C2C" }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <Link href={`/category/${category.slug}`}>
                      <span
                        className="font-label font-semibold text-xs flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: "#8B1A2F", letterSpacing: "0.08em", textTransform: "uppercase" }}
                      >
                        All {category.name} <ArrowRight size={12} />
                      </span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} variant="default" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Hair Types Navigation ── */}
      <section className="py-14" style={{ backgroundColor: "#1A0A0F" }}>
        <div className="container">
          <p
            className="font-label font-semibold text-xs mb-2"
            style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Find Your Hair Type
          </p>
          <h2
            className="font-display font-bold mb-8"
            style={{ fontSize: "1.75rem", color: "#FDF6EE" }}
          >
            Browse All Hair Type Guides
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {hairTypes.map((ht) => (
              <Link key={ht.id} href={`/hair-type/${ht.slug}`}>
                <div
                  className="p-5 rounded-sm cursor-pointer transition-all hover:scale-105"
                  style={{
                    backgroundColor: ht.id === hairType.id ? ht.accentColor : "rgba(255,255,255,0.05)",
                    border: `1px solid ${ht.id === hairType.id ? ht.accentColor : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <span className="text-2xl mb-2 block">{ht.icon}</span>
                  <p
                    className="font-display font-semibold"
                    style={{ fontSize: "1rem", color: ht.id === hairType.id ? "#FFF" : "#FDF6EE" }}
                  >
                    {ht.name}
                  </p>
                  <p
                    className="font-body text-xs mt-1"
                    style={{ color: ht.id === hairType.id ? "rgba(255,255,255,0.8)" : "#9A7A8A" }}
                  >
                    {getProductsForHairType(ht.id).length} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
