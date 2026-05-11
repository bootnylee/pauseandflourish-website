# Weekly Product Validation Notes — 2026-05-11

The catalog contains 24 current products before this update. Automated Amazon DP checks returned HTTP 200 for every current ASIN. Amazon product-title extraction was limited by page markup/anti-bot rendering, so current product pages are treated as resolved unless replacement evidence is found during targeted follow-up research.

Automated image checks found two broken hero image URLs that need correction: `bonafide-relizen` (`B0FTTCLPB2`) and `citracal-calcium-d3` (`B0FNVNR9CF`). No duplicate hero image URLs were detected in the extracted catalog list.

The phrase-based availability check flagged `optimum-nutrition-gold-whey` because the page text contains a stock-status phrase, but it also extracted a valid Amazon product title for the current ASIN. This should be treated as a manual-review item rather than an automatic replacement.

Targeted search follow-up found that the Bonafide Relizen catalog ASIN `B0FTTCLPB2` is not the current Amazon product result; the search result points to `B01DTKK5ES` for “Relizen by Bonafide. Relief from Menopausal Hot Flashes & Night Sweats — 1-Month Supply (60 Tablets).” This product should replace the existing Bonafide entry ASIN and image.

Targeted search follow-up found that the Citracal catalog ASIN `B0FNVNR9CF` is not the primary current Amazon result; the current Amazon product result points to `B07RCJY6WD` for “Citracal Petites Calcium Citrate with Vitamin D3.” This product should replace the existing Citracal ASIN and image while keeping the same review position/category.

Image validation found no duplicate `heroImage` values across the current catalog. Two images were broken and replacement Amazon media URLs were verified with HTTP 200 image responses:

| Product | Replacement ASIN | Replacement Hero Image |
|---|---:|---|
| Bonafide Relizen Hot Flash Relief | `B01DTKK5ES` | `https://m.media-amazon.com/images/I/716dnVyeX3L._AC_SL1500_.jpg` |
| Citracal Petites Calcium Citrate + D3 | `B07RCJY6WD` | `https://m.media-amazon.com/images/I/81-MBbR-BnL._AC_SL1500_.jpg` |

Selected new product additions were verified as in-stock Amazon listings through fetched product metadata:

| Product | ASIN | Category | Price | Rating | Reviews | Image |
|---|---:|---|---:|---:|---:|---|
| O Positiv MENO Vitamins for Menopause | `B0D6S94T77` | Multi-Symptom Supplements | $36.97 | 4.4 | 2,373 | `https://m.media-amazon.com/images/I/71mZt0CltqL._AC_SL1500_.jpg` |
| EQUELLE Multi-Symptom Perimenopause & Menopause Relief | `B0D6DL2Q1M` | Multi-Symptom Supplements | $79.99 | 4.2 | 266 | `https://m.media-amazon.com/images/I/71xaG7RpCvL._AC_SL1500_.jpg` |
| Bonafide Revaree Vaginal Moisturizer | `B07GX65L5T` | Vaginal & Intimate Health | $131.00 | 4.4 | 4,387 | `https://m.media-amazon.com/images/I/71EpuMglGlL._SL1500_.jpg` |

Research notes: O Positiv MENO is positioned around black cohosh and KSM-66 ashwagandha for hot flashes, night sweats, mood, and stress/sleep support. EQUELLE centers on S-equol from fermented soy germ for multi-symptom menopause support. Revaree centers on 5 mg hyaluronic acid vaginal inserts for non-hormonal vaginal dryness relief.

Build validation: `npm run build` completed successfully after installing dependencies with `npm install --legacy-peer-deps` in the freshly cloned workspace and repairing escaped newline formatting in the new review text. Vite emitted non-blocking warnings about missing analytics env placeholders and chunk size, but the production client and server bundles were created successfully.
