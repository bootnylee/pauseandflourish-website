"""
Fetch correct Amazon product hero images for all 20 PauseAndFlourish products.
Uses the Amazon product page to extract the main image URL for each ASIN.
"""
import requests
import re
import time
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

# All 20 products: (product_id, asin)
PRODUCTS = [
    ("remifemin-menopause", "B00020I9W4"),
    ("estroven-complete", "B07WQMKQMK"),
    ("bonafide-relizen", "B07BXPQXM8"),
    ("natrol-melatonin-10mg", "B000GG9UBM"),
    ("magnesium-glycinate-sleep", "B000BD0RT0"),
    ("olly-goodbye-stress", "B07BXHQKQJ"),
    ("cooling-towel-chill-pal", "B07CZPBGKW"),
    ("bedfan-personal-cooling", "B001CNPWH4"),
    ("amberen-menopause-relief", "B003YDQCMQ"),
    ("citracal-calcium-d3", "B001GCU8V4"),
    ("garden-of-life-bone-strength", "B00YXNPXMI"),
    ("replens-long-lasting-moisturizer", "B000052XEL"),
    ("hyalogic-intimate-serum", "B000Z96ZJQ"),
    ("vital-proteins-collagen-peptides", "B00K6TP2ZS"),
    ("neutrogena-rapid-firming", "B09BXHQKQJ"),
    ("kegel-exerciser-perifit", "B07XQMKQMK"),
    ("optimum-nutrition-gold-whey", "B000QSNYGI"),
    ("alpha-gpc-cognitive", "B01DOQX5QI"),
    ("rhodiola-rosea-energy", "B0775B46M3"),
    ("vitamin-b12-energy", "B0013OQGO6"),
]

def get_amazon_image(asin):
    """Try to get the main product image from Amazon product page."""
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return None, f"HTTP {resp.status_code}"
        
        html = resp.text
        
        # Try to find the main image in the page data
        # Method 1: colorImages JSON
        m = re.search(r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', html)
        if m:
            return m.group(1), "hiRes"
        
        # Method 2: landingImage
        m = re.search(r'id="landingImage"[^>]+src="(https://m\.media-amazon\.com/images/I/[^"]+)"', html)
        if m:
            return m.group(1), "landingImage"
        
        # Method 3: imgTagWrapper
        m = re.search(r'id="imgTagWrapper".*?src="(https://m\.media-amazon\.com/images/I/[^"]+)"', html, re.DOTALL)
        if m:
            return m.group(1), "imgTagWrapper"
        
        # Method 4: any SL1500 image
        m = re.search(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9]+\._SL1500_\.jpg)', html)
        if m:
            return m.group(1), "SL1500"
        
        # Method 5: any SL500 image
        m = re.search(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9]+\._SL500_\.jpg)', html)
        if m:
            img = m.group(1).replace("_SL500_", "_SL1500_")
            return img, "SL500->1500"
        
        return None, "no image found"
    except Exception as e:
        return None, str(e)

results = {}
print("Fetching Amazon product images...")
print("=" * 60)

for product_id, asin in PRODUCTS:
    print(f"  {product_id} ({asin})...", end=" ", flush=True)
    img_url, method = get_amazon_image(asin)
    if img_url:
        print(f"✅ [{method}]")
        results[product_id] = {"asin": asin, "image": img_url, "method": method}
    else:
        print(f"❌ {method}")
        results[product_id] = {"asin": asin, "image": None, "error": method}
    time.sleep(2)  # Be polite to Amazon

print("\n" + "=" * 60)
print("Results:")
found = sum(1 for v in results.values() if v["image"])
print(f"  Found: {found}/{len(PRODUCTS)}")
print()

# Save results
with open("/home/ubuntu/pauseandflourish/scripts/image_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("Saved to scripts/image_results.json")
print()

# Print the mapping for easy copy-paste
print("Image URL mapping:")
for product_id, data in results.items():
    if data["image"]:
        print(f'  "{product_id}": "{data["image"]}",')
    else:
        print(f'  "{product_id}": null,  // NEEDS MANUAL LOOKUP: {data.get("error")}')
