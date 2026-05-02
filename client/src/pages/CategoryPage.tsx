// PauseAndFlourish.com - Category Page
// Design: Bold magazine aesthetic with Burgundy (#8B1A2F) + Amber (#D4822A) + Cream (#FDF6EE)
// Features: Sidebar FilterPanel (price range + hair type) + Sort

import { useEffect, useState, useMemo } from "react";
import { useParams } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import ComparisonCard from "@/components/ComparisonCard";
import FilterPanel, {
  FilterState,
  getDefaultFilters,
  hasActiveFilters,
  applyFilters,
  HAIR_TYPES,
} from "@/components/FilterPanel";
import { categories, getProductsByCategory, getComparisonsByCategory } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { Link } from "wouter";
import { ArrowLeft, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { id: "default", label: "Featured" },
  { id: "rating-desc", label: "Highest Rated" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const allCategoryProducts = getProductsByCategory(slug || "");
  const comparisons = getComparisonsByCategory(slug || "");

  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [sortBy, setSortBy] = useState<string>("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (category) {
      updateDocumentMeta({
        title: `${category.name} Reviews | PauseAndFlourish`,
        description: `${category.description} Read our expert reviews and comparisons.`,
        canonical: `https://pauseandflourish.com/category/${slug}`,
        ogImage: category.imageUrl,
      });
    }
    // Reset filters when category changes
    setFilters(getDefaultFilters());
    setSortBy("default");
  }, [category, slug]);

  const anyActive = hasActiveFilters(filters) || sortBy !== "default";

  const activeFilterCount =
    (filters.priceMin > 0 || filters.priceMax < 600 ? 1 : 0) +
    filters.hairTypes.length;

  const filtered = useMemo(() => {
    let result = applyFilters(allCategoryProducts, filters);
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
  }, [allCategoryProducts, filters, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "Featured";

  if (!category) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl" style={{ color: "#2C2C2C" }}>
            Category Not Found
          </h1>
          <Link href="/">
            <button className="btn-primary mt-6 rounded-sm px-6 py-3">Back to Home</button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* ── Category Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "300px" }}>
        <div className="absolute inset-0">
          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(44,44,44,0.85) 0%, rgba(44,44,44,0.4) 60%, transparent 100%)",
            }}
          />
        </div>
        <div
          className="relative container py-16 flex flex-col justify-center"
          style={{ minHeight: "300px" }}
        >
          <Link href="/">
            <button
              className="flex items-center gap-2 font-label text-xs mb-6 hover:opacity-80 transition-opacity"
              style={{ color: "#F2C4CE", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              <ArrowLeft size={14} /> Home
            </button>
          </Link>
          <p className="section-label mb-2" style={{ color: "#F2C4CE" }}>
            {category.type === "product" ? "Hair Products" : "Styling Tools"}
          </p>
          <h1
            className="font-display font-bold mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#FDF6EE" }}
          >
            {category.name}
          </h1>
          <p
            className="font-body text-lg leading-relaxed"
            style={{ color: "#F2C4CE", maxWidth: "600px" }}
          >
            {category.description}
          </p>
        </div>
      </section>

      {/* ── Comparisons ── */}
      {comparisons.length > 0 && (
        <section className="py-12" style={{ backgroundColor: "#FFF8F0" }}>
          <div className="container">
            <p className="section-label mb-2">Head-to-Head</p>
            <h2
              className="font-display font-bold mb-8"
              style={{ fontSize: "1.8rem", color: "#2C2C2C" }}
            >
              {category.name} Comparisons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((c) => (
                <ComparisonCard key={c.id} comparison={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sort + Filter Bar ── */}
      <section
        className="py-4 border-y sticky top-[73px] z-40"
        style={{ borderColor: "#E8DDD0", backgroundColor: "#FDF6EE" }}
      >
        <div className="container">
          <div className="flex flex-wrap items-center gap-3">
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
                  className="absolute left-0 top-full mt-1 rounded-sm border shadow-lg z-50"
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
                onClick={() => { setFilters(getDefaultFilters()); setSortBy("default"); }}
                className="flex items-center gap-1 text-xs font-label font-semibold"
                style={{ color: "#D4822A", letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                <X size={12} /> Clear All
              </button>
            )}

            {/* Results count */}
            <span className="ml-auto text-xs font-body" style={{ color: "#999" }}>
              {filtered.length} of {allCategoryProducts.length} products
            </span>
          </div>
        </div>
      </section>

      {/* ── Active Filter Chips ── */}
      {anyActive && (
        <section className="py-3 border-b" style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}>
          <div className="container">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-body" style={{ color: "#999" }}>Active:</span>
              {(filters.priceMin > 0 || filters.priceMax < 600) && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full" style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE" }}>
                  ${filters.priceMin}–{filters.priceMax >= 600 ? "$600+" : `$${filters.priceMax}`}
                  <button onClick={() => setFilters(f => ({ ...f, priceMin: 0, priceMax: 600 }))}><X size={11} /></button>
                </span>
              )}
              {filters.hairTypes.map((ht) => (
                <span key={ht} className="flex items-center gap-1 px-2.5 py-1 text-xs font-label font-semibold rounded-full" style={{ backgroundColor: "#D4822A", color: "#FFF" }}>
                  {HAIR_TYPES.find((h) => h.id === ht)?.label}
                  <button onClick={() => setFilters(f => ({ ...f, hairTypes: f.hairTypes.filter(t => t !== ht) }))}><X size={11} /></button>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Products Section: Sidebar + Grid ── */}
      <section className="py-12">
        <div className="container">
          <div className="flex gap-8 items-start">

            {/* Desktop Sidebar */}
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
                      onClick={() => { setFilters(getDefaultFilters()); setSortBy("default"); }}
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
                  productCount={filtered.length}
                />
              </div>
            </aside>

            {/* Mobile Filter Panel */}
            <div className="w-full">
              {showMobileFilters && (
                <div className="lg:hidden mb-6">
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    productCount={filtered.length}
                  />
                </div>
              )}

              {/* Section header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 rounded-sm" style={{ backgroundColor: "#8B1A2F" }} />
                <h2
                  className="font-label font-semibold text-sm"
                  style={{ color: "#8B1A2F", letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  {anyActive ? `${filtered.length} Results` : `All ${category.name} Reviews`}
                </h2>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-display text-2xl font-semibold mb-3" style={{ color: "#2C2C2C" }}>
                    No products match your filters
                  </p>
                  <p className="font-body text-base mb-6" style={{ color: "#6C6C6C" }}>
                    Try widening your price range or selecting different hair types.
                  </p>
                  <button
                    onClick={() => { setFilters(getDefaultFilters()); setSortBy("default"); }}
                    className="px-6 py-3 font-label font-semibold text-xs rounded-sm"
                    style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} variant="featured" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
