import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist", "public");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`❌ ${message}`);
}

function checkIncludes(html, text, label) {
  if (html.includes(text)) console.log(`   ${label}: ✅`);
  else fail(`${label} missing`);
}

function checkPage(route, expectations = []) {
  const path = route === "/" ? resolve(DIST, "index.html") : resolve(DIST, `${route.replace(/^\//, "")}.html`);
  if (!existsSync(path)) {
    fail(`${route} prerender file missing: ${path}`);
    return;
  }

  const html = readFileSync(path, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "MISSING";
  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || "MISSING";
  const hasHashedScript = /<script[^>]+\/assets\/[^>]+>/.test(html);
  const hasDevScript = html.includes("/src/main.tsx");

  console.log(`\n${hasHashedScript && !hasDevScript ? "✅" : "❌"} ${route}`);
  console.log(`   title: ${title.substring(0, 80)}`);
  console.log(`   canonical: ${canonical}`);
  if (!hasHashedScript || hasDevScript) fail(`${route} has invalid script references`);
  for (const [text, label] of expectations) checkIncludes(html, text, label);
  return html;
}

const medical = "Content is for informational and educational purposes only and is not a substitute for professional medical advice.";
const dshea = "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

checkPage("/");
checkPage("/privacy", [["Privacy Policy", "Privacy Policy body"], ["EmailOctopus", "EmailOctopus disclosure"], ["Google Analytics 4", "GA4 disclosure"]]);
checkPage("/terms", [["Terms of Use", "Terms body"], ["not medical advice", "medical-advice limitation"], ["Amazon Services LLC Associates Program", "affiliate disclosure"]]);
checkPage("/contact", [["Contact PauseAndFlourish", "Contact body"], ["Privacy Request", "Privacy-request instruction"]]);
const reviewHtml = checkPage("/review/remifemin-menopause-supplement", [[medical, "Medical Disclaimer"], [dshea, "DSHEA disclaimer"]]);
const comparisonHtml = checkPage("/comparison/qunol-vs-amberen", [[medical, "Medical Disclaimer"], [dshea, "DSHEA disclaimer"]]);

if (reviewHtml) {
  if (!reviewHtml.includes('"@type":"Product"')) fail("Product schema missing from review prerender");
  else if (/"offers"\s*:/.test(reviewHtml) || /"priceCurrency"\s*:/.test(reviewHtml) || /"availability"\s*:/.test(reviewHtml)) fail("Product schema contains Offer fields");
  else console.log("   Product schema and Offer fields: ✅ Product present; Offer fields absent");
}
if (comparisonHtml && !comparisonHtml.includes(medical)) fail("Comparison Medical Disclaimer missing");

const sitemap = resolve(DIST, "sitemap.xml");
if (!existsSync(sitemap)) fail("Sitemap missing from prerender output");
else {
  const xml = readFileSync(sitemap, "utf8");
  for (const route of ["/privacy", "/terms", "/contact"]) {
    if (!xml.includes(`https://pauseandflourish.com${route}`)) fail(`Sitemap missing ${route}`);
    else console.log(`   Sitemap ${route}: ✅`);
  }
}

const htmlFiles = readdirSync(DIST, { recursive: true }).filter((file) => String(file).endsWith(".html"));
for (const file of htmlFiles) {
  const html = readFileSync(resolve(DIST, String(file)), "utf8");
  if (html.includes("/src/main.tsx")) fail(`Dev script leaked into ${file}`);
}
console.log(`\n📊 Total prerendered HTML files: ${htmlFiles.length}`);
if (failures) process.exitCode = 1;
else console.log("✅ Prerender legal, disclaimer, schema, sitemap, and script checks passed.");
