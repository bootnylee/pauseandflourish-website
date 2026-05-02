// PauseAndFlourish.com — Sitemap Generator
// Run: node scripts/generate-sitemap.mjs
// Generates /client/public/sitemap.xml from product data

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://pauseandflourish.com";
const TODAY = new Date().toISOString().split("T")[0];

// Static pages
const staticPages = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/reviews", priority: "0.9", changefreq: "weekly" },
  { url: "/comparisons", priority: "0.9", changefreq: "weekly" },
  { url: "/about", priority: "0.5", changefreq: "monthly" },
  { url: "/quiz", priority: "0.8", changefreq: "monthly" },
  { url: "/category/multi-symptom-supplements", priority: "0.8", changefreq: "weekly" },
  { url: "/category/sleep-mood-support", priority: "0.8", changefreq: "weekly" },
  { url: "/category/hot-flash-cooling", priority: "0.8", changefreq: "weekly" },
  { url: "/category/bone-joint-health", priority: "0.8", changefreq: "weekly" },
  { url: "/category/vaginal-intimate-health", priority: "0.8", changefreq: "weekly" },
  { url: "/category/menopause-skincare", priority: "0.8", changefreq: "weekly" },
  { url: "/category/fitness-pelvic-health", priority: "0.8", changefreq: "weekly" },
  { url: "/category/cognitive-energy-support", priority: "0.8", changefreq: "weekly" },
  { url: "/stage/early-perimenopause", priority: "0.7", changefreq: "monthly" },
  { url: "/stage/late-perimenopause", priority: "0.7", changefreq: "monthly" },
  { url: "/stage/active-menopause", priority: "0.7", changefreq: "monthly" },
  { url: "/stage/early-postmenopause", priority: "0.7", changefreq: "monthly" },
  { url: "/stage/late-postmenopause", priority: "0.7", changefreq: "monthly" },
];

// Product review slugs — updated weekly by weekly-update.mjs
const productSlugs = [
  "remifemin-menopause-supplement",
  "estroven-complete-menopause-relief",
  "bonafide-relizen-hot-flash-relief",
  "natrol-melatonin-10mg-sleep-aid",
  "doctors-best-magnesium-glycinate",
  "olly-goodbye-stress-gummies",
  "chill-pal-mesh-cooling-towel",
  "bedfan-personal-bed-fan",
  "amberen-multi-symptom-menopause-relief",
  "citracal-petites-calcium-d3",
  "garden-of-life-mykind-bone-strength",
  "replens-long-lasting-vaginal-moisturizer",
  "hyalogic-hyaluronic-acid-intimate-serum",
  "vital-proteins-collagen-peptides",
  "neutrogena-rapid-firming-retinol-serum",
  "perifit-kegel-exerciser-app",
  "optimum-nutrition-gold-standard-whey",
  "double-wood-alpha-gpc-cognitive-support",
  "nootropics-depot-rhodiola-rosea",
  "jarrow-formulas-methyl-b12",
];

// Comparison slugs
const comparisonSlugs = [
  "remifemin-vs-estroven-complete",
  "natrol-melatonin-vs-magnesium-glycinate",
  "replens-vs-hyalogic-intimate-serum",
  "vital-proteins-vs-neutrogena-rapid-firming",
  "amberen-vs-bonafide-relizen",
  "alpha-gpc-vs-rhodiola-rosea-brain-fog",
];

function buildSitemapEntry({ url, priority, changefreq, lastmod }) {
  return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const entries = [
  ...staticPages.map(p => buildSitemapEntry({ ...p, lastmod: TODAY })),
  ...productSlugs.map(slug => buildSitemapEntry({
    url: `/review/${slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: TODAY,
  })),
  ...comparisonSlugs.map(slug => buildSitemapEntry({
    url: `/comparison/${slug}`,
    priority: "0.8",
    changefreq: "monthly",
    lastmod: TODAY,
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

const outputPath = resolve(__dirname, "../client/public/sitemap.xml");
writeFileSync(outputPath, sitemap, "utf-8");
console.log(`✅ Sitemap generated: ${outputPath}`);
console.log(`   ${entries.length} URLs included`);
