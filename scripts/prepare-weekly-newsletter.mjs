#!/usr/bin/env node

/**
 * Stages a ready-to-paste weekly newsletter for human review in EmailOctopus.
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
      <tr><td align="center" style="background:#ffffff;padding:18px 18px 0;"><img src="${escapeHtml(article.heroImage)}" alt="${escapeHtml(article.title)}" width="420" style="display:block;max-width:100%;height:auto;border:0;"></td></tr>
      <tr><td style="padding:28px 34px 18px;color:${palette.body};font-size:16px;line-height:1.7;">
        <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 10px;">New evidence-based guidance</div>
        <h1 style="margin:0 0 16px;color:${palette.heading};font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.22;">${escapeHtml(article.title)}</h1>
        <p style="margin:0;color:${palette.body};">${escapeHtml(article.excerpt)}</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 10px;"><tr><td style="border-radius:5px;background:${palette.accent};"><a href="${escapeHtml(article.url)}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.2px;">Read the full review</a></td></tr></table>
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

async function findNewestArticle() {
  const source = await fs.readFile(path.join(root, "client/src/lib/products.ts"), "utf8");
  const records = objectsInCollection(source, "allProducts")
    .map((objectText) => ({
      title: fieldFromObject(objectText, "name"),
      excerpt: excerptFrom(fieldFromObject(objectText, "shortDescription"), fieldFromObject(objectText, "description")),
      heroImage: fieldFromObject(objectText, "heroImage"),
      publishedDate: fieldFromObject(objectText, "publishDate"),
      slug: fieldFromObject(objectText, "slug"),
      source: "client/src/lib/products.ts (allProducts)",
    }))
    .filter((record) => /^\d{4}-\d{2}-\d{2}$/.test(record.publishedDate));

  if (records.length === 0) fail("ARTICLE_DETECTION", "No dated review records were found in client/src/lib/products.ts.");
  records.sort((left, right) => right.publishedDate.localeCompare(left.publishedDate));
  const article = records[0];
  article.url = `https://${config.domain}/review/${article.slug}`;
  if (!article.title || !article.excerpt || !article.heroImage || !article.slug) {
    fail("ARTICLE_PARSE", "The newest review record is missing a required title, excerpt, image, or slug field.");
  }
  return article;
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
  const article = await findNewestArticle();
  const today = newsletterDate();
  const age = ageInDays(article.publishedDate, today);
  const outputDirectory = path.resolve(root, process.env.NEWSLETTER_OUTPUT_DIR ?? "newsletters");
  const stem = `${article.publishedDate}-${article.slug}`;
  const htmlPath = path.join(outputDirectory, `${stem}.html`);
  const metaPath = path.join(outputDirectory, `${stem}.meta.json`);

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
    suggestedSubject: `New this week: ${article.title}`,
    previewText: article.excerpt.slice(0, 160),
    fromName: config.fromName,
    fromAddress: config.fromAddress,
    listName: config.listName,
    articleUrl: article.url,
    publishedDate: article.publishedDate,
    articleTitle: article.title,
    articleSource: article.source,
    stagedAt: new Date().toISOString(),
    note: "Create and send this campaign manually in the EmailOctopus dashboard. This workflow never calls the EmailOctopus API.",
  };
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(htmlPath, renderHtml(article), "utf8");
  await fs.writeFile(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  const commitSha = await commitAndPush(htmlPath, metaPath, article);
  console.log(`NEWSLETTER_PREPARED: ${path.relative(root, htmlPath)}`);
  console.log(`SUBJECT: ${metadata.suggestedSubject}`);
  console.log(`CTA_URL: ${article.url}`);
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
