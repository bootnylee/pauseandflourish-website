// PauseAndFlourish.com - All Reviews Page
// Design: Bold magazine aesthetic with Burgundy (var(--pf-primary)) + Amber (var(--pf-accent)) + Cream (var(--pf-paper))
// Features: Sidebar FilterPanel (price range + menopause stage + category) + Sort + Search

import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import FilterPanel, {
  FilterState,
  getDefaultFilters,
  hasActiveFilters,
  applyFilters,
  MENOPAUSE_STAGES,
} from "@/components/FilterPanel";
import { allProducts, categories } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { Search, SlidersHorizontal, X, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { QUIZ_RESULT_KEY } from "@/pages/MenopauseQuiz";

// Menopause stage meta for the personalized banner
const STAGE_LABELS: Record<string, { label: string; color: string; bg: string; tagline: string }> = {
  "early-perimenopause":  { label: "Early Perimenopause",  color: "var(--pf-primary)", bg: "var(--pf-tint-2)", tagline: "Targeted solutions for the earliest signs of hormonal change." },
  "late-perimenopause":   { label: "Late Perimenopause",   color: "var(--pf-primary-light)", bg: "var(--pf-tint)", tagline: "Relief for intensifying symptoms — hot flashes, brain fog, and more." },
  "active-menopause":     { label: "Active Menopause",     color: "var(--pf-accent)", bg: "var(--pf-accent-tint)", tagline: "Comprehensive support for the full menopause transition." },
  "early-postmenopause":  { label: "Early Postmenopause",  color: "#7B6EA8", bg: "#F5F0FF", tagline: "Rebuilding and thriving in the years after menopause." },
  "late-postmenopause":   { label: "Late Postmenopause",   color: "var(--pf-primary)", bg: "var(--pf-tint-2)", tagline: "Long-term wellness, longevity, and vitality support." },
};

// Personalized banner shown at top of reviews when quiz result is saved
function PicksForYouBanner({ onApplyFilter }: { onApplyFilter: (stage: string) => void }) {
  const [savedStage, setSavedStage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.stage) setSavedStage(parsed?.stage);
      } catch {}
    }
  }, []);

  if (!savedStage || dismissed || !STAGE_LABELS[savedStage]) return null;

  const meta = STAGE_LABELS[savedStage];
  const matchCount = allProducts.filter(
    p => Array.isArray(p.stages) && p.stages.includes(savedStage)
  ).length;

  return (
    <div
      className="border-b px-6 py-4"
      style={{ backgroundColor: meta.bg, borderColor: `${meta.color}33` }}
    >
      <div className="container flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Sparkles size={16} style={{ color: meta.color, flexShrink: 0 }} />
          <div>
            <span className="font-body font-semibold text-sm" style={{ color: meta.color }}>
              {matchCount} Picks for Your {meta.label}
            </span>
            <span className="font-body text-xs ml-2 hidden sm:inline" style={{ color: "var(--pf-primary-dark)" }}>
              {meta.tagline}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onApplyFilter(savedStage)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-body font-semibold text-xs transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: meta.color, color: "var(--pf-paper)" }}
          >
            Show My Picks <ArrowRight size={12} />
          </button>
          <Link href="/quiz">
            <span className="font-body text-xs cursor-pointer hover:underline" style={{ color: meta.color }}>Retake Quiz</span>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="font-body text-xs hover:opacity-60 transition-opacity"
            style={{ color: "var(--pf-soft)", background: "none", border: "none", padding: 0 }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { id: "default", label: "Featured" },
  { id: "rating-desc", label: "Highest Rated" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
];

export default function AllReviews() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    updateDocumentMeta({
      title: "All Menopause Product Reviews | PauseAndFlourish",
      description:
        "Browse all expert menopause product reviews across supplements, cooling solutions, sleep aids, skincare, and more. Filter by stage, category, and price.",
      canonical: "https://pauseandflourish.com/reviews",
    });
  }, []);

  const clearAll = () => {
    setSelectedCategory("all");
    setFilters(getDefaultFilters());
    setSortBy("newest");
    setSearchQuery("");
  };

  const anyActive =
    selectedCategory !== "all" ||
    hasActiveFilters(filters) ||
    sortBy !== "newest" ||
    searchQuery.length > 0;

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 600 ? 1 : 0) +
    filters.stages.length;

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Price + Menopause Stage via shared utility
    result = applyFilters(result, filters);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "rating-desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
        break;
      default:
        result.sort((a, b) => {
          if (a.editorPick && !b.editorPick) return -1;
          if (!a.editorPick && b.editorPick) return 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [selectedCategory, filters, sortBy, searchQuery]);

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Newest First";

  function applyStageFilter(stage: string) {
    setFilters(prev => ({ ...prev, stages: [stage] }));
    // Scroll to the product grid
    setTimeout(() => {
      const grid = document.getElementById("reviews-grid");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <SiteLayout>
      {/* ── Personalized Picks Banner ── */}
      <PicksForYouBanner onApplyFilter={applyStageFilter} />

      {/* ── Page Header ── */}
      <section
        className="py-14 border-b"
        style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-tint)" }}
      >
        <div className="container">
          <p
            className="font-label font-semibold text-xs mb-2"
            style={{ color: "var(--pf-accent)", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Expert Tested
          </p>
          <h1
            className="font-display font-bold"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--pf-ink)" }}
          >
            All Menopause Product Reviews
          </h1>
          <p
            className="font-body text-lg mt-3"
            style={{ color: "var(--pf-soft-ink)", maxWidth: "600px" }}
          >
            {allProducts.length} products reviewed across {categories.length} categories.
            Updated every Monday with new reviews.
          </p>
        </div>
      </section>

      {/* ── Search + Sort Bar ── */}
      {/* id anchor for scroll-to */}
      <div id="reviews-grid" />
      <section
        className="py-4 border-b sticky top-[73px] z-40"
        style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-paper)" }}
      >
        <div className="container">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "360px" }}>
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--pf-primary)" }}
              />
              <input
                type="text"
                placeholder="Search products, brands…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-body rounded-sm border"
                style={{
                  borderColor: "var(--pf-line-strong)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--pf-ink)",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#999" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters((v) => !v)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 text-xs font-label font-semibold rounded-sm border transition-colors"
              style={{
                borderColor: showMobileFilters ? "var(--pf-primary)" : "var(--pf-line-strong)",
                backgroundColor: showMobileFilters ? "var(--pf-primary)" : "transparent",
                color: showMobileFilters ? "var(--pf-paper)" : "var(--pf-primary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                  style={{ backgroundColor: "var(--pf-accent)", color: "#FFF" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-label font-semibold rounded-sm border transition-colors"
                style={{
                  borderColor: "var(--pf-line-strong)",
                  backgroundColor: "transparent",
                  color: "var(--pf-ink)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Sort: {activeSortLabel}
                <ChevronDown size={13} />
              </button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-sm border shadow-lg z-50"
                  style={{ backgroundColor: "#FFF", borderColor: "var(--pf-line)", minWidth: "180px" }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-label font-semibold hover:bg-amber-50 transition-colors"
                      style={{
                        color: sortBy === opt.id ? "var(--pf-primary)" : "var(--pf-ink)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid var(--pf-line)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All */}
            {anyActive && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-label font-semibold"
                style={{ color: "var(--pf-accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                <X size={12} /> Clear All
              </button>
            )}

            {/* Results count */}
            <span className="ml-auto text-xs font-body" style={{ color: "#999" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── Active Filter Chips ── */}
      {anyActive && (
        <section
          className="py-3 border-b"
          style={{ borderColor: "var(--pf-line)", backgroundColor: "var(--pf-tint)" }}
        >
          <div className="container">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-body" style={{ color: "#999" }}>Active:</span>
              {selectedCategory !== "all" && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "var(--pf-primary)", color: "var(--pf-paper)" }}
                >
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("all")}><X size={11} /></button>
                </span>
              )}
              {(filters.priceMin > 0 || filters.priceMax < 600) && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "var(--pf-primary)", color: "var(--pf-paper)" }}
                >
                  ${filters.priceMin}–{filters.priceMax >= 600 ? "$600+" : `$${filters.priceMax}`}
                  <button onClick={() => setFilters(f => ({ ...f, priceMin: 0, priceMax: 600 }))}><X size={11} /></button>
                </span>
              )}
              {filters.stages.map((ht) => (
                <span
                  key={ht}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "var(--pf-accent)", color: "#FFF" }}
                >
                  {MENOPAUSE_STAGES.find((h) => h.id === ht)?.label}
                  <button onClick={() => setFilters(f => ({ ...f, stages: f.stages.filter(t => t !== ht) }))}><X size={11} /></button>
                </span>
              ))}
              {sortBy !== "default" && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "var(--pf-soft-ink)", color: "#FFF" }}
                >
                  {activeSortLabel}
                  <button onClick={() => setSortBy("default")}><X size={11} /></button>
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Main Layout: Sidebar + Grid ── */}
      <section className="py-10">
        <div className="container">
          <div className="flex gap-8 items-start">

            {/* ── Desktop Sidebar Filter ── */}
            <aside className="hidden lg:block flex-shrink-0" style={{ width: "260px" }}>
              <div className="sticky top-[130px]">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="font-label font-semibold text-xs"
                    style={{ color: "var(--pf-primary)", letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    Filter Products
                  </h2>
                  {anyActive && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-label font-semibold"
                      style={{ color: "var(--pf-accent)" }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  showCategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  productCount={filtered.length}
                />
              </div>
            </aside>

            {/* ── Mobile Filter Panel (collapsible) ── */}
            {showMobileFilters && (
              <div className="lg:hidden w-full mb-6">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  showCategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  productCount={filtered.length}
                />
              </div>
            )}

            {/* ── Products Grid ── */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-display text-2xl font-semibold mb-3" style={{ color: "var(--pf-ink)" }}>
                    No products found
                  </p>
                  <p className="font-body text-base mb-6" style={{ color: "var(--pf-soft-ink)" }}>
                    Try adjusting your price range, menopause stage, or search terms.
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-6 py-3 font-label font-semibold text-xs rounded-sm"
                    style={{ backgroundColor: "var(--pf-primary)", color: "var(--pf-paper)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Editor's Picks (only when no active filters) */}
                  {!anyActive && (
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "var(--pf-accent)" }} />
                        <h2
                          className="font-label font-semibold text-sm"
                          style={{ color: "var(--pf-primary)", letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                          Editor's Picks
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                        {filtered.filter((p) => p.editorPick).map((p) => (
                          <ProductCard key={p.id} product={p} variant="featured" />
                        ))}
                      </div>
                      <div className="border-t mb-10" style={{ borderColor: "var(--pf-line)" }} />
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "var(--pf-primary)" }} />
                        <h2
                          className="font-label font-semibold text-sm"
                          style={{ color: "var(--pf-primary)", letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                          All Reviews
                        </h2>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((p) => (
                      <ProductCard key={p.id} product={p} variant="featured" />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
