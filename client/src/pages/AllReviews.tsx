// PauseAndFlourish.com - All Reviews Page
// Design: Bold magazine aesthetic with Burgundy (#8B1A2F) + Amber (#D4822A) + Cream (#FDF6EE)
// Features: Sidebar FilterPanel (price range + hair type + category) + Sort + Search

import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import FilterPanel, {
  FilterState,
  getDefaultFilters,
  hasActiveFilters,
  applyFilters,
  HAIR_TYPES,
} from "@/components/FilterPanel";
import { allProducts, categories } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { Search, SlidersHorizontal, X, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { QUIZ_RESULT_KEY } from "@/pages/HairQuiz";

// Hair type meta for the personalized banner
const HAIR_TYPE_LABELS: Record<string, { label: string; color: string; bg: string; tagline: string }> = {
  fine:          { label: "Fine Hair",         color: "#6B4E9B", bg: "#F5F0FF", tagline: "Lightweight formulas that add volume without weighing strands down." },
  thick:         { label: "Thick Hair",        color: "#2C6B2F", bg: "#EDFAEE", tagline: "Rich, moisturizing formulas that tame and smooth thick strands." },
  curly:         { label: "Curly Hair",        color: "#D4822A", bg: "#FFF8EE", tagline: "Curl-defining products that enhance pattern and fight frizz." },
  coarse:        { label: "Coarse Hair",       color: "#8B4513", bg: "#FFF5EE", tagline: "Intensive hydration and smoothing treatments for coarse texture." },
  dry:           { label: "Dry Hair",          color: "#C0392B", bg: "#FFF5F5", tagline: "Deep moisture and repair formulas for parched, brittle hair." },
  normal:        { label: "Normal Hair",       color: "#2C6B2F", bg: "#EDFAEE", tagline: "Balanced, everyday essentials that keep your hair at its best." },
  "color-treated": { label: "Color-Treated Hair", color: "#8B1A2F", bg: "#FFF5F7", tagline: "Color-safe formulas that protect vibrancy and prevent fade." },
};

// Personalized banner shown at top of reviews when quiz result is saved
function PicksForYouBanner({ onApplyFilter }: { onApplyFilter: (hairType: string) => void }) {
  const [savedHairType, setSavedHairType] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.primary) setSavedHairType(parsed.primary);
      } catch {}
    }
  }, []);

  if (!savedHairType || dismissed || !HAIR_TYPE_LABELS[savedHairType]) return null;

  const meta = HAIR_TYPE_LABELS[savedHairType];
  const matchCount = allProducts.filter(
    p => Array.isArray(p.hairTypes) && p.hairTypes.includes(savedHairType)
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
            <span className="font-body text-xs ml-2 hidden sm:inline" style={{ color: "#6B5B4E" }}>
              {meta.tagline}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => onApplyFilter(savedHairType)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-body font-semibold text-xs transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: meta.color, color: "#FDF6EE" }}
          >
            Show My Picks <ArrowRight size={12} />
          </button>
          <Link href="/hair-quiz">
            <span className="font-body text-xs cursor-pointer hover:underline" style={{ color: meta.color }}>Retake Quiz</span>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="font-body text-xs hover:opacity-60 transition-opacity"
            style={{ color: "#8C8C8C", background: "none", border: "none", padding: 0 }}
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
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    updateDocumentMeta({
      title: "All Hair Product Reviews | PauseAndFlourish",
      description:
        "Browse all expert hair product reviews across shampoos, conditioners, hair masks, serums, hair dryers, flat irons, and curling irons. Filter by price and hair type.",
      canonical: "https://pauseandflourish.com/reviews",
    });
  }, []);

  const clearAll = () => {
    setSelectedCategory("all");
    setFilters(getDefaultFilters());
    setSortBy("default");
    setSearchQuery("");
  };

  const anyActive =
    selectedCategory !== "all" ||
    hasActiveFilters(filters) ||
    sortBy !== "default" ||
    searchQuery.length > 0;

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < 600 ? 1 : 0) +
    filters.hairTypes.length;

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Price + Hair Type via shared utility
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
    SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Featured";

  function applyHairTypeFilter(hairType: string) {
    setFilters(prev => ({ ...prev, hairTypes: [hairType] }));
    // Scroll to the product grid
    setTimeout(() => {
      const grid = document.getElementById("reviews-grid");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <SiteLayout>
      {/* ── Personalized Picks Banner ── */}
      <PicksForYouBanner onApplyFilter={applyHairTypeFilter} />

      {/* ── Page Header ── */}
      <section
        className="py-14 border-b"
        style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}
      >
        <div className="container">
          <p
            className="font-label font-semibold text-xs mb-2"
            style={{ color: "#D4822A", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Expert Tested
          </p>
          <h1
            className="font-display font-bold"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}
          >
            All Hair Product Reviews
          </h1>
          <p
            className="font-body text-lg mt-3"
            style={{ color: "#6C6C6C", maxWidth: "600px" }}
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
        style={{ borderColor: "#E8DDD0", backgroundColor: "#FDF6EE" }}
      >
        <div className="container">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "360px" }}>
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8B1A2F" }}
              />
              <input
                type="text"
                placeholder="Search products, brands…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm font-body rounded-sm border"
                style={{
                  borderColor: "#D4C5B5",
                  backgroundColor: "#FFFFFF",
                  color: "#2C2C2C",
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
                borderColor: showMobileFilters ? "#8B1A2F" : "#D4C5B5",
                backgroundColor: showMobileFilters ? "#8B1A2F" : "transparent",
                color: showMobileFilters ? "#FDF6EE" : "#8B1A2F",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                  style={{ backgroundColor: "#D4822A", color: "#FFF" }}
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
                  borderColor: "#D4C5B5",
                  backgroundColor: "transparent",
                  color: "#2C2C2C",
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
                  style={{ backgroundColor: "#FFF", borderColor: "#E8DDD0", minWidth: "180px" }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-label font-semibold hover:bg-amber-50 transition-colors"
                      style={{
                        color: sortBy === opt.id ? "#8B1A2F" : "#2C2C2C",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #F0E8DC",
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
                style={{ color: "#D4822A", letterSpacing: "0.06em", textTransform: "uppercase" }}
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
          style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}
        >
          <div className="container">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-body" style={{ color: "#999" }}>Active:</span>
              {selectedCategory !== "all" && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE" }}
                >
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory("all")}><X size={11} /></button>
                </span>
              )}
              {(filters.priceMin > 0 || filters.priceMax < 600) && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE" }}
                >
                  ${filters.priceMin}–{filters.priceMax >= 600 ? "$600+" : `$${filters.priceMax}`}
                  <button onClick={() => setFilters(f => ({ ...f, priceMin: 0, priceMax: 600 }))}><X size={11} /></button>
                </span>
              )}
              {filters.hairTypes.map((ht) => (
                <span
                  key={ht}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "#D4822A", color: "#FFF" }}
                >
                  {HAIR_TYPES.find((h) => h.id === ht)?.label}
                  <button onClick={() => setFilters(f => ({ ...f, hairTypes: f.hairTypes.filter(t => t !== ht) }))}><X size={11} /></button>
                </span>
              ))}
              {sortBy !== "default" && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full"
                  style={{ backgroundColor: "#6C6C6C", color: "#FFF" }}
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
                    style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    Filter Products
                  </h2>
                  {anyActive && (
                    <button
                      onClick={clearAll}
                      className="text-xs font-label font-semibold"
                      style={{ color: "#D4822A" }}
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
                  <p className="font-display text-2xl font-semibold mb-3" style={{ color: "#2C2C2C" }}>
                    No products found
                  </p>
                  <p className="font-body text-base mb-6" style={{ color: "#6C6C6C" }}>
                    Try adjusting your price range, hair type, or search terms.
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-6 py-3 font-label font-semibold text-xs rounded-sm"
                    style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.1em", textTransform: "uppercase" }}
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
                        <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#D4822A" }} />
                        <h2
                          className="font-label font-semibold text-sm"
                          style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                          Editor's Picks
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                        {filtered.filter((p) => p.editorPick).map((p) => (
                          <ProductCard key={p.id} product={p} variant="featured" />
                        ))}
                      </div>
                      <div className="border-t mb-10" style={{ borderColor: "#E8DDD0" }} />
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#8B1A2F" }} />
                        <h2
                          className="font-label font-semibold text-sm"
                          style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}
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
