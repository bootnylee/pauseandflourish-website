#!/usr/bin/env node
/**
 * scripts/fetch-prices.js — Amazon PA-API 5.0 price & image sync
 *
 * Reads every `asin:` from client/src/lib/products.ts, calls PA-API 5.0
 * GetItems in batches of 10 ASINs (Resources: Offers.Listings.Price,
 * Images.Primary.Large), throttled to 1 request/second with exponential
 * backoff on HTTP 429, then rewrites products.ts in place, updating ONLY:
 *   - price:        "<DisplayAmount>"   (from Offers.Listings[0].Price.DisplayAmount)
 *   - priceDisplay: "<DisplayAmount>"   (from Offers.Listings[0].Price.DisplayAmount)
 *   - heroImage:                        (from Images.Primary.Large.URL)
 * All other fields and file formatting are preserved exactly.
 *
 * ASINs that return ItemNotAccessible (or any error) or have no offer are
 * flagged in price-sync-report.json and left unchanged — never deleted.
 *
 * Credentials are read STRICTLY from environment variables:
 *   PAAPI_ACCESS_KEY, PAAPI_SECRET_KEY, PAAPI_PARTNER_TAG
 * They are never logged, printed, or written to disk.
 *
 * Usage:
 *   node scripts/fetch-prices.js             # live sync (requires env vars)
 *   node scripts/fetch-prices.js --dry-run   # uses local mock fixture, no network;
 *                                             # STRICTLY READ-ONLY: products.ts is never
 *                                             # modified, proposed changes go only into
 *                                             # price-sync-report.json
 *
 * AWS SigV4 signing is implemented with Node built-in crypto only — no
 * external dependencies.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ─── Configuration ───────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const PRODUCTS_FILE = path.join(REPO_ROOT, "client", "src", "lib", "products.ts");
const REPORT_FILE = path.join(REPO_ROOT, "price-sync-report.json");
const FIXTURE_FILE = path.join(__dirname, "fixtures", "paapi-getitems-mock.json");

const HOST = "webservices.amazon.com";
const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";
const URI_PATH = "/paapi5/getitems";
const API_TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
const MARKETPLACE = "www.amazon.com";

const BATCH_SIZE = 10;
const REQUEST_INTERVAL_MS = 1000; // 1 request per second
const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 2000; // 2s, 4s, 8s, 16s, 32s

const RESOURCES = ["Offers.Listings.Price", "Images.Primary.Large"];

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Credentials (env only — never logged, never hardcoded) ─────────────────

function getCredentials() {
  const accessKey = process.env.PAAPI_ACCESS_KEY;
  const secretKey = process.env.PAAPI_SECRET_KEY;
  const partnerTag = process.env.PAAPI_PARTNER_TAG;
  if (!accessKey || !secretKey || !partnerTag) {
    console.error(
      "ERROR: Missing required environment variables. " +
        "PAAPI_ACCESS_KEY, PAAPI_SECRET_KEY, and PAAPI_PARTNER_TAG must all be set."
    );
    process.exit(1);
  }
  return { accessKey, secretKey, partnerTag };
}

// ─── AWS Signature Version 4 (Node built-in crypto only) ────────────────────

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function amzDates(date = new Date()) {
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8); // YYYYMMDD
  return { amzDate, dateStamp };
}

function signRequest({ accessKey, secretKey }, payload) {
  const { amzDate, dateStamp } = amzDates();

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${API_TARGET}\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    "POST",
    URI_PATH,
    "", // no query string
    canonicalHeaders,
    signedHeaders,
    sha256Hex(payload),
  ].join("\n");

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    "Content-Encoding": "amz-1.0",
    "Content-Type": "application/json; charset=utf-8",
    Host: HOST,
    "X-Amz-Date": amzDate,
    "X-Amz-Target": API_TARGET,
    Authorization: authorization,
  };
}

// ─── PA-API GetItems call with throttle + exponential backoff ───────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Returns { body, httpStatus, errorCodes } where:
 *   body        — parsed JSON response (may contain ItemsResult and/or Errors)
 *   httpStatus  — numeric HTTP status code (always captured)
 *   errorCodes  — array of Errors[].Code strings from the response (never credential material)
 */
async function getItems(credentials, asins) {
  const payload = JSON.stringify({
    ItemIds: asins,
    ItemIdType: "ASIN",
    Resources: RESOURCES,
    PartnerTag: credentials.partnerTag,
    PartnerType: "Associates",
    Marketplace: MARKETPLACE,
  });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const headers = signRequest(credentials, payload);
    const res = await fetch(`https://${HOST}${URI_PATH}`, {
      method: "POST",
      headers,
      body: payload,
    });

    if (res.status === 429) {
      if (attempt === MAX_RETRIES) {
        throw new Error(`PA-API throttled (429) after ${MAX_RETRIES} retries`);
      }
      const backoff = BACKOFF_BASE_MS * 2 ** attempt;
      console.log(`  429 TooManyRequests — backing off ${backoff / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(backoff);
      continue;
    }

    const body = await res.json().catch(() => ({}));

    // Extract error codes ONLY — never log messages (may contain request details).
    const errorCodes = (body.Errors ?? []).map((e) => e.Code ?? "Unknown");

    if (!res.ok) {
      // Log the HTTP status and error codes so they appear in the workflow log
      // and are captured in the report. Never print credential material or full
      // request headers.
      console.error(
        `  PA-API HTTP ${res.status} for batch [${asins.join(", ")}]` +
          (errorCodes.length ? ` — error codes: ${errorCodes.join(", ")}` : "")
      );
    }

    return { body, httpStatus: res.status, errorCodes };
  }
}

// ─── Fixture loading for --dry-run ───────────────────────────────────────────

function loadFixture() {
  const raw = fs.readFileSync(FIXTURE_FILE, "utf8");
  return JSON.parse(raw);
}

// ─── Extract ASINs from products.ts ──────────────────────────────────────────

function extractAsins(source) {
  const asins = new Set();
  const re = /asin:\s*"([A-Z0-9]{10})"/g;
  let m;
  while ((m = re.exec(source)) !== null) asins.add(m[1]);
  return [...asins];
}

// ─── Parse GetItems responses into { asin: { price, display, image } } ──────

function indexResponse(response, priceMap, errorMap) {
  for (const err of response?.Errors ?? []) {
    // Error code e.g. "ItemNotAccessible"; message contains the ASIN.
    const asinMatch = /ItemId\s+([A-Z0-9]{10})/i.exec(err.Message ?? "");
    if (asinMatch) {
      errorMap.set(asinMatch[1], err.Code ?? "Unknown");
    }
  }
  for (const item of response?.ItemsResult?.Items ?? []) {
    const asin = item.ASIN;
    const listing = item.Offers?.Listings?.[0];
    const price = listing?.Price;
    const image = item.Images?.Primary?.Large?.URL ?? null;
    if (price?.Amount != null && price?.DisplayAmount) {
      priceMap.set(asin, {
        amount: price.Amount,
        display: price.DisplayAmount,
        image,
      });
    } else {
      errorMap.set(asin, "NoOffer");
      // Still capture a fresh image if present, so hotlink rot is fixed even
      // when the offer is missing.
      if (image) priceMap.set(asin, { amount: null, display: null, image });
    }
  }
}

// ─── Rewrite products.ts in place (only price + image values change) ─────────

function updateProductBlocks(source, priceMap) {
  const updated = new Set();
  const asinRe = /asin:\s*"([A-Z0-9]{10})"/g;

  // Locate each product object block by scanning from the asin: field to the
  // end of its enclosing object literal, then rewrite fields inside it.
  let result = "";
  let cursor = 0;
  let m;
  while ((m = asinRe.exec(source)) !== null) {
    const asin = m[1];
    const data = priceMap.get(asin);
    if (!data) continue;

    // Find the boundaries of the enclosing object: walk back to the opening
    // "{" and forward to its matching "}".
    const asinPos = m.index;
    let open = source.lastIndexOf("{", asinPos);
    // Walk back further if there are nested closings between (defensive).
    let depth = 1;
    let close = -1;
    for (let i = open + 1; i < source.length; i++) {
      const ch = source[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (open === -1 || close === -1) continue;

    let block = source.slice(open, close + 1);
    let changed = false;

    if (data.amount != null && data.display) {
      // This repo stores price as a display string, e.g. price: "$31.88"
      const nb = block
        .replace(/(\bprice:\s*")[^"]*(")/, (_, p1, p2) => `${p1}${data.display}${p2}`)
        .replace(/(\bpriceDisplay:\s*")[^"]*(")/, (_, p1, p2) => `${p1}${data.display}${p2}`);
      if (nb !== block) {
        block = nb;
        changed = true;
      }
    }

    if (data.image) {
      const nb = block.replace(
        /(\bheroImage:\s*")[^"]*(")/,
        (_, p1, p2) => `${p1}${data.image}${p2}`
      );
      if (nb !== block) {
        block = nb;
        changed = true;
      }
    }

    if (changed) {
      result += source.slice(cursor, open) + block;
      cursor = close + 1;
      updated.add(asin);
    }
  }
  result += source.slice(cursor);
  return { source: result, updated };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const source = fs.readFileSync(PRODUCTS_FILE, "utf8");
  const asins = extractAsins(source);
  console.log(`Found ${asins.length} unique ASINs in products.ts`);

  const priceMap = new Map();
  const errorMap = new Map();

  // batchErrors captures per-batch HTTP status and error codes for the report.
  // Never contains credential material or full request headers.
  const batchErrors = [];

  if (DRY_RUN) {
    console.log("DRY RUN: using mock GetItems fixture — no network calls, no credentials required.");
    const fixtures = loadFixture();
    for (const response of fixtures.responses) {
      indexResponse(response, priceMap, errorMap);
    }
  } else {
    const credentials = getCredentials();
    for (let i = 0; i < asins.length; i += BATCH_SIZE) {
      const batch = asins.slice(i, i + BATCH_SIZE);
      const batchNum = i / BATCH_SIZE + 1;
      const totalBatches = Math.ceil(asins.length / BATCH_SIZE);
      console.log(`Fetching batch ${batchNum}/${totalBatches} (${batch.length} ASINs)`);
      try {
        const { body, httpStatus, errorCodes } = await getItems(credentials, batch);

        // Record any non-200 batch result in the report (codes only, no secrets).
        if (httpStatus !== 200 && errorCodes.length > 0) {
          batchErrors.push({
            batchNum,
            asins: batch,
            httpStatus,
            errorCodes,
          });
          // Mark all ASINs in this batch with the first error code so they
          // appear explicitly in the flagged list rather than as NotReturned.
          for (const asin of batch) {
            if (!priceMap.has(asin) && !errorMap.has(asin)) {
              errorMap.set(asin, errorCodes[0]);
            }
          }
        }

        indexResponse(body, priceMap, errorMap);
      } catch (err) {
        console.error(`  Batch failed: ${err.message}`);
        batchErrors.push({
          batchNum,
          asins: batch,
          httpStatus: null,
          errorCodes: ["BatchRequestFailed"],
        });
        for (const asin of batch) {
          if (!priceMap.has(asin) && !errorMap.has(asin)) {
            errorMap.set(asin, "BatchRequestFailed");
          }
        }
      }
      if (i + BATCH_SIZE < asins.length) await sleep(REQUEST_INTERVAL_MS);
    }
  }

  // Any ASIN with no data and no explicit error is unreturned → flag it.
  for (const asin of asins) {
    if (!priceMap.has(asin) && !errorMap.has(asin)) {
      errorMap.set(asin, "NotReturned");
    }
  }

  const { source: newSource, updated } = updateProductBlocks(source, priceMap);
  if (DRY_RUN) {
    // DRY RUN is strictly read-only: products.ts is NEVER rewritten. All
    // proposed changes are recorded in price-sync-report.json only.
    console.log(
      "DRY RUN: products.ts left untouched; proposed changes written to price-sync-report.json only."
    );
  } else if (newSource !== source) {
    fs.writeFileSync(PRODUCTS_FILE, newSource, "utf8");
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: DRY_RUN ? "dry-run" : "live",
    totalAsins: asins.length,
    updatedCount: updated.size,
    updated: [...updated].sort(),
    proposedChanges: DRY_RUN
      ? [...updated].sort().map((asin) => {
          const data = priceMap.get(asin);
          return {
            asin,
            newPrice: data?.amount ?? null,
            newPriceDisplay: data?.display ?? null,
            newImage: data?.image ?? null,
          };
        })
      : undefined,
    flagged: [...errorMap.entries()]
      .map(([asin, reason]) => ({ asin, reason, action: "left unchanged" }))
      .sort((a, b) => a.asin.localeCompare(b.asin)),
    // batchErrors is only present when there were non-200 responses.
    // Contains HTTP status codes and PA-API error Code strings only —
    // never credential material, never full request headers.
    ...(batchErrors.length > 0 ? { batchErrors } : {}),
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(`Updated ${updated.size} product(s); flagged ${errorMap.size} ASIN(s) — see price-sync-report.json`);

  // ─── Systemic-failure guard ───────────────────────────────────────────────
  // When running live, if every single ASIN was flagged and nothing was updated,
  // the entire sync was a no-op. This is almost certainly a systemic error
  // (auth failure, account eligibility, network issue) rather than legitimate
  // product unavailability. Exit non-zero so the workflow FAILS loudly instead
  // of committing a useless report that masks the problem.
  if (!DRY_RUN && updated.size === 0 && errorMap.size === asins.length && asins.length > 0) {
    const uniqueErrorCodes = [...new Set([...errorMap.values()])].sort();
    console.error(
      `SYSTEMIC FAILURE: mode=live, updatedCount=0, flagged=${errorMap.size}/${asins.length} (100%). ` +
        `Unique error codes: ${uniqueErrorCodes.join(", ")}. ` +
        `This is not a product-availability issue — check PA-API credentials, ` +
        `partner tag, and Associates account eligibility (requires 3 qualifying ` +
        `sales in the trailing 180 days). Exiting non-zero.`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(1);
});
