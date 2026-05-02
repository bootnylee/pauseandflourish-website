// PauseAndFlourish.com — Menopause Stage Page
// Displays products, symptoms, and guidance for a specific menopause stage

import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { allProducts } from "@/lib/products";
import { menopauseStages } from "@/lib/menopauseStages";
import { updateDocumentMeta } from "@/lib/seo";

export default function MenopauseStagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<"default" | "rating" | "price-asc" | "price-desc">("default");

  const stage = menopauseStages.find((s) => s.slug === slug);

  useEffect(() => {
    if (!stage) return;
    updateDocumentMeta({
      title: `${stage.name} Products & Guide | PauseAndFlourish`,
      description: `Expert-reviewed products and guidance for ${stage.name}. ${stage.description}`,
      keywords: `${stage.name.toLowerCase()} products, ${stage.name.toLowerCase()} supplements, menopause ${stage.slug} guide`,
      canonical: `https://www.pauseandflourish.com/stage/${stage.slug}`,
    });
  }, [stage]);

  if (!stage) {
    return (
      <SiteLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display font-bold text-3xl mb-4" style={{ color: "#2C2C2C" }}>Stage Not Found</h1>
          <p className="font-body text-base mb-8" style={{ color: "#5C5C5C" }}>We couldn't find that menopause stage. Try taking our quiz to find yours.</p>
          <Link href="/quiz">
            <button className="font-label font-semibold px-6 py-3 rounded-sm" style={{ backgroundColor: "#2D7D6F", color: "#FAF7F4", letterSpacing: "0.08em", textTransform: "uppercase" }}>Take the Quiz</button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const stageProducts = allProducts.filter((p) => p.stages.includes(stage.slug));

  const sorted = [...stageProducts].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return (b.editorPick ? 1 : 0) - (a.editorPick ? 1 : 0);
  });

  const otherStages = menopauseStages.filter((s) => s.slug !== stage.slug);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-14" style={{ backgroundColor: stage.bg }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-xs font-label" style={{ color: "#8C8C8C" }}>
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <span>Menopause Stages</span>
            <ChevronRight size={12} />
            <span style={{ color: stage.color }}>{stage.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{stage.icon}</span>
                <div>
                  <p className="font-label font-semibold text-xs mb-1" style={{ color: stage.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>Menopause Stage Guide</p>
                  <h1 className="font-display font-bold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#2C2C2C" }}>{stage.name}</h1>
                </div>
              </div>
              <p className="font-body text-sm mb-2" style={{ color: "#8C8C8C" }}>Typical age range: <strong style={{ color: "#2C2C2C" }}>{stage.ageRange}</strong></p>
              <p className="font-body text-base leading-relaxed mb-6" style={{ color: "#5C5C5C" }}>{stage.description}</p>
              <Link href="/quiz">
                <button className="font-label font-semibold text-xs px-5 py-3 rounded-sm border transition-colors" style={{ color: stage.color, borderColor: stage.color, backgroundColor: "transparent", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Not sure this is your stage? Take the quiz
                </button>
              </Link>
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-sm p-6 border" style={{ borderColor: `${stage.color}33` }}>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: "1.1rem", color: "#2C2C2C" }}>Common Symptoms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stage.symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="font-body text-sm" style={{ color: "#5C5C5C" }}>{symptom}</span>
                  </div>
                ))}
              </div>
              {stage.keyFocus && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E8DDD0" }}>
                  <p className="font-label font-semibold text-xs mb-2" style={{ color: stage.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>Key Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {stage.keyFocus.map((focus) => (
                      <span key={focus} className="font-body text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${stage.color}15`, color: stage.color }}>{focus}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-14">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="section-label mb-1">Curated for {stage.name}</p>
              <h2 className="font-display font-bold" style={{ fontSize: "1.8rem", color: "#2C2C2C" }}>
                {sorted.length} Recommended Product{sorted.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-label text-xs" style={{ color: "#8C8C8C", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="font-body text-sm border rounded-sm px-3 py-1.5"
                style={{ borderColor: "#E8DDD0", color: "#2C2C2C", backgroundColor: "#FAF7F4" }}
              >
                <option value="default">Editor's Choice</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display font-bold text-xl mb-3" style={{ color: "#2C2C2C" }}>No products yet for this stage</p>
              <p className="font-body text-sm mb-6" style={{ color: "#8C8C8C" }}>We're adding more reviews regularly. Check back soon.</p>
              <Link href="/reviews">
                <button className="font-label font-semibold text-xs px-5 py-3 rounded-sm" style={{ backgroundColor: "#2D7D6F", color: "#FAF7F4", letterSpacing: "0.08em", textTransform: "uppercase" }}>Browse All Reviews</button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Other Stages */}
      <section className="py-12 border-t" style={{ borderColor: "#E8DDD0", backgroundColor: "#F5F0EA" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold" style={{ fontSize: "1.4rem", color: "#2C2C2C" }}>Explore Other Stages</h2>
            <Link href="/quiz">
              <button className="font-label font-semibold text-xs flex items-center gap-1" style={{ color: "#2D7D6F", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Find My Stage <ArrowRight size={13} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {otherStages.map((s) => (
              <Link key={s.id} href={`/stage/${s.slug}`}>
                <div className="p-4 rounded-sm cursor-pointer transition-all hover:shadow-md border" style={{ backgroundColor: s.bg, borderColor: `${s.color}33` }}>
                  <span className="text-xl mb-2 block">{s.icon}</span>
                  <p className="font-display font-semibold text-sm leading-tight" style={{ color: "#2C2C2C" }}>{s.name}</p>
                  <p className="font-body text-xs mt-1" style={{ color: "#8C8C8C" }}>{s.ageRange}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup variant="inline" />
    </SiteLayout>
  );
}
