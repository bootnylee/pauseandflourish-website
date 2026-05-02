// Design: Refined Magazine Meets Bold Lifestyle
// Burgundy primary, Amber accent, Cream background, Cormorant Garamond display font
// Hair Type Quiz — multi-step questionnaire with scoring and personalized product recommendations

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft, RotateCcw, ExternalLink, Star, Share2, Check, Trash2, Mail } from "lucide-react";

import SiteLayout from "@/components/SiteLayout";
import { allProducts } from "@/lib/products";

// ─── Quiz Email Capture ────────────────────────────────────────────────────────
// The EmailOctopus JS widget works by finding a <script data-form="..."> tag in
// the DOM and inserting the form HTML immediately after it (nextSibling), then
// removing the script tag itself. To keep the form inside our styled card, we
// inject the <script> tag into the card's container div via useEffect, so the
// widget inserts the form HTML inside the card rather than at the body level.
const EMAILOCTOPUS_FORM_ID = "aeb1d42c-40de-11f1-aa22-35d9c85d0d35";
const EMAILOCTOPUS_SCRIPT_SRC = `https://eocampaign1.com/form/${EMAILOCTOPUS_FORM_ID}.js`;

function QuizEmailCapture({ hairTypeLabel, accentColor }: { hairTypeLabel: string; accentColor: string; hairTypeId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove any previously injected widget (e.g. on hot-reload)
    container.innerHTML = "";

    // Inject the <script data-form="..."> tag directly inside our container div.
    // The EmailOctopus widget scans for this tag, inserts the form HTML right
    // after it (parentNode.insertBefore(form, script.nextSibling)), then removes
    // the script tag. Because the script tag is inside our card div, the form
    // HTML ends up inside the card — not appended to <body>.
    const script = document.createElement("script");
    script.src = EMAILOCTOPUS_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-form", EMAILOCTOPUS_FORM_ID);
    container.appendChild(script);

    return () => {
      // Clean up on unmount
      if (container.contains(script)) container.removeChild(script);
    };
  }, []);

  return (
    <div
      className="rounded-xl px-8 py-10 text-center"
      style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`, border: `1.5px solid ${accentColor}33` }}
    >
      <div className="flex justify-center mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}22` }}>
          <Mail size={18} style={{ color: accentColor }} />
        </div>
      </div>
      <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: accentColor, letterSpacing: "0.16em" }}>
        Save Your Results
      </p>
      <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#2C2C2C" }}>
        Get Your {hairTypeLabel} Guide
      </h3>
      <p className="font-body text-sm mb-6 leading-relaxed" style={{ color: "#6B5B6E", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
        We'll email you your personalized hair type profile, top product picks, and weekly expert tips — curated for {hairTypeLabel}.
      </p>
      {/* The EmailOctopus widget injects the form HTML right after the <script> tag
          that we insert into this div via useEffect. */}
      <div ref={containerRef} className="max-w-sm mx-auto" />
      <p className="font-body text-xs mt-3" style={{ color: "#B8A99A" }}>No spam, ever. Unsubscribe at any time.</p>
    </div>
  );
}

// ─── Quiz Questions ────────────────────────────────────────────────────────────

interface Option {
  text: string;
  scores: Partial<Record<HairTypeId, number>>;
}

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  options: Option[];
}

type HairTypeId = "fine" | "thick" | "curly" | "coarse" | "dry" | "normal" | "color-treated";

// ─── localStorage key ────────────────────────────────────────────────────────
export const QUIZ_RESULT_KEY = "pauseandflourish_quiz_result";
export type QuizResultData = { primary: HairTypeId; secondary: HairTypeId; completedAt: string };

const questions: Question[] = [
  {
    id: "strand-thickness",
    question: "How would you describe the thickness of a single strand of your hair?",
    subtitle: "Compare one strand to a piece of thread or hold it up to light.",
    options: [
      { text: "Very thin — almost invisible, like a wisp", scores: { fine: 3 } },
      { text: "Thin but visible", scores: { fine: 2, normal: 1 } },
      { text: "Medium — similar to a thread", scores: { normal: 3 } },
      { text: "Thick and clearly visible", scores: { thick: 2, coarse: 1 } },
      { text: "Very thick and wiry", scores: { coarse: 3, thick: 1 } },
    ],
  },
  {
    id: "curl-pattern",
    question: "What is your natural curl pattern when hair air-dries without any products?",
    options: [
      { text: "Completely straight — no wave at all", scores: { fine: 1, normal: 1 } },
      { text: "Slight wave or bend", scores: { normal: 2, fine: 1 } },
      { text: "Loose waves or soft S-curves", scores: { curly: 1, normal: 1 } },
      { text: "Defined curls or ringlets", scores: { curly: 3 } },
      { text: "Tight coils or very kinky curls", scores: { curly: 2, coarse: 2 } },
    ],
  },
  {
    id: "moisture-feel",
    question: "How does your hair feel a few hours after washing (no products)?",
    options: [
      { text: "Dry and rough — almost straw-like", scores: { dry: 3, coarse: 1 } },
      { text: "Slightly dry, especially at the ends", scores: { dry: 2, normal: 1 } },
      { text: "Balanced — not too dry or oily", scores: { normal: 3 } },
      { text: "Slightly oily at the roots", scores: { fine: 2, normal: 1 } },
      { text: "Oily throughout", scores: { fine: 3 } },
    ],
  },
  {
    id: "volume-density",
    question: "How much hair do you have overall?",
    subtitle: "This is about density — how many strands, not how thick each one is.",
    options: [
      { text: "Very little — my ponytail is thin and wispy", scores: { fine: 3 } },
      { text: "Below average — I can see my scalp easily", scores: { fine: 2, normal: 1 } },
      { text: "Average — a normal amount", scores: { normal: 3 } },
      { text: "Above average — full and voluminous", scores: { thick: 2, normal: 1 } },
      { text: "Very dense — my ponytail is thick and heavy", scores: { thick: 3 } },
    ],
  },
  {
    id: "frizz",
    question: "How does your hair behave in humidity?",
    options: [
      { text: "No change — stays smooth and flat", scores: { fine: 2, normal: 1 } },
      { text: "Slight frizz or puffiness", scores: { normal: 2, dry: 1 } },
      { text: "Noticeable frizz and volume increase", scores: { curly: 2, thick: 1, dry: 1 } },
      { text: "Major frizz — hard to control", scores: { curly: 3, coarse: 2, dry: 1 } },
      { text: "Curls tighten or pattern changes significantly", scores: { curly: 3, coarse: 1 } },
    ],
  },
  {
    id: "dryness",
    question: "How often does your hair feel dry or need moisture?",
    options: [
      { text: "Rarely — my hair stays hydrated naturally", scores: { normal: 3, fine: 1 } },
      { text: "Sometimes — mainly at the ends", scores: { normal: 2, dry: 1 } },
      { text: "Often — I need to moisturize regularly", scores: { dry: 2, coarse: 1 } },
      { text: "Very often — it always feels thirsty", scores: { dry: 3, coarse: 1 } },
      { text: "Constantly — even right after conditioning", scores: { dry: 3, coarse: 2 } },
    ],
  },
  {
    id: "color-treatment",
    question: "Is your hair chemically treated or color-processed?",
    options: [
      { text: "No — completely natural", scores: {} },
      { text: "Highlights or balayage", scores: { "color-treated": 2, dry: 1 } },
      { text: "Full color (box dye or salon)", scores: { "color-treated": 3, dry: 1 } },
      { text: "Bleached or heavily lightened", scores: { "color-treated": 3, dry: 2 } },
      { text: "Permed, relaxed, or chemically straightened", scores: { "color-treated": 2, coarse: 1, dry: 1 } },
    ],
  },
  {
    id: "breakage",
    question: "How prone is your hair to breakage or damage?",
    options: [
      { text: "Very resilient — rarely breaks", scores: { normal: 2, thick: 1 } },
      { text: "Occasionally breaks at the ends", scores: { normal: 1, dry: 1 } },
      { text: "Breaks fairly often, especially when styling", scores: { dry: 2, coarse: 1 } },
      { text: "Very fragile — breaks easily", scores: { dry: 3, fine: 1, "color-treated": 1 } },
      { text: "Extremely fragile — breaks with minimal tension", scores: { dry: 3, "color-treated": 2 } },
    ],
  },
];

// ─── Scoring & Result Logic ────────────────────────────────────────────────────

function calculateResult(answers: Record<string, number>): HairTypeId {
  const scores: Record<HairTypeId, number> = {
    fine: 0, thick: 0, curly: 0, coarse: 0, dry: 0, normal: 0, "color-treated": 0,
  };

  questions.forEach((q) => {
    const answerIndex = answers[q.id];
    if (answerIndex !== undefined) {
      const option = q.options[answerIndex];
      (Object.entries(option.scores) as [HairTypeId, number][]).forEach(([type, score]) => {
        scores[type] += score;
      });
    }
  });

  // Find the top type
  return (Object.entries(scores) as [HairTypeId, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function getTopTwo(answers: Record<string, number>): [HairTypeId, HairTypeId] {
  const scores: Record<HairTypeId, number> = {
    fine: 0, thick: 0, curly: 0, coarse: 0, dry: 0, normal: 0, "color-treated": 0,
  };
  questions.forEach((q) => {
    const answerIndex = answers[q.id];
    if (answerIndex !== undefined) {
      const option = q.options[answerIndex];
      (Object.entries(option.scores) as [HairTypeId, number][]).forEach(([type, score]) => {
        scores[type] += score;
      });
    }
  });
  const sorted = (Object.entries(scores) as [HairTypeId, number][]).sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

// ─── Hair Type Result Data ─────────────────────────────────────────────────────

const resultData: Record<HairTypeId, {
  title: string;
  tagline: string;
  description: string;
  accentColor: string;
  bgColor: string;
  tips: string[];
  avoid: string[];
}> = {
  fine: {
    title: "Fine Hair",
    tagline: "Your hair needs lightweight love — volume without weight.",
    description: "Your strands are naturally thin and can easily become weighed down. The right products add body and volume while keeping hair clean and fresh longer.",
    accentColor: "#D4822A",
    bgColor: "#FFF8F0",
    tips: ["Use lightweight, sulfate-free shampoos", "Apply conditioner only from mid-length to ends", "Choose volumizing serums over heavy oils", "Blow-dry with a round brush for lift"],
    avoid: ["Heavy creams or butters", "Applying conditioner at the roots", "Over-washing, which strips natural oils"],
  },
  thick: {
    title: "Thick Hair",
    tagline: "Your hair has natural power — tame and smooth it with rich formulas.",
    description: "Your hair has abundant density and strand width. It needs rich, moisturizing products that can penetrate deeply and powerful tools to manage its natural volume.",
    accentColor: "#8B1A2F",
    bgColor: "#FFF5F7",
    tips: ["Use rich, moisturizing shampoos and conditioners", "Deep condition weekly", "Apply anti-frizz serums on damp hair", "Use a high-powered dryer to reduce drying time"],
    avoid: ["Lightweight or volumizing formulas", "Skipping deep conditioning", "Low-powered styling tools"],
  },
  curly: {
    title: "Curly Hair",
    tagline: "Your curls crave definition, hydration, and frizz control.",
    description: "Your curl pattern is your greatest asset. The right products enhance definition, lock in moisture, and keep frizz at bay — letting your natural texture shine.",
    accentColor: "#6B4C8A",
    bgColor: "#F8F5FF",
    tips: ["Co-wash or use sulfate-free shampoo", "Apply conditioner generously", "Use a diffuser when blow-drying", "Apply curl creams on soaking wet hair"],
    avoid: ["Sulfate shampoos that strip moisture", "Rough towel-drying", "Brushing dry curls"],
  },
  coarse: {
    title: "Coarse Hair",
    tagline: "Your hair is strong and resilient — it needs intensive moisture to soften.",
    description: "Coarse hair has the widest strand diameter and is often resistant to moisture. Intensive hydration and smoothing treatments are essential to achieve softness and manageability.",
    accentColor: "#5C4033",
    bgColor: "#FFF8F5",
    tips: ["Use intensive moisturizing masks weekly", "Apply leave-in conditioner daily", "Use a wide-tooth comb to detangle", "Seal moisture with a hair oil"],
    avoid: ["Lightweight or clarifying shampoos", "Skipping deep conditioning", "High heat without heat protection"],
  },
  dry: {
    title: "Dry Hair",
    tagline: "Your hair is thirsty — deep hydration is your top priority.",
    description: "Your hair lacks moisture, whether from heat styling, chemical treatments, environmental factors, or natural porosity. Intensive hydrating products will transform its texture and health.",
    accentColor: "#C0762A",
    bgColor: "#FFFAF5",
    tips: ["Use moisturizing, sulfate-free shampoos", "Deep condition every 1–2 weeks", "Apply a leave-in conditioner after every wash", "Use a heat protectant before any heat styling"],
    avoid: ["Sulfate shampoos", "Excessive heat styling", "Skipping conditioner"],
  },
  normal: {
    title: "Normal Hair",
    tagline: "Your hair is balanced — maintain it with quality everyday products.",
    description: "You have the most versatile hair type. Your hair is neither too oily nor too dry, with manageable texture. Focus on maintaining its natural balance with quality products.",
    accentColor: "#4A7C59",
    bgColor: "#F5FFF8",
    tips: ["Use a balanced, gentle shampoo", "Condition regularly to maintain softness", "Use a light serum for shine", "Protect from heat with a lightweight spray"],
    avoid: ["Over-washing", "Heavy, greasy products", "Excessive heat styling"],
  },
  "color-treated": {
    title: "Color-Treated Hair",
    tagline: "Your hair needs color protection and intensive repair.",
    description: "Chemical processing changes your hair's structure, making it more porous and prone to dryness and breakage. Color-safe, bond-building products are essential to maintain vibrancy and health.",
    accentColor: "#7B3F7F",
    bgColor: "#FDF5FF",
    tips: ["Use color-safe, sulfate-free shampoos", "Apply bond-building treatments weekly", "Use a UV-protective serum or spray", "Deep condition every week"],
    avoid: ["Sulfate shampoos that strip color", "Excessive heat without protection", "Skipping bond-building treatments"],
  },
};

// ─── Product Recommendations ───────────────────────────────────────────────────

function getRecommendedProducts(primary: HairTypeId, secondary: HairTypeId) {
  const targetTypes = [primary, secondary, "all"];
  
  // Get products that match the hair type
  const matching = allProducts.filter((p) => {
    if (!p.hairTypes) return false;
    return p.hairTypes.some((ht: string) => targetTypes.includes(ht));
  });

  // Score products: primary match = 3, secondary = 2, "all" = 1
  const scored = matching.map((p) => {
    let score = 0;
    if (p.hairTypes?.includes(primary)) score += 3;
    if (p.hairTypes?.includes(secondary)) score += 2;
    if (p.hairTypes?.includes("all")) score += 1;
    if (p.editorPick) score += 1;
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 6, ensuring category diversity
  const categories = new Set<string>();
  const result = [];
  for (const { product } of scored) {
    if (result.length >= 6) break;
    if (!categories.has(product.categorySlug) || result.length < 3) {
      result.push(product);
      categories.add(product.categorySlug);
    }
  }

  // Fill up to 6 if needed
  if (result.length < 6) {
    for (const { product } of scored) {
      if (result.length >= 6) break;
      if (!result.includes(product)) result.push(product);
    }
  }

  return result.slice(0, 6);
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body text-xs" style={{ color: "#9A7A8A", letterSpacing: "0.08em" }}>
          QUESTION {current} OF {total}
        </span>
        <span className="font-body text-xs font-medium" style={{ color: "#8B1A2F" }}>
          {pct}% complete
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E8DDD0" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: "#8B1A2F" }}
        />
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function QuizProductCard({ product }: { product: typeof allProducts[0] }) {
  const amazonUrl = `https://www.amazon.com/dp/${product.asin}?tag=pauseandflourish-20`;
  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DDD0" }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", backgroundColor: "#F9F4EE" }}>
        <img
          src={product.amazonImageUrl || product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=60";
          }}
        />
        {product.editorPick && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-xs font-body font-semibold rounded"
            style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.06em" }}
          >
            EDITOR'S PICK
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-body text-xs mb-1" style={{ color: "#9A7A8A", letterSpacing: "0.06em" }}>
          {product.category}
        </p>
        <h3 className="font-display text-base font-semibold mb-2 leading-snug" style={{ color: "#2C2C2C" }}>
          {product.name}
        </h3>
        <p className="font-body text-sm mb-3 flex-1 leading-relaxed" style={{ color: "#6B5B6E" }}>
          {product.shortDescription}
        </p>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              size={12}
              fill={s <= Math.round(product.rating || 4.5) ? "#D4822A" : "none"}
              stroke={s <= Math.round(product.rating || 4.5) ? "#D4822A" : "#D4822A"}
            />
          ))}
          <span className="font-body text-xs ml-1" style={{ color: "#9A7A8A" }}>
            {product.rating || "4.5"}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-body font-semibold transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.05em" }}
          >
            View on Amazon <ExternalLink size={11} />
          </a>
          <Link
            href={`/review/${product.slug}`}
            className="flex items-center justify-center py-2 px-3 rounded text-xs font-body font-semibold transition-all duration-200"
            style={{ border: "1px solid #8B1A2F", color: "#8B1A2F", backgroundColor: "transparent" }}
          >
            Review
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Quiz Component ───────────────────────────────────────────────────────

export default function HairQuiz() {
  const [step, setStep] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<HairTypeId | null>(null);
  const [secondary, setSecondary] = useState<HairTypeId | null>(null);
  const [copied, setCopied] = useState(false);

  // Load saved result from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) {
      try {
        const data: QuizResultData = JSON.parse(saved);
        setResult(data.primary);
        setSecondary(data.secondary);
        setStep("results");
      } catch {}
    }
  }, []);

  // Reset selected when question changes
  useEffect(() => {
    setSelected(answers[questions[currentQ]?.id] ?? null);
  }, [currentQ]);

  function handleSelect(index: number) {
    setSelected(index);
  }

  function handleNext() {
    if (selected === null) return;
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(currentQ + 1);
        setAnimating(false);
      }, 200);
    } else {
      // Calculate results
      const [primary, sec] = getTopTwo(newAnswers);
      setResult(primary);
      setSecondary(sec);
      setStep("results");
      // Persist result to localStorage
      const quizSaveData: QuizResultData = { primary, secondary: sec, completedAt: new Date().toISOString() };
      localStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(quizSaveData));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(currentQ - 1);
        setAnimating(false);
      }, 200);
    } else {
      setStep("intro");
    }
  }

  function handleRestart() {
    localStorage.removeItem(QUIZ_RESULT_KEY);
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setResult(null);
    setSecondary(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleShare() {
    if (!result) return;
    const info = resultData[result];
    const url = `${window.location.origin}/hair-quiz`;
    const text = `I just took the PauseAndFlourish Hair Type Quiz and found out I have ${info.title}! ${info.tagline} Take the quiz to find your hair type and get personalized product recommendations.`;
    if (navigator.share) {
      navigator.share({ title: `My Hair Type: ${info.title}`, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }

  const q = questions[currentQ];
  const resultInfo = result ? resultData[result] : null;
  const recommendedProducts = result && secondary ? getRecommendedProducts(result, secondary) : [];

  return (
    <SiteLayout>
      {/* ── Intro Screen ── */}
      {step === "intro" && (
        <div className="min-h-screen" style={{ backgroundColor: "#FDF6EE" }}>
          {/* Hero */}
          <div
            className="relative overflow-hidden py-20 px-6"
            style={{ backgroundColor: "#2C1810", backgroundImage: "linear-gradient(135deg, #2C1810 0%, #8B1A2F 60%, #5C2D44 100%)" }}
          >
            <div className="max-w-2xl mx-auto text-center relative z-10">
              <p
                className="font-body text-xs tracking-widest mb-4 uppercase"
                style={{ color: "#D4822A", letterSpacing: "0.18em" }}
              >
                Personalized Hair Care
              </p>
              <h1
                className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight"
                style={{ color: "#FDF6EE" }}
              >
                Discover Your
                <br />
                <span style={{ color: "#D4822A" }}>Hair Type</span>
              </h1>
              <p className="font-body text-lg mb-10 leading-relaxed" style={{ color: "rgba(253,246,238,0.8)" }}>
                Answer 8 quick questions and we'll identify your hair type and recommend the exact products your hair needs — curated from our expert-tested catalog.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                {[
                  { label: "8 Questions", sub: "Takes about 2 minutes" },
                  { label: "7 Hair Types", sub: "Precise identification" },
                  { label: "6 Products", sub: "Personalized for you" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-2xl font-bold" style={{ color: "#D4822A" }}>{stat.label}</div>
                    <div className="font-body text-xs" style={{ color: "rgba(253,246,238,0.6)", letterSpacing: "0.06em" }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("quiz")}
                className="inline-flex items-center gap-2 px-10 py-4 rounded font-body font-semibold text-base transition-all duration-200 hover:opacity-90 hover:gap-3"
                style={{ backgroundColor: "#D4822A", color: "#FDF6EE", letterSpacing: "0.06em" }}
              >
                Start the Quiz <ChevronRight size={18} />
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: "#D4822A" }} />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: "#FDF6EE" }} />
          </div>

          {/* Hair types preview */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            <p className="font-body text-xs text-center mb-8 tracking-widest uppercase" style={{ color: "#9A7A8A", letterSpacing: "0.14em" }}>
              Which type are you?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(Object.entries(resultData) as [HairTypeId, typeof resultData[HairTypeId]][]).map(([id, data]) => (
                <div
                  key={id}
                  className="p-4 rounded-lg text-center transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: data.bgColor, border: `1px solid ${data.accentColor}22` }}
                >
                  <div className="font-display text-sm font-semibold mb-1" style={{ color: data.accentColor }}>
                    {data.title}
                  </div>
                  <div className="font-body text-xs leading-snug" style={{ color: "#6B5B6E" }}>
                    {data.tagline.split(" — ")[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz Screen ── */}
      {step === "quiz" && (
        <div className="min-h-screen py-12 px-6" style={{ backgroundColor: "#FDF6EE" }}>
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-10">
              <ProgressBar current={currentQ + 1} total={questions.length} />
            </div>

            {/* Question card */}
            <div
              className={`rounded-xl p-8 mb-6 transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DDD0", boxShadow: "0 4px 24px rgba(44,24,16,0.06)" }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 leading-snug" style={{ color: "#2C2C2C" }}>
                {q.question}
              </h2>
              {q.subtitle && (
                <p className="font-body text-sm mb-6 italic" style={{ color: "#9A7A8A" }}>
                  {q.subtitle}
                </p>
              )}
              {!q.subtitle && <div className="mb-6" />}

              <div className="flex flex-col gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className="w-full text-left px-5 py-4 rounded-lg font-body text-sm transition-all duration-150"
                    style={{
                      border: selected === i ? "2px solid #8B1A2F" : "1.5px solid #E8DDD0",
                      backgroundColor: selected === i ? "#FFF5F7" : "#FDFAF7",
                      color: selected === i ? "#8B1A2F" : "#2C2C2C",
                      fontWeight: selected === i ? "600" : "400",
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: selected === i ? "#8B1A2F" : "#E8DDD0",
                        color: selected === i ? "#FDF6EE" : "#6B5B6E",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded font-body text-sm transition-all duration-150 hover:opacity-80"
                style={{ border: "1px solid #E8DDD0", color: "#6B5B6E", backgroundColor: "transparent" }}
              >
                <ChevronLeft size={16} />
                {currentQ === 0 ? "Back to Intro" : "Previous"}
              </button>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="flex items-center gap-2 px-7 py-2.5 rounded font-body font-semibold text-sm transition-all duration-150"
                style={{
                  backgroundColor: selected !== null ? "#8B1A2F" : "#E8DDD0",
                  color: selected !== null ? "#FDF6EE" : "#9A7A8A",
                  cursor: selected !== null ? "pointer" : "not-allowed",
                  letterSpacing: "0.05em",
                }}
              >
                {currentQ === questions.length - 1 ? "See My Results" : "Next Question"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results Screen ── */}
      {step === "results" && resultInfo && result && (
        <div style={{ backgroundColor: "#FDF6EE" }}>
          {/* Result hero */}
          <div
            className="py-16 px-6 text-center"
            style={{
              backgroundColor: resultInfo.bgColor,
              borderBottom: `3px solid ${resultInfo.accentColor}33`,
            }}
          >
            <div className="max-w-2xl mx-auto">
              <p
                className="font-body text-xs tracking-widest uppercase mb-3"
                style={{ color: resultInfo.accentColor, letterSpacing: "0.18em" }}
              >
                Your Hair Type
              </p>
              <h1
                className="font-display text-5xl md:text-6xl font-bold mb-4"
                style={{ color: resultInfo.accentColor }}
              >
                {resultInfo.title}
              </h1>
              <p className="font-display text-xl md:text-2xl mb-6 italic" style={{ color: "#2C2C2C" }}>
                "{resultInfo.tagline}"
              </p>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "#4A3A4A", maxWidth: "560px", margin: "0 auto 2rem" }}>
                {resultInfo.description}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/hair-type/${result}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-body font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: resultInfo.accentColor, color: "#FDF6EE", letterSpacing: "0.05em" }}
                >
                  Explore {resultInfo.title} Guide <ChevronRight size={15} />
                </Link>
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-body font-semibold text-sm transition-all duration-200 hover:opacity-80"
                  style={{ border: `1.5px solid ${resultInfo.accentColor}`, color: resultInfo.accentColor, backgroundColor: "transparent" }}
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded font-body font-semibold text-sm transition-all duration-200 hover:opacity-80"
                  style={{ border: `1.5px solid ${resultInfo.accentColor}44`, color: resultInfo.accentColor, backgroundColor: `${resultInfo.accentColor}11` }}
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share Results</>}
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(QUIZ_RESULT_KEY);
                    handleRestart();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded font-body text-sm transition-all duration-200 hover:opacity-80"
                  style={{ border: "1.5px solid #E8DDD0", color: "#8C8C8C", backgroundColor: "transparent" }}
                  title="Remove your saved hair profile and start fresh"
                >
                  <Trash2 size={13} /> Clear My Profile
                </button>
              </div>
            </div>
          </div>

          {/* Tips & Avoid */}
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-2 gap-6 mb-14">
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: "#FFFFFF", border: `1px solid ${resultInfo.accentColor}33` }}
              >
                <h3 className="font-display text-lg font-bold mb-4" style={{ color: resultInfo.accentColor }}>
                  What Works for Your Hair
                </h3>
                <ul className="space-y-2">
                  {resultInfo.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm" style={{ color: "#4A3A4A" }}>
                      <span className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: resultInfo.accentColor, color: "#FDF6EE" }}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DDD0" }}
              >
                <h3 className="font-display text-lg font-bold mb-4" style={{ color: "#6B5B6E" }}>
                  What to Avoid
                </h3>
                <ul className="space-y-2">
                  {resultInfo.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm" style={{ color: "#4A3A4A" }}>
                      <span className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#E8DDD0", color: "#6B5B6E" }}>✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Product Recommendations */}
            <div>
              <div className="text-center mb-8">
                <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: "#9A7A8A", letterSpacing: "0.14em" }}>
                  Curated for {resultInfo.title}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "#2C2C2C" }}>
                  Your Recommended Products
                </h2>
                <p className="font-body text-sm mt-2" style={{ color: "#9A7A8A" }}>
                  Expert-tested picks matched to your specific hair needs
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendedProducts.map((product) => (
                  <QuizProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  href={`/hair-type/${result}`}
                  className="inline-flex items-center gap-2 font-body text-sm font-semibold transition-all duration-200 hover:gap-3"
                  style={{ color: resultInfo.accentColor }}
                >
                  See all products for {resultInfo.title} <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Email capture */}
            <div className="mt-12 mb-4">
              <QuizEmailCapture hairTypeLabel={resultInfo.title} accentColor={resultInfo.accentColor} hairTypeId={result!} />
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
