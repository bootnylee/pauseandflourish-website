/**
 * PauseAndFlourish — Data Extractor
 * Run with: npx tsx scripts/extract-data.ts
 * Outputs JSON to stdout for use by prerender.mjs
 */
import { allProducts, categories, comparisons } from "../client/src/lib/products.js";
import { menopauseStages } from "../client/src/lib/menopauseStages.js";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const data = {
  allProducts: allProducts.map(p => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    asin: p.asin,
    category: p.category,
    categorySlug: p.categorySlug,
    stages: p.stages,
    price: p.price,
    rating: p.rating,
    reviewCount: p.reviewCount,
    heroImage: p.heroImage,
    shortDescription: p.shortDescription,
    fullReview: p.fullReview ? p.fullReview.substring(0, 500) : "",
    verdict: p.verdict,
    score: p.score,
    publishDate: p.publishDate,
  })),
  categories: categories.map(c => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
  })),
  comparisons: comparisons.map(c => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    categorySlug: c.categorySlug,
    summary: c.summary,
    verdict: c.verdict,
    publishDate: c.publishDate,
  })),
  menopauseStages: menopauseStages.map(s => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
  })),
};

const outPath = resolve(__dirname, "site-data.json");
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Wrote ${data.allProducts.length} products, ${data.comparisons.length} comparisons, ${data.categories.length} categories to ${outPath}`);
