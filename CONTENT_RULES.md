# Content Integrity Rules — PauseAndFlourish

These rules apply to every product review, comparison, product card, generated page, and structured-data block.

## Verified Products and Affiliate Links

Every Amazon affiliate destination must use a verified ASIN whose live catalog title matches the named product. If an exact ASIN cannot be verified, the product may remain in editorial content but must display **Not linked** / **No verified link** instead of an Amazon destination. The pre-publish validation gate blocks mismatched product-to-ASIN mappings.

## Customer Ratings and Review Counts

Do not display, publish, or place in structured data any numeric Amazon star rating or Amazon review count unless the exact value was retrieved from a supported current catalog response and stored with its retrieval timestamp. Static source values, estimates, copied listing text, and manually entered values are not acceptable sources. When a current verifiable source is unavailable, omit the rating.

Genuine, approved first-party user reviews may produce `AggregateRating` only through the approved-review feature flag and moderation workflow. Never derive `AggregateRating` from static product fields, editorial opinion, Amazon copy, or estimates.

## Prohibited Amazon Merchandising Claims

Never claim or imply `Amazon's Choice`, `Amazon Choice`, `Best Seller`, `Best-Seller`, `Bestseller`, or numbered variants such as `#1 Best Seller`. The Amazon Creators API does not provide these badges as an approved content source. Do not scrape them, infer them, or repeat them in body copy, pros/cons, product cards, metadata, or structured data.

Use neutral, independently supportable editorial language instead. The commerce-template and ASIN validation gates treat prohibited badge phrases and static card-rating renderers as blocking deployment errors.
