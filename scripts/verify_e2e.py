#!/usr/bin/env python3
"""
PauseAndFlourish.com — End-to-End Data Integrity Verification
Checks all products, comparisons, routes, field completeness, and affiliate links.
"""
import re
import sys
import json

PRODUCTS_FILE = "client/src/lib/products.ts"
APP_FILE = "client/src/App.tsx"
AFFILIATE_TAG = "pauseandflourish-20"

REQUIRED_PRODUCT_FIELDS = [
    "id", "slug", "name", "brand", "asin", "affiliateUrl", "category",
    "categorySlug", "stages", "price", "rating", "reviewCount", "heroImage",
    "summary", "pros", "cons", "verdict", "score", "editorPick", "bestFor",
    "tags", "shortDescription", "fullReview", "priceDisplay", "publishDate"
]

REQUIRED_COMPARISON_FIELDS = [
    "id", "slug", "title", "subtitle", "productIds", "winner", "summary"
]

MENOPAUSE_STAGES = [
    "early-perimenopause", "late-perimenopause", "active-menopause",
    "early-postmenopause", "late-postmenopause"
]

EXPECTED_CATEGORIES = [
    "multi-symptom-supplements", "sleep-mood-support", "hot-flash-cooling",
    "bone-joint-health", "vaginal-intimate-health", "menopause-skincare",
    "fitness-pelvic-health", "cognitive-energy-support"
]

issues = []
warnings = []
passed = []

def check(name, condition, detail=""):
    if condition:
        passed.append(f"✅ {name}")
    else:
        issues.append(f"❌ {name}" + (f": {detail}" if detail else ""))

def warn(name, detail=""):
    warnings.append(f"⚠️  {name}" + (f": {detail}" if detail else ""))

with open(PRODUCTS_FILE) as f:
    content = f.read()

# ── 1. Affiliate Tag ──────────────────────────────────────────────────────────
check("Affiliate tag is pauseandflourish-20",
      f'AFFILIATE_TAG = "{AFFILIATE_TAG}"' in content)

# ── 2. Extract product blocks ─────────────────────────────────────────────────
# Extract all product IDs
product_ids = re.findall(r'^\s{2}id:\s*["\']([^"\']+)["\']', content, re.MULTILINE)
# Filter out category and comparison IDs (they appear in different arrays)
# Products are between allProducts = [ and comparisons = [
products_section_match = re.search(
    r'export const allProducts.*?(?=export const comparisons|// ─── Helper)',
    content, re.DOTALL
)
comparison_section_match = re.search(
    r'export const comparisons.*?(?=// ─── Helper|\Z)',
    content, re.DOTALL
)

products_section = products_section_match.group(0) if products_section_match else ""
comparisons_section = comparison_section_match.group(0) if comparison_section_match else ""

prod_ids = re.findall(r'^\s{4}id:\s*["\']([^"\']+)["\']', products_section, re.MULTILINE)
comp_ids = re.findall(r'^\s{4}id:\s*["\']([^"\']+)["\']', comparisons_section, re.MULTILINE)

check(f"Products found (expect 21+)", len(prod_ids) >= 21, f"found {len(prod_ids)}")
check(f"Comparisons found (expect 6+)", len(comp_ids) >= 6, f"found {len(comp_ids)}")

# ── 3. Check for duplicate product IDs ───────────────────────────────────────
dup_prods = [pid for pid in prod_ids if prod_ids.count(pid) > 1]
check("No duplicate product IDs", len(dup_prods) == 0, f"duplicates: {list(set(dup_prods))}")

# ── 4. Check for duplicate ASINs ─────────────────────────────────────────────
asins = re.findall(r'asin:\s*["\']([^"\']+)["\']', products_section)
dup_asins = [a for a in asins if asins.count(a) > 1]
check("No duplicate ASINs", len(dup_asins) == 0, f"duplicates: {list(set(dup_asins))}")

# ── 5. All affiliate URLs use correct tag ─────────────────────────────────────
affiliate_urls = re.findall(r'affiliateUrl:\s*buildAffiliateUrl\(["\']([^"\']+)["\']\)', products_section)
check(f"All {len(affiliate_urls)} products use buildAffiliateUrl()", len(affiliate_urls) == len(prod_ids),
      f"found {len(affiliate_urls)} affiliateUrl calls for {len(prod_ids)} products")

# ── 6. Required fields on all products ───────────────────────────────────────
for field in REQUIRED_PRODUCT_FIELDS:
    count = len(re.findall(rf'^\s{{4}}{field}:', products_section, re.MULTILINE))
    check(f"Field '{field}' present on all {len(prod_ids)} products",
          count >= len(prod_ids), f"found {count} of {len(prod_ids)}")

# ── 7. All products have heroImage ────────────────────────────────────────────
hero_images = re.findall(r'heroImage:\s*["\']([^"\']+)["\']', products_section)
dup_images = [img for img in hero_images if hero_images.count(img) > 1]
check("No duplicate heroImages", len(dup_images) == 0,
      f"duplicates: {[img.split('/')[-1] for img in list(set(dup_images))]}")
check("All products have media-amazon heroImage",
      all("media-amazon.com" in img for img in hero_images),
      f"non-amazon images: {[img for img in hero_images if 'media-amazon.com' not in img]}")

# ── 8. All products have valid stages ─────────────────────────────────────────
# Check each product has at least one valid stage
stage_blocks = re.findall(r'stages:\s*\[([^\]]+)\]', products_section)
for i, block in enumerate(stage_blocks):
    stages_in_block = re.findall(r'["\']([^"\']+)["\']', block)
    invalid = [s for s in stages_in_block if s not in MENOPAUSE_STAGES]
    if invalid:
        issues.append(f"❌ Product #{i+1} has invalid stage(s): {invalid}")

check(f"All {len(stage_blocks)} products have stages defined",
      len(stage_blocks) == len(prod_ids), f"found {len(stage_blocks)} stage blocks for {len(prod_ids)} products")

# ── 9. All products have valid categorySlug ───────────────────────────────────
cat_slugs = re.findall(r'categorySlug:\s*["\']([^"\']+)["\']', products_section)
invalid_cats = [c for c in cat_slugs if c not in EXPECTED_CATEGORIES]
check("All products have valid categorySlug", len(invalid_cats) == 0,
      f"invalid: {invalid_cats}")

# ── 10. Comparisons reference valid product IDs ───────────────────────────────
comp_product_refs = re.findall(r'productIds:\s*\["([^"]+)",\s*"([^"]+)"\]', comparisons_section)
missing_refs = []
for p1, p2 in comp_product_refs:
    if p1 not in prod_ids:
        missing_refs.append(f"{p1} (not in allProducts)")
    if p2 not in prod_ids:
        missing_refs.append(f"{p2} (not in allProducts)")
check("All comparison productIds reference valid products",
      len(missing_refs) == 0, f"missing: {missing_refs}")

# ── 11. Comparison winners reference valid product IDs ────────────────────────
comp_winners = re.findall(r'^\s{4}winner:\s*["\']([^"\']+)["\']', comparisons_section, re.MULTILINE)
invalid_winners = [w for w in comp_winners if w not in prod_ids]
check("All comparison winners reference valid products",
      len(invalid_winners) == 0, f"invalid winners: {invalid_winners}")

# ── 12. Check App.tsx routes ──────────────────────────────────────────────────
with open(APP_FILE) as f:
    app_content = f.read()

expected_routes = [
    "/", "/quiz", "/about", "/reviews", "/comparisons",
    "/review/:slug", "/comparison/:slug", "/category/:slug", "/stage/:slug"
]
for route in expected_routes:
    check(f"Route '{route}' defined in App.tsx",
          route in app_content or route.replace("/", "\\/") in app_content)

# Check no hair-specific routes remain
check("No /hair-quiz route in App.tsx", "/hair-quiz" not in app_content)
check("No /hair-type route in App.tsx", "/hair-type" not in app_content)

# ── 13. Check for remaining hair references in key files ─────────────────────
import os
hair_files = []
for root, dirs, files in os.walk("client/src"):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for fname in files:
        if fname.endswith(('.tsx', '.ts', '.css')):
            fpath = os.path.join(root, fname)
            with open(fpath) as f:
                fcontent = f.read()
            hair_matches = re.findall(r'\b(hair[Tt]ype|hairQuiz|hair-quiz|hair-type|HairQuiz|HairType)\b', fcontent)
            if hair_matches:
                hair_files.append(f"{fpath}: {list(set(hair_matches))}")
check("No hair-specific component references remain", len(hair_files) == 0,
      "\n    ".join(hair_files))

# ── 14. Check sitemap ─────────────────────────────────────────────────────────
if os.path.exists("client/public/sitemap.xml"):
    with open("client/public/sitemap.xml") as f:
        sitemap = f.read()
    url_count = sitemap.count("<url>")
    check(f"Sitemap exists with {url_count} URLs", url_count >= 20)
    check("Sitemap references pauseandflourish.com", "pauseandflourish.com" in sitemap)
    check("No silkierstrands.com in sitemap", "silkierstrands" not in sitemap.lower())
else:
    warn("sitemap.xml not found in client/public/")

# ── 15. Check package.json ────────────────────────────────────────────────────
with open("package.json") as f:
    pkg = json.load(f)
check("package.json name is pauseandflourish", "pauseandflourish" in pkg.get("name", ""))

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("PAUSE AND FLOURISH — END-TO-END VERIFICATION REPORT")
print("="*60)
print(f"\n✅ PASSED: {len(passed)}")
print(f"❌ ISSUES: {len(issues)}")
print(f"⚠️  WARNINGS: {len(warnings)}")

if issues:
    print("\n── ISSUES (must fix) ──────────────────────────────────────")
    for i in issues:
        print(f"  {i}")

if warnings:
    print("\n── WARNINGS (review) ──────────────────────────────────────")
    for w in warnings:
        print(f"  {w}")

print("\n── PASSED ──────────────────────────────────────────────────")
for p in passed:
    print(f"  {p}")

print("\n" + "="*60)
sys.exit(1 if issues else 0)
