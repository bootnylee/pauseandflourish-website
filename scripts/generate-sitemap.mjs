/**
 * PauseAndFlourish.com — Sitemap Generator
 * ==========================================
 * Reads ONLY from scripts/site-data.json (produced by extract-data.ts)
 * so every <loc> in the output maps 1:1 to a route that actually renders
 * real content.  No hardcoded slug lists — the sitemap can never drift
 * from the live data again.
 *
 * Build order in netlify.toml:
 *   npx tsx scripts/extract-data.ts   ← writes site-data.json
 *   node scripts/generate-sitemap.mjs ← reads site-data.json, writes sitemap
 *   pnpm build
 *   node scripts/prerender.mjs
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_PATH = resolve(__dirname, "site-data.json");
const OUT_PATH = resolve(ROOT, "client", "public", "sitemap.xml");
const BASE_URL = "https://pauseandflourish.com";

// ── Guard: site-data.json must exist (run extract-data.ts first) ─────────────
if (!existsSync(DATA_PATH)) {
  console.error("❌ scripts/site-data.json not found — run `npx tsx scripts/extract-data.ts` first");
  process.exit(1);
}

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const {
  allProducts = [],
  comparisons = [],
  categories = [],
  menopauseStages = [],
  authors = [],
  researchArticles = [],
} = data;

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── Helper: build a <url> entry ───────────────────────────────────────────────
function urlEntry(path, { lastmod = today, changefreq = "monthly", priority = "0.7" } = {}) {
  return [
    "  <url>",
    `    <loc>${BASE_URL}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function researchPath(article) {
  if (!article.slug) throw new Error(`Research article is missing stable slug: ${article.id}`);
  return `/research/${article.slug}`;
}

// ── Collect all URLs ──────────────────────────────────────────────────────────
const entries = [];

// Static pages
entries.push(urlEntry("/",            { changefreq: "weekly",  priority: "1.0" }));
entries.push(urlEntry("/reviews",     { changefreq: "weekly",  priority: "0.9" }));
entries.push(urlEntry("/comparisons", { changefreq: "weekly",  priority: "0.9" }));
entries.push(urlEntry("/about",       { changefreq: "monthly", priority: "0.5" }));
entries.push(urlEntry("/methodology", { changefreq: "monthly", priority: "0.5" }));
entries.push(urlEntry("/quiz",        { changefreq: "monthly", priority: "0.8" }));
entries.push(urlEntry("/news-and-articles", { changefreq: "weekly", priority: "0.8" }));
entries.push(urlEntry("/privacy", { changefreq: "yearly", priority: "0.3" }));
entries.push(urlEntry("/terms", { changefreq: "yearly", priority: "0.3" }));
entries.push(urlEntry("/contact", { changefreq: "yearly", priority: "0.3" }));

// Category pages — sourced from live categories data
for (const cat of categories) {
  entries.push(urlEntry(`/category/${cat.slug}`, { changefreq: "weekly", priority: "0.8" }));
}

// Stage pages — sourced from live menopauseStages data
for (const stage of menopauseStages) {
  entries.push(urlEntry(`/stage/${stage.slug}`, { changefreq: "monthly", priority: "0.7" }));
}

// Author pages — sourced from live authors data
for (const author of authors) {
  entries.push(urlEntry(`/author/${author.slug}`, { changefreq: "monthly", priority: "0.5" }));
}

// Product review pages — sourced from live allProducts data
for (const product of allProducts) {
  let lastmod = today;
  if (product.publishDate) {
    try {
      lastmod = new Date(product.publishDate).toISOString().slice(0, 10);
    } catch (_) { /* keep today */ }
  }
  entries.push(urlEntry(`/review/${product.slug}`, { lastmod, changefreq: "monthly", priority: "0.7" }));
}

// Comparison pages — sourced from live comparisons data
for (const comp of comparisons) {
  let lastmod = today;
  if (comp.publishDate) {
    try {
      lastmod = new Date(comp.publishDate).toISOString().slice(0, 10);
    } catch (_) { /* keep today */ }
  }
  entries.push(urlEntry(`/comparison/${comp.slug}`, { lastmod, changefreq: "monthly", priority: "0.8" }));
}

// Research detail pages — sourced verbatim from the existing research catalog
for (const article of researchArticles) {
  entries.push(urlEntry(researchPath(article), {
    lastmod: article.date_added || today,
    changefreq: "monthly",
    priority: "0.6",
  }));
}

// ── Assemble XML ─────────────────────────────────────────────────────────────
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  "</urlset>",
  "",
].join("\n");

writeFileSync(OUT_PATH, xml, "utf8");

console.log(`✅ Sitemap written to ${OUT_PATH}`);
console.log(`   ${entries.length} URLs total`);
console.log(`   Breakdown:`);
console.log(`     Static pages:     10`);
console.log(`     Category pages:   ${categories.length}`);
console.log(`     Stage pages:      ${menopauseStages.length}`);
console.log(`     Author pages:     ${authors.length}`);
console.log(`     Review pages:     ${allProducts.length}`);
console.log(`     Comparison pages: ${comparisons.length}`);
console.log(`     Research pages:    ${researchArticles.length}`);
