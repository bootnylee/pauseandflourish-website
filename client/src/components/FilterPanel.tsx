// PauseAndFlourish.com - Shared FilterPanel Component
// Design: Bold magazine aesthetic with Burgundy (#8B1A2F) + Amber (#D4822A) + Cream (#FDF6EE)
// Features: Dual-handle price range slider + hair type checkboxes + category pills

import { useRef, useCallback } from "react";
import { X, DollarSign, Scissors } from "lucide-react";

export const HAIR_TYPES = [
  { id: "fine", label: "Fine", icon: "🌿" },
  { id: "thick", label: "Thick", icon: "🌊" },
  { id: "curly", label: "Curly", icon: "🌀" },
  { id: "coarse", label: "Coarse", icon: "💪" },
  { id: "dry", label: "Dry", icon: "🏜️" },
  { id: "normal", label: "Normal", icon: "✨" },
  { id: "color-treated", label: "Color-Treated", icon: "🎨" },
  { id: "all", label: "All Hair Types", icon: "💁" },
];

export const PRICE_PRESETS = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25–$75", min: 25, max: 75 },
  { label: "$75–$150", min: 75, max: 150 },
  { label: "$150–$300", min: 150, max: 300 },
  { label: "$300+", min: 300, max: 600 },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 600;

export interface FilterState {
  priceMin: number;
  priceMax: number;
  hairTypes: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showCategoryFilter?: boolean;
  categories?: { id: string; slug: string; name: string }[];
  selectedCategory?: string;
  onCategoryChange?: (slug: string) => void;
  productCount?: number;
}

export function getDefaultFilters(): FilterState {
  return { priceMin: PRICE_MIN, priceMax: PRICE_MAX, hairTypes: [] };
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.priceMin > PRICE_MIN ||
    filters.priceMax < PRICE_MAX ||
    filters.hairTypes.length > 0
  );
}

export function applyFilters<T extends { price: number; hairTypes?: string[] }>(
  products: T[],
  filters: FilterState
): T[] {
  return products.filter((p) => {
    // Price range
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
    // Hair type
    if (filters.hairTypes.length > 0) {
      if (!p.hairTypes || p.hairTypes.length === 0) return true;
      return filters.hairTypes.some(
        (ht) => p.hairTypes!.includes(ht) || p.hairTypes!.includes("all")
      );
    }
    return true;
  });
}

export default function FilterPanel({
  filters,
  onChange,
  showCategoryFilter = false,
  categories = [],
  selectedCategory = "all",
  onCategoryChange,
  productCount,
}: FilterPanelProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const toggleHairType = (id: string) => {
    const next = filters.hairTypes.includes(id)
      ? filters.hairTypes.filter((t) => t !== id)
      : [...filters.hairTypes, id];
    onChange({ ...filters, hairTypes: next });
  };

  const setPricePreset = (min: number, max: number) => {
    onChange({ ...filters, priceMin: min, priceMax: max });
  };

  const resetPrice = () => {
    onChange({ ...filters, priceMin: PRICE_MIN, priceMax: PRICE_MAX });
  };

  const resetHairTypes = () => {
    onChange({ ...filters, hairTypes: [] });
  };

  // Dual-handle slider logic
  const handleMinDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;

      const move = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = Math.round(pct * PRICE_MAX);
        const newMin = Math.min(raw, filters.priceMax - 10);
        onChange({ ...filters, priceMin: newMin });
      };

      const onMouseMove = (ev: MouseEvent) => move(ev.clientX);
      const onTouchMove = (ev: TouchEvent) => move(ev.touches[0].clientX);
      const cleanup = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", cleanup);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", cleanup);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", cleanup);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", cleanup);
    },
    [filters, onChange]
  );

  const handleMaxDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;

      const move = (clientX: number) => {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = Math.round(pct * PRICE_MAX);
        const newMax = Math.max(raw, filters.priceMin + 10);
        onChange({ ...filters, priceMax: newMax });
      };

      const onMouseMove = (ev: MouseEvent) => move(ev.clientX);
      const onTouchMove = (ev: TouchEvent) => move(ev.touches[0].clientX);
      const cleanup = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", cleanup);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", cleanup);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", cleanup);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", cleanup);
    },
    [filters, onChange]
  );

  const minPct = (filters.priceMin / PRICE_MAX) * 100;
  const maxPct = (filters.priceMax / PRICE_MAX) * 100;
  const isPriceActive = filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX;
  const isPresetActive = (min: number, max: number) =>
    filters.priceMin === min && filters.priceMax === max;

  return (
    <div
      className="rounded-sm border p-5"
      style={{ borderColor: "#E8DDD0", backgroundColor: "#FFF8F0" }}
    >
      <div className="flex flex-col gap-7">

        {/* ── Category Filter (optional) ── */}
        {showCategoryFilter && categories.length > 0 && onCategoryChange && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className="font-label font-semibold text-xs"
                style={{ color: "#8B1A2F", letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                Category
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange("all")}
                className="px-3 py-1.5 text-xs font-label font-semibold rounded-sm border transition-colors"
                style={{
                  backgroundColor: selectedCategory === "all" ? "#8B1A2F" : "transparent",
                  color: selectedCategory === "all" ? "#FDF6EE" : "#8B1A2F",
                  borderColor: "#8B1A2F",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.slug)}
                  className="px-3 py-1.5 text-xs font-label font-semibold rounded-sm border transition-colors"
                  style={{
                    backgroundColor: selectedCategory === cat.slug ? "#8B1A2F" : "transparent",
                    color: selectedCategory === cat.slug ? "#FDF6EE" : "#8B1A2F",
                    borderColor: "#8B1A2F",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Price Range ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign size={13} style={{ color: "#8B1A2F" }} />
              <p
                className="font-label font-semibold text-xs"
                style={{ color: "#8B1A2F", letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                Price Range
              </p>
            </div>
            {isPriceActive && (
              <button
                onClick={resetPrice}
                className="flex items-center gap-1 text-xs font-label font-semibold"
                style={{ color: "#D4822A", letterSpacing: "0.05em" }}
              >
                <X size={11} /> Reset
              </button>
            )}
          </div>

          {/* Price display */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="font-label font-semibold text-sm px-3 py-1 rounded-sm"
              style={{ backgroundColor: "#F2E8DC", color: "#8B1A2F" }}
            >
              ${filters.priceMin}
            </span>
            <span className="text-xs font-body" style={{ color: "#999" }}>to</span>
            <span
              className="font-label font-semibold text-sm px-3 py-1 rounded-sm"
              style={{ backgroundColor: "#F2E8DC", color: "#8B1A2F" }}
            >
              {filters.priceMax >= PRICE_MAX ? "$600+" : `$${filters.priceMax}`}
            </span>
          </div>

          {/* Dual-handle slider track */}
          <div className="relative h-6 flex items-center mb-4 px-2" ref={trackRef}>
            {/* Track background */}
            <div
              className="absolute inset-x-2 h-1.5 rounded-full"
              style={{ backgroundColor: "#E8DDD0" }}
            />
            {/* Active range fill */}
            <div
              className="absolute h-1.5 rounded-full"
              style={{
                left: `calc(${minPct}% + 8px * (1 - ${minPct / 100}))`,
                right: `calc(${100 - maxPct}% + 8px * ${maxPct / 100})`,
                backgroundColor: "#8B1A2F",
              }}
            />
            {/* Min handle */}
            <div
              className="absolute w-5 h-5 rounded-full border-2 shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
              style={{
                left: `calc(${minPct}% - 10px + 8px)`,
                backgroundColor: "#FDF6EE",
                borderColor: "#8B1A2F",
                boxShadow: "0 1px 4px rgba(139,26,47,0.3)",
              }}
              onMouseDown={handleMinDrag}
              onTouchStart={handleMinDrag}
            />
            {/* Max handle */}
            <div
              className="absolute w-5 h-5 rounded-full border-2 shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
              style={{
                left: `calc(${maxPct}% - 10px + 8px)`,
                backgroundColor: "#FDF6EE",
                borderColor: "#8B1A2F",
                boxShadow: "0 1px 4px rgba(139,26,47,0.3)",
              }}
              onMouseDown={handleMaxDrag}
              onTouchStart={handleMaxDrag}
            />
          </div>

          {/* Price presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setPricePreset(preset.min, preset.max)}
                className="px-2.5 py-1 text-xs font-label font-semibold rounded-sm border transition-colors"
                style={{
                  backgroundColor: isPresetActive(preset.min, preset.max)
                    ? "#8B1A2F"
                    : "transparent",
                  color: isPresetActive(preset.min, preset.max) ? "#FDF6EE" : "#8B1A2F",
                  borderColor: "#C4A882",
                  letterSpacing: "0.04em",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Hair Type ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scissors size={13} style={{ color: "#8B1A2F" }} />
              <p
                className="font-label font-semibold text-xs"
                style={{ color: "#8B1A2F", letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                Hair Type
              </p>
            </div>
            {filters.hairTypes.length > 0 && (
              <button
                onClick={resetHairTypes}
                className="flex items-center gap-1 text-xs font-label font-semibold"
                style={{ color: "#D4822A", letterSpacing: "0.05em" }}
              >
                <X size={11} /> Reset
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {HAIR_TYPES.map((ht) => {
              const active = filters.hairTypes.includes(ht.id);
              return (
                <label
                  key={ht.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {/* Custom checkbox */}
                  <div
                    className="w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: active ? "#8B1A2F" : "#C4A882",
                      backgroundColor: active ? "#8B1A2F" : "transparent",
                    }}
                    onClick={() => toggleHairType(ht.id)}
                  >
                    {active && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="#FDF6EE"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm font-body transition-colors"
                    style={{ color: active ? "#8B1A2F" : "#4A4A4A" }}
                    onClick={() => toggleHairType(ht.id)}
                  >
                    {ht.label}
                  </span>
                </label>
              );
            })}
          </div>
          {filters.hairTypes.length > 0 && (
            <p className="text-xs font-body mt-3 leading-relaxed" style={{ color: "#999" }}>
              Showing products for:{" "}
              <strong style={{ color: "#D4822A" }}>
                {filters.hairTypes
                  .map((id) => HAIR_TYPES.find((h) => h.id === id)?.label)
                  .join(", ")}
              </strong>
            </p>
          )}
        </div>

        {/* ── Results count ── */}
        {productCount !== undefined && (
          <div
            className="pt-3 border-t"
            style={{ borderColor: "#E8DDD0" }}
          >
            <p className="text-xs font-body text-center" style={{ color: "#999" }}>
              <strong style={{ color: "#8B1A2F" }}>{productCount}</strong>{" "}
              product{productCount !== 1 ? "s" : ""} match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
