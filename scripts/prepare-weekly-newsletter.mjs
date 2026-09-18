#!/usr/bin/env node

/**
 * Stages a ready-to-paste weekly newsletter for human review. A human creates the
 * campaign in Klaviyo and sends it; this script never calls any email API.
 *
 * NEWSLETTER-0918: the scan used to read allProducts (reviews) only. Since the
 * 2026-09-09 TOPIC PRIORITY directive every weekly stem is a comparison, so the
 * newest "review" stayed at 2026-09-07 and every Tuesday run skipped silently.
 * Both collections are scanned now, and a corpus that stops moving fails loudly.
 * This script intentionally makes no network requests and never creates or sends campaigns.
 */
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = {
  siteName: "Pause & Flourish",
  tagline: "Evidence-based menopause wellness.",
  domain: "pauseandflourish.com",
  fromName: "Pause & Flourish",
  fromAddress: "hello@pauseandflourish.com",
  eyebrow: {
    review: "New evidence-based guidance",
    comparison: "Head to head",
  },
  listName: "Pause & Flourish newsletter list",
  palette: {
    page: "#f9f5f0",
    card: "#ffffff",
    header: "#1a6b6b",
    accent: "#c8693a",
    accentSoft: "#b8d8d8",
    heading: "#1a6b6b",
    body: "#4a4a4a",
    muted: "#777777",
    footer: "#f9f5f0",
  },
};

// NEWSLETTER-0918: content ships weekly and the Tuesday run normally sees a
// 1-day-old stem. 8 days (the freshness window below) means one cycle slipped —
// tolerable and already quiet. More than 14 days means two consecutive cycles
// produced nothing, which is broken authoring rather than a quiet week, so the
// run must fail loudly instead of looking identical to "already sent that one".
const STALL_AFTER_DAYS = 14;

function fail(step, message) {
  throw new Error(`${step}: ${message}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function newsletterDate() {
  const candidate = process.env.NEWSLETTER_NOW ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) fail("DATE", "NEWSLETTER_NOW must use YYYY-MM-DD.");
  return candidate;
}

function ageInDays(publishedDate, today) {
  return Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${publishedDate}T00:00:00Z`)) / 86_400_000);
}

function localTestMode() {
  return process.env.NEWSLETTER_TEST_MODE === "true" && process.env.GITHUB_ACTIONS !== "true";
}

function fieldFromObject(objectText, fieldName) {
  const expression = new RegExp(
    "\\b" + fieldName + "\\s*:\\s*([\"'`])([\\s\\S]*?)\\1\\s*,?",
    "m",
  );
  const match = objectText.match(expression);
  return match ? plainText(match[2].replace(/\\([\\`"'])/g, "$1")) : "";
}

function objectsInCollection(source, collectionName) {
  const collectionStart = source.indexOf(`export const ${collectionName}`);
  if (collectionStart === -1) fail("ARTICLE_DETECTION", `Could not find ${collectionName} in the data source.`);
  const assignment = source.indexOf("=", collectionStart);
  const openingBracket = assignment === -1 ? -1 : source.indexOf("[", assignment);
  if (openingBracket === -1) fail("ARTICLE_DETECTION", `${collectionName} has no assigned array declaration.`);

  const objects = [];
  let bracketDepth = 0;
  let braceDepth = 0;
  let objectStart = -1;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openingBracket; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (!escaped && char === quote) quote = "";
      escaped = !escaped && char === "\\";
      if (char !== "\\") escaped = false;
      continue;
    }
    if (char === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (char === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (char === '"' || char === "'" || char === "`") { quote = char; escaped = false; continue; }
    if (char === "[") { bracketDepth += 1; continue; }
    if (char === "]") {
      bracketDepth -= 1;
      if (bracketDepth === 0) break;
      continue;
    }
    if (char === "{") {
      if (bracketDepth === 1 && braceDepth === 0) objectStart = index;
      braceDepth += 1;
      continue;
    }
    if (char === "}" && braceDepth > 0) {
      braceDepth -= 1;
      if (bracketDepth === 1 && braceDepth === 0 && objectStart >= 0) {
        objects.push(source.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }
  return objects;
}

function excerptFrom(...sources) {
  const sentences = [];
  for (const source of sources) {
    for (const candidate of plainText(source).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []) {
      const sentence = candidate.trim();
      if (sentence.length >= 35 && !sentences.includes(sentence)) sentences.push(sentence);
      if (sentences.length === 3) return sentences.join(" ");
    }
  }
  return sentences.join(" ");
}

async function writeResult(result) {
  if (process.env.NEWSLETTER_RESULT_FILE) {
    await fs.writeFile(process.env.NEWSLETTER_RESULT_FILE, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  }
}

function renderHtml(article) {
  const { palette } = config;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.title)} | ${escapeHtml(config.siteName)}</title>
</head>
<body style="margin:0;padding:0;background:${palette.page};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${palette.page};margin:0;padding:32px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:${palette.card};border-radius:10px;overflow:hidden;border:1px solid #ead9cf;">
      <tr><td align="center" style="background:${palette.header};padding:32px 28px;border-bottom:4px solid ${palette.accentSoft};">
        <div style="color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:.4px;">Pause &amp; Flourish</div>
        <div style="margin-top:8px;color:#b8d8d8;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(config.tagline)}</div>
      </td></tr>
      <tr><td align="center" style="background:${palette.footer};padding:18px 28px;border-bottom:1px solid #d7e8e5;">
        <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;">Pause &amp; Flourish Journal</div>
        <div style="margin-top:6px;color:${palette.muted};font-size:13px;line-height:1.5;">Practical, evidence-based support for every stage.</div>
      </td></tr>
      <tr><td style="padding:28px 34px 18px;color:${palette.body};font-size:16px;line-height:1.7;">
        <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 10px;">${escapeHtml(config.eyebrow[article.kind])}</div>
        <h1 style="margin:0 0 16px;color:${palette.heading};font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.22;">${escapeHtml(article.title)}</h1>
        <p style="margin:0;color:${palette.body};">${escapeHtml(article.excerpt)}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 10px;"><tr><td style="border-radius:5px;background:${palette.accent};"><a href="${escapeHtml(article.url)}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.2px;">${escapeHtml(ctaLabel(article.kind))}</a></td></tr></table>
      </td></tr>
      <tr><td align="center" style="background:${palette.footer};padding:24px 28px;color:${palette.muted};font-size:12px;line-height:1.55;">
        <p style="margin:0 0 8px;">{{SenderInfo}}</p>
        <p style="margin:0;"><a href="{{UnsubscribeURL}}" style="color:${palette.accent};text-decoration:none;">Unsubscribe</a> &nbsp;·&nbsp; <a href="https://pauseandflourish.com/about" style="color:${palette.accent};text-decoration:none;">About Pause &amp; Flourish</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>
`;
}

const SOURCE_FILE = "client/src/lib/products.ts";

function recordPath(kind) {
  return kind === "comparison" ? "comparison" : "review";
}

function ctaLabel(kind) {
  return kind === "comparison" ? "Read the full comparison" : "Read the full review";
}

// NEWSLETTER-0918: comparisons are a second export in the same module, not a
// separate file, and carry no image of their own; the winner's product image is
// resolved best-effort for downstream use only (the email body renders no image).
async function findNewestRecord() {
  const sourceFile = process.env.NEWSLETTER_SOURCE_FILE ?? SOURCE_FILE;
  const source = await fs.readFile(path.resolve(root, sourceFile), "utf8");

  const productImages = new Map();
  const reviews = objectsInCollection(source, "allProducts").map((objectText) => {
    const image = fieldFromObject(objectText, "heroImage");
    productImages.set(fieldFromObject(objectText, "id"), image);
    return {
      kind: "review",
      title: fieldFromObject(objectText, "name"),
      excerpt: excerptFrom(fieldFromObject(objectText, "shortDescription"), fieldFromObject(objectText, "description")),
      heroImage: image,
      publishedDate: fieldFromObject(objectText, "publishDate"),
      slug: fieldFromObject(objectText, "slug"),
      source: `${SOURCE_FILE} (allProducts)`,
    };
  });

  const comparisons = objectsInCollection(source, "comparisons").map((objectText) => ({
    kind: "comparison",
    title: fieldFromObject(objectText, "title"),
    excerpt: excerptFrom(
      fieldFromObject(objectText, "summary"),
      fieldFromObject(objectText, "verdict"),
      fieldFromObject(objectText, "winnerReason"),
      fieldFromObject(objectText, "subtitle"),
    ),
    heroImage:
      productImages.get(fieldFromObject(objectText, "winnerId")) ||
      productImages.get(fieldFromObject(objectText, "winner")) ||
      productImages.get(fieldFromObject(objectText, "product1Id")) ||
      productImages.get(fieldFromObject(objectText, "product2Id")) ||
      "",
    publishedDate: fieldFromObject(objectText, "publishDate"),
    slug: fieldFromObject(objectText, "slug"),
    source: `${SOURCE_FILE} (comparisons)`,
  }));

  const records = [...reviews, ...comparisons].filter((record) => /^\d{4}-\d{2}-\d{2}$/.test(record.publishedDate));
  if (records.length === 0) fail("ARTICLE_DETECTION", `No dated review or comparison records were found in ${sourceFile}.`);

  // Newest first; slug ascending breaks a same-day tie so the pick is deterministic.
  records.sort((left, right) => right.publishedDate.localeCompare(left.publishedDate) || left.slug.localeCompare(right.slug));
  const record = records[0];
  record.url = `https://${config.domain}/${recordPath(record.kind)}/${record.slug}`;
  // A review still has to carry its own image (unchanged gate). A comparison has no
  // image field at all and frequently names products long retired from allProducts,
  // so requiring one there would turn ordinary weeks into hard failures.
  if (!record.title || !record.excerpt || !record.slug || (record.kind === "review" && !record.heroImage)) {
    fail("ARTICLE_PARSE", `The newest ${record.kind} record is missing a required title, excerpt, slug, or (reviews only) image field.`);
  }
  return record;
}

// NEWSLETTER-0918: "the newest stem is one we already sent" and "authoring has
// produced nothing for two weeks" used to look identical and both exit 0.
async function reportStall(record, age) {
  const summary = plainText(
    `${config.siteName}: the newest content across reviews and comparisons is the ${record.kind} "${record.title}" ` +
      `(${recordPath(record.kind)}/${record.slug}), published ${record.publishedDate} — ${age} days old against a ${STALL_AFTER_DAYS}-day threshold. ` +
      "Nothing newer exists in either collection, so at least two weekly authoring cycles produced nothing. " +
      "This is an authoring/content-pipeline failure, not a week with nothing new to send; no newsletter was staged.",
  );
  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(process.env.GITHUB_OUTPUT, `newsletter_stalled=true\nnewsletter_stall_summary=${summary}\n`, "utf8");
  }
  await writeResult({ status: "failed", reason: "content-stalled", ageDays: age, thresholdDays: STALL_AFTER_DAYS, article: record });
  return summary;
}

async function commitAndPush(htmlPath, metaPath, article) {
  if (process.env.NEWSLETTER_COMMIT !== "true") return "";
  const relativeHtml = path.relative(root, htmlPath);
  const relativeMeta = path.relative(root, metaPath);
  const commitMessage = `chore: stage weekly newsletter ${article.slug} ${article.publishedDate}`;
  try {
    await execFile("git", ["config", "user.name", "Pause & Flourish Newsletter Bot"], { cwd: root });
    await execFile("git", ["config", "user.email", "bot@pauseandflourish.com"], { cwd: root });
    await execFile("git", ["add", "--", relativeHtml, relativeMeta], { cwd: root });
    await execFile("git", ["commit", "-m", commitMessage], { cwd: root });
  } catch (error) {
    fail("GIT_COMMIT", error.stderr?.trim() || error.message);
  }
  try {
    const { stdout } = await execFile("git", ["rev-parse", "HEAD"], { cwd: root });
    await execFile("git", ["push", "origin", "HEAD:main"], { cwd: root });
    return stdout.trim();
  } catch (error) {
    fail("GIT_PUSH", error.stderr?.trim() || error.message);
  }
}

async function main() {
  const article = await findNewestRecord();
  const today = newsletterDate();
  const age = ageInDays(article.publishedDate, today);
  const outputDirectory = path.resolve(root, process.env.NEWSLETTER_OUTPUT_DIR ?? "newsletters");
  const stem = `${article.publishedDate}-${article.slug}`;
  const htmlPath = path.join(outputDirectory, `${stem}.html`);
  const metaPath = path.join(outputDirectory, `${stem}.meta.json`);

  if (age > STALL_AFTER_DAYS && !localTestMode()) {
    fail("CONTENT_STALLED", await reportStall(article, age));
  }
  if ((age < 0 || age > 8) && !localTestMode()) {
    console.log(`NO_NEW_ARTICLE: newest article ${article.slug} was published ${article.publishedDate} (${age} days old); no newsletter staged.`);
    await writeResult({ status: "no-op", reason: "stale", article });
    return;
  }
  if ((age < 0 || age > 8) && localTestMode()) console.log(`TEST_MODE: bypassing freshness only for local validation; newest article is ${age} days old.`);
  if (await fs.access(htmlPath).then(() => true).catch(() => false)) {
    console.log(`ALREADY_STAGED: ${path.relative(root, htmlPath)} already exists; no duplicate newsletter staged.`);
    await writeResult({ status: "no-op", reason: "already-staged", article, htmlPath: path.relative(root, htmlPath) });
    return;
  }

  const metadata = {
    suggestedSubject: article.kind === "comparison" ? `Head to head: ${article.title}` : `New this week: ${article.title}`,
    previewText: article.excerpt.slice(0, 160),
    fromName: config.fromName,
    fromAddress: config.fromAddress,
    listName: config.listName,
    articleUrl: article.url,
    publishedDate: article.publishedDate,
    articleTitle: article.title,
    articleSource: article.source,
    recordType: article.kind,
    stagedAt: new Date().toISOString(),
    note: "Create and send this campaign manually in Klaviyo. This workflow never calls any email API.",
  };
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(htmlPath, renderHtml(article), "utf8");
  await fs.writeFile(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  const commitSha = await commitAndPush(htmlPath, metaPath, article);
  console.log(`NEWSLETTER_PREPARED: ${path.relative(root, htmlPath)}`);
  console.log(`SUBJECT: ${metadata.suggestedSubject}`);
  console.log(`CTA_URL: ${article.url}`);
  console.log(`RECORD_TYPE: ${article.kind}`);
  if (process.env.GITHUB_OUTPUT) {
    await fs.appendFile(
      process.env.GITHUB_OUTPUT,
      `newsletter_prepared=true\nnewsletter_html_path=${path.relative(root, htmlPath)}\nnewsletter_meta_path=${path.relative(root, metaPath)}\nnewsletter_commit_sha=${commitSha}\n`,
      "utf8",
    );
  }
  await writeResult({ status: "prepared", article, htmlPath: path.relative(root, htmlPath), metaPath: path.relative(root, metaPath), ...metadata });
}

main().catch((error) => {
  console.error(`NEWSLETTER_PREP_FAILED: ${error.message}`);
  process.exitCode = 1;
});
