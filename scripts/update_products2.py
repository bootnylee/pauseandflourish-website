"""
Update products.ts with correct ASINs and hero images from the lookup results.
Uses the actual slug values found in products.ts.
"""
import json
import re
from collections import Counter

# Load lookup results
with open("/home/ubuntu/pauseandflourish/scripts/product_lookup_results.json") as f:
    results = json.load(f)

# Read current products.ts
with open("/home/ubuntu/pauseandflourish/client/src/lib/products.ts") as f:
    content = f.read()

AFFILIATE_TAG = "pauseandflourish-20"

def build_affiliate_url(asin):
    return f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"

# Map product_id (from lookup) to actual slug in products.ts
SLUG_MAP = {
    "remifemin-menopause": "remifemin-menopause-supplement",
    "estroven-complete": "estroven-complete-menopause-relief",
    "bonafide-relizen": "bonafide-relizen-hot-flash-relief",
    "natrol-melatonin-10mg": "natrol-melatonin-10mg-sleep-aid",
    "magnesium-glycinate-sleep": "doctors-best-magnesium-glycinate",
    "olly-goodbye-stress": "olly-goodbye-stress-gummies",
    "cooling-towel-chill-pal": "chill-pal-mesh-cooling-towel",
    "bedfan-personal-cooling": "bedfan-personal-bed-fan",
    "amberen-menopause-relief": "amberen-multi-symptom-menopause-relief",
    "citracal-calcium-d3": "citracal-petites-calcium-d3",
    "garden-of-life-bone-strength": "garden-of-life-mykind-bone-strength",
    "replens-long-lasting-moisturizer": "replens-long-lasting-vaginal-moisturizer",
    "hyalogic-intimate-serum": "hyalogic-hyaluronic-acid-intimate-serum",
    "vital-proteins-collagen-peptides": "vital-proteins-collagen-peptides",
    "neutrogena-rapid-firming": "neutrogena-rapid-firming-retinol-serum",
    "kegel-exerciser-perifit": "perifit-kegel-exerciser-app",
    "optimum-nutrition-gold-whey": "optimum-nutrition-gold-standard-whey",
    "alpha-gpc-cognitive": "double-wood-alpha-gpc-cognitive-support",
    "rhodiola-rosea-energy": "nootropics-depot-rhodiola-rosea",
    "vitamin-b12-energy": "jarrow-methylcobalamin-b12-energy",
}

updated = content
changes = 0

for product_id, data in results.items():
    new_asin = data.get("asin")
    new_image = data.get("image")
    
    if not new_asin or not new_image:
        print(f"  SKIP {product_id}: missing data")
        continue
    
    slug = SLUG_MAP.get(product_id, product_id)
    new_url = build_affiliate_url(new_asin)
    
    # Find the product block by its slug
    slug_pattern = rf'(slug:\s*"{re.escape(slug)}")'
    m = re.search(slug_pattern, updated)
    if not m:
        print(f"  NOT FOUND: {product_id} (slug={slug})")
        continue
    
    start = m.start()
    end_search = start + 2000  # Look within 2000 chars of the slug
    
    block = updated[start:end_search]
    old_block = block
    
    # Replace ASIN
    block = re.sub(r'asin:\s*"[^"]*"', f'asin: "{new_asin}"', block, count=1)
    
    # Replace affiliateUrl
    block = re.sub(
        r'affiliateUrl:\s*"[^"]*"',
        f'affiliateUrl: "{new_url}"',
        block, count=1
    )
    
    # Replace heroImage
    block = re.sub(
        r'heroImage:\s*"[^"]*"',
        f'heroImage: "{new_image}"',
        block, count=1
    )
    
    if block != old_block:
        updated = updated[:start] + block + updated[end_search:]
        changes += 1
        print(f"  ✅ {product_id}: ASIN={new_asin}")
    else:
        print(f"  ⚠️  {product_id}: no changes made (check field order)")

print(f"\nTotal changes: {changes}")

# Write updated file
with open("/home/ubuntu/pauseandflourish/client/src/lib/products.ts", "w") as f:
    f.write(updated)

print("products.ts updated!")

# Verify no duplicate ASINs
asins = re.findall(r'asin:\s*"([A-Z0-9]{10})"', updated)
dupes = {k: v for k, v in Counter(asins).items() if v > 1}
if dupes:
    print(f"\n⚠️  Duplicate ASINs found: {dupes}")
else:
    print(f"\n✅ All {len(asins)} ASINs are unique")

# Verify no duplicate images
images = re.findall(r'heroImage:\s*"([^"]+)"', updated)
img_dupes = {k: v for k, v in Counter(images).items() if v > 1}
if img_dupes:
    print(f"⚠️  Duplicate images: {len(img_dupes)} duplicates")
    for img, count in img_dupes.items():
        print(f"    {img}: {count}x")
else:
    print(f"✅ All {len(images)} hero images are unique")

# Print final ASIN/image mapping
print("\nFinal product data:")
for product_id, data in results.items():
    slug = SLUG_MAP.get(product_id, product_id)
    asin = data.get("asin", "?")
    img = data.get("image", "MISSING")
    img_short = img.split("/")[-1] if img else "MISSING"
    print(f"  {slug}: {asin} -> {img_short}")
