// PauseAndFlourish.com — SEO Audit Script
// Checks for common SEO issues and generates a report
// Run by GitHub Actions weekly

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTS_FILE = resolve(__dirname, "../client/src/lib/products.ts");
const SITEMAP_FILE = resolve(__dirname, "../client/public/sitemap.xml");
const ROBOTS_FILE = resolve(__dirname, "../client/public/robots.txt");
const REPORT_FILE = resolve(__dirname, "../seo-audit-report.json");

const TODAY = new Date().toISOString().split("T")[0];

const issues = [];
const warnings = [];
const passed = [];

// ============================================================
// CHECK 1: robots.txt exists
// ============================================================
if (existsSync(ROBOTS_FILE)) {
  const robots = readFileSync(ROBOTS_FILE, "utf-8");
  if (robots.includes("Sitemap:")) {
    passed.push("robots.txt exists and references sitemap");
  } else {
    warnings.push("robots.txt exists but does not reference sitemap");
  }
} else {
  issues.push("robots.txt is missing from /client/public/");
}

// ============================================================
// CHECK 2: sitemap.xml exists and has URLs
// ============================================================
if (existsSync(SITEMAP_FILE)) {
  const sitemap = readFileSync(SITEMAP_FILE, "utf-8");
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  if (urlCount > 10) {
    passed.push(`sitemap.xml exists with ${urlCount} URLs`);
  } else {
    warnings.push(`sitemap.xml exists but only has ${urlCount} URLs — may be incomplete`);
  }
} else {
  issues.push("sitemap.xml is missing — run generate-sitemap.mjs");
}

// ============================================================
// CHECK 3: Products data integrity
// ============================================================
const productsContent = readFileSync(PRODUCTS_FILE, "utf-8");

// Check for products missing required fields
const missingSlug = productsContent.match(/id: "[^"]+",\s*\n(?!.*slug:)/g);
if (missingSlug) {
  warnings.push(`${missingSlug.length} products may be missing slug field`);
} else {
  passed.push("All products appear to have slug fields");
}

// Check for products missing descriptions
const missingDesc = productsContent.match(/shortDescription: ""/g);
if (missingDesc) {
  issues.push(`${missingDesc.length} products have empty shortDescription`);
} else {
  passed.push("All products have shortDescription");
}

// Check for products missing Amazon ASINs
const missingAsin = productsContent.match(/asin: ""/g);
if (missingAsin) {
  issues.push(`${missingAsin.length} products have empty ASIN`);
} else {
  passed.push("All products have Amazon ASINs");
}

// ============================================================
// CHECK 4: Affiliate link format
// ============================================================
const affiliateTag = "pauseandflourish-20";
if (productsContent.includes(affiliateTag) || readFileSync(resolve(__dirname, "../client/src/lib/products.ts"), "utf-8").includes(affiliateTag)) {
  passed.push(`Affiliate tag "${affiliateTag}" is present in products data`);
} else {
  issues.push(`Affiliate tag "${affiliateTag}" not found — check amazonLink function`);
}

// ============================================================
// CHECK 5: Index.html has proper meta tags
// ============================================================
const indexHtml = resolve(__dirname, "../client/index.html");
if (existsSync(indexHtml)) {
  const html = readFileSync(indexHtml, "utf-8");
  if (html.includes('name="description"')) {
    passed.push("index.html has meta description");
  } else {
    warnings.push("index.html missing meta description (handled dynamically via JS)");
  }
  if (html.includes('property="og:')) {
    passed.push("index.html has Open Graph meta tags");
  } else {
    warnings.push("index.html missing Open Graph meta tags (handled dynamically via JS)");
  }
  if (html.includes('rel="canonical"')) {
    passed.push("index.html has canonical URL");
  } else {
    warnings.push("Canonical URLs handled dynamically via JS — ensure updateDocumentMeta is called on all pages");
  }
}

// ============================================================
// GENERATE REPORT
// ============================================================
const report = {
  auditDate: TODAY,
  summary: {
    passed: passed.length,
    warnings: warnings.length,
    issues: issues.length,
    score: Math.round((passed.length / (passed.length + warnings.length + issues.length)) * 100),
  },
  passed,
  warnings,
  issues,
  recommendations: [
    "Ensure all new products added weekly have complete metadata (slug, description, ASIN, pros/cons)",
    "Regenerate sitemap after each weekly update to include new pages",
    "Monitor Google Search Console for crawl errors after each deployment",
    "Consider adding FAQ schema markup to comparison pages for rich snippets",
    "Add breadcrumb schema markup to product review pages",
    "Ensure all product images have descriptive alt text",
    "Monitor Core Web Vitals in Google Search Console monthly",
    "Submit sitemap to Google Search Console at https://search.google.com/search-console",
  ],
};

writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf-8");

console.log("\n📊 SEO Audit Report");
console.log("==================");
console.log(`Score: ${report.summary.score}/100`);
console.log(`✅ Passed: ${report.summary.passed}`);
console.log(`⚠️  Warnings: ${report.summary.warnings}`);
console.log(`❌ Issues: ${report.summary.issues}`);

if (issues.length > 0) {
  console.log("\n❌ Issues to fix:");
  issues.forEach(i => console.log(`   - ${i}`));
}

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  warnings.forEach(w => console.log(`   - ${w}`));
}

console.log(`\n📄 Full report saved to: seo-audit-report.json`);

// Exit with error if there are critical issues
if (issues.length > 3) {
  console.error("\n🚨 Too many SEO issues — review before deploying");
  process.exit(1);
}
