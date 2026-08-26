/**
 * PauseAndFlourish — Data Extractor
 * Run with: npx tsx scripts/extract-data.ts
 * Outputs JSON to stdout for use by prerender.mjs
 */
import { allProducts, categories, comparisons } from "../client/src/lib/products.js";
import { menopauseStages } from "../client/src/lib/menopauseStages.js";
import { authors } from "../client/src/lib/authors.js";
import { researchArticles } from "../client/src/lib/researchArticles.js";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const productIds = new Set(allProducts.map((product) => product.id));
const reviewSlugs = new Set<string>();
for (const product of allProducts) {
  if (reviewSlugs.has(product.slug)) {
    throw new Error(`Duplicate review slug in catalog: ${product.slug}`);
  }
  reviewSlugs.add(product.slug);
}

const invalidComparisons = comparisons.filter((comparison) => {
  const referencedProducts = comparison.productIds?.length
    ? comparison.productIds
    : [comparison.product1Id, comparison.product2Id].filter(Boolean);
  const winnerId = comparison.winnerId || comparison.winner;
  return referencedProducts.length !== 2
    || referencedProducts.some((productId) => !productIds.has(productId))
    || !winnerId
    || !productIds.has(winnerId);
});
if (invalidComparisons.length > 0) {
  throw new Error(`Unresolvable comparison data: ${invalidComparisons.map((comparison) => comparison.slug).join(", ")}`);
}

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
    fullReview: p.fullReview || "",
    pros: p.pros || [],
    cons: p.cons || [],
    bestFor: p.bestFor || "",
    editorPick: p.editorPick || false,
    editorNote: p.editorNote || "",
    verdict: p.verdict,
    score: p.score,
    publishDate: p.publishDate,
    authorId: (p as any).authorId || "diane-kessler",
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
    productIds: c.productIds,
    product1Id: c.product1Id,
    product2Id: c.product2Id,
    winnerId: c.winnerId,
    winnerReason: c.winnerReason,
    summary: c.summary,
    verdict: c.verdict,
    publishDate: c.publishDate,
    authorId: (c as any).authorId || "diane-kessler",
  })),
  authors: authors.map(a => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    role: a.role,
    bio: a.bio,
    bioLong: a.bioLong,
    photoPlaceholder: a.photoPlaceholder,
    url: a.url,
  })),
  menopauseStages: menopauseStages.map(s => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
  })),
  researchArticles: researchArticles.map(article => ({
    id: article.id,
    citation: article.citation,
    headline: article.headline,
    takeaway: article.takeaway,
    url: article.url,
    study_type: article.study_type,
    stage_id: article.stage_id,
    date_added: article.date_added,
  })),
};

const outPath = resolve(__dirname, "site-data.json");
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Wrote ${data.allProducts.length} products, ${data.comparisons.length} comparisons, ${data.categories.length} categories to ${outPath}`);
