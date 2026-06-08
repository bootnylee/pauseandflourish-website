#!/usr/bin/env python3
"""
PauseAndFlourish Product and Asset Validator
============================================
Run this script during weekly catalog maintenance and before deployment to catch:
  1. Duplicate product IDs, slugs, ASINs, or heroImage URLs
  2. Missing or malformed Amazon ASINs
  3. Missing, duplicate, non-Amazon, or broken heroImage URLs
  4. Broken heroImage URLs when --live is enabled
  5. Broken Amazon product pages when --live-products is enabled

Usage:
  python3 scripts/validate-products.py                  # Fast static catalog checks
  python3 scripts/validate-products.py --live           # Static checks plus live heroImage HTTP checks
  python3 scripts/validate-products.py --live-products  # Static checks plus live product-page HTTP checks
  npm run check:assets                                  # Weekly workflow asset-integrity check

Exit codes:
  0 = All clear
  1 = Issues found
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from collections import Counter
from pathlib import Path
from typing import Iterable

try:
    import requests
except ImportError:  # pragma: no cover - handled at runtime
    requests = None

ROOT = Path(__file__).parent.parent
PRODUCTS_FILE = ROOT / "client/src/lib/products.ts"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}
IMAGE_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
}

KNOWN_FAKE_ASIN_PATTERNS = [
    r"B00AQNFMD[A-Z0-9]",
    r"B09NWQMHV[A-Z0-9]",
    r"B000UXLPB[A-Z0-9]",
    r"B07QHQRPN[A-Z0-9]",
    r"B0C7BKGM5[A-Z0-9]",
    r"B0FKCQTPF[A-Z0-9]",
    r"B0BJNX6R5[A-Z0-9]",
    r"B08NWQMHV[A-Z0-9]",
    r"B003EQUKX[A-Z0-9]",
    r"B00YQHK8G[A-Z0-9]",
    r"B08CXQJWJ[A-Z0-9]",
    r"B0C1VQWX5[A-Z0-9]",
    r"B002A5WKX[A-Z0-9]",
    r"B0773VWWJ[A-Z0-9]",
    r"B0C2JQHK4[A-Z0-9]",
    r"B0CXTKBV1[A-Z0-9]",
    r"B07CKKGR8[A-Z0-9]",
]


def extract_array(source: str, export_name: str) -> str:
    """Return the source text inside an exported top-level array."""
    start = source.index(f"export const {export_name}")
    equals = source.index("=", start)
    array_start = source.index("[", equals)
    level = 0
    in_string = False
    escape = False
    quote = ""

    for idx, char in enumerate(source[array_start:], array_start):
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == quote:
                in_string = False
        else:
            if char in ('"', "'", "`"):
                in_string = True
                quote = char
            elif char == "[":
                level += 1
            elif char == "]":
                level -= 1
                if level == 0:
                    return source[array_start + 1 : idx]
    raise ValueError(f"Could not find end of {export_name} array")


def split_top_level_objects(array_source: str) -> list[str]:
    """Split a TypeScript array body into top-level object literals."""
    objects: list[str] = []
    level = 0
    start: int | None = None
    in_string = False
    escape = False
    quote = ""

    for idx, char in enumerate(array_source):
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == quote:
                in_string = False
        else:
            if char in ('"', "'", "`"):
                in_string = True
                quote = char
            elif char == "{":
                if level == 0:
                    start = idx
                level += 1
            elif char == "}":
                level -= 1
                if level == 0 and start is not None:
                    objects.append(array_source[start : idx + 1])
                    start = None
    return objects


def get_string_field(object_source: str, field: str) -> str:
    patterns = [
        rf'{field}:\s*"([^"]*)"',
        rf"{field}:\s*'([^']*)'",
        rf'{field}:\s*buildAffiliateUrl\("([^"]*)"\)',
    ]
    for pattern in patterns:
        match = re.search(pattern, object_source)
        if match:
            return match.group(1).strip()
    return ""


def extract_products() -> list[dict[str, str]]:
    source = PRODUCTS_FILE.read_text()
    products_source = extract_array(source, "allProducts")
    products = []
    for object_source in split_top_level_objects(products_source):
        products.append(
            {
                "id": get_string_field(object_source, "id"),
                "slug": get_string_field(object_source, "slug"),
                "name": get_string_field(object_source, "name"),
                "brand": get_string_field(object_source, "brand"),
                "asin": get_string_field(object_source, "asin"),
                "heroImage": get_string_field(object_source, "heroImage"),
            }
        )
    return products


def duplicate_values(products: Iterable[dict[str, str]], field: str) -> list[str]:
    values = [product[field] for product in products if product.get(field)]
    counts = Counter(values)
    return sorted(value for value, count in counts.items() if count > 1)


def check_static(products: list[dict[str, str]]) -> list[str]:
    issues: list[str] = []

    required_fields = ["id", "slug", "name", "brand", "asin", "heroImage"]
    for product in products:
        label = product.get("id") or product.get("name") or "unknown product"
        for field in required_fields:
            if not product.get(field):
                issues.append(f"[{label}] missing required field: {field}")
        asin = product.get("asin", "")
        if asin and not re.fullmatch(r"[A-Z0-9]{10}", asin):
            issues.append(f"[{label}] malformed ASIN: {asin}")
        image = product.get("heroImage", "")
        if image and not image.startswith("https://m.media-amazon.com/images/I/"):
            issues.append(f"[{label}] heroImage must be an Amazon media image URL: {image}")

    for field in ["id", "slug", "asin", "heroImage"]:
        for value in duplicate_values(products, field):
            matching_ids = [product["id"] for product in products if product.get(field) == value]
            issues.append(f"duplicate {field}: {value} used by {', '.join(matching_ids)}")

    source = PRODUCTS_FILE.read_text()
    for pattern in KNOWN_FAKE_ASIN_PATTERNS:
        for asin in re.findall(pattern, source):
            issues.append(f"fake or placeholder ASIN detected: {asin}")

    return issues


def check_live_product(session: "requests.Session", asin: str) -> tuple[bool | None, str]:
    try:
        response = session.get(
            f"https://www.amazon.com/dp/{asin}?tag=pauseandflourish-20",
            headers=HEADERS,
            timeout=20,
            allow_redirects=True,
        )
        body = response.text[:300000].lower()
        unavailable_markers = [
            "currently unavailable",
            "we don't know when or if this item will be back in stock",
            "no longer available",
            "page not found",
            "sorry! we couldn't find that page",
        ]
        title_found = 'id="producttitle"' in body or "id='producttitle'" in body
        unavailable = any(marker in body for marker in unavailable_markers)
        if response.status_code == 404 or unavailable:
            return False, f"status={response.status_code}; unavailable marker found"
        if response.status_code == 200 and title_found:
            return True, "status=200; product title found"
        return None, f"status={response.status_code}; manual review recommended"
    except Exception as exc:  # pragma: no cover - network dependent
        return None, f"{type(exc).__name__}: {exc}"


def check_live_image(session: "requests.Session", image_url: str) -> tuple[bool, str]:
    try:
        response = session.get(image_url, headers=IMAGE_HEADERS, timeout=20, stream=True)
        content_type = response.headers.get("content-type", "")
        ok = response.status_code == 200 and content_type.startswith("image/")
        status = f"status={response.status_code}; content-type={content_type or 'unknown'}"
        response.close()
        return ok, status
    except Exception as exc:  # pragma: no cover - network dependent
        return False, f"{type(exc).__name__}: {exc}"


def check_live_images(products: list[dict[str, str]]) -> list[str]:
    if requests is None:
        return ["requests package is required for --live checks"]

    issues: list[str] = []
    session = requests.Session()

    print("\nRunning live asset-integrity checks for heroImage URLs...")
    for index, product in enumerate(products, start=1):
        label = f"{product['id']} ({product['asin']})"
        image_ok, image_status = check_live_image(session, product["heroImage"])
        if not image_ok:
            issues.append(f"[{label}] heroImage broken: {image_status}; {product['heroImage']}")
        print(f"  {index:02d}/{len(products)} {label}: image={image_status}")
        time.sleep(0.2)

    return issues


def check_live_products(products: list[dict[str, str]]) -> list[str]:
    if requests is None:
        return ["requests package is required for --live-products checks"]

    issues: list[str] = []
    session = requests.Session()

    print("\nRunning live Amazon product-page checks...")
    for index, product in enumerate(products, start=1):
        label = f"{product['id']} ({product['asin']})"
        product_ok, product_status = check_live_product(session, product["asin"])
        if product_ok is False:
            issues.append(f"[{label}] Amazon product unavailable or broken: {product_status}")
        elif product_ok is None:
            print(f"  Manual review: {label}; {product_status}")
        print(f"  {index:02d}/{len(products)} {label}: product={product_status}")
        time.sleep(0.35)

    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="PauseAndFlourish product and asset validator")
    parser.add_argument("--live", action="store_true", help="Run live heroImage HTTP checks")
    parser.add_argument("--live-products", action="store_true", help="Run live Amazon product-page HTTP checks")
    args = parser.parse_args()

    print("=" * 72)
    print("PauseAndFlourish Product and Asset Validator")
    print("=" * 72)

    products = extract_products()
    issues = check_static(products)

    print(f"Products checked: {len(products)}")
    print("Static checks: product IDs, slugs, ASINs, heroImage URLs, duplicates, and placeholders")

    if args.live:
        issues.extend(check_live_images(products))
    if args.live_products:
        issues.extend(check_live_products(products))

    print("\n" + "=" * 72)
    if issues:
        print(f"VALIDATION FAILED — {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"  - {issue}")
        return 1

    if args.live or args.live_products:
        print("VALIDATION PASSED — requested live checks passed.")
    else:
        print("VALIDATION PASSED — static product and asset checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
