#!/usr/bin/env node
/**
 * Local, manifest-backed product image library (PF-IMAGES-0917 / SS-IMAGES-0917). Identical file in PF and SS.
 *
 * Every product card had been imageless whenever the Creators API sync was stale, because the only image each
 * product had was an Amazon-hosted URL behind the freshness gate. Each listing image is copied once into
 * client/public/images/products/<asin>.jpg (max 900px), manifest.json records the source, and
 * productImages.generated.json is what getRenderableProductImage() reads first.
 *
 * Runs in three places so a new product can never ship without a picture: the product-image-library
 * workflow (commits the files), the Netlify build (fills any gap for that build), and by hand.
 *
 * Idempotent: an ASIN that already has a file is skipped. One request per image, no retries — a failure is
 * printed and left for the next run. Run:  node scripts/build-product-image-library.mjs
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "client/public/images/products");
const GENERATED = path.join(ROOT, "client/src/lib/productImages.generated.json");
const MANIFEST = path.join(OUT_DIR, "manifest.json");
const MAX_EDGE = 900;

const exists = (f) => access(f).then(() => true).catch(() => false);
const source = await readFile(path.join(ROOT, "client/src/lib/products.ts"), "utf8");

// products.ts is a TS literal; pull asin + first Amazon-hosted image URL + name per product block
const products = [];
for (const block of source.split(/\n\s*\{\s*\n\s*id:/)) {
  const asin = block.match(/asin:\s*"([A-Z0-9]{10})"/);
  if (!asin) continue;
  const urls = [...block.matchAll(/(?:imageUrl|amazonImageUrl|heroImage):\s*"([^"]+)"/g)].map((m) => m[1]).filter((u) => /media-amazon\.com|images-amazon\.com/.test(u));
  const name = block.match(/name:\s*"([^"]+)"/);
  if (urls.length) products.push({ asin: asin[1], url: urls[0].replace(/\._(AC_)?SL\d+_\./, `._$1SL${MAX_EDGE}_.`), name: name ? name[1] : "" });
}
console.log(`${products.length} products with an Amazon listing image`);

await mkdir(OUT_DIR, { recursive: true });
let manifest = { version: 1, purpose: "Local, manifest-backed product imagery (PF-IMAGES-0917 / SS-IMAGES-0917). Amazon listing images used under the Amazon Associates image-display terms, subject to those terms.", assets: [] };
if (await exists(MANIFEST)) manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const generated = {};
const failed = [];
for (const p of products) {
  const file = path.join(OUT_DIR, `${p.asin}.jpg`);
  const webPath = `/images/products/${p.asin}.jpg`;
  if (await exists(file)) { generated[p.asin] = webPath; continue; }
  try {
    const r = await fetch(p.url, { headers: { Accept: "image/*" }, signal: AbortSignal.timeout(30000) });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/^image\//.test(type)) throw new Error(`HTTP ${r.status} ${type}`);
    const bytes = Buffer.from(await r.arrayBuffer());
    if (bytes.length < 2000) throw new Error("too small to be a listing image");
    await writeFile(file, bytes);
    generated[p.asin] = webPath;
    manifest.assets = manifest.assets.filter((a) => a.asin !== p.asin);
    manifest.assets.push({ asin: p.asin, path: webPath, source: p.url, name: p.name, source_type: "Amazon product listing" });
    console.log(`saved ${p.asin} (${bytes.length} bytes)`);
  } catch (err) {
    failed.push(`${p.asin}: ${err.message}`);
  }
  await new Promise((res) => setTimeout(res, 500));
}
await writeFile(GENERATED, JSON.stringify(generated, null, 0) + "\n");
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`library: ${Object.keys(generated).length}/${products.length} products have a local image`);
if (failed.length) { console.log("failed (left for the next run):"); for (const f of failed) console.log("  " + f); }
process.exit(failed.length ? 1 : 0);
