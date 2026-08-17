#!/usr/bin/env node
/**
 * Non-blocking Amazon ASIN mapping validator.
 *
 * The validator parses every top-level entry in the product catalog, compares
 * each entry's displayed product name with the Amazon listing title, and writes
 * a JSON report. It deliberately exits 0 for MATCH, MISMATCH, DEAD, and
 * INCONCLUSIVE results so the weekly workflow remains issue-only.
 *
 * It uses only the current Creators API secrets:
 * CREATORS_API_CLIENT_ID, CREATORS_API_CLIENT_SECRET, CREATORS_API_PARTNER_TAG.
 * A public-page lookup is a conservative fallback. Bot blocks, rate limits,
 * credentials/service failures, and missing public titles are INCONCLUSIVE.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PRODUCTS_FILE = join(REPO_ROOT, "client", "src", "lib", "products.ts");
const DEFAULT_REPORT = join(REPO_ROOT, "asin-mapping-report.json");
const MATCH_THRESHOLD = 0.48;
const REQUEST_DELAY_MS = 1050;
const STOP_WORDS = new Set([
  "a", "an", "and", "at", "by", "for", "from", "in", "on", "of", "or", "the", "to", "with",
  "amazon", "buy", "check", "click", "deal", "details", "get", "here", "learn", "more", "now",
  "price", "shop", "view", "your", "you", "lb", "lbs", "oz", "pack",
]);

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function sleep(ms) {
  return new Promise(resolveSleep => setTimeout(resolveSleep, ms));
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalise(value) {
  return cleanText(String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " "));
}

function canonicalToken(token) {
  // Singularize only simple English plurals so title variants such as
  // "Pillow" versus "Pillows" do not mask a valid brand/product match.
  return token.length > 3 && token.endsWith("s") && !token.endsWith("ss") ? token.slice(0, -1) : token;
}

function productTokens(value) {
  return normalise(value).split(" ")
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))
    .map(canonicalToken);
}

function scoreTitleMatch(contextName, amazonTitle) {
  const contextTokens = productTokens(contextName);
  const titleTokens = new Set(productTokens(amazonTitle));
  if (contextTokens.length === 0 || titleTokens.size === 0) return { score: 0, matchedTokens: [], matches: false };

  const contextSet = new Set(contextTokens);
  const matchedTokens = [...contextSet].filter(token => titleTokens.has(token)).sort();
  const fullOverlap = matchedTokens.length / contextSet.size;
  const brandMatch = titleTokens.has(contextTokens[0]) ? 1 : 0;
  const productSet = new Set(contextTokens.slice(1));
  const productOverlap = productSet.size
    ? [...productSet].filter(token => titleTokens.has(token)).length / productSet.size
    : fullOverlap;
  const a = normalise(contextName);
  const b = normalise(amazonTitle);
  const sequence = sequenceSimilarity(a, b);
  const score = (0.40 * fullOverlap) + (0.30 * productOverlap) + (0.20 * brandMatch) + (0.10 * sequence);
  return { score: Number(score.toFixed(3)), matchedTokens, matches: score >= MATCH_THRESHOLD };
}

function sequenceSimilarity(a, b) {
  if (!a || !b) return 0;
  // A compact Dice-bigram score is sufficient as a minor tie-breaker; token
  // overlap and first-token brand matching remain the primary safety signals.
  const grams = value => {
    const out = new Map();
    for (let i = 0; i < value.length - 1; i++) {
      const gram = value.slice(i, i + 2);
      out.set(gram, (out.get(gram) || 0) + 1);
    }
    return out;
  };
  const left = grams(a);
  const right = grams(b);
  let shared = 0;
  for (const [gram, count] of left) shared += Math.min(count, right.get(gram) || 0);
  return (2 * shared) / Math.max(1, (a.length - 1) + (b.length - 1));
}

function readStringAt(content, index) {
  const quote = content[index];
  if (!["'", "\"", "`"].includes(quote)) return null;
  let value = "";
  for (let i = index + 1; i < content.length; i++) {
    const char = content[i];
    if (char === "\\") {
      value += char + (content[i + 1] || "");
      i += 1;
      continue;
    }
    if (char === quote) return { value, end: i };
    value += char;
  }
  return null;
}

function topLevelObjectsInArray(content, arrayStart) {
  const objects = [];
  let arrayDepth = 0;
  let objectDepth = 0;
  let objectStart = -1;

  for (let i = arrayStart; i < content.length; i++) {
    const char = content[i];
    if (["'", "\"", "`"].includes(char)) {
      const string = readStringAt(content, i);
      if (!string) throw new Error("Unterminated string in product catalog");
      i = string.end;
      continue;
    }
    if (char === "/" && content[i + 1] === "/") {
      const nextLine = content.indexOf("\n", i + 2);
      i = nextLine === -1 ? content.length : nextLine;
      continue;
    }
    if (char === "/" && content[i + 1] === "*") {
      const end = content.indexOf("*/", i + 2);
      if (end === -1) throw new Error("Unterminated comment in product catalog");
      i = end + 1;
      continue;
    }
    if (char === "[") arrayDepth += 1;
    else if (char === "]") {
      arrayDepth -= 1;
      if (arrayDepth === 0) break;
    } else if (char === "{") {
      if (arrayDepth === 1 && objectDepth === 0) objectStart = i;
      if (arrayDepth >= 1) objectDepth += 1;
    } else if (char === "}" && objectDepth > 0) {
      objectDepth -= 1;
      if (arrayDepth === 1 && objectDepth === 0 && objectStart >= 0) {
        objects.push(content.slice(objectStart, i + 1));
        objectStart = -1;
      }
    }
  }
  return objects;
}

function propertyValue(objectText, property) {
  const match = new RegExp(`\\b${property}\\s*:\\s*(["'])((?:\\\\.|(?!\\1).)*)\\1`, "s").exec(objectText);
  return match ? cleanText(match[2].replace(/\\([\\'"`])/g, "$1")) : "";
}

function extractProducts() {
  const content = readFileSync(PRODUCTS_FILE, "utf8");
  // The site stores its catalog in typed Product[] source collections. Parse
  // each concrete collection so every product entry is included exactly once.
  const declaration = /(?:export\s+)?const\s+([A-Za-z][A-Za-z0-9]*Products)\s*:\s*Product\[\]\s*=\s*\[/g;
  const entries = [];
  let match;
  while ((match = declaration.exec(content)) !== null) {
    const arrayStart = match.index + match[0].lastIndexOf("[");
    entries.push(...topLevelObjectsInArray(content, arrayStart));
  }
  if (entries.length === 0) throw new Error("Could not locate any typed Product[] source collections");

  const products = [];
  const seen = new Set();
  for (const entry of entries) {
    const name = propertyValue(entry, "name");
    const asin = propertyValue(entry, "asin").toUpperCase();
    const brand = propertyValue(entry, "brand");
    if (!name && !asin) continue;
    const key = `${name}|${asin}`;
    if (!seen.has(key)) {
      seen.add(key);
      products.push({ name, asin, brand });
    }
  }
  return products;
}

function credentials() {
  const credentialId = process.env.CREATORS_API_CLIENT_ID || "";
  const credentialSecret = process.env.CREATORS_API_CLIENT_SECRET || "";
  const partnerTag = process.env.CREATORS_API_PARTNER_TAG || "";
  return credentialId && credentialSecret && partnerTag ? { credentialId, credentialSecret, partnerTag } : null;
}

let tokenCache = null;
async function tokenV3(config) {
  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: config.credentialId,
      client_secret: config.credentialSecret,
      scope: "creatorsapi::default",
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) throw new Error(`LwA token HTTP ${response.status}: ${body.error || "unavailable"}`);
  return body;
}

async function tokenV2(config) {
  const basic = Buffer.from(`${config.credentialId}:${config.credentialSecret}`).toString("base64");
  const response = await fetch("https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "creatorsapi/default" }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) throw new Error(`Cognito token HTTP ${response.status}: ${body.error || "unavailable"}`);
  return body;
}

async function accessToken(config) {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.accessToken;
  let tokenData;
  try {
    tokenData = await tokenV3(config);
  } catch (v3Error) {
    try {
      tokenData = await tokenV2(config);
    } catch (v2Error) {
      throw new Error(`${v3Error.message}; ${v2Error.message}`);
    }
  }
  tokenCache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + Math.max(0, (Number(tokenData.expires_in) || 3600) - 60) * 1000,
  };
  return tokenCache.accessToken;
}

async function creatorsLookup(asin, config) {
  try {
    const token = await accessToken(config);
    const response = await fetch("https://creatorsapi.amazon/catalog/v1/getItems", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-marketplace": "www.amazon.com",
      },
      body: JSON.stringify({
        itemIds: [asin],
        itemIdType: "ASIN",
        marketplace: "www.amazon.com",
        partnerTag: config.partnerTag,
        resources: ["itemInfo.title"],
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { verdict: "INCONCLUSIVE", title: null, source: "creators_api", detail: `GetItems HTTP ${response.status}` };
    const title = body?.itemsResult?.items?.[0]?.itemInfo?.title?.displayValue;
    if (title) return { verdict: "LIVE", title: cleanText(title), source: "creators_api", detail: "" };
    const error = body?.errors?.[0] || {};
    const detail = String(error.message || "No item title returned");
    const code = String(error.code || "").toLowerCase();
    const combined = `${code} ${detail}`.toLowerCase();
    if (combined.includes("notfound") || combined.includes("not found") || combined.includes("itemnotaccessible") || combined.includes("item not accessible")) {
      return { verdict: "DEAD", title: null, source: "creators_api", detail };
    }
    return { verdict: "INCONCLUSIVE", title: null, source: "creators_api", detail };
  } catch (error) {
    return { verdict: "INCONCLUSIVE", title: null, source: "creators_api", detail: `Creators API unavailable: ${error.message}` };
  }
}

async function scrapeLookup(asin) {
  try {
    const response = await fetch(`https://www.amazon.com/dp/${asin}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (response.status === 404) return { verdict: "DEAD", title: null, source: "scrape", detail: "Amazon product page returned HTTP 404" };
    if (response.status === 403 || response.status === 429) return { verdict: "INCONCLUSIVE", title: null, source: "scrape", detail: `Amazon returned HTTP ${response.status} (bot/rate block)` };
    const page = await response.text();
    const lowered = page.toLowerCase();
    if (lowered.includes("captcha") || lowered.includes("robot check") || lowered.includes("sorry, we just need to make sure")) {
      return { verdict: "INCONCLUSIVE", title: null, source: "scrape", detail: "Amazon returned a bot-check or rate-limit page" };
    }
    const titleMatch = /id=["']productTitle["'][^>]*>\s*([^<]{3,500})/i.exec(page)
      || /<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']{3,500})/i.exec(page);
    if (titleMatch) return { verdict: "LIVE", title: cleanText(titleMatch[1]), source: "scrape", detail: "" };
    return { verdict: "INCONCLUSIVE", title: null, source: "scrape", detail: "Amazon page did not expose a product title" };
  } catch (error) {
    return { verdict: "INCONCLUSIVE", title: null, source: "scrape", detail: `Amazon request failed: ${error.message}` };
  }
}

async function lookupTitle(asin, config, offline) {
  if (offline) return { verdict: "INCONCLUSIVE", title: null, source: "offline", detail: "Offline mode requested" };
  if (config) {
    const apiResult = await creatorsLookup(asin, config);
    if (apiResult.verdict === "LIVE" || apiResult.verdict === "DEAD") return apiResult;
  }
  return scrapeLookup(asin);
}

async function main() {
  const offline = process.argv.includes("--offline");
  const maxItems = Number(getArg("--max-items", "0")) || 0;
  const reportPath = resolve(getArg("--output", DEFAULT_REPORT));
  const products = extractProducts();
  const inspected = maxItems > 0 ? products.slice(0, maxItems) : products;
  const config = credentials();

  console.log("=".repeat(72));
  console.log("ASIN Mapping Validation — Pause & Flourish (blocking gate)");
  console.log("=".repeat(72));
  console.log(`Catalog entries found: ${products.length} | entries inspected: ${inspected.length}`);
  console.log(`Lookup source: ${config ? "Amazon Creators API with scrape fallback" : "public Amazon scrape fallback"}`);

  const cache = new Map();
  const findings = [];
  for (let i = 0; i < inspected.length; i++) {
    const product = inspected[i];
    let lookup;
    if (!/^[A-Z0-9]{10}$/.test(product.asin)) {
      lookup = { verdict: "INCONCLUSIVE", title: null, source: "catalog", detail: "Missing or invalid 10-character ASIN" };
    } else if (cache.has(product.asin)) {
      lookup = cache.get(product.asin);
    } else {
      lookup = await lookupTitle(product.asin, config, offline);
      cache.set(product.asin, lookup);
      if (i < inspected.length - 1 && !offline) await sleep(REQUEST_DELAY_MS);
    }

    const finding = {
      product: product.name,
      brand: product.brand,
      asin: product.asin,
      amazon_title: lookup.title,
      score: null,
      matched_tokens: [],
      source: lookup.source,
      verdict: lookup.verdict,
      detail: lookup.detail,
    };
    if (lookup.verdict === "LIVE") {
      const match = scoreTitleMatch(product.name, lookup.title || "");
      finding.score = match.score;
      finding.matched_tokens = match.matchedTokens;
      finding.verdict = match.matches ? "MATCH" : "MISMATCH";
      if (!match.matches) finding.detail = `Name/title score ${(match.score * 100).toFixed(0)}% is below the ${(MATCH_THRESHOLD * 100).toFixed(0)}% threshold`;
    }
    findings.push(finding);
    const preview = String(finding.amazon_title || finding.detail || "").replace(/\s+/g, " ").slice(0, 72);
    const score = finding.score === null ? "—" : `${Math.round(finding.score * 100)}%`;
    console.log(`${finding.verdict.padEnd(12)} | ${finding.asin.padEnd(10)} | ${score.padStart(4)} | ${finding.product.slice(0, 42)} | ${preview}`);
  }

  const summary = Object.fromEntries(["MATCH", "MISMATCH", "DEAD", "INCONCLUSIVE"].map(verdict => [verdict, findings.filter(item => item.verdict === verdict).length]));
  const report = {
    generated_at: new Date().toISOString(),
    validator: "scripts/validate-asin-mappings.mjs",
    non_blocking: false,
    threshold: MATCH_THRESHOLD,
    catalog_file: "client/src/lib/products.ts",
    catalog_entries_found: products.length,
    entries_inspected: inspected.length,
    unique_asins: cache.size,
    lookup_mode: config ? "creators_api_with_scrape_fallback" : "scrape_fallback_only",
    summary,
    findings,
  };
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log("-".repeat(72));
  console.log(`SUMMARY | match=${summary.MATCH} mismatch=${summary.MISMATCH} dead=${summary.DEAD} inconclusive=${summary.INCONCLUSIVE} | report=${reportPath}`);
  const blockers = summary.MISMATCH + summary.DEAD + summary.INCONCLUSIVE + (products.length === 0 ? 1 : 0);
  if (blockers > 0) {
    console.error(`BLOCKED | ${blockers} product destination(s) are unresolved, dead, mismatched, or missing.`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`BLOCKED | validator internal error: ${error.message}`);
  process.exit(1);
});
