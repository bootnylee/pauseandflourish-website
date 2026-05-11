from __future__ import annotations

import re
import sys
import json
from html import unescape
import requests

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', re.sub('<.*?>', '', s)).strip()

def first(patterns, body):
    for p in patterns:
        m = re.search(p, body, re.S)
        if m:
            return clean(unescape(m.group(1)))
    return ''

for asin in sys.argv[1:]:
    url = f'https://www.amazon.com/dp/{asin}?tag=pauseandflourish-20'
    r = requests.get(url, headers=HEADERS, timeout=30)
    body = unescape(r.text)
    print(f'=== {asin} ===')
    print('url', url)
    print('status', r.status_code, 'final', r.url, 'bytes', len(body))
    title = first([r'<span[^>]+id="productTitle"[^>]*>(.*?)</span>'], body)
    price = first([
        r'<span class="a-price[^>]*>\s*<span[^>]*class="a-offscreen"[^>]*>(.*?)</span>',
        r'<span[^>]+class="a-offscreen"[^>]*>(\$[0-9][^<]+)</span>',
    ], body)
    rating = first([
        r'<span[^>]+class="a-icon-alt"[^>]*>([0-9.]+ out of 5 stars)</span>',
        r'([0-9.]+ out of 5 stars)'
    ], body)
    reviews = first([
        r'<span[^>]+id="acrCustomerReviewText"[^>]*>(.*?)</span>',
        r'([0-9,]+ ratings)'
    ], body)
    availability = first([r'<div[^>]+id="availability"[^>]*>(.*?)</div>'], body)
    imgs = []
    for m in re.finditer(r'https://m\.media-amazon\.com/images/I/[^"\\\s,}]+', body):
        u = m.group(0).replace('\\','')
        if u not in imgs:
            imgs.append(u)
    imgs = [u for u in imgs if u.endswith('.jpg') or '.jpg' in u]
    imgs_sorted = sorted(imgs, key=lambda u: (('AC_SL1500' in u) or ('SL1500' in u), ('SX300' not in u), len(u)), reverse=True)
    print('title', title)
    print('price', price)
    print('rating', rating)
    print('reviews', reviews)
    print('availability', availability)
    for i,u in enumerate(imgs_sorted[:8],1):
        print(f'image{i}', u)
    print()
