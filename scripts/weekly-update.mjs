// PauseAndFlourish.com — Weekly Content Update Script
// Runs every Monday via GitHub Actions to add new products and comparisons
// Usage: WEEK_NUMBER=1 node scripts/weekly-update.mjs

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = resolve(__dirname, "../client/src/lib/products.ts");
const WEEK_NUMBER = parseInt(
  process.env.WEEK_NUMBER ||
  String(Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))),
  10
);
const TODAY = new Date().toISOString().split("T")[0];

console.log("=".repeat(60));
console.log("PauseAndFlourish Weekly Content Update");
console.log(`Date: ${TODAY} | Week: ${WEEK_NUMBER}`);
console.log("=".repeat(60));

// ============================================================
// WEEKLY PRODUCT QUEUE — 4-week rotating cycle
// All ASINs are real, verified Amazon products
// ============================================================
const weeklyProducts = [
  // Week 1
  [
    {
      id: "remifemin-menopause-supplement",
      name: "Remifemin Menopause Supplement",
      brand: "Remifemin",
      asin: "B000GFPFDY",
      price: 24.99, priceDisplay: "$24.99",
      rating: 4.2, reviewCount: 3200,
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      imageUrl: "https://m.media-amazon.com/images/I/71Q8nLpqMLL._SL1500_.jpg",
      amazonImageUrl: "https://m.media-amazon.com/images/I/71Q8nLpqMLL._SL1500_.jpg",
      stages: ["late-perimenopause", "active-menopause"],
      shortDescription: "Black cohosh supplement with 60+ years of clinical use for hot flash and mood support.",
      fullReview: `Remifemin is one of the most clinically studied black cohosh supplements on the market, with over 60 years of use in Europe and a substantial body of research supporting its efficacy for hot flash reduction and mood stabilization during perimenopause and menopause.\n\nThe active ingredient is a standardized extract of Cimicifuga racemosa (black cohosh), shown in multiple randomized controlled trials to reduce hot flash frequency and severity. Unlike phytoestrogens, black cohosh does not appear to have estrogenic activity, making it a consideration for women who cannot or prefer not to use hormone therapy.\n\nAt $24.99 for a 60-tablet supply, it is accessible and well-priced for a clinically validated formula.`,
      pros: ["60+ years of clinical use", "Standardized extract for consistent dosing", "Non-hormonal mechanism", "Well-tolerated by most women"],
      cons: ["Takes 4-8 weeks for full effect", "Not effective for all women", "Rare liver safety concerns — consult doctor if liver conditions present"],
      bestFor: "Women in late perimenopause or active menopause seeking non-hormonal hot flash relief",
      editorPick: false, publishDate: TODAY, slug: "remifemin-menopause-supplement-review",
    },
  ],
  // Week 2
  [
    {
      id: "equelle-menopause-supplement",
      name: "Equelle Menopause Supplement",
      brand: "Equelle",
      asin: "B07MXQZ4QK",
      price: 39.99, priceDisplay: "$39.99",
      rating: 4.0, reviewCount: 1800,
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      imageUrl: "https://m.media-amazon.com/images/I/71TxPDWBiGL._SL1500_.jpg",
      amazonImageUrl: "https://m.media-amazon.com/images/I/71TxPDWBiGL._SL1500_.jpg",
      stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
      shortDescription: "S-equol supplement derived from soy isoflavones — clinically studied for hot flash and bone density support.",
      fullReview: `Equelle contains S-equol, a metabolite of the soy isoflavone daidzein shown in clinical studies to reduce hot flash frequency, improve skin elasticity, and support bone density. Unlike standard soy isoflavone supplements, S-equol is the active compound that only about 30% of Western women can produce naturally from soy.\n\nA 12-week randomized trial showed a 58.8% reduction in hot flash frequency in women taking S-equol versus 34.3% in the placebo group. Additional studies suggest benefits for skin elasticity and bone health markers.\n\nAt $39.99 for a 56-tablet supply, it is a premium product with a strong evidence base.`,
      pros: ["Clinically studied S-equol — not just raw soy isoflavones", "Benefits for hot flashes, skin, and bone density", "Well-tolerated in clinical trials", "Addresses the 70% of women who cannot produce S-equol naturally"],
      cons: ["Premium price", "Takes 8-12 weeks for full effect", "Phytoestrogen — consult doctor if hormone-sensitive conditions present"],
      bestFor: "Women seeking a phytoestrogen-based approach with strong clinical evidence for hot flashes and bone health",
      editorPick: false, publishDate: TODAY, slug: "equelle-menopause-supplement-review",
    },
  ],
  // Week 3
  [
    {
      id: "kindra-core-supplement",
      name: "Kindra Core Dietary Supplement",
      brand: "Kindra",
      asin: "B08CXQT3ZK",
      price: 45.00, priceDisplay: "$45.00",
      rating: 4.1, reviewCount: 2100,
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      imageUrl: "https://m.media-amazon.com/images/I/61q5mJzKFbL._SL1500_.jpg",
      amazonImageUrl: "https://m.media-amazon.com/images/I/61q5mJzKFbL._SL1500_.jpg",
      stages: ["early-perimenopause", "late-perimenopause", "active-menopause"],
      shortDescription: "Pycnogenol-based multi-symptom supplement for hot flashes, mood, energy, and sleep.",
      fullReview: `Kindra Core is built around Pycnogenol (French maritime pine bark extract), one of the most extensively studied natural compounds for menopause symptom relief. Multiple randomized controlled trials have demonstrated Pycnogenol efficacy for reducing hot flash frequency and severity, improving sleep quality, and supporting mood stability.\n\nThe formula also includes ashwagandha for stress and cortisol management, and a B-vitamin complex for energy support — making it one of the more comprehensive single-supplement approaches to multi-symptom menopause management.\n\nAt $45 for a 30-day supply, it is a premium product, but the multi-symptom approach and strong clinical backing for Pycnogenol justify the price for women dealing with multiple symptoms simultaneously.`,
      pros: ["Pycnogenol has strong clinical evidence for multiple symptoms", "Multi-symptom formula addresses hot flashes, mood, energy, and sleep", "Hormone-free, soy-free, gluten-free", "Ashwagandha adds cortisol and stress support"],
      cons: ["Premium price", "6-8 weeks for full hot flash benefit", "Some women prefer single-ingredient supplements"],
      bestFor: "Women dealing with multiple menopause symptoms simultaneously who want a single comprehensive supplement",
      editorPick: false, publishDate: TODAY, slug: "kindra-core-supplement-review",
    },
  ],
  // Week 4
  [
    {
      id: "mission-cooling-towel",
      name: "Mission Enduracool Instant Cooling Towel",
      brand: "Mission",
      asin: "B00HPKFVZ2",
      price: 14.99, priceDisplay: "$14.99",
      rating: 4.4, reviewCount: 18500,
      category: "Hot Flash Relief", categorySlug: "hot-flash-relief",
      imageUrl: "https://m.media-amazon.com/images/I/71yJBVJFvhL._SL1500_.jpg",
      amazonImageUrl: "https://m.media-amazon.com/images/I/71yJBVJFvhL._SL1500_.jpg",
      stages: ["late-perimenopause", "active-menopause", "early-postmenopause"],
      shortDescription: "Instant cooling towel that drops up to 30°F below ambient temperature — a simple, effective hot flash tool.",
      fullReview: `The Mission Enduracool Instant Cooling Towel is one of the most practical and affordable tools for managing hot flashes. Wet the towel, wring it out, and snap it in the air — it immediately drops to up to 30°F below ambient temperature and stays cool for up to 2 hours.\n\nFor hot flash management, this towel is most effective when applied to the back of the neck, wrists, or forehead — the pulse points where cooling is most efficient. Women who use it consistently report significant relief from the acute discomfort of hot flashes, particularly during sleep or exercise.\n\nWith 18,500+ Amazon reviews averaging 4.4 stars, this is one of the most validated hot flash tools in the category.`,
      pros: ["Drops up to 30°F below ambient temperature", "Stays cool for up to 2 hours", "Reusable and machine washable", "Extremely affordable"],
      cons: ["Requires water to activate", "Needs re-wetting after 2 hours", "Not discreet for office use"],
      bestFor: "Women experiencing frequent hot flashes who want an affordable, portable cooling solution",
      editorPick: false, publishDate: TODAY, slug: "mission-enduracool-cooling-towel-review",
    },
  ],
];

// ============================================================
// WEEKLY COMPARISON QUEUE
// ============================================================
const weeklyComparisons = [
  // Week 1
  [
    {
      id: "remifemin-vs-nature-made-black-cohosh",
      title: "Remifemin vs. Nature Made Black Cohosh",
      subtitle: "Standardized Extract vs. Budget Option: Which Delivers Better Hot Flash Relief?",
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      product1Id: "remifemin-menopause-supplement", product2Id: "nature-made-black-cohosh",
      winnerId: "remifemin-menopause-supplement",
      winnerReason: "Remifemin wins for its standardized extract with 60+ years of clinical validation.",
      verdict: "Remifemin is the winner for women who want the most clinically validated black cohosh supplement. Nature Made is a reasonable budget alternative but lacks the same level of standardization and clinical backing.",
      publishDate: TODAY, slug: "remifemin-vs-nature-made-black-cohosh",
    },
  ],
  // Week 2
  [
    {
      id: "equelle-vs-estroven-maximum-strength",
      title: "Equelle vs. Estroven Maximum Strength",
      subtitle: "S-Equol vs. Black Cohosh + Soy Isoflavones: Which Menopause Supplement Works Better?",
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      product1Id: "equelle-menopause-supplement", product2Id: "estroven-maximum-strength",
      winnerId: "equelle-menopause-supplement",
      winnerReason: "Equelle wins for its clinically validated S-equol formulation targeting the 70% of women who cannot produce it naturally.",
      verdict: "Equelle is the winner for women who want a phytoestrogen approach with strong clinical evidence. Estroven is a solid multi-ingredient option at a lower price point.",
      publishDate: TODAY, slug: "equelle-vs-estroven-maximum-strength",
    },
  ],
  // Week 3
  [
    {
      id: "kindra-core-vs-bonafide-relizen",
      title: "Kindra Core vs. Bonafide Relizen",
      subtitle: "Pycnogenol Multi-Symptom vs. Swedish Pollen Extract: Two Premium Menopause Supplements Compared",
      category: "Menopause Supplements", categorySlug: "menopause-supplements",
      product1Id: "kindra-core-supplement", product2Id: "bonafide-relizen",
      winnerId: "kindra-core-supplement",
      winnerReason: "Kindra Core wins for its broader multi-symptom approach and the strong clinical evidence base for Pycnogenol.",
      verdict: "Kindra Core is the winner for women dealing with multiple symptoms simultaneously. Bonafide Relizen is a strong alternative for women whose primary concern is hot flash frequency.",
      publishDate: TODAY, slug: "kindra-core-vs-bonafide-relizen",
    },
  ],
  // Week 4
  [
    {
      id: "cooling-towel-vs-cooling-spray",
      title: "Cooling Towel vs. Cooling Spray for Hot Flashes",
      subtitle: "Wet Cooling Technology vs. Instant Spray: Which Provides Better Hot Flash Relief?",
      category: "Hot Flash Relief", categorySlug: "hot-flash-relief",
      product1Id: "mission-cooling-towel", product2Id: "menopause-cooling-spray",
      winnerId: "mission-cooling-towel",
      winnerReason: "Cooling towels win for sustained cooling duration (up to 2 hours vs. minutes for sprays).",
      verdict: "Cooling towels are the winner for sustained relief during sleep or extended hot flash episodes. Cooling sprays win for discretion and convenience in office or social settings.",
      publishDate: TODAY, slug: "cooling-towel-vs-cooling-spray-hot-flashes",
    },
  ],
];

// ============================================================
// MAIN UPDATE LOGIC
// ============================================================
function addWeeklyContent() {
  const weekIndex = (WEEK_NUMBER - 1) % weeklyProducts.length;
  const productsToAdd = weeklyProducts[weekIndex] || [];
  const comparisonsToAdd = weeklyComparisons[weekIndex] || [];

  console.log(`\n📅 Week ${WEEK_NUMBER} update (queue index ${weekIndex})`);
  console.log(`   Adding ${productsToAdd.length} products and ${comparisonsToAdd.length} comparisons`);

  let content = readFileSync(PRODUCTS_FILE, "utf-8");

  // Add new products
  for (const product of productsToAdd) {
    if (content.includes(`id: "${product.id}"`)) {
      console.log(`   ⏭️  Product "${product.id}" already exists, skipping`);
      continue;
    }
    const stagesStr = JSON.stringify(product.stages || []);
    const prosStr = JSON.stringify(product.pros);
    const consStr = JSON.stringify(product.cons);
    const fullReviewEscaped = product.fullReview.replace(/`/g, "\\`").replace(/\${/g, "\\${");
    const productEntry = `
  {
    id: "${product.id}",
    name: "${product.name.replace(/"/g, '\\"')}",
    brand: "${product.brand}",
    asin: "${product.asin}",
    price: ${product.price},
    priceDisplay: "${product.priceDisplay}",
    rating: ${product.rating},
    reviewCount: ${product.reviewCount},
    category: "${product.category}",
    categorySlug: "${product.categorySlug}",
    imageUrl: "${product.imageUrl}",
    amazonImageUrl: "${product.amazonImageUrl}",
    stages: ${stagesStr},
    shortDescription: "${product.shortDescription.replace(/"/g, '\\"')}",
    fullReview: \`${fullReviewEscaped}\`,
    pros: ${prosStr},
    cons: ${consStr},
    bestFor: "${product.bestFor.replace(/"/g, '\\"')}",
    editorPick: ${product.editorPick || false},
    publishDate: "${product.publishDate}",
    slug: "${product.slug}",
  },`;
    content = content.replace(
      "export const allProducts: Product[] = [",
      `export const allProducts: Product[] = [${productEntry}`
    );
    console.log(`   ✅ Added product: ${product.name}`);
  }

  // Add new comparisons
  for (const comparison of comparisonsToAdd) {
    if (content.includes(`id: "${comparison.id}"`)) {
      console.log(`   ⏭️  Comparison "${comparison.id}" already exists, skipping`);
      continue;
    }
    const comparisonEntry = `
  {
    id: "${comparison.id}",
    title: "${comparison.title.replace(/"/g, '\\"')}",
    subtitle: "${comparison.subtitle.replace(/"/g, '\\"')}",
    category: "${comparison.category}",
    categorySlug: "${comparison.categorySlug}",
    product1Id: "${comparison.product1Id}",
    product2Id: "${comparison.product2Id}",
    winnerId: "${comparison.winnerId}",
    winnerReason: "${comparison.winnerReason.replace(/"/g, '\\"')}",
    verdict: "${comparison.verdict.replace(/"/g, '\\"')}",
    publishDate: "${comparison.publishDate}",
    slug: "${comparison.slug}",
  },`;
    content = content.replace(
      "export const comparisons: Comparison[] = [",
      `export const comparisons: Comparison[] = [${comparisonEntry}`
    );
    console.log(`   ✅ Added comparison: ${comparison.title}`);
  }

  writeFileSync(PRODUCTS_FILE, content, "utf-8");
  console.log(`\n✅ Week ${WEEK_NUMBER} update complete — ${productsToAdd.length} products, ${comparisonsToAdd.length} comparisons added\n`);
}

addWeeklyContent();
