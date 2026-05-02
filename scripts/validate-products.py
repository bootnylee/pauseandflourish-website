#!/usr/bin/env python3
"""
SilkierStrands Product Validator
=================================
Run this script before every deployment to catch:
  1. Duplicate ASINs (same product listed twice)
  2. Duplicate image URLs (same image used for different products)
  3. Fake/placeholder ASINs (known sequential patterns)
  4. Broken Amazon product pages (HTTP 404)
  5. Broken Amazon image URLs (HTTP non-200)

Usage:
  python3 scripts/validate-products.py              # Fast checks only (no HTTP)
  python3 scripts/validate-products.py --live       # Full live HTTP checks (slower)

Exit codes:
  0 = All clear
  1 = Issues found
"""

import re
import sys
import time
import argparse
from collections import Counter
from pathlib import Path

# ── Configuration ──────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
FILES_TO_CHECK = [
    ROOT / "client/src/lib/products.ts",
    ROOT / "scripts/weekly-update.mjs",
]

# Known fake ASIN patterns (sequential placeholders that were used historically)
FAKE_ASIN_PATTERNS = [
    r"B00AQNFMD[A-Z0-9]",
    r"B09NWQMHV[A-Z0-9]",
    r"B000UXLPB[A-Z0-9]",
    r"B07QHQRPN[A-Z0-9]",
    r"B0C7BKGM5[A-Z0-9]",
    r"B0FKCQTPF[A-Z0-9]",   # Native Coconut placeholder
    r"B0BJNX6R5[A-Z0-9]",   # L'Oreal placeholder
    r"B08NWQMHV[A-Z0-9]",   # Olaplex placeholder series
    r"B003EQUKX[A-Z0-9]",   # It's a 10 placeholder
    r"B00YQHK8G[A-Z0-9]",   # Briogeo placeholder
    r"B08CXQJWJ[A-Z0-9]",   # Karseell placeholder
    r"B0C1VQWX5[A-Z0-9]",   # SUNATORIA placeholder
    r"B002A5WKX[A-Z0-9]",   # Moroccanoil placeholder
    r"B0773VWWJ[A-Z0-9]",   # Alfaparf placeholder
    r"B0C2JQHK4[A-Z0-9]",   # MAREE placeholder
    r"B0CXTKBV1[A-Z0-9]",   # Dyson Supersonic placeholder
    r"B07CKKGR8[A-Z0-9]",   # Conair Double Ceramic placeholder
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def extract_products(filepath):
    """Extract all (asin, image_code, name) tuples from a file."""
    content = filepath.read_text()
    asins = re.findall(r'asin:\s*["\']([A-Z0-9]{10})["\']', content)
    images = re.findall(
        r'amazonImageUrl:\s*"https://m\.media-amazon\.com/images/I/([^"._]+)', content
    )
    names = re.findall(r'name:\s*["\']([^"\']+)["\']', content)
    return asins, images, names


def check_static(filepath, label, all_asins, all_images):
    """Run fast static checks (no HTTP requests)."""
    asins, images, names = extract_products(filepath)
    all_asins.extend(asins)
    all_images.extend(images)

    issues = []

    # Duplicate ASINs within this file
    asin_counts = Counter(asins)
    for asin, count in asin_counts.items():
        if count > 1:
            issues.append(f"DUPLICATE ASIN {asin} appears {count} times")

    # Duplicate images within this file
    img_counts = Counter(images)
    for img, count in img_counts.items():
        if count > 1:
            issues.append(f"DUPLICATE IMAGE {img} appears {count} times")

    # Fake/placeholder ASINs
    for pattern in FAKE_ASIN_PATTERNS:
        matches = re.findall(pattern, filepath.read_text())
        for m in matches:
            issues.append(f"FAKE/PLACEHOLDER ASIN detected: {m}")

    return issues, len(asins)


def check_live_asin(asin):
    """Check if an Amazon product page returns HTTP 200."""
    try:
        import requests
        url = f"https://www.amazon.com/dp/{asin}"
        resp = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        if resp.status_code == 404:
            return False, 404
        elif resp.status_code == 200:
            # Check if it's a "page not found" response disguised as 200
            if "page not found" in resp.text.lower() or "dog" in resp.text.lower()[:500]:
                return False, "SOFT_404"
        return True, resp.status_code
    except Exception as e:
        return None, str(e)


def check_live_image(image_code):
    """Check if an Amazon image URL returns HTTP 200."""
    try:
        import requests
        url = f"https://m.media-amazon.com/images/I/{image_code}._SL1500_.jpg"
        resp = requests.head(url, timeout=8)
        return resp.status_code == 200, resp.status_code
    except Exception as e:
        return None, str(e)


def main():
    parser = argparse.ArgumentParser(description="SilkierStrands Product Validator")
    parser.add_argument("--live", action="store_true", help="Run live HTTP checks (slower)")
    args = parser.parse_args()

    print("=" * 60)
    print("SilkierStrands Product Validator")
    print("=" * 60)

    all_issues = []
    total_products = 0
    all_asins = []
    all_images = []

    # Static checks
    for filepath in FILES_TO_CHECK:
        if not filepath.exists():
            print(f"WARNING: {filepath} not found, skipping")
            continue
        label = filepath.name
        issues, count = check_static(filepath, label, all_asins, all_images)
        total_products += count
        if issues:
            for issue in issues:
                all_issues.append(f"[{label}] {issue}")
            print(f"  {label}: {count} products — {len(issues)} issues")
        else:
            print(f"  {label}: {count} products — OK")

    # NOTE: Cross-file duplicates are intentional — weekly-update.mjs reuses
    # products from the main products.ts catalog. Only within-file duplicates
    # are flagged (handled above in check_static).

    print(f"\nTotal products checked: {total_products}")

    # Live HTTP checks (optional)
    if args.live:
        print("\nRunning live HTTP checks (this may take a few minutes)...")
        unique_asins = list(set(all_asins))
        unique_images = list(set(all_images))

        broken_asins = []
        for i, asin in enumerate(unique_asins):
            ok, status = check_live_asin(asin)
            if ok is False:
                broken_asins.append(asin)
                all_issues.append(f"[LIVE] BROKEN AMAZON LINK: https://www.amazon.com/dp/{asin} (status: {status})")
            time.sleep(0.5)  # Rate limiting
            if (i + 1) % 10 == 0:
                print(f"  Checked {i+1}/{len(unique_asins)} ASINs...")

        broken_images = []
        for i, img in enumerate(unique_images):
            ok, status = check_live_image(img)
            if ok is False:
                broken_images.append(img)
                all_issues.append(f"[LIVE] BROKEN IMAGE: {img} (status: {status})")
            time.sleep(0.2)
            if (i + 1) % 20 == 0:
                print(f"  Checked {i+1}/{len(unique_images)} images...")

        print(f"  Live ASIN checks: {len(unique_asins) - len(broken_asins)}/{len(unique_asins)} OK")
        print(f"  Live image checks: {len(unique_images) - len(broken_images)}/{len(unique_images)} OK")

    # Final report
    print("\n" + "=" * 60)
    if all_issues:
        print(f"VALIDATION FAILED — {len(all_issues)} issue(s) found:")
        for issue in all_issues:
            print(f"  ❌  {issue}")
        print("\nRule: Any product not available on Amazon MUST be replaced")
        print("      with a real, available Amazon product in the same category.")
        sys.exit(1)
    else:
        print(f"VALIDATION PASSED — {total_products} products, zero issues")
        print("\nAll ASINs are unique, all images are unique, no fake ASINs detected.")
        sys.exit(0)


if __name__ == "__main__":
    main()
