"""
Legacy product-image helper.

This utility is deliberately direct-ASIN-only. It can fetch image metadata for an
already verified ASIN, but it never searches Amazon or selects a product from a
query. Product candidates must first pass the repository's authenticated
Creators API validation gate.
"""
import json
import re
import time
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}

# Add an ASIN only after it has been independently authenticated and title-matched.
# Entries without an ASIN are reported for manual verification and are never selected.
PRODUCTS = [
    ("remifemin-menopause", "B0CRKW8DFJ"),
    ("estroven-complete", None),
    ("bonafide-relizen", None),
    ("natrol-melatonin-10mg", None),
    ("magnesium-glycinate-sleep", None),
    ("olly-goodbye-stress", None),
    ("cooling-towel-chill-pal", None),
    ("bedfan-personal-cooling", None),
    ("amberen-menopause-relief", None),
    ("citracal-calcium-d3", None),
    ("garden-of-life-bone-strength", None),
    ("replens-long-lasting-moisturizer", None),
    ("hyalogic-intimate-serum", "B000Z96ZJQ"),
    ("vital-proteins-collagen-peptides", None),
    ("neutrogena-rapid-firming", None),
    ("kegel-exerciser-perifit", None),
    ("optimum-nutrition-gold-whey", None),
    ("alpha-gpc-cognitive", None),
    ("rhodiola-rosea-energy", "B0775B46M3"),
    ("vitamin-b12-energy", None),
]


def get_product_page(asin):
    """Get a product-page image only for a supplied direct ASIN."""
    url = f"https://www.amazon.com/dp/{asin}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            return None, f"HTTP {response.status_code}"
        html = response.text
        for pattern, label in (
            (r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+\.jpg)"', "hiRes"),
            (r'id="landingImage"[^>]+src="(https://m\.media-amazon\.com/images/I/[^"]+)"', "landingImage"),
        ):
            match = re.search(pattern, html)
            if match:
                return match.group(1), label
        return None, "no image found"
    except Exception as error:
        return None, str(error)


results = {}
for product_id, asin in PRODUCTS:
    if not asin:
        results[product_id] = {"asin": None, "image": None, "error": "No verified direct ASIN configured"}
        continue
    image, method = get_product_page(asin)
    results[product_id] = {"asin": asin, "image": image, "method": method}
    time.sleep(2)

with open("/home/ubuntu/pauseandflourish/scripts/product_lookup_results.json", "w") as output:
    json.dump(results, output, indent=2)

print("Saved direct-ASIN-only lookup results to scripts/product_lookup_results.json")
