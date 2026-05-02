// PauseAndFlourish.com — Menopause Stage Quiz
// 8-question quiz that identifies the user's menopause stage and saves to localStorage

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/lib/products";
import { menopauseStages } from "@/lib/menopauseStages";
import { updateDocumentMeta } from "@/lib/seo";

export const QUIZ_RESULT_KEY = "paf_quiz_result";

interface QuizQuestion {
  id: string;
  question: string;
  subtext?: string;
  options: { value: string; label: string; description?: string }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "periods",
    question: "How would you describe your menstrual cycle right now?",
    subtext: "This is the single most important indicator of your stage.",
    options: [
      { value: "regular", label: "Regular and predictable", description: "Cycles within 21–35 days, consistent" },
      { value: "irregular", label: "Irregular or unpredictable", description: "Cycles varying by 7+ days, skipping occasionally" },
      { value: "rare", label: "Rare — only a few per year", description: "Less than 4 periods in the past 12 months" },
      { value: "none-recent", label: "None in the past 3–11 months", description: "Approaching the 12-month mark" },
      { value: "none-year", label: "None for 12+ months", description: "Officially in menopause or postmenopause" },
    ],
  },
  {
    id: "hot_flashes",
    question: "How often do you experience hot flashes or night sweats?",
    options: [
      { value: "never", label: "Rarely or never" },
      { value: "mild", label: "Occasionally — a few times a week" },
      { value: "moderate", label: "Daily — manageable but noticeable" },
      { value: "severe", label: "Multiple times daily — significantly disruptive" },
      { value: "improving", label: "They were severe but are now improving" },
    ],
  },
  {
    id: "sleep",
    question: "How is your sleep quality?",
    options: [
      { value: "good", label: "Generally good — I sleep through the night" },
      { value: "mild", label: "Occasionally disrupted — I wake up sometimes" },
      { value: "moderate", label: "Frequently disrupted — night sweats or anxiety wake me" },
      { value: "poor", label: "Poor — I struggle to fall or stay asleep most nights" },
    ],
  },
  {
    id: "mood",
    question: "Have you noticed changes in your mood or emotional wellbeing?",
    options: [
      { value: "none", label: "No significant changes" },
      { value: "mild", label: "Mild — slightly more irritable or anxious than usual" },
      { value: "moderate", label: "Moderate — noticeable mood swings, anxiety, or low mood" },
      { value: "severe", label: "Significant — mood changes are affecting my daily life" },
    ],
  },
  {
    id: "brain_fog",
    question: "Are you experiencing brain fog, memory issues, or difficulty concentrating?",
    options: [
      { value: "none", label: "Not really — my cognition feels normal" },
      { value: "mild", label: "Occasionally — I forget things more than I used to" },
      { value: "moderate", label: "Regularly — brain fog is a daily frustration" },
      { value: "severe", label: "Significantly — it's affecting my work or relationships" },
    ],
  },
  {
    id: "vaginal",
    question: "Are you experiencing vaginal dryness or changes in intimate comfort?",
    options: [
      { value: "none", label: "No — no changes in this area" },
      { value: "mild", label: "Mild — occasional dryness or discomfort" },
      { value: "moderate", label: "Moderate — noticeable dryness affecting daily comfort" },
      { value: "significant", label: "Significant — affecting intimacy and daily life" },
    ],
  },
  {
    id: "skin_hair",
    question: "Have you noticed changes in your skin, hair, or nails?",
    options: [
      { value: "none", label: "No significant changes" },
      { value: "mild", label: "Mild — slightly drier skin or some hair thinning" },
      { value: "moderate", label: "Moderate — noticeable skin thinning, hair loss, or brittle nails" },
      { value: "significant", label: "Significant — these changes are bothering me" },
    ],
  },
  {
    id: "age",
    question: "What is your current age range?",
    subtext: "This helps calibrate your stage alongside your symptoms.",
    options: [
      { value: "under-40", label: "Under 40" },
      { value: "40-44", label: "40–44" },
      { value: "45-49", label: "45–49" },
      { value: "50-54", label: "50–54" },
      { value: "55-59", label: "55–59" },
      { value: "60-plus", label: "60 or older" },
    ],
  },
];

function calculateStage(answers: Record<string, string>): string {
  const periods = answers.periods;
  const age = answers.age;

  // Primary determination: period status
  if (periods === "none-year") {
    // Postmenopause — distinguish by age and symptoms
    if (age === "55-59" || age === "60-plus") return "late-postmenopause";
    return "early-postmenopause";
  }

  if (periods === "none-recent") return "active-menopause";

  if (periods === "rare") {
    // Late perimenopause
    return "late-perimenopause";
  }

  if (periods === "irregular") {
    // Early or late perimenopause based on symptoms
    const hotFlashes = answers.hot_flashes;
    const sleep = answers.sleep;
    if (hotFlashes === "severe" || hotFlashes === "moderate" || sleep === "poor") {
      return "late-perimenopause";
    }
    return "early-perimenopause";
  }

  // Regular periods — early perimenopause if symptoms present, otherwise too early
  const hasSymptoms = answers.hot_flashes !== "never" || answers.mood !== "none" || answers.brain_fog !== "none";
  if (hasSymptoms && (age === "40-44" || age === "45-49" || age === "50-54")) {
    return "early-perimenopause";
  }

  return "early-perimenopause";
}

const STAGE_RESULTS: Record<string, { title: string; description: string; color: string; bg: string; icon: string }> = {
  "early-perimenopause": {
    title: "Early Perimenopause",
    description: "You're in the early stages of the transition. Your hormones are beginning to shift, and you may notice subtle changes in your cycle, mood, and energy. This is the perfect time to build a strong foundation with targeted supplements and lifestyle strategies.",
    color: "#2D7D6F",
    bg: "#E8F5F2",
    icon: "🌱",
  },
  "late-perimenopause": {
    title: "Late Perimenopause",
    description: "You're in the most symptomatic phase of the transition. Hot flashes, sleep disruption, and mood changes are common at this stage. The good news: there are excellent evidence-based products and strategies that can significantly improve your quality of life.",
    color: "#5B4A8A",
    bg: "#F0ECFF",
    icon: "🌊",
  },
  "active-menopause": {
    title: "Active Menopause",
    description: "You're approaching or have reached the official menopause milestone (12 months without a period). You're managing the full range of symptoms while your body completes its hormonal transition. Targeted support now sets the stage for a healthy postmenopause.",
    color: "#1A6B8A",
    bg: "#E8F4FA",
    icon: "⚡",
  },
  "early-postmenopause": {
    title: "Early Postmenopause",
    description: "You've passed the 12-month mark and are in early postmenopause. Many symptoms begin to stabilize, but long-term health priorities — bone density, cardiovascular health, vaginal health, and cognitive function — become increasingly important.",
    color: "#7A5C1E",
    bg: "#FFF8E7",
    icon: "🌅",
  },
  "late-postmenopause": {
    title: "Late Postmenopause",
    description: "You're well into postmenopause and thriving in your next chapter. The focus now is on longevity, vitality, and maintaining the health gains you've built. Bone health, cognitive support, and cardiovascular wellness are your key priorities.",
    color: "#2C6B2F",
    bg: "#EDFAEE",
    icon: "🌟",
  },
};

export default function MenopauseQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    updateDocumentMeta({
      title: "Menopause Stage Quiz — Find Your Stage | PauseAndFlourish",
      description: "Take our 8-question quiz to identify your menopause or perimenopause stage and get personalized product recommendations.",
      canonical: "https://www.pauseandflourish.com/quiz",
    });
  }, []);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion) / QUESTIONS.length) * 100;

  function handleSelect(value: string) {
    setSelectedOption(value);
  }

  function handleNext() {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [question.id]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion === QUESTIONS.length - 1) {
      const stage = calculateStage(newAnswers);
      setResult(stage);
      const topProducts = allProducts.filter(p => p.stages.includes(stage)).slice(0, 3).map(p => p.slug);
      localStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify({ stage, topProducts, completedAt: new Date().toISOString() }));
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[QUESTIONS[currentQuestion - 1].id] || null);
    }
  }

  function handleRetake() {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setSelectedOption(null);
    localStorage.removeItem(QUIZ_RESULT_KEY);
  }

  // Results screen
  if (result) {
    const stageResult = STAGE_RESULTS[result];
    const recommendedProducts = allProducts.filter(p => p.stages.includes(result)).slice(0, 4);
    const stageData = menopauseStages.find(s => s.slug === result);

    return (
      <SiteLayout>
        <div className="min-h-screen" style={{ backgroundColor: stageResult.bg }}>
          <div className="container max-w-3xl py-16">
            {/* Result Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle size={20} style={{ color: stageResult.color }} />
                <p className="font-label font-semibold text-xs" style={{ color: stageResult.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>Your Quiz Result</p>
              </div>
              <span className="text-5xl mb-4 block">{stageResult.icon}</span>
              <h1 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#2C2C2C" }}>
                You're in {stageResult.title}
              </h1>
              <p className="font-body text-base leading-relaxed" style={{ color: "#5C5C5C", maxWidth: "560px", margin: "0 auto" }}>
                {stageResult.description}
              </p>
            </div>

            {/* Key Symptoms for this stage */}
            {stageData && (
              <div className="bg-white rounded-sm p-6 mb-8 border" style={{ borderColor: `${stageResult.color}33` }}>
                <h2 className="font-display font-bold mb-4" style={{ fontSize: "1.3rem", color: "#2C2C2C" }}>Common Symptoms at This Stage</h2>
                <div className="grid grid-cols-2 gap-2">
                  {stageData.primarySymptoms.map(symptom => (
                    <div key={symptom} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stageResult.color }} />
                      <span className="font-body text-sm" style={{ color: "#5C5C5C" }}>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold mb-6" style={{ fontSize: "1.5rem", color: "#2C2C2C" }}>
                  Recommended for {stageResult.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} variant="default" />
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stage/${result}`}>
                <button className="font-label font-semibold px-8 py-4 rounded-sm transition-colors" style={{ backgroundColor: stageResult.color, color: "#FDF8F4", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  View Full Stage Guide <ArrowRight size={16} className="inline ml-2" />
                </button>
              </Link>
              <button onClick={handleRetake} className="font-label font-semibold px-8 py-4 rounded-sm transition-colors border" style={{ color: stageResult.color, borderColor: stageResult.color, backgroundColor: "transparent", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // Quiz screen
  return (
    <SiteLayout>
      <div className="min-h-screen" style={{ backgroundColor: "#FDF8F4" }}>
        <div className="container max-w-2xl py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="font-label text-xs" style={{ color: "#8C8C8C", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </p>
              <p className="font-label text-xs" style={{ color: "#2D7D6F" }}>{Math.round(progress)}% complete</p>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#D4EBE7" }}>
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "#2D7D6F" }} />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "#2C2C2C" }}>
              {question.question}
            </h1>
            {question.subtext && (
              <p className="font-body text-sm" style={{ color: "#8C8C8C" }}>{question.subtext}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map(option => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full text-left p-4 rounded-sm border-2 transition-all"
                style={{
                  borderColor: selectedOption === option.value ? "#2D7D6F" : "#D4EBE7",
                  backgroundColor: selectedOption === option.value ? "#E8F5F2" : "#FFFFFF",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: selectedOption === option.value ? "#2D7D6F" : "#B8A99A" }}>
                    {selectedOption === option.value && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#2D7D6F" }} />}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm" style={{ color: "#2C2C2C" }}>{option.label}</p>
                    {option.description && <p className="font-body text-xs mt-0.5" style={{ color: "#8C8C8C" }}>{option.description}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 font-label font-semibold text-sm px-4 py-2 rounded-sm transition-colors disabled:opacity-30"
              style={{ color: "#5C5C5C" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="flex items-center gap-2 font-label font-semibold text-sm px-6 py-3 rounded-sm transition-colors disabled:opacity-40"
              style={{ backgroundColor: selectedOption ? "#2D7D6F" : "#B8A99A", color: "#FDF8F4", letterSpacing: "0.06em" }}
            >
              {currentQuestion === QUESTIONS.length - 1 ? "See My Results" : "Next"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
