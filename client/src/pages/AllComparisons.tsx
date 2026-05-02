// PauseAndFlourish.com — All Comparisons Page
// Menopause product head-to-head comparisons, filtered by stage and category

import { useEffect, useState } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import ComparisonCard from "@/components/ComparisonCard";
import { comparisons, allProducts } from "@/lib/products";
import { updateDocumentMeta } from "@/lib/seo";
import { QUIZ_RESULT_KEY } from "@/pages/MenopauseQuiz";
import { Sparkles, ArrowRight, X, Filter } from "lucide-react";

// Menopause stage filter options
const STAGE_OPTIONS: { id: string; label: string; emoji: string }[] = [
  { id: "early-perimenopause",  label: "Early Perimenopause",  emoji: "🌱" },
  { id: "late-perimenopause",   label: "Late Perimenopause",   emoji: "🌿" },
  { id: "active-menopause",     label: "Active Menopause",     emoji: "🔥" },
  { id: "early-postmenopause",  label: "Early Postmenopause",  emoji: "🌸" },
  { id: "late-postmenopause",   label: "Late Postmenopause",   emoji: "✨" },
];

const STAGE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "early-perimenopause":  { label: "Early Perimenopause",  color: "#2D7D6F", bg: "#F0FAF8" },
  "late-perimenopause":   { label: "Late Perimenopause",   color: "#3D8B7A", bg: "#E8F7F4" },
  "active-menopause":     { label: "Active Menopause",     color: "#C4722A", bg: "#FFF8EE" },
  "early-postmenopause":  { label: "Early Postmenopause",  color: "#7B6EA8", bg: "#F5F0FF" },
  "late-postmenopause":   { label: "Late Postmenopause",   color: "#2D7D6F", bg: "#F0FAF8" },
};

const CATEGORY_OPTIONS = [
  { id: "all",                        label: "All Categories" },
  { id: "multi-symptom-supplements",  label: "Menopause Supplements" },
  { id: "sleep-mood-support",         label: "Sleep & Mood" },
  { id: "hot-flash-cooling",          label: "Hot Flash & Cooling" },
  { id: "bone-joint-health",          label: "Bone & Joint Health" },
  { id: "vaginal-intimate-health",    label: "Vaginal & Intimate Health" },
  { id: "menopause-skincare",         label: "Menopause Skincare" },
  { id: "fitness-pelvic-health",      label: "Fitness & Pelvic Health" },
  { id: "cognitive-energy-support",   label: "Cognitive & Energy" },
];

function QuizEntryBanner() {
  const [savedStage, setSavedStage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUIZ_RESULT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stage) setSavedStage(parsed?.stage);
      }
    } catch {}
  }, []);

  if (dismissed) return null;

  const meta = savedStage ? STAGE_LABELS[savedStage] : null;

  if (meta && savedStage) {
    return (
      <div className="border-b px-6 py-4" style={{ backgroundColor: meta.bg, borderColor: `${meta.color}33` }}>
        <div className="container flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={16} style={{ color: meta.color, flexShrink: 0 }} />
            <div>
              <span className="font-body font-semibold text-sm" style={{ color: meta.color }}>
                Showing comparisons for {meta.label}
              </span>
              <span className="font-body text-xs ml-2 hidden sm:inline" style={{ color: "#3D5A58" }}>
                Use the menopause stage filter below to surface the most relevant comparisons.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/quiz">
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-body font-semibold text-xs transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: meta.color, color: "#FDF8F4" }}
              >
                View My Stage Profile <ArrowRight size={12} />
              </span>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="hover:opacity-60 transition-opacity"
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

  return (
    <div className="border-b px-6 py-4" style={{ backgroundColor: "#EDF5F3", borderColor: "#D4EBE7" }}>
      <div className="container flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Sparkles size={16} style={{ color: "#2D7D6F", flexShrink: 0 }} />
          <div>
            <span className="font-body font-semibold text-sm" style={{ color: "#2D7D6F" }}>
              Not sure which product is right for you?
            </span>
            <span className="font-body text-xs ml-2 hidden sm:inline" style={{ color: "#3D5A58" }}>
              Your menopause stage can help — take our 2-minute quiz to find out.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/quiz">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded font-body font-semibold text-xs transition-all duration-200 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4" }}
            >
              Take the Menopause Stage Quiz <ArrowRight size={12} />
            </span>
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="hover:opacity-60 transition-opacity"
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

export default function AllComparisons() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStage, setActiveStage] = useState<string | null>(null);

  useEffect(() => {
    updateDocumentMeta({
      title: "Menopause Product Comparisons | PauseAndFlourish",
      description: "Expert head-to-head comparisons of the best menopause supplements, cooling products, and wellness solutions. Find out which product wins for your stage.",
      canonical: "https://pauseandflourish.com/comparisons",
    });
    // Pre-select menopause stage from saved quiz result
    try {
      const saved = localStorage.getItem(QUIZ_RESULT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stage) setActiveStage(parsed?.stage);
      }
    } catch {}
  }, []);

  const filtered = comparisons.filter(c => {
    const categoryMatch = activeCategory === "all" || c.categorySlug === activeCategory;
    const productIds = (c as any).productIds || [(c as any).product1Id, (c as any).product2Id].filter(Boolean);
    const stageMatch = !activeStage || productIds.some((pid: string) => {
      const product = (allProducts as any[]).find((p: any) => p.id === pid);
      return product?.stages?.includes(activeStage);
    });
    return categoryMatch && stageMatch;
  });

  return (
    <SiteLayout>
      {/* Quiz Entry Banner */}
      <QuizEntryBanner />

      {/* Header */}
      <section className="py-16 border-b" style={{ borderColor: "#D4EBE7", backgroundColor: "#EDF5F3" }}>
        <div className="container">
          <p className="section-label mb-2">Head-to-Head</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}>
            Product Comparisons
          </h1>
          <p className="font-body text-lg mt-3" style={{ color: "#6C6C6C", maxWidth: "600px" }}>
            We put the top products head-to-head so you know exactly which one to buy. New comparisons added every Monday.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-20 border-b" style={{ backgroundColor: "#FDFAF6", borderColor: "#D4EBE7" }}>
        <div className="container py-4">
          <div className="flex flex-col gap-3">

            {/* Menopause Stage Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-label text-xs font-semibold mr-1" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <Filter size={11} /> Menopause Stage
              </span>
              <button
                onClick={() => setActiveStage(null)}
                className="px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all duration-150"
                style={
                  activeStage === null
                    ? { backgroundColor: "#2D7D6F", color: "#FDF8F4", border: "1.5px solid #2D7D6F" }
                    : { backgroundColor: "transparent", color: "#3D5A58", border: "1.5px solid #C0DDD9" }
                }
              >
                All Types
              </button>
              {STAGE_OPTIONS.map(ht => (
                <button
                  key={ht.id}
                  onClick={() => setActiveStage(activeStage === ht.id ? null : ht.id)}
                  className="px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all duration-150"
                  style={
                    activeStage === ht.id
                      ? { backgroundColor: "#2D7D6F", color: "#FDF8F4", border: "1.5px solid #2D7D6F" }
                      : { backgroundColor: "transparent", color: "#3D5A58", border: "1.5px solid #C0DDD9" }
                  }
                >
                  {ht.emoji} {ht.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-label text-xs font-semibold mr-1" style={{ color: "#3D5A58", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Category
              </span>
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all duration-150"
                  style={
                    activeCategory === cat.id
                      ? { backgroundColor: "#1A3A38", color: "#FDF8F4", border: "1.5px solid #1A3A38" }
                      : { backgroundColor: "transparent", color: "#3D5A58", border: "1.5px solid #C0DDD9" }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results count */}
      <div className="container pt-6 pb-2">
        <p className="font-body text-sm" style={{ color: "#8C8C8C" }}>
          {filtered.length === comparisons.length
            ? `${comparisons.length} comparisons`
            : `${filtered.length} of ${comparisons.length} comparisons`}
          {activeStage && (
            <span style={{ color: "#2D7D6F" }}>
              {" for "}<strong>{STAGE_OPTIONS.find(h => h.id === activeStage)?.label}</strong>
            </span>
          )}
          {activeCategory !== "all" && (
            <span style={{ color: "#3D5A58" }}>
              {" "}in <strong>{CATEGORY_OPTIONS.find(c => c.id === activeCategory)?.label}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Comparisons Grid */}
      <section className="py-8">
        <div className="container">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => <ComparisonCard key={c.id} comparison={c} variant="featured" />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-2xl font-semibold mb-3" style={{ color: "#2C2C2C" }}>No comparisons found</p>
              <p className="font-body text-base mb-6" style={{ color: "#6C6C6C" }}>
                No comparisons match the selected filters. Try removing a filter to see more results.
              </p>
              <button              onClick={() => { setActiveCategory("all"); setActiveStage(null); }}
                className="px-5 py-2.5 rounded font-body font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4" }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
