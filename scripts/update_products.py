"""
Update products.ts with correct ASINs and hero images from the lookup results.
"""
import json
import re

# Load lookup results
with open("/home/ubuntu/pauseandflourish/scripts/product_lookup_results.json") as f:
    results = json.load(f)

# Read current products.ts
with open("/home/ubuntu/pauseandflourish/client/src/lib/products.ts") as f:
    content = f.read()

AFFILIATE_TAG = "pauseandflourish-20"

def build_affiliate_url(asin):
    return f"https://www.amazon.com/dp/{asin}?tag={AFFILIATE_TAG}"

# Map product IDs to their old ASINs (from current products.ts)
old_asins = {
    "remifemin-menopause": "B00020I9W4",
    "estroven-complete": "B07WQMKQMK",
    "bonafide-relizen": "B07BXPQXM8",
    "natrol-melatonin-10mg": "B000GG9UBM",
    "magnesium-glycinate-sleep": "B000BD0RT0",
    "olly-goodbye-stress": "B07BXHQKQJ",
    "cooling-towel-chill-pal": "B07CZPBGKW",
    "bedfan-personal-cooling": "B001CNPWH4",
    "amberen-menopause-relief": "B003YDQCMQ",
    "citracal-calcium-d3": "B001GCU8V4",
    "garden-of-life-bone-strength": "B00YXNPXMI",
    "replens-long-lasting-moisturizer": "B000052XEL",
    "hyalogic-intimate-serum": "B000Z96ZJQ",
    "vital-proteins-collagen-peptides": "B00K6TP2ZS",
    "neutrogena-rapid-firming": "B09BXHQKQJ",
    "kegel-exerciser-perifit": "B07XQMKQMK",
    "optimum-nutrition-gold-whey": "B000QSNYGI",
    "alpha-gpc-cognitive": "B01DOQX5QI",
    "rhodiola-rosea-energy": "B07CZPBGKW",  # was duplicate
    "vitamin-b12-energy": "B0013OQGO6",
}

# We need to do targeted replacements per product block
# Strategy: find each product block by its slug, then replace asin, affiliateUrl, heroImage

updated = content
changes = 0

for product_id, data in results.items():
    new_asin = data.get("asin")
    new_image = data.get("image")
    
    if not new_asin or not new_image:
        print(f"  SKIP {product_id}: missing data")
        continue
    
    new_url = build_affiliate_url(new_asin)
    
    # Find the product block by its slug
    # Pattern: slug: "product-id" ... asin: "OLD" ... affiliateUrl: "..." ... heroImage: "..."
    slug = product_id  # slug matches product_id in our data
    
    # Find the block containing this slug
    slug_pattern = rf'(slug:\s*"{re.escape(slug)}".*?)(asin:\s*"[^"]*")'
    m = re.search(slug_pattern, updated, re.DOTALL)
    if not m:
        print(f"  NOT FOUND: {product_id} (slug={slug})")
        continue
    
    # Get the position of the match to do targeted replacement
    start = m.start()
    end_search = start + 2000  # Look within 2000 chars of the slug
    
    block = updated[start:end_search]
    
    # Replace ASIN
    old_block = block
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
        print(f"  ⚠️  {product_id}: no changes made")

print(f"\nTotal changes: {changes}")

# Write updated file
with open("/home/ubuntu/pauseandflourish/client/src/lib/products.ts", "w") as f:
    f.write(updated)

print("products.ts updated!")

# Verify no duplicate ASINs
asins = re.findall(r'asin:\s*"([A-Z0-9]{10})"', updated)
from collections import Counter
dupes = {k: v for k, v in Counter(asins).items() if v > 1}
if dupes:
    print(f"\n⚠️  Duplicate ASINs found: {dupes}")
else:
    print(f"\n✅ All {len(asins)} ASINs are unique")

# Verify no duplicate images
images = re.findall(r'heroImage:\s*"([^"]+)"', updated)
img_dupes = {k: v for k, v in Counter(images).items() if v > 1}
if img_dupes:
    print(f"⚠️  Duplicate images found: {len(img_dupes)} duplicates")
    for img, count in img_dupes.items():
        print(f"    {img}: {count}x")
else:
    print(f"✅ All {len(images)} hero images are unique")
