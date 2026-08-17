#!/usr/bin/env node
/**
 * Validate Amazon destination construction in the production bundle.
 *
 * This runs after `pnpm build`, scanning rendered HTML and compiled JavaScript.
 * Direct product records are separately live-title-validated; this gate ensures
 * no orphaned or generic Amazon URL can survive into the published bundle.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const BUILD_ROOT = process.argv[2] || join(REPO_ROOT, "dist", "public");
const PARTNER_TAG = process.env.CREATORS_API_PARTNER_TAG || "pauseandflourish-20";
const PUBLIC_AMAZON_URL = /https:\/\/(?:www\.)?amazon\.com[^"'`\\\s<>()]*/gi;
const HREF_URL = /href\s*=\s*["'](https?:\/\/(?:www\.)?amazon\.[^"'\s<>]+)["']/gi;
const LITERAL_DP = /^https:\/\/(?:www\.)?amazon\.com\/dp\/[A-Z0-9]{10}(?:[/?#]|$)/i;
const DYNAMIC_DP = /^https:\/\/(?:www\.)?amazon\.com\/dp\/\$\{[^}]+\}\?tag=(?:\$\{[^}]+\}|[A-Za-z0-9-]+)$/;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else if (/\.(?:html|js|mjs)$/i.test(entry)) files.push(path);
  }
  return files;
}

function hasAffiliateTag(url) {
  return new RegExp(`[?&]tag=${PARTNER_TAG.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[&#]|$)`, "i").test(url);
}

const files = walk(BUILD_ROOT);
const failures = [];
let htmlAnchors = 0;
let directAnchors = 0;
let bundleAmazonDestinations = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (/\.html$/i.test(file)) {
    for (const match of text.matchAll(HREF_URL)) {
      htmlAnchors++;
      const href = match[1].replace(/&amp;/g, "&");
      if (LITERAL_DP.test(href) && hasAffiliateTag(href)) directAnchors++;
      else failures.push(`${file}: malformed rendered Amazon anchor ${href}`);
    }
  }
  if (/\.(?:js|mjs)$/i.test(file)) {
    for (const match of text.matchAll(PUBLIC_AMAZON_URL)) {
      const url = match[0];
      bundleAmazonDestinations++;
      if (DYNAMIC_DP.test(url) && (url.endsWith(`?tag=${PARTNER_TAG}`) || /\?tag=\$\{[^}]+\}$/.test(url))) continue;
      if (LITERAL_DP.test(url) && hasAffiliateTag(url)) continue;
      failures.push(`${file}: malformed compiled Amazon destination ${url}`);
    }
  }
}

console.log("Rendered Amazon Anchor Gate");
console.log(`Build files checked:           ${files.length}`);
console.log(`Rendered HTML Amazon anchors:  ${htmlAnchors}`);
console.log(`Tagged direct HTML anchors:    ${directAnchors}`);
console.log(`Compiled Amazon destinations:  ${bundleAmazonDestinations}`);
console.log(`Non-conforming:                ${failures.length}`);
for (const failure of failures) console.error(`  - ${failure}`);
process.exit(failures.length ? 1 : 0);
