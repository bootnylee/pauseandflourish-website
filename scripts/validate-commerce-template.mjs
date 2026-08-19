#!/usr/bin/env node
/**
 * Blocks deploys if product-bearing route components drift from the canonical
 * conversion/SEO template. ASIN title validation remains in validate-asins.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const failures = [];
const expect = (source, token, label) => { if (!source.includes(token)) failures.push(label); };

const commerce = read("client/src/components/ProductCommerce.tsx");
const comparison = read("client/src/pages/ComparisonPage.tsx");
const review = read("client/src/pages/ProductReview.tsx");
const cards = read("client/src/components/ProductCard.tsx");
const quiz = "";
const commerceSeo = read("client/src/lib/commerceSeo.ts");
const products = read("client/src/lib/products.ts");

expect(commerce, 'rel="sponsored nofollow noopener"', "Verified CTA must use sponsored, nofollow, noopener");
expect(commerce, "No verified link", "Verified CTA must suppress unverified product links");
expect(commerce, "Price unavailable", "Catalog-price UI must hide unavailable prices");
expect(comparison, "ProductComparisonTable", "Comparison pages must render the standardized comparison table");
expect(comparison, "View picks on Amazon", "Comparison pages must render the mobile sticky buyer CTA");
expect(comparison, "commerceItemListSchema", "Comparison pages must emit ItemList Product schema");
expect(comparison, "comparison-faq-schema", "Comparison pages must emit FAQPage schema");
if (/Editorial assessment|>Rating</.test(commerce)) failures.push("Comparison template must not contain a placeholder Rating column or assessment text");
expect(review, '"@type": "Article"', "Review pages must emit Article schema");
expect(review, "commerceItemListSchema", "Review pages must emit ItemList Product schema");
expect(review, "product-faq-schema", "Review pages must emit FAQPage schema");
expect(cards, "VerifiedAmazonCta", "Product cards must use verified CTA rendering");

if (/\baggregateRating\s*:/.test(commerceSeo)) failures.push("Commerce schema must not fabricate aggregateRating");
if (/reviewRating\s*:|ratingValue\s*:/.test(commerceSeo)) failures.push("Commerce schema must not expose an unverified static numeric rating");
const prohibitedBadge = /Amazon['’]?s Choice|Amazon Choice|Best[- ]?Seller|Bestseller|#\d+\s+Best[- ]?Seller/i;
for (const [name, source] of [["Product content", products], ["ComparisonPage", comparison], ["ProductReview", review], ["ProductCard", cards]]) {
  if (prohibitedBadge.test(source)) failures.push(`${name} contains a prohibited Amazon merchandising badge claim`);
}
for (const [name, source] of [["ProductCard", cards], ["ComparisonPage", comparison], ["ProductReview", review]]) {
  if (/StarRatingDisplay|product\.rating\.toFixed\(|product\.reviewCount/.test(source)) failures.push(`${name} renders an unverified static product rating`);
}

for (const [name, source] of [["ComparisonPage", comparison], ["ProductReview", review], ["ProductCard", cards]]) {
  if (/href=\{(?:amazonLink|affUrl|amazonUrl)/.test(source)) failures.push(`${name} contains a raw Amazon href outside VerifiedAmazonCta`);
  if (/rel="noopener noreferrer nofollow"/.test(source)) failures.push(`${name} has legacy affiliate rel values`);
}

if (failures.length) {
  console.error("COMMERCE TEMPLATE GATE FAILED:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Commerce template gate passed: verified CTAs, comparison table, schema parity, and content-integrity rules are present.");
