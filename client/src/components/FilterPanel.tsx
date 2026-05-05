// PauseAndFlourish.com - Shared FilterPanel Component
// Design: Teal (#2D7D6F) + Terracotta (#C4722A) + Ivory (#FDF8F4)
// Features: Dual-handle price range slider + menopause stage checkboxes + category pills

import { useRef, useCallback } from "react";
import { X, DollarSign, Activity } from "lucide-react";

export const MENOPAUSE_STAGES = [
  { id: "early-perimenopause", label: "Early Perimenopause", icon: "🌱" },
  { id: "late-perimenopause", label: "Late Perimenopause", icon: "🌿" },
  { id: "active-menopause", label: "Active Menopause", icon: "🔥" },
  { id: "early-postmenopause", label: "Early Postmenopause", icon: "🌸" },
  { id: "late-postmenopause", label: "Late Postmenopause", icon: "✨" },
];

// Backward-compat alias so any component importing HAIR_TYPES still works
export const HAIR_TYPES = MENOPAUSE_STAGES;

export const PRICE_PRESETS = [
  { label: "Under $15", min: 0, max: 15 },
  { label: "$15–$30", min: 15, max: 30 },
  { label: "$30–$50", min: 30, max: 50 },
  { label: "$50–$100", min: 50, max: 100 },
  { label: "$100+", min: 100, max: 300 },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 300;

export interface FilterState {
  priceMin: number;
  priceMax: number;
  stages: string[];
  hairTypes?: string[]; // deprecated alias
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
  return { priceMin: PRICE_MIN, priceMax: PRICE_MAX, stages: [] };
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.priceMin > PRICE_MIN ||
    filters.priceMax < PRICE_MAX ||
    (filters.stages?.length ?? 0) > 0
  );
}

export function applyFilters<T extends { price: number; stages?: string[] }>(
  products: T[],
  filters: FilterState
): T[] {
  return products.filter((p) => {
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
    if (filters.stages && filters.stages.length > 0) {
      if (!p.stages || p.stages.length === 0) return true;
      return filters.stages.some((s) => p.stages!.includes(s));
    }
    return true;
  });
}

export default function FilterPanel({
  filters,
  onChange,
  showCategoryFilter = false,
  categories = [],
  selectedCategory,
  onCategoryChange,
  productCount,
}: FilterPanelProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercent = (value: number) =>
    ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const minPct = getPercent(filters.priceMin);
  const maxPct = getPercent(filters.priceMax);

  const handleMinDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const slider = sliderRef.current;
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const move = (clientX: number) => {
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const value = Math.round(PRICE_MIN + pct * (PRICE_MAX - PRICE_MIN));
        if (value < filters.priceMax) onChange({ ...filters, priceMin: value });
      };
      const onMove = (ev: MouseEvent | TouchEvent) => {
        const x = "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
        move(x);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchend", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
    },
    [filters, onChange]
  );

  const handleMaxDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const slider = sliderRef.current;
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const move = (clientX: number) => {
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const value = Math.round(PRICE_MIN + pct * (PRICE_MAX - PRICE_MIN));
        if (value > filters.priceMin) onChange({ ...filters, priceMax: value });
      };
      const onMove = (ev: MouseEvent | TouchEvent) => {
        const x = "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
        move(x);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchend", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
    },
    [filters, onChange]
  );

  const setPricePreset = (min: number, max: number) =>
    onChange({ ...filters, priceMin: min, priceMax: max });

  const isPresetActive = (min: number, max: number) =>
    filters.priceMin === min && filters.priceMax === max;

  const toggleStage = (id: string) => {
    const stages = filters.stages ?? [];
    const next = stages.includes(id) ? stages.filter((s) => s !== id) : [...stages, id];
    onChange({ ...filters, stages: next });
  };

  const resetStages = () => onChange({ ...filters, stages: [] });
  const resetAll = () => onChange(getDefaultFilters());

  const TEAL = "#2D7D6F";
  const TERRA = "#C4722A";
  const IVORY = "#FDF8F4";
  const BORDER = "#D9EDE9";

  return (
    <div className="rounded-xl border p-5 space-y-6" style={{ backgroundColor: IVORY, borderColor: BORDER }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-label font-bold text-sm" style={{ color: TEAL, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Filter
        </h3>
        {hasActiveFilters(filters) && (
          <button onClick={resetAll} className="flex items-center gap-1 text-xs font-label font-semibold" style={{ color: TERRA }}>
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      {/* Category pills */}
      {showCategoryFilter && categories.length > 0 && (
        <div>
          <p className="font-label font-semibold text-xs mb-2" style={{ color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Category
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(active ? "" : cat.slug)}
                  className="px-2.5 py-1 text-xs font-label font-semibold rounded-full border transition-colors"
                  style={{ backgroundColor: active ? TEAL : "transparent", color: active ? IVORY : TEAL, borderColor: TEAL }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={13} style={{ color: TEAL }} />
            <p className="font-label font-semibold text-xs" style={{ color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Price Range
            </p>
          </div>
          <span className="text-xs font-body" style={{ color: "#666" }}>
            ${filters.priceMin} – {filters.priceMax >= PRICE_MAX ? "$300+" : `$${filters.priceMax}`}
          </span>
        </div>
        <div ref={sliderRef} className="relative h-2 rounded-full mx-2 mb-4" style={{ backgroundColor: BORDER }}>
          <div className="absolute h-2 rounded-full" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%`, backgroundColor: TEAL }} />
          <div
            className="absolute w-5 h-5 rounded-full border-2 shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
            style={{ left: `calc(${minPct}% - 10px)`, backgroundColor: IVORY, borderColor: TEAL }}
            onMouseDown={handleMinDrag}
            onTouchStart={handleMinDrag}
          />
          <div
            className="absolute w-5 h-5 rounded-full border-2 shadow-md cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-110"
            style={{ left: `calc(${maxPct}% - 10px + 8px)`, backgroundColor: IVORY, borderColor: TEAL }}
            onMouseDown={handleMaxDrag}
            onTouchStart={handleMaxDrag}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setPricePreset(preset.min, preset.max)}
              className="px-2.5 py-1 text-xs font-label font-semibold rounded-sm border transition-colors"
              style={{
                backgroundColor: isPresetActive(preset.min, preset.max) ? TEAL : "transparent",
                color: isPresetActive(preset.min, preset.max) ? IVORY : TEAL,
                borderColor: BORDER,
                letterSpacing: "0.04em",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menopause Stage filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={13} style={{ color: TEAL }} />
            <p className="font-label font-semibold text-xs" style={{ color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Your Stage
            </p>
          </div>
          {(filters.stages?.length ?? 0) > 0 && (
            <button onClick={resetStages} className="flex items-center gap-1 text-xs font-label font-semibold" style={{ color: TERRA }}>
              <X size={11} /> Reset
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {MENOPAUSE_STAGES.map((stage) => {
            const active = (filters.stages ?? []).includes(stage.id);
            return (
              <label key={stage.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className="w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: active ? TEAL : BORDER, backgroundColor: active ? TEAL : "transparent" }}
                  onClick={() => toggleStage(stage.id)}
                >
                  {active && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke={IVORY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm font-body transition-colors"
                  style={{ color: active ? TEAL : "#4A4A4A" }}
                  onClick={() => toggleStage(stage.id)}
                >
                  {stage.label}
                </span>
              </label>
            );
          })}
        </div>
        {(filters.stages?.length ?? 0) > 0 && (
          <p className="text-xs font-body mt-3 leading-relaxed" style={{ color: "#999" }}>
            Showing products for:{" "}
            <strong style={{ color: TERRA }}>
              {(filters.stages ?? [])
                .map((id) => MENOPAUSE_STAGES.find((s) => s.id === id)?.label)
                .join(", ")}
            </strong>
          </p>
        )}
      </div>

      {/* Results count */}
      {productCount !== undefined && (
        <div className="pt-3 border-t" style={{ borderColor: BORDER }}>
          <p className="text-xs font-body text-center" style={{ color: "#999" }}>
            <strong style={{ color: TEAL }}>{productCount}</strong>{" "}
            product{productCount !== 1 ? "s" : ""} match your filters
          </p>
        </div>
      )}
    </div>
  );
}
