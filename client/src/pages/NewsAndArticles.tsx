// PauseAndFlourish.com — News & Articles Page
// Displays peer-reviewed research articles sorted by menopause stage
import { useState } from "react";
import { ExternalLink, BookOpen, FlaskConical, BarChart3, Users, FileText, Microscope } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
import {
  researchArticles,
  getArticlesByStage,
  type ResearchArticle,
  type ArticleStageId,
} from "../lib/researchArticles";

// ─── Stage tab configuration ─────────────────────────────────────────────────
const TABS: { id: ArticleStageId | "all"; label: string; color: string }[] = [
  { id: "all",                  label: "All Articles",        color: "#2D7D6F" },
  { id: "general",              label: "General",             color: "#5A6A7A" },
  { id: "early-perimenopause",  label: "Early Perimenopause", color: "#2D7D6F" },
  { id: "late-perimenopause",   label: "Late Perimenopause",  color: "#C4622D" },
  { id: "active-menopause",     label: "Active Menopause",    color: "#8B2252" },
  { id: "early-postmenopause",  label: "Early Postmenopause", color: "#5B6E2D" },
  { id: "late-postmenopause",   label: "Late Postmenopause",  color: "#4A3F7A" },
];

// ─── Study type badge colours ─────────────────────────────────────────────────
const STUDY_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  "Meta-Analysis":     { bg: "#E8F5E9", text: "#1B5E20" },
  "Systematic Review": { bg: "#E3F2FD", text: "#0D47A1" },
  "RCT":               { bg: "#FFF3E0", text: "#E65100" },
  "Clinical Trial":    { bg: "#FFF3E0", text: "#E65100" },
  "Cohort Study":      { bg: "#F3E5F5", text: "#4A148C" },
  "Cross-Sectional":   { bg: "#FCE4EC", text: "#880E4F" },
  "Observational":     { bg: "#F3E5F5", text: "#4A148C" },
  "Review":            { bg: "#E0F7FA", text: "#006064" },
};

function studyTypeIcon(type: string) {
  switch (type) {
    case "Meta-Analysis":
    case "Systematic Review": return <BarChart3 size={11} />;
    case "RCT":
    case "Clinical Trial":    return <FlaskConical size={11} />;
    case "Cohort Study":
    case "Observational":     return <Users size={11} />;
    case "Cross-Sectional":   return <FileText size={11} />;
    default:                  return <Microscope size={11} />;
  }
}

// ─── Article Card ─────────────────────────────────────────────────────────────
function ArticleCard({ article }: { article: ResearchArticle }) {
  const typeStyle = STUDY_TYPE_STYLES[article.study_type] ?? { bg: "#F5F5F5", text: "#424242" };
  const tab = TABS.find(t => t.id === article.stage_id);
  const stageColor = tab?.color ?? "#5A6A7A";
  const stageLabel = tab?.label ?? "General";

  return (
    <div
      className="bg-white rounded-lg border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderColor: "#E8F0EE" }}
    >
      {/* Top row: study type badge + stage pill */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-label"
          style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
        >
          {studyTypeIcon(article.study_type)}
          {article.study_type}
        </span>
        <span
          className="text-xs font-label font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${stageColor}18`, color: stageColor, border: `1px solid ${stageColor}40` }}
        >
          {stageLabel}
        </span>
      </div>

      {/* Consumer headline */}
      <h3 className="font-display font-bold leading-snug" style={{ fontSize: "1rem", color: "#1A2E2A" }}>
        {article.headline}
      </h3>

      {/* Key takeaway */}
      <p className="font-body text-sm leading-relaxed" style={{ color: "#4A5E5A" }}>
        {article.takeaway}
      </p>

      {/* Citation */}
      <p
        className="font-body text-xs leading-relaxed italic"
        style={{ color: "#8A9A97", borderTop: "1px solid #EDF5F3", paddingTop: "0.75rem" }}
      >
        {article.citation}
      </p>

      {/* Footer: date + link */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="font-label text-xs" style={{ color: "#A0B0AD" }}>
          Added {new Date(article.date_added).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-label text-xs font-semibold hover:underline"
            style={{ color: "#2D7D6F" }}
          >
            View Source <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewsAndArticles() {
  const [activeTab, setActiveTab] = useState<ArticleStageId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const baseArticles: ResearchArticle[] =
    activeTab === "all"
      ? [...researchArticles].sort((a, b) => b.date_added.localeCompare(a.date_added))
      : getArticlesByStage(activeTab as ArticleStageId).sort((a, b) => b.date_added.localeCompare(a.date_added));

  const filtered = searchQuery.trim()
    ? baseArticles.filter(a =>
        a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.takeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.citation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseArticles;

  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  return (
    <SiteLayout>
      {/* Hero banner */}
      <section
        className="py-14 px-4"
        style={{ background: "linear-gradient(135deg, #EDF5F3 0%, #F5EDE8 100%)" }}
      >
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full font-label text-xs font-semibold"
            style={{ backgroundColor: "#D4EBE7", color: "#2D7D6F" }}>
            <BookOpen size={13} />
            Peer-Reviewed Research
          </div>
          <h1 className="font-display font-bold mb-4" style={{ fontSize: "2.4rem", color: "#1A2E2A", lineHeight: 1.15 }}>
            News &amp; Articles
          </h1>
          <p className="font-body text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#4A5E5A" }}>
            We curate the latest peer-reviewed research on menopause and perimenopause — translated into plain language so you can make informed decisions. Updated weekly.
          </p>
          <p className="font-body text-xs mt-4" style={{ color: "#8A9A97" }}>
            Content is for informational purposes only and is not a substitute for professional medical advice.
          </p>
        </div>
      </section>

      {/* Stage tabs */}
      <section className="sticky top-0 z-30 border-b" style={{ backgroundColor: "#FDF8F4", borderColor: "#D4EBE7" }}>
        <div className="container overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-3.5 font-label text-xs font-semibold whitespace-nowrap transition-all border-b-2"
                  style={{
                    color: isActive ? tab.color : "#7A9A97",
                    borderBottomColor: isActive ? tab.color : "transparent",
                    backgroundColor: isActive ? `${tab.color}0D` : "transparent",
                  }}
                >
                  {tab.label}
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: isActive ? `${tab.color}22` : "#EDF5F3",
                      color: isActive ? tab.color : "#7A9A97",
                    }}
                  >
                    {tab.id === "all"
                      ? researchArticles.length
                      : researchArticles.filter(a => a.stage_id === tab.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search + results */}
      <section className="py-10 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Search bar */}
          <div className="mb-8 max-w-lg">
            <input
              type="search"
              placeholder="Search articles by keyword…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border font-body text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D4EBE7",
                backgroundColor: "#FFFFFF",
                color: "#2C2C2C",
                // @ts-ignore
                "--tw-ring-color": "#2D7D6F40",
              }}
            />
          </div>

          {/* Section heading */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold" style={{ fontSize: "1.3rem", color: "#1A2E2A" }}>
              {activeTab === "all" ? "All Articles" : activeTabConfig.label}
            </h2>
            <span className="font-label text-xs" style={{ color: "#8A9A97" }}>
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Article grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: "#8A9A97" }}>
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-body text-sm">No articles found for that search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="mt-12 p-5 rounded-lg border font-body text-xs leading-relaxed"
            style={{ backgroundColor: "#F0FAF8", borderColor: "#D4EBE7", color: "#4A5E5A" }}
          >
            <strong>Medical Disclaimer:</strong> The research articles listed here are sourced from peer-reviewed journals and are provided for informational and educational purposes only. PauseAndFlourish.com does not endorse any specific treatment, supplement, or medical intervention. Always consult a qualified healthcare professional before making changes to your health regimen.
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
