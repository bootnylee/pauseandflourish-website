"""
Look up all 20 PauseAndFlourish products on Amazon via search,
extract correct ASINs and main product image URLs.
"""
import requests
import re
import time
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

# Products to look up: (product_id, search_query, known_good_asin_or_None)
PRODUCTS = [
    ("remifemin-menopause", "Remifemin Menopause Symptoms Relief Black Cohosh 120 tablets", "B0CRKW8DFJ"),
    ("estroven-complete", "Estroven Complete Multi-Symptom Menopause Relief", None),
    ("bonafide-relizen", "Bonafide Relizen Hot Flash Relief pollen extract", None),
    ("natrol-melatonin-10mg", "Natrol Melatonin 10mg Advanced Sleep Time Release", None),
    ("magnesium-glycinate-sleep", "Doctors Best High Absorption Magnesium Glycinate Lysinate 100mg", None),
    ("olly-goodbye-stress", "OLLY Goodbye Stress Gummy ashwagandha GABA lemon balm", None),
    ("cooling-towel-chill-pal", "Chill Pal Mesh Cooling Towel", None),
    ("bedfan-personal-cooling", "BedFan Personal Cooling Fan between sheets", None),
    ("amberen-menopause-relief", "Amberen Menopause Supplement Women 60 capsules", None),
    ("citracal-calcium-d3", "Citracal Petites Calcium Citrate Vitamin D3", None),
    ("garden-of-life-bone-strength", "Garden of Life Bone Strength Take Care Calcium", None),
    ("replens-long-lasting-moisturizer", "Replens Long-Lasting Vaginal Moisturizer", None),
    ("hyalogic-intimate-serum", "Hyalogic Episilk Pure HA Facial Serum hyaluronic acid", "B000Z96ZJQ"),
    ("vital-proteins-collagen-peptides", "Vital Proteins Collagen Peptides Powder unflavored", None),
    ("neutrogena-rapid-firming", "Neutrogena Rapid Firming Peptide Contour Lift Face Cream", None),
    ("kegel-exerciser-perifit", "Perifit Kegel Exerciser pelvic floor trainer", None),
    ("optimum-nutrition-gold-whey", "Optimum Nutrition Gold Standard 100% Whey Protein", None),
    ("alpha-gpc-cognitive", "Alpha GPC Choline Supplement cognitive", None),
    ("rhodiola-rosea-energy", "Nootropics Depot Rhodiola Rosea 500mg capsules", "B0775B46M3"),
    ("vitamin-b12-energy", "Jarrow Formulas Methylcobalamin B12 1000mcg", None),
]

def search_amazon(query):
    """Search Amazon and return the first product's ASIN and image."""
    url = f"https://www.amazon.com/s?k={requests.utils.quote(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return None, None, f"HTTP {resp.status_code}"
        
        html = resp.text
        
        # Find first product ASIN
        asin_match = re.search(r'data-asin="([A-Z0-9]{10})"', html)
        if not asin_match:
            return None, None, "no ASIN found in search results"
        
        asin = asin_match.group(1)
        
        # Find image for this ASIN
        img_match = re.search(
            rf'data-asin="{asin}".*?src="(https://m\.media-amazon\.com/images/I/[^"]+)"',
            html, re.DOTALL
        )
        img_url = img_match.group(1) if img_match else None
        
        return asin, img_url, "ok"
    except Exception as e:
        return None, None, str(e)

def get_product_page(asin):
    """Get the main image from a product page."""
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return None, f"HTTP {resp.status_code}"
        
        html = resp.text
        
        # Method 1: hiRes in colorImages JSON
        m = re.search(r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', html)
        if m:
            return m.group(1), "hiRes"
        
        # Method 2: landingImage
        m = re.search(r'id="landingImage"[^>]+src="(https://m\.media-amazon\.com/images/I/[^"]+)"', html)
        if m:
            return m.group(1), "landingImage"
        
        # Method 3: AC_SL1500
        m = re.search(r'(https://m\.media-amazon\.com/images/I/[A-Za-z0-9]+\._AC_SL1500_\.jpg)', html)
        if m:
            return m.group(1), "AC_SL1500"
        
        return None, "no image found"
    except Exception as e:
        return None, str(e)

results = {}
print("Looking up Amazon products...")
print("=" * 70)

for product_id, query, known_asin in PRODUCTS:
    print(f"\n  {product_id}")
    
    if known_asin:
        asin = known_asin
        print(f"    Using known ASIN: {asin}")
    else:
        print(f"    Searching: {query[:50]}...", end=" ", flush=True)
        asin, search_img, status = search_amazon(query)
        if asin:
            print(f"✅ ASIN: {asin}")
        else:
            print(f"❌ {status}")
            results[product_id] = {"asin": None, "image": None, "error": status}
            time.sleep(2)
            continue
        time.sleep(2)
    
    # Get product page image
    print(f"    Getting image for {asin}...", end=" ", flush=True)
    img_url, method = get_product_page(asin)
    if img_url:
        print(f"✅ [{method}]")
        results[product_id] = {"asin": asin, "image": img_url}
    else:
        print(f"❌ {method}")
        results[product_id] = {"asin": asin, "image": None, "error": method}
    
    time.sleep(2)

print("\n" + "=" * 70)
found = sum(1 for v in results.values() if v.get("image"))
print(f"Results: {found}/{len(PRODUCTS)} images found")

with open("/home/ubuntu/pauseandflourish/scripts/product_lookup_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("\nSaved to scripts/product_lookup_results.json")
print("\nMapping:")
for pid, data in results.items():
    asin = data.get("asin", "?")
    img = data.get("image", "MISSING")
    print(f'  "{pid}": asin="{asin}", image="{img}"')
