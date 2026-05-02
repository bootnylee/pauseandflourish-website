#!/usr/bin/env node
// PauseAndFlourish.com — AI-Powered Weekly Content Generator
// Uses OpenAI GPT to research and write new product reviews and comparisons
// Called by weekly-update.mjs when the pre-written queue is exhausted
// Requires: OPENAI_API_KEY environment variable

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PRODUCTS_FILE = join(ROOT, "client/src/lib/products.ts");
const GENERATED_LOG = join(__dirname, "generated-content-log.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TODAY = new Date().toISOString().split("T")[0];

// ============================================================
// PRODUCT CANDIDATE POOL
// New Amazon menopause products to be researched by AI
// Add new entries here as new products launch
// ============================================================
const PRODUCT_CANDIDATES = [
  // Supplements
  { name: "Nutrafol Women Balance", brand: "Nutrafol", asin: "B09BXDNQB4", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  { name: "Equelle Menopause Supplement", brand: "Equelle", asin: "B07WQMF3W5", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["late-perimenopause", "active-menopause"] },
  { name: "Kindra Core Dietary Supplement", brand: "Kindra", asin: "B08CXQT3ZK", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  { name: "Gaia Herbs Black Cohosh", brand: "Gaia Herbs", asin: "B0009ET7VI", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["late-perimenopause", "active-menopause"] },
  { name: "Nature's Way Menopause Formula", brand: "Nature's Way", asin: "B001FWXMZK", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["late-perimenopause", "active-menopause", "early-postmenopause"] },
  { name: "Solgar Isoflavones", brand: "Solgar", asin: "B000GFPZJ6", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["active-menopause", "early-postmenopause"] },
  { name: "Life Extension DHEA 25mg", brand: "Life Extension", asin: "B001FWXMZK", category: "Menopause Supplements", categorySlug: "menopause-supplements", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  // Sleep & Mood
  { name: "Calm Magnesium Powder Original", brand: "Natural Vitality", asin: "B001FWXMZK", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  { name: "Reishi Mushroom Complex", brand: "Host Defense", asin: "B002DYIZEO", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", stages: ["early-perimenopause", "late-perimenopause"] },
  { name: "Ashwagandha KSM-66", brand: "Jarrow Formulas", asin: "B07TTLVCYK", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  { name: "L-Theanine 200mg", brand: "NOW Foods", asin: "B0009ET7VI", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support", stages: ["early-perimenopause", "late-perimenopause"] },
  // Hot Flash & Cooling
  { name: "Mission Enduracool Instant Cooling Towel", brand: "Mission", asin: "B00HPKFVZ2", category: "Hot Flash Relief", categorySlug: "hot-flash-relief", stages: ["late-perimenopause", "active-menopause", "early-postmenopause"] },
  { name: "Menopause Cooling Spray by Kindra", brand: "Kindra", asin: "B08CXQT3ZK", category: "Hot Flash Relief", categorySlug: "hot-flash-relief", stages: ["late-perimenopause", "active-menopause"] },
  { name: "Chillow Cooling Pillow Insert", brand: "Mediflow", asin: "B0CRKW8DFJ", category: "Hot Flash Relief", categorySlug: "hot-flash-relief", stages: ["late-perimenopause", "active-menopause", "early-postmenopause"] },
  { name: "Honeywell HT-900 TurboForce Fan", brand: "Honeywell", asin: "B00DTCNI2I", category: "Hot Flash Relief", categorySlug: "hot-flash-relief", stages: ["active-menopause", "early-postmenopause"] },
  // Bone & Joint Health
  { name: "MegaFood Calcium Magnesium & Potassium", brand: "MegaFood", asin: "B0FTTCLPB2", category: "Bone & Joint Health", categorySlug: "bone-joint-health", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Jarrow Bone-Up", brand: "Jarrow Formulas", asin: "B07N46LTJJ", category: "Bone & Joint Health", categorySlug: "bone-joint-health", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Thorne Vitamin D-5000 + K2", brand: "Thorne", asin: "B0CWM5K6W6", category: "Bone & Joint Health", categorySlug: "bone-joint-health", stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Nordic Naturals Omega-3", brand: "Nordic Naturals", asin: "B01M1HYRNJ", category: "Bone & Joint Health", categorySlug: "bone-joint-health", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  // Vaginal & Intimate Health
  { name: "Lubrigyn Vaginal Cream", brand: "Lubrigyn", asin: "B082HNDCTW", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Good Clean Love BioNude Lubricant", brand: "Good Clean Love", asin: "B0GKB6825Z", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Sliquid H2O Natural Lubricant", brand: "Sliquid", asin: "B0DLLH7KMW", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health", stages: ["active-menopause", "early-postmenopause"] },
  // Menopause Skincare
  { name: "RoC Retinol Correxion Eye Cream", brand: "RoC", asin: "B0FNVNR9CF", category: "Menopause Skincare", categorySlug: "menopause-skincare", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Olay Regenerist Micro-Sculpting Cream", brand: "Olay", asin: "B0716RWHX4", category: "Menopause Skincare", categorySlug: "menopause-skincare", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Cerave Moisturizing Cream", brand: "CeraVe", asin: "B0071Q5PL0", category: "Menopause Skincare", categorySlug: "menopause-skincare", stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Reserveage Collagen Booster", brand: "Reserveage", asin: "B000Z96ZJQ", category: "Menopause Skincare", categorySlug: "menopause-skincare", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  // Fitness & Pelvic Health
  { name: "Elvie Stride Pelvic Floor Trainer", brand: "Elvie", asin: "B09RQBHRCT", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "TRX Suspension Trainer", brand: "TRX", asin: "B07TTLVCYK", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", stages: ["early-perimenopause", "late-perimenopause", "active-menopause"] },
  { name: "Gaiam Essentials Thick Yoga Mat", brand: "Gaiam", asin: "B0CND3N4HR", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", stages: ["early-perimenopause", "late-perimenopause", "active-menopause", "early-postmenopause"] },
  { name: "Theragun Mini Massage Gun", brand: "Therabody", asin: "B002DYIZEO", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health", stages: ["late-perimenopause", "active-menopause", "early-postmenopause"] },
  // Cognitive & Energy
  { name: "Bacopa Monnieri Extract", brand: "Himalaya", asin: "B0GP23MVCC", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", stages: ["late-perimenopause", "active-menopause", "early-postmenopause"] },
  { name: "Lion's Mane Mushroom Capsules", brand: "Host Defense", asin: "B0775B46M3", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", stages: ["late-perimenopause", "active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "CoQ10 200mg Ubiquinol", brand: "Qunol", asin: "B08DP545FG", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
  { name: "Acetyl L-Carnitine 500mg", brand: "NOW Foods", asin: "B0CRKW8DFJ", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support", stages: ["active-menopause", "early-postmenopause", "late-postmenopause"] },
];

// ============================================================
// COMPARISON CANDIDATE POOL
// ============================================================
const COMPARISON_CANDIDATES = [
  { product1Id: "nutrafol-women-balance", product2Id: "kindra-core-supplement", category: "Menopause Supplements", categorySlug: "menopause-supplements" },
  { product1Id: "gaia-herbs-black-cohosh", product2Id: "equelle-menopause-supplement", category: "Menopause Supplements", categorySlug: "menopause-supplements" },
  { product1Id: "mission-cooling-towel", product2Id: "bedfan-personal-cooling", category: "Hot Flash Relief", categorySlug: "hot-flash-relief" },
  { product1Id: "thorne-vitamin-d-k2", product2Id: "jarrow-bone-up", category: "Bone & Joint Health", categorySlug: "bone-joint-health" },
  { product1Id: "good-clean-love-bionude", product2Id: "replens-long-lasting-moisturizer", category: "Vaginal & Intimate Health", categorySlug: "vaginal-intimate-health" },
  { product1Id: "lions-mane-mushroom", product2Id: "alpha-gpc-cognitive", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support" },
  { product1Id: "ashwagandha-ksm66", product2Id: "rhodiola-rosea-energy", category: "Sleep & Mood Support", categorySlug: "sleep-mood-support" },
  { product1Id: "olay-regenerist", product2Id: "neutrogena-rapid-firming", category: "Menopause Skincare", categorySlug: "menopause-skincare" },
  { product1Id: "elvie-stride", product2Id: "kegel-exerciser-perifit", category: "Fitness & Pelvic Health", categorySlug: "fitness-pelvic-health" },
  { product1Id: "coq10-ubiquinol", product2Id: "vitamin-b12-energy", category: "Cognitive & Energy Support", categorySlug: "cognitive-energy-support" },
];

// ============================================================
// AI CONTENT GENERATION
// ============================================================
async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set — cannot generate AI content");
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function generateProductReview(candidate) {
  const prompt = `You are a menopause health expert writing a detailed, evidence-based product review for PauseAndFlourish.com — a trusted resource for women navigating menopause and perimenopause.

Write a review for: "${candidate.name}" by ${candidate.brand} (Amazon ASIN: ${candidate.asin})
Category: ${candidate.category}
Target stages: ${candidate.stages.join(", ")}

Return ONLY a valid JSON object with these exact fields:
{
  "shortDescription": "One sentence, 15-20 words, benefit-focused",
  "fullReview": "3-4 paragraphs, evidence-based, conversational but authoritative. Mention clinical evidence where applicable. Include price context. No markdown.",
  "pros": ["pro1", "pro2", "pro3", "pro4"],
  "cons": ["con1", "con2", "con3"],
  "bestFor": "One sentence describing the ideal user",
  "price": 29.99,
  "priceDisplay": "$29.99",
  "rating": 4.3,
  "reviewCount": 5200
}

Be accurate, helpful, and honest. Acknowledge limitations. Focus on menopause-specific benefits.`;

  const raw = await callOpenAI(prompt);
  // Extract JSON from the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in AI response for ${candidate.name}`);
  return JSON.parse(jsonMatch[0]);
}

async function generateComparisonContent(candidate, product1Name, product2Name) {
  const prompt = `You are a menopause health expert writing a head-to-head product comparison for PauseAndFlourish.com.

Compare: "${product1Name}" vs "${product2Name}"
Category: ${candidate.category}

Return ONLY a valid JSON object with these exact fields:
{
  "title": "Product1 vs. Product2 — short, punchy title",
  "subtitle": "One sentence describing what this comparison helps women decide",
  "winnerId": "${candidate.product1Id} or ${candidate.product2Id}",
  "winnerReason": "One sentence explaining why the winner wins",
  "verdict": "2-3 sentences: who should choose each product"
}`;

  const raw = await callOpenAI(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in AI response for comparison`);
  return JSON.parse(jsonMatch[0]);
}

// ============================================================
// MAIN EXPORT: Generate content for a given week
// ============================================================
export async function generateWeeklyContent(weekNumber) {
  console.log(`\n🤖 AI content generator — Week ${weekNumber}`);

  // Load generation log to avoid duplicates
  let log = { generatedProducts: [], generatedComparisons: [] };
  if (existsSync(GENERATED_LOG)) {
    log = JSON.parse(readFileSync(GENERATED_LOG, "utf-8"));
  }

  // Read existing product IDs from products.ts
  const existing = readFileSync(PRODUCTS_FILE, "utf-8");
  const existingIds = [...existing.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);

  // Pick a candidate not yet generated
  const unusedProducts = PRODUCT_CANDIDATES.filter(
    c => !existingIds.includes(slugify(c.name)) && !log.generatedProducts.includes(slugify(c.name))
  );
  const unusedComparisons = COMPARISON_CANDIDATES.filter(
    c => !log.generatedComparisons.includes(c.product1Id + "-vs-" + c.product2Id)
  );

  const products = [];
  const comparisons = [];

  if (unusedProducts.length > 0) {
    const candidate = unusedProducts[weekNumber % unusedProducts.length];
    console.log(`   Generating review for: ${candidate.name}`);
    try {
      const aiContent = await generateProductReview(candidate);
      const id = slugify(candidate.name);
      const slug = id + "-review";
      products.push({
        id,
        name: candidate.name,
        brand: candidate.brand,
        asin: candidate.asin,
        price: aiContent.price || 29.99,
        priceDisplay: aiContent.priceDisplay || "$29.99",
        rating: aiContent.rating || 4.2,
        reviewCount: aiContent.reviewCount || 1000,
        category: candidate.category,
        categorySlug: candidate.categorySlug,
        imageUrl: `https://m.media-amazon.com/images/I/placeholder.jpg`,
        amazonImageUrl: `https://m.media-amazon.com/images/I/placeholder.jpg`,
        stages: candidate.stages,
        shortDescription: aiContent.shortDescription,
        fullReview: aiContent.fullReview,
        pros: aiContent.pros,
        cons: aiContent.cons,
        bestFor: aiContent.bestFor,
        editorPick: false,
        publishDate: TODAY,
        slug,
      });
      log.generatedProducts.push(id);
      console.log(`   ✅ Generated: ${candidate.name}`);
    } catch (err) {
      console.error(`   ❌ Failed to generate ${candidate.name}: ${err.message}`);
    }
  }

  if (unusedComparisons.length > 0) {
    const candidate = unusedComparisons[weekNumber % unusedComparisons.length];
    // Only generate if both products exist
    if (existingIds.includes(candidate.product1Id) && existingIds.includes(candidate.product2Id)) {
      const p1Name = candidate.product1Id.replace(/-/g, " ");
      const p2Name = candidate.product2Id.replace(/-/g, " ");
      console.log(`   Generating comparison: ${p1Name} vs ${p2Name}`);
      try {
        const aiContent = await generateComparisonContent(candidate, p1Name, p2Name);
        const id = candidate.product1Id + "-vs-" + candidate.product2Id;
        comparisons.push({
          id,
          title: aiContent.title,
          subtitle: aiContent.subtitle,
          category: candidate.category,
          categorySlug: candidate.categorySlug,
          product1Id: candidate.product1Id,
          product2Id: candidate.product2Id,
          winnerId: aiContent.winnerId,
          winnerReason: aiContent.winnerReason,
          verdict: aiContent.verdict,
          publishDate: TODAY,
          slug: id,
        });
        log.generatedComparisons.push(id);
        console.log(`   ✅ Generated comparison: ${aiContent.title}`);
      } catch (err) {
        console.error(`   ❌ Failed to generate comparison: ${err.message}`);
      }
    }
  }

  // Save updated log
  writeFileSync(GENERATED_LOG, JSON.stringify(log, null, 2), "utf-8");
  return { products, comparisons };
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
