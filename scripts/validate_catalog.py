from __future__ import annotations

from pathlib import Path
import re
import time
import csv
import sys
from urllib.parse import urlparse

import requests

ROOT = Path('/home/ubuntu/pauseandflourish')
PRODUCTS = ROOT / 'client/src/lib/products.ts'
OUT = ROOT / 'catalog_validation_results.csv'

text = PRODUCTS.read_text()
section = text.split('export const allProducts: Product[] = [', 1)[1].split('];', 1)[0]
blocks = re.split(r'\n\s*\{\n', section)
rows = []
for b in blocks[1:]:
    b = '{\n' + b
    def m(pattern: str) -> str:
        mo = re.search(pattern, b, re.S)
        return mo.group(1) if mo else ''
    rows.append({
        'id': m(r'id: "([^"]+)"'),
        'name': m(r'name: "([^"]+)"'),
        'brand': m(r'brand: "([^"]+)"'),
        'asin': m(r'asin: "([^"]+)"'),
        'category_slug': m(r'categorySlug: "([^"]+)"'),
        'hero_image': m(r'heroImage: "([^"]+)"'),
    })

session = requests.Session()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

results = []
for row in rows:
    asin = row['asin']
    url = f'https://www.amazon.com/dp/{asin}?tag=pauseandflourish-20'
    product_status = 'unknown'
    http_status = ''
    title = ''
    unavailable_phrase = ''
    try:
        r = session.get(url, headers=headers, timeout=20, allow_redirects=True)
        http_status = str(r.status_code)
        body = r.text[:300000]
        title_match = re.search(r'<span[^>]+id="productTitle"[^>]*>(.*?)</span>', body, re.S)
        if title_match:
            title = re.sub(r'\s+', ' ', re.sub('<.*?>', '', title_match.group(1))).strip()
        lower = body.lower()
        phrases = [
            'currently unavailable', 'we don\'t know when or if this item will be back in stock',
            'page not found', 'looking for something?', 'sorry! we couldn\'t find that page',
            'no longer available', 'temporarily out of stock'
        ]
        for p in phrases:
            if p in lower:
                unavailable_phrase = p
                break
        if title and not unavailable_phrase:
            product_status = 'available_title_found'
        elif unavailable_phrase:
            product_status = 'unavailable_phrase_found'
        elif r.status_code in (200, 301, 302) and '/dp/' in r.url:
            product_status = 'page_resolved_needs_manual_review'
        else:
            product_status = 'not_resolved'
    except Exception as e:
        product_status = f'error: {type(e).__name__}: {e}'

    image_status = 'unknown'
    image_http = ''
    image_content_type = ''
    try:
        ir = session.get(row['hero_image'], headers={'User-Agent': headers['User-Agent']}, timeout=15, stream=True)
        image_http = str(ir.status_code)
        image_content_type = ir.headers.get('content-type', '')
        image_status = 'ok' if ir.status_code == 200 and image_content_type.startswith('image/') else 'broken'
        ir.close()
    except Exception as e:
        image_status = f'error: {type(e).__name__}: {e}'

    result = dict(row)
    result.update({
        'affiliate_url': url,
        'http_status': http_status,
        'final_url': locals().get('r').url if 'r' in locals() else '',
        'amazon_status': product_status,
        'amazon_title': title,
        'unavailable_phrase': unavailable_phrase,
        'image_status': image_status,
        'image_http_status': image_http,
        'image_content_type': image_content_type,
    })
    results.append(result)
    print(f"{asin}\t{row['name']}\t{product_status}\t{http_status}\t{title[:80]}\timage:{image_status}")
    time.sleep(0.4)

# duplicate image report
seen = {}
for res in results:
    img = res['hero_image']
    if img in seen:
        res['duplicate_image_with'] = seen[img]
    else:
        res['duplicate_image_with'] = ''
        seen[img] = res['id']

with OUT.open('w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
    writer.writeheader()
    writer.writerows(results)
print(f'Wrote {OUT}')
