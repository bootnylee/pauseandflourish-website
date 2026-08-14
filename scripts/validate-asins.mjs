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
 *   node scripts/validate-asins.mjs
 *
 * This is a hard publication gate. It does not support warning-only or skip modes.
 * Environment variables (set in Netlify dashboard → Site settings → Environment):
 *   CREATORS_API_CLIENT_ID          → Amazon Creators API client ID
 *   CREATORS_API_CLIENT_SECRET      → Amazon Creators API client secret
 *   CREATORS_API_PARTNER_TAG        → affiliate tag (default: pauseandflourish-20)
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
const PARTNER_TAG            = process.env.CREATORS_API_PARTNER_TAG || "pauseandflourish-20";
const MARKETPLACE            = "www.amazon.com";

const MATCH_THRESHOLD = 0.60;
const REQUEST_DELAY_MS = 1200;

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
      partnerTag: PARTNER_TAG,
      partnerType: "Associates",
      resources: ["itemInfo.title", "images.primary.small", "offersV2.listings.price"],
    })
  );
  return JSON.parse(resp.body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: scrape public Amazon page
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeAmazonTitle(asin) {
  try {
    const resp = await httpGet(
      "www.amazon.com", `/dp/${asin}`,
      {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    );
    if (resp.status === 404) return { title: null, error: "ASIN not found (404)" };
    const m = resp.body.match(/id="productTitle"[^>]*>\s*([^<]{5,300})/);
    if (m) return { title: m[1].trim(), error: null };
    const m2 = resp.body.match(/<meta[^>]+property="og:title"[^>]+content="([^"]{5,300})"/);
    if (m2) return { title: m2[1].trim(), error: null };
    if (resp.body.includes("robot") || resp.body.includes("captcha"))
      return { title: null, error: "Amazon bot-check" };
    return { title: null, error: "Title not found in page" };
  } catch (e) {
    return { title: null, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify one ASIN
// ─────────────────────────────────────────────────────────────────────────────
async function verifyAsin(asin, name) {
  // Try Creators API first
  if (CREATORS_CLIENT_ID && CREATORS_CLIENT_SECRET) {
    try {
      const data = await creatorsApiLookup(asin);
      const items = data?.itemsResult?.items || [];
      if (items.length > 0) {
        const title = items[0]?.itemInfo?.title?.displayValue || null;
        const { matches, score } = titleMatches(name, title || "");
        return { title, resolves: true, matches, score, source: "creators_api", error: null };
      }
      const errMsg = data?.errors?.[0]?.message || "No items returned";
      return { title: null, resolves: false, matches: false, score: 0, source: "creators_api", error: errMsg };
    } catch (e) {
      // Fall through to scrape
    }
  }

  // Fallback: scrape
  const { title, error } = await scrapeAmazonTitle(asin);
  if (error || !title) return { title: null, resolves: false, matches: false, score: 0, source: "scrape", error: error || "not found" };
  const { matches, score } = titleMatches(name, title);
  return { title, resolves: true, matches, score, source: "scrape", error: null };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`ASIN Validation Gate — PauseAndFlourish`);
  console.log(`Auth: ${CREATORS_CLIENT_ID ? "Creators API (OAuth 2.0)" : "public page scraping (fallback)"}`);
  console.log(`${"=".repeat(60)}`);

  const products = extractProducts(PRODUCTS_FILE);
  const searchUrlFiles = findAmazonSearchUrls(join(REPO_ROOT, "client", "src"));
  console.log(`Checking ${products.length} products...`);
  console.log("Mode: blocking direct-ASIN policy\n");

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
    console.log("\n✗  Deploy BLOCKED. Fix the above issues before publishing.");
    process.exit(1);
  } else {
    console.log("\n✓  All products validated. Deploy proceeding.");
    process.exit(0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
