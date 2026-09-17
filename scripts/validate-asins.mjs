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
 * Environment variables (set in Netlify dashboard → Site settings → Environment):
 *   ASIN_VALIDATE=warn              → warn-only mode for remote catalog validation
 *   CREATORS_API_CLIENT_ID          → Amazon Creators API client ID
 *   CREATORS_API_CLIENT_SECRET      → Amazon Creators API client secret
 *   CREATORS_API_PARTNER_TAG        → compared to the registered API partner tag; mismatch logs a warning
 *   Credentials portal: https://affiliate-program.amazon.com/creatorsapi
 *
 * Auth: OAuth 2.0 client_credentials via Login with Amazon (LwA)
 * Token endpoint: https://api.amazon.com/auth/o2/token
 * API endpoint:   https://creatorsapi.amazon/catalog/v1/getItems
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PRODUCTS_FILE = join(REPO_ROOT, "client/src/lib/products.ts");

// ── Creators API config ────────────────────────────────────────────────────
const CREATORS_CLIENT_ID     = process.env.CREATORS_API_CLIENT_ID || "";
const CREATORS_CLIENT_SECRET = process.env.CREATORS_API_CLIENT_SECRET || "";
// Creators API app is registered to this store; site affiliate links keep their own tags.
const API_PARTNER_TAG        = "trailbuiltove-20";
const CONFIGURED_PARTNER_TAG = process.env.CREATORS_API_PARTNER_TAG || "";
const MARKETPLACE            = "www.amazon.com";

const WARN_ONLY = process.argv.includes("--warn-only") || process.env.ASIN_VALIDATE === "warn";
// --local-only: the deterministic checks only (no network). The remote catalog verification is a data job, not a
// build step: 62 products × (API retries + backoff + delay) was 3–12 minutes of every deploy for a check whose
// answer does not change between commits (BUILD-TIME-0917). The daily rebuild runs the remote pass.
const LOCAL_ONLY = process.argv.includes("--local-only") || process.env.ASIN_VALIDATE === "local";
const MATCH_THRESHOLD = 0.60;
// Creators API can return a transient empty item set under short-lived quota or
// catalog propagation pressure. Retry before treating a listing as unavailable.
const REQUEST_DELAY_MS = 2500;
const LOOKUP_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 3000;

// Token cache
let _tokenCache = { token: null, expiresAt: 0 };

// ─────────────────────────────────────────────────────────────────────────────
// Extract products from products.ts
// ─────────────────────────────────────────────────────────────────────────────
function extractProducts(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const products = [];
  const seen = new Set();

  const objPattern  = /\{[^{}]*?name:\s*["']([^"']{3,100})["'][^{}]*?asin:\s*["']([A-Z0-9]{10})["'][^{}]*?\}/gs;
  const objPattern2 = /\{[^{}]*?asin:\s*["']([A-Z0-9]{10})["'][^{}]*?name:\s*["']([^"']{3,100})["'][^{}]*?\}/gs;

  let m;
  while ((m = objPattern.exec(content)) !== null) {
    const key = `${m[1]}|${m[2]}`;
    if (!seen.has(key)) { seen.add(key); products.push({ name: m[1].trim(), asin: m[2].trim() }); }
  }
  while ((m = objPattern2.exec(content)) !== null) {
    const key = `${m[2]}|${m[1]}`;
    if (!seen.has(key)) { seen.add(key); products.push({ name: m[2].trim(), asin: m[1].trim() }); }
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
  const stop = new Set(["a","an","the","for","and","or","in","on","of","to","with","lb","lbs","by","at","from","amazon"]);
  const expWords = new Set(normalize(expected).split(" ").filter(w => w.length > 1 && !stop.has(w)));
  const amzWords = new Set(normalize(amazonTitle).split(" ").filter(w => w.length > 1 && !stop.has(w)));
  if (expWords.size === 0) return { matches: false, score: 0 };
  const shared = [...expWords].filter(w => amzWords.has(w));
  const overlap = shared.length / expWords.size;
  const requiredShared = expWords.size <= 2 ? 1 : 2;
  return { matches: overlap >= MATCH_THRESHOLD && shared.length >= requiredShared, score: overlap };
}

function findAmazonSearchUrls(root) {
  const hits = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) hits.push(...findAmazonSearchUrls(path));
    else if (/\.(?:ts|tsx|js|jsx|html)$/i.test(entry) && /amazon\.com\/s\?/i.test(readFileSync(path, "utf-8"))) hits.push(path);
  }
  return hits;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────────────────────────────────────
function httpPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === "string" ? body : JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(data) }, timeout: 12000 },
      (res) => {
        let raw = "";
        res.on("data", c => { raw += c; });
        res.on("end", () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    req.write(data);
    req.end();
  });
}

function httpGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method: "GET", headers, timeout: 12000 },
      (res) => {
        let raw = "";
        res.on("data", c => { raw += c; });
        res.on("end", () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Creators API — OAuth 2.0 token + GetItems
// ─────────────────────────────────────────────────────────────────────────────
async function getAccessToken() {
  const now = Date.now() / 1000;
  if (_tokenCache.token && now < _tokenCache.expiresAt - 60) return _tokenCache.token;

  const cacheToken = (resp, generation) => {
    const data = JSON.parse(resp.body || "{}");
    if (resp.status < 200 || resp.status >= 300 || !data.access_token) {
      throw new Error(`${generation} Creators API authentication failed (HTTP ${resp.status})`);
    }
    _tokenCache.token = data.access_token;
    _tokenCache.expiresAt = now + (data.expires_in || 3600);
    return _tokenCache.token;
  };

  try {
    const resp = await httpPost(
      "api.amazon.com", "/auth/o2/token",
      { "Content-Type": "application/json" },
      JSON.stringify({
        grant_type: "client_credentials",
        client_id: CREATORS_CLIENT_ID,
        client_secret: CREATORS_CLIENT_SECRET,
        scope: "creatorsapi::default",
      })
    );
    return cacheToken(resp, "v3");
  } catch (v3Error) {
    const basic = Buffer.from(`${CREATORS_CLIENT_ID}:${CREATORS_CLIENT_SECRET}`).toString("base64");
    const resp = await httpPost(
      "creatorsapi.auth.us-east-1.amazoncognito.com", "/oauth2/token",
      {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basic}`,
      },
      "grant_type=client_credentials&scope=creatorsapi%2Fdefault"
    );
    try {
      return cacheToken(resp, "v2");
    } catch (v2Error) {
      throw new Error(`Creators API authentication failed for both v3 and v2 flows: ${v3Error.message}; ${v2Error.message}`);
    }
  }
}

async function creatorsApiLookup(asin) {
  const token = await getAccessToken();
  const resp = await httpPost(
    "creatorsapi.amazon", "/catalog/v1/getItems",
    {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-marketplace": MARKETPLACE,
    },
    JSON.stringify({
      itemIds: [asin],
      itemIdType: "ASIN",
      marketplace: MARKETPLACE,
      partnerTag: API_PARTNER_TAG,
      partnerType: "Associates",
      resources: ["itemInfo.title", "images.primary.small", "offersV2.listings.price"],
    })
  );
  return JSON.parse(resp.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: scrape public Amazon page
// ─────────────────────────────────────────────────────────────────────────────
// The public-page scrape fallback was removed 2026-09-17: it ran with a spoofed browser UA, returned
// "Title not found" or bot-checks for most products, and cost ~5 minutes per build. When the Creators API is
// unavailable the product is reported as unverified and the site already hides its price.
// ─────────────────────────────────────────────────────────────────────────────
// Verify one ASIN
// ─────────────────────────────────────────────────────────────────────────────
async function verifyAsin(asin, name) {
  let lastApiIssue = "Creators API lookup unavailable";
  if (CREATORS_CLIENT_ID && CREATORS_CLIENT_SECRET) {
    for (let attempt = 1; attempt <= LOOKUP_ATTEMPTS; attempt++) {
      try {
        const data = await creatorsApiLookup(asin);
        const items = data?.itemsResult?.items || [];
        if (items.length > 0) {
          const title = items[0]?.itemInfo?.title?.displayValue || null;
          const { matches, score } = titleMatches(name, title || "");
          return { title, resolves: true, matches, score, source: "creators_api", error: null };
        }
        lastApiIssue = data?.errors?.[0]?.message || "No items returned";
      } catch (error) {
        lastApiIssue = error?.message || "Creators API request failed";
      }
      if (attempt < LOOKUP_ATTEMPTS) await sleep(RETRY_BACKOFF_MS * attempt);
    }
  }

  // A final title fetch helps distinguish persistent API empty responses from a
  // real delisting. A missing or bot-protected title still fails closed.
  return { title: null, resolves: false, matches: false, score: 0, source: "creators_api", error: lastApiIssue };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  if (CONFIGURED_PARTNER_TAG && CONFIGURED_PARTNER_TAG !== API_PARTNER_TAG) {
    console.warn("WARNING: configured Creators API partner tag differs from the app registration; using trailbuiltove-20 for API requests.");
  }
  console.log(`\n${"=".repeat(60)}`);
  console.log(`ASIN Validation Gate — PauseAndFlourish`);
  console.log(`Auth: ${CREATORS_CLIENT_ID ? "Creators API (OAuth 2.0)" : "public page scraping (fallback)"}`);
  console.log(`${"=".repeat(60)}`);

  const products = extractProducts(PRODUCTS_FILE);
  const searchUrlFiles = findAmazonSearchUrls(join(REPO_ROOT, "client", "src"));
  console.log(`Checking ${products.length} products...`);
  console.log(`Mode: ${WARN_ONLY ? "warn-only remote validation" : "blocking direct-ASIN policy"}\n`);

  let passed = 0, failed = 0;
  const failures = [];
  for (const file of searchUrlFiles) {
    failed++;
    failures.push({ product: "Amazon search URL", asin: "N/A", issue: `Amazon search destinations are prohibited (${file})`, amazon_title: null });
  }
  if (products.length === 0) {
    failed++;
    failures.push({ product: "Product catalog", asin: "N/A", issue: "No direct-ASIN product records were found", amazon_title: null });
  }

  const seen = new Set();
  for (const { name, asin } of products) {
    if (!/^[A-Z0-9]{10}$/.test(asin)) { failed++; failures.push({ product: name, asin, issue: "ASIN is not 10 characters [A-Z0-9]", amazon_title: null }); }
    if (seen.has(asin)) { failed++; failures.push({ product: name, asin, issue: "duplicate ASIN in catalog", amazon_title: null }); }
    seen.add(asin);
  }
  if (LOCAL_ONLY) {
    console.log(`  local checks: ${products.length} products, ${failures.length} finding(s); remote verification runs on the daily rebuild`);
    if (failures.length) { failures.forEach(f => console.log(`   • ${f.product} (${f.asin}): ${f.issue}`)); process.exit(1); }
    console.log("\n✓  Local ASIN checks passed. Deploy proceeding.");
    process.exit(0);
  }
  if (!CREATORS_CLIENT_ID || !CREATORS_CLIENT_SECRET) {
    console.log("  Creators API credentials unavailable: remote verification skipped (reported, not blocking).");
    if (failures.length && !WARN_ONLY) { failures.forEach(f => console.log(`   • ${f.product} (${f.asin}): ${f.issue}`)); process.exit(1); }
    process.exit(0);
  }

  for (let i = 0; i < products.length; i++) {
    const { name, asin } = products[i];
    const result = await verifyAsin(asin, name);

    if (result.resolves && result.matches) {
      console.log(`  ✓ ${name} (${asin})`);
      passed++;
    } else {
      const issue = !result.resolves
        ? (result.error || "ASIN not found")
        : `title mismatch (${Math.round(result.score * 100)}%): got "${(result.title || "N/A").slice(0, 60)}"`;
      console.log(`  ✗ ${name} (${asin}): ${issue}`);
      failed++;
      failures.push({ product: name, asin, issue, amazon_title: result.title });
    }

    if (i < products.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);

  if (failures.length > 0) {
    console.log(`\n⚠  ${failed} product(s) failed:`);
    failures.forEach(f => console.log(`   • ${f.product} (${f.asin}): ${f.issue}`));
    if (WARN_ONLY) {
      console.log("\n⚠  warn-only mode: remote validation findings reported; deploy proceeding.");
      process.exit(0);
    }
    console.log("\n✗  Deploy BLOCKED. Fix the above issues before publishing.");
    process.exit(1);
  } else {
    console.log("\n✓  All products validated. Deploy proceeding.");
    process.exit(0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
