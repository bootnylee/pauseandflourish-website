from __future__ import annotations

import re
import sys
import requests
from html import unescape

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

for asin in sys.argv[1:]:
    url=f'https://www.amazon.com/dp/{asin}?tag=pauseandflourish-20'
    print(f'=== {asin} {url} ===')
    r=requests.get(url,headers=HEADERS,timeout=30)
    print('status',r.status_code,'final',r.url,'bytes',len(r.text))
    body=unescape(r.text)
    title=re.search(r'<span[^>]+id="productTitle"[^>]*>(.*?)</span>',body,re.S)
    if title:
        print('title',re.sub(r'\s+',' ',re.sub('<.*?>','',title.group(1))).strip())
    # Search for m.media image URLs; strip escaped characters and size variants.
    urls=set()
    for m in re.finditer(r'https://m\.media-amazon\.com/images/I/[^"\\\s,}]+', body):
        u=m.group(0).replace('\\','')
        urls.add(u)
    for m in re.finditer(r'//m\.media-amazon\.com/images/I/[^"\\\s,}]+', body):
        urls.add('https:'+m.group(0).replace('\\',''))
    def score(u):
        # Prefer high-resolution main AC/SL images, not thumbnails or sprite assets.
        return (('AC_SL1500' in u) or ('SL1500' in u), ('._AC_' in u) or ('._SL' in u), len(u))
    for u in sorted(urls, key=score, reverse=True)[:30]:
        print(u)
