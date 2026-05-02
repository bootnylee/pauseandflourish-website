// PauseAndFlourish.com — Monthly Performance Report Generator
// Runs on the 1st of each month via GitHub Actions
// Generates a Markdown report summarizing site content, affiliate links, and SEO health
// Usage: node scripts/monthly-report.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = resolve(__dirname, "../client/src/lib/products.ts");
const REPORTS_DIR = resolve(__dirname, "../reports");
const TODAY = new Date().toISOString().split("T")[0];
const MONTH = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
const PREV_MONTH = new Date(new Date().setMonth(new Date().getMonth() - 1))
  .toLocaleString("en-US", { month: "long", year: "numeric" });

console.log("=".repeat(60));
console.log("PauseAndFlourish Monthly Report Generator");
console.log(`Report period: ${PREV_MONTH}`);
console.log("=".repeat(60));

// Ensure reports directory exists
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

// ============================================================
// PARSE PRODUCTS DATA
// ============================================================
function parseProductsFile() {
  const content = readFileSync(PRODUCTS_FILE, "utf-8");

  // Extract product IDs and categories
  const productMatches = [...content.matchAll(/id:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*brand:\s*"([^"]+)",\s*\n\s*asin:\s*"([^"]+)",\s*\n\s*price:\s*([\d.]+),.*?\n.*?\n.*?\n\s*category:\s*"([^"]+)",\s*\n\s*categorySlug:\s*"([^"]+)"/gs)];

  const products = productMatches.map(m => ({
    id: m[1], name: m[2], brand: m[3], asin: m[4],
    price: parseFloat(m[5]), category: m[6], categorySlug: m[7],
  }));

  // Extract comparisons
  const comparisonMatches = [...content.matchAll(/id:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)",\s*\n\s*subtitle:\s*"([^"]+)",\s*\n\s*category:\s*"([^"]+)"/g)];
  const comparisons = comparisonMatches.map(m => ({
    id: m[1], title: m[2], subtitle: m[3], category: m[4],
  }));

  // Count by category
  const byCategory = {};
  for (const p of products) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  }

  // Count comparisons by category
  const compByCategory = {};
  for (const c of comparisons) {
    compByCategory[c.category] = (compByCategory[c.category] || 0) + 1;
  }

  // Count editor picks
  const editorPickCount = (content.match(/editorPick:\s*true/g) || []).length;

  // Count unique ASINs
  const asinMatches = [...content.matchAll(/asin:\s*"([A-Z0-9]{10})"/g)];
  const uniqueAsins = new Set(asinMatches.map(m => m[1]));

  return { products, comparisons, byCategory, compByCategory, editorPickCount, uniqueAsins };
}

// ============================================================
// GENERATE REPORT
// ============================================================
function generateReport() {
  const { products, comparisons, byCategory, compByCategory, editorPickCount, uniqueAsins } = parseProductsFile();

  const totalProducts = products.length;
  const totalComparisons = comparisons.length;
  const totalCategories = Object.keys(byCategory).length;
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;

  const reportFilename = `report-${TODAY}.md`;
  const reportPath = resolve(REPORTS_DIR, reportFilename);

  const categoryTable = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `| ${cat} | ${count} | ${compByCategory[cat] || 0} |`)
    .join("\n");

  const report = `# PauseAndFlourish Monthly Performance Report
## ${PREV_MONTH}

*Generated: ${TODAY} | Site: [pauseandflourish.com](https://www.pauseandflourish.com)*

---

## Executive Summary

| Metric | Value |
| :--- | :--- |
| Total Products in Catalog | **${totalProducts}** |
| Total Comparisons | **${totalComparisons}** |
| Product Categories | **${totalCategories}** |
| Editor's Pick Products | **${editorPickCount}** |
| Unique Amazon ASINs | **${uniqueAsins.size}** |
| Average Product Price | **$${avgPrice.toFixed(2)}** |
| Amazon Affiliate Tag | **pauseandflourish-20** |

---

## Content Inventory by Category

| Category | Products | Comparisons |
| :--- | :---: | :---: |
${categoryTable}
| **TOTAL** | **${totalProducts}** | **${totalComparisons}** |

---

## Affiliate Link Health

All Amazon affiliate links use the tag \`pauseandflourish-20\`. The product validator
script (\`scripts/validate-products.py\`) should be run monthly with the \`--live\` flag
to verify all ${uniqueAsins.size} unique ASINs are still active on Amazon.

**To run a full live validation:**
\`\`\`bash
python3 scripts/validate-products.py --live
\`\`\`

---

## Weekly Content Update Status

The weekly content update script (\`scripts/weekly-update.mjs\`) runs every Monday
via GitHub Actions. The 4-week rotating queue adds new products and comparisons
across all menopause categories.

**To manually trigger a week's update:**
\`\`\`bash
WEEK_NUMBER=1 node scripts/weekly-update.mjs
\`\`\`

---

## SEO Health Checklist

Run the SEO audit script to check for missing meta descriptions, duplicate titles,
and broken internal links:

\`\`\`bash
node scripts/seo-audit.mjs
\`\`\`

**Key SEO targets for PauseAndFlourish:**
- "best menopause supplements" — high volume, high competition
- "perimenopause symptoms and remedies" — high volume, medium competition
- "best supplements for perimenopause weight gain" — medium volume, low competition
- "what stage of menopause am I in" — quiz-driving, medium volume
- "hot flash relief products" — high purchase intent
- "menopause sleep aids" — high volume, medium competition
- "intimate dryness menopause" — high purchase intent, low competition

---

## Email List Health

Review EmailOctopus dashboard for:
- Total subscribers by segment (Early Perimenopause, Late Perimenopause,
  Active Menopause, Early Postmenopause, Late Postmenopause)
- Open rates by segment (target: >25%)
- Click-through rates (target: >3%)
- Unsubscribe rate (target: <0.5%)
- New subscribers this month

---

## Action Items for Next Month

- [ ] Run \`python3 scripts/validate-products.py --live\` to verify all ASINs
- [ ] Run \`node scripts/seo-audit.mjs\` and address any flagged issues
- [ ] Review EmailOctopus analytics and adjust sequences as needed
- [ ] Check Netlify analytics for top-performing pages
- [ ] Add new products to the weekly-update.mjs queue for next cycle
- [ ] Review Amazon affiliate commission reports in Associates dashboard
- [ ] Update any products with significant price changes (>20%)
- [ ] Check for new menopause supplement launches to review

---

*This report was automatically generated by \`scripts/monthly-report.mjs\`.*
*PauseAndFlourish.com — Evidence-Based Menopause Wellness*
`;

  writeFileSync(reportPath, report, "utf-8");
  console.log(`\n✅ Report generated: reports/${reportFilename}`);
  console.log(`   Products: ${totalProducts} | Comparisons: ${totalComparisons} | Categories: ${totalCategories}`);
  console.log(`   Unique ASINs: ${uniqueAsins.size} | Editor Picks: ${editorPickCount}`);
  console.log(`   Average price: $${avgPrice.toFixed(2)}\n`);

  return reportPath;
}

generateReport();
