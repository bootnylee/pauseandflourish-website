#!/usr/bin/env node
/**
 * validate-asins.mjs — Pre-publish ASIN validation gate for PauseAndFlourish.
 *
 * PART 2 of the affiliate-link guardrail system (React site version).
 *
 * Reads all products from client/src/lib/products.ts, verifies each ASIN
 * resolves to a live Amazon listing with a matching title, and exits with
 * code 1 (blocking the deploy) if any product fails.
 *
 * Usage:
 *   node scripts/validate-asins.mjs [--warn-only]
 *
 * Environment variables:
 *   ASIN_VALIDATE=warn   → warn-only mode (don't block deploy)
 *   ASIN_VALIDATE=skip   → skip validation entirely
 *   PAAPI_ACCESS_KEY     → Amazon PA-API access key (optional, enables faster validation)
 *   PAAPI_SECRET_KEY     → Amazon PA-API secret key
 *   PAAPI_ASSOCIATE_TAG  → affiliate tag (default: pauseandflourish-20)
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PRODUCTS_FILE = join(REPO_ROOT, "client/src/lib/products.ts");
const AFFILIATE_TAG = process.env.PAAPI_ASSOCIATE_TAG || "pauseandflourish-20";
const WARN_ONLY = process.argv.includes("--warn-only") || process.env.ASIN_VALIDATE === "warn";
const SKIP = process.env.ASIN_VALIDATE === "skip";
const MATCH_THRESHOLD = 0.35;
const REQUEST_DELAY_MS = 1500;

if (SKIP) {
  console.log("⚠  ASIN validation skipped (ASIN_VALIDATE=skip).");
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract products from products.ts
// ─────────────────────────────────────────────────────────────────────────────
function extractProducts(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const products = [];

  // Match objects with both name and asin fields
  const objPattern = /\{[^{}]*?name:\s*["']([^"']{3,100})["'][^{}]*?asin:\s*["']([A-Z0-9]{10})["'][^{}]*?\}/gs;
  const objPattern2 = /\{[^{}]*?asin:\s*["']([A-Z0-9]{10})["'][^{}]*?name:\s*["']([^"']{3,100})["'][^{}]*?\}/gs;

  let m;
  const seen = new Set();

  while ((m = objPattern.exec(content)) !== null) {
    const key = `${m[1]}|${m[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      products.push({ name: m[1].trim(), asin: m[2].trim() });
    }
  }
  while ((m = objPattern2.exec(content)) !== null) {
    const key = `${m[2]}|${m[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      products.push({ name: m[2].trim(), asin: m[1].trim() });
    }
  }

  return products;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fuzzy title matching
// ─────────────────────────────────────────────────────────────────────────────
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function titleMatches(expected, amazonTitle) {
  if (!amazonTitle) return { matches: false, score: 0 };
  const stop = new Set(["a", "an", "the", "for", "and", "or", "in", "on", "of", "to", "with", "lb", "lbs"]);
  const expWords = new Set(normalize(expected).split(" ").filter(w => w.length > 1 && !stop.has(w)));
  const amzWords = new Set(normalize(amazonTitle).split(" ").filter(w => w.length > 1 && !stop.has(w)));
  if (expWords.size === 0) return { matches: true, score: 1 };
  const overlap = [...expWords].filter(w => amzWords.has(w)).length / expWords.size;
  return { matches: overlap >= MATCH_THRESHOLD, score: overlap };
}

// ─────────────────────────────────────────────────────────────────────────────
// Amazon page scraping (fallback)
// ─────────────────────────────────────────────────────────────────────────────
function fetchAmazonTitle(asin) {
  return new Promise((resolve) => {
    const url = `https://www.amazon.com/dp/${asin}`;
    const options = {
      hostname: "www.amazon.com",
      path: `/dp/${asin}`,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 12000,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode === 404) {
          resolve({ title: null, error: "ASIN not found (404)" });
          return;
        }
        const m = data.match(/id="productTitle"[^>]*>\s*([^<]{5,300})/);
        if (m) { resolve({ title: m[1].trim(), error: null }); return; }
        const m2 = data.match(/<meta[^>]+property="og:title"[^>]+content="([^"]{5,300})"/);
        if (m2) { resolve({ title: m2[1].trim(), error: null }); return; }
        if (data.includes("robot") || data.includes("captcha")) {
          resolve({ title: null, error: "Amazon bot-check" });
        } else {
          resolve({ title: null, error: "Title not found in page" });
        }
      });
    });
    req.on("error", (e) => resolve({ title: null, error: e.message }));
    req.on("timeout", () => { req.destroy(); resolve({ title: null, error: "Request timeout" }); });
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`ASIN Validation Gate — PauseAndFlourish`);
  console.log(`${"=".repeat(60)}`);

  const products = extractProducts(PRODUCTS_FILE);
  console.log(`Checking ${products.length} products...`);
  console.log(`Mode: ${WARN_ONLY ? "warn-only" : "blocking"}\n`);

  let passed = 0, failed = 0;
  const failures = [];

  for (let i = 0; i < products.length; i++) {
    const { name, asin } = products[i];
    const { title, error } = await fetchAmazonTitle(asin);

    if (error || !title) {
      console.log(`  ✗ ${name} (${asin}): ${error || "not found"}`);
      failed++;
      failures.push({ product: name, asin, issue: error || "ASIN not found" });
    } else {
      const { matches, score } = titleMatches(name, title);
      if (matches) {
        console.log(`  ✓ ${name} (${asin})`);
        passed++;
      } else {
        const issue = `title mismatch (${Math.round(score * 100)}%): got "${title.slice(0, 60)}"`;
        console.log(`  ✗ ${name} (${asin}): ${issue}`);
        failed++;
        failures.push({ product: name, asin, issue, amazon_title: title });
      }
    }

    if (i < products.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);

  if (failures.length > 0) {
    console.log(`\n⚠  ${failed} product(s) failed:`);
    failures.forEach(f => console.log(`   • ${f.product} (${f.asin}): ${f.issue}`));

    if (WARN_ONLY) {
      console.log("\n⚠  warn-only mode: deploy proceeding despite failures.");
      process.exit(0);
    } else {
      console.log("\n✗  Deploy BLOCKED. Fix the above issues before publishing.");
      process.exit(1);
    }
  } else {
    console.log("\n✓  All products validated. Deploy proceeding.");
    process.exit(0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
