#!/usr/bin/env node
/**
 * Covers the weekly newsletter record selection (NEWSLETTER-0918).
 *
 * Why this test exists
 * --------------------
 * For two weeks SS and P&F staged nothing: the scan read allProducts (reviews)
 * only, every new stem was a comparison, and the run exited 0 every Tuesday.
 * Nothing distinguished that from "we already sent the newest thing".
 *
 * What it asserts, against the real script on synthetic products.ts fixtures:
 *   1. a comparison is selected when it is the newest record         -> /comparison/<slug>
 *   2. a review is selected when it is the newest record             -> /review/<slug>
 *   3. a same-day tie is broken deterministically by slug ascending  (both directions)
 *   4. a corpus older than the stall threshold fails LOUDLY          -> exit 1 + CONTENT_STALLED
 *   5. "already sent the newest stem" stays quiet                    -> exit 0 + ALREADY_STAGED
 *
 * Tautology proof: revert findNewestRecord to the allProducts-only scan and case 1
 * fails (it would pick the older review); drop the stall gate and case 4 fails
 * (exit 0, no CONTENT_STALLED); widen the tie-break and case 3 fails.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "prepare-weekly-newsletter.mjs");
const TODAY = "2026-09-18";
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "newsletter-selection-"));

function productsModule(reviews, comparisons) {
  const review = (r) => `  {
    id: "${r.slug}-product",
    name: ${JSON.stringify(r.title)},
    heroImage: "https://images.example.com/${r.slug}.jpg",
    shortDescription: "A deliberately long enough teaser sentence so the excerpt builder keeps it intact.",
    publishDate: "${r.publishDate}",
    slug: "${r.slug}",
  },`;
  const comparison = (c) => `  {
    id: "${c.slug}",
    slug: "${c.slug}",
    title: ${JSON.stringify(c.title)},
    subtitle: "A deliberately long enough subtitle sentence so the excerpt builder keeps it intact.",
    product1Id: "${reviews[0]?.slug ?? "missing"}-product",
    product2Id: "absent-product",
    winnerId: "${reviews[0]?.slug ?? "missing"}-product",
    winnerReason: "A deliberately long enough winner rationale sentence so the excerpt builder keeps it intact.",
    verdict: "A deliberately long enough verdict sentence so the excerpt builder keeps it intact.",
    publishDate: "${c.publishDate}",
  },`;
  return `export const allProducts: Product[] = [
${reviews.map(review).join("\n")}
];

export const comparisons: Comparison[] = [
${comparisons.map(comparison).join("\n")}
];
`;
}

let caseIndex = 0;
function run({ reviews = [], comparisons = [], preStage = null }) {
  const label = `case-${++caseIndex}`;
  const sourceFile = path.join(workspace, `${label}.ts`);
  const outputDir = path.join(workspace, label);
  fs.writeFileSync(sourceFile, productsModule(reviews, comparisons), "utf8");
  fs.mkdirSync(outputDir, { recursive: true });
  if (preStage) fs.writeFileSync(path.join(outputDir, `${preStage}.html`), "staged earlier", "utf8");

  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      NEWSLETTER_NOW: TODAY,
      NEWSLETTER_SOURCE_FILE: sourceFile,
      NEWSLETTER_OUTPUT_DIR: outputDir,
      NEWSLETTER_COMMIT: "false",
      NEWSLETTER_TEST_MODE: "",
      GITHUB_ACTIONS: "",
      GITHUB_OUTPUT: "",
    },
  });
  return { ...result, outputDir, staged: fs.readdirSync(outputDir) };
}

const fresh = "2026-09-14";
const reviewRecord = { slug: "zzz-hydrating-shampoo-review", title: "ZZZ Hydrating Shampoo", publishDate: fresh };
const comparisonRecord = { slug: "aaa-serum-vs-bbb-serum", title: "AAA Serum vs. BBB Serum", publishDate: fresh };

// 1. Comparison is newest -> it wins, with the comparison URL and CTA.
{
  const r = run({
    reviews: [{ ...reviewRecord, publishDate: "2026-09-07" }],
    comparisons: [comparisonRecord],
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /RECORD_TYPE: comparison/);
  assert.match(r.stdout, /CTA_URL: https:\/\/[^/]+\/comparison\/aaa-serum-vs-bbb-serum/);
  const html = fs.readFileSync(path.join(r.outputDir, `${fresh}-aaa-serum-vs-bbb-serum.html`), "utf8");
  assert.match(html, /Read the full comparison/);
  assert.doesNotMatch(html, /Read the full review/);
  console.log("PASS newest comparison is selected");
}

// 2. Review is newest -> unchanged behaviour.
{
  const r = run({
    reviews: [reviewRecord],
    comparisons: [{ ...comparisonRecord, publishDate: "2026-09-07" }],
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /RECORD_TYPE: review/);
  assert.match(r.stdout, /CTA_URL: https:\/\/[^/]+\/review\/zzz-hydrating-shampoo-review/);
  const html = fs.readFileSync(path.join(r.outputDir, `${fresh}-zzz-hydrating-shampoo-review.html`), "utf8");
  assert.match(html, /Read the full review/);
  console.log("PASS newest review is selected");
}

// 3. Same-day tie -> lowest slug wins, whichever type that is.
{
  const comparisonFirst = run({ reviews: [reviewRecord], comparisons: [comparisonRecord] });
  assert.equal(comparisonFirst.status, 0, comparisonFirst.stderr);
  assert.match(comparisonFirst.stdout, /comparison\/aaa-serum-vs-bbb-serum/);

  const reviewFirst = run({
    reviews: [{ ...reviewRecord, slug: "aaa-hydrating-shampoo-review" }],
    comparisons: [{ ...comparisonRecord, slug: "zzz-serum-vs-bbb-serum" }],
  });
  assert.equal(reviewFirst.status, 0, reviewFirst.stderr);
  assert.match(reviewFirst.stdout, /review\/aaa-hydrating-shampoo-review/);
  console.log("PASS same-day tie breaks deterministically on slug");
}

// 4. Nothing newer than the stall threshold -> loud failure, nothing staged.
{
  const r = run({
    reviews: [{ ...reviewRecord, publishDate: "2026-08-24" }],
    comparisons: [{ ...comparisonRecord, publishDate: "2026-08-24" }],
  });
  assert.equal(r.status, 1, `expected a non-zero exit, got ${r.status}`);
  assert.match(r.stderr, /NEWSLETTER_PREP_FAILED: CONTENT_STALLED/);
  assert.match(r.stderr, /25 days old/);
  assert.match(r.stderr, /authoring\/content-pipeline failure/);
  assert.deepEqual(r.staged, []);
  console.log("PASS stalled corpus fails loudly");
}

// 5. Newest stem already staged -> quiet no-op, exit 0.
{
  const r = run({
    reviews: [{ ...reviewRecord, publishDate: "2026-09-07" }],
    comparisons: [comparisonRecord],
    preStage: `${fresh}-aaa-serum-vs-bbb-serum`,
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /ALREADY_STAGED/);
  assert.doesNotMatch(r.stdout, /NEWSLETTER_PREPARED/);
  console.log("PASS already-sent week stays quiet");
}

fs.rmSync(workspace, { recursive: true, force: true });
console.log("ALL PASS scripts/test-weekly-newsletter-selection.mjs");
