import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist", "public");

function checkPage(path, label) {
  const html = readFileSync(path, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "MISSING";
  const canon = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || "MISSING";
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || "MISSING";
  const hasHashedScript = /<script[^>]+\/assets\/[^>]+>/.test(html);
  const hasDevScript = html.includes("/src/main.tsx");
  const hasPersonSchema = html.includes('"@type":"Person"') || html.includes('"@type": "Person"');
  const hasProductSchema = html.includes('"@type":"Product"') || html.includes('"@type": "Product"');

  const ok = hasHashedScript && !hasDevScript;
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  console.log(`   title: ${title.substring(0, 70)}`);
  console.log(`   canonical: ${canon}`);
  console.log(`   hashed script: ${hasHashedScript} | dev path: ${hasDevScript}`);
  if (hasPersonSchema) console.log(`   Person schema: ✅`);
  if (hasProductSchema) console.log(`   Product schema: ✅`);
  console.log();
}

checkPage(resolve(DIST, "index.html"), "Homepage /");
checkPage(resolve(DIST, "review/remifemin-menopause-supplement/index.html"), "Review /review/remifemin-menopause-supplement");
checkPage(resolve(DIST, "author/diane-kessler/index.html"), "Author /author/diane-kessler");
checkPage(resolve(DIST, "author/carol-beaumont/index.html"), "Author /author/carol-beaumont");

// Check a comparison
const comps = readdirSync(resolve(DIST, "comparison"));
checkPage(resolve(DIST, "comparison", comps[0], "index.html"), `Comparison /comparison/${comps[0]}`);

// Summary
const allFiles = [];
function walk(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.isDirectory()) walk(resolve(dir, f.name));
    else if (f.name === "index.html") allFiles.push(resolve(dir, f.name));
  }
}
walk(DIST);
let broken = 0;
for (const f of allFiles) {
  const html = readFileSync(f, "utf8");
  if (html.includes("/src/main.tsx")) broken++;
}
console.log(`\n📊 Total prerendered pages: ${allFiles.length}`);
console.log(`${broken === 0 ? "✅" : "❌"} Pages with dev path /src/main.tsx: ${broken}`);
