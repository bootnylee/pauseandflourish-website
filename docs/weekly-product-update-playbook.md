# Weekly Product Update Playbook — PauseAndFlourish.com

## Purpose

Every week, this automated task ensures the integrity of the product catalog by validating links and images, and expands the content by adding new product comparisons and reviews. The workflow must also protect site assets by running an **asset-integrity check after any image-related change** and before the final build.

## Step-by-Step Process

### Step 1: Validate Product Links and Availability

- Read `/home/ubuntu/pauseandflourish/client/src/lib/products.ts` to get the list of all current products.
- For each product, check if the Amazon link using the ASIN is still functioning and the product is available.
- **Rule:** If a given product does not exist on Amazon or is no longer available, replace it with a similar product that is available on Amazon. Ensure the replacement product has correct and accurate pictures.

### Step 2: Validate Product Images

- Verify that each product includes an accurate and unique picture (`heroImage`).
- Ensure that no pictures are repeated across the entire site; every product must have its own distinct image.
- If a product image is changed, replaced, added, or corrected, treat that as an **image-related change** and complete Step 5 before building.

### Step 3: Add 3 New Product Reviews

- Determine 3 new menopause-related products to review, such as supplements, cooling devices, skincare, intimate health, pelvic health, sleep support, bone and joint support, or cognitive and energy support, that are not currently in the catalog.
- For each new product, gather:
  - `id`, `slug`, `name`, `brand`, `asin`
  - `category`, `categorySlug`, `stages`
  - `price`, `rating`, `reviewCount`, `heroImage`, which must be accurate and unique
  - `summary`, `pros`, `cons`, `ingredients`
  - `verdict`, `score`, `editorPick`, `bestFor`, `tags`
  - `shortDescription`, `fullReview`, `priceDisplay`, `publishDate`
- Add these 3 new products to the `allProducts` array in `products.ts`.
- Because new product reviews include new `heroImage` values, this step normally triggers the asset-integrity check in Step 5.

### Step 4: Add 3 New Product Comparisons

- Determine 3 new product comparisons, comparing existing products or newly added products.
- For each comparison, gather:
  - `id`, `slug`, `title`, `subtitle`
  - `category`, `categorySlug`
  - `productIds`, as an array of two product IDs
  - `winner`, `winnerReason`, `summary`, `verdict`, `publishDate`
- Add these 3 new comparisons to the `comparisons` array in `products.ts`.

### Step 5: Run Asset-Integrity Check After Image-Related Changes

- Run this step after any `heroImage` addition, replacement, correction, or other image-related catalog change.
- Execute the standard asset-integrity command from the project root:

  ```bash
  cd /home/ubuntu/pauseandflourish
  npm run check:assets
  ```

- The check must verify that catalog product IDs, slugs, ASINs, and `heroImage` URLs are unique, that `heroImage` URLs are valid Amazon media image URLs, and that live image URLs resolve successfully.
- If the command reports any duplicate, missing, malformed, or broken asset, fix the issue in `products.ts` and rerun `npm run check:assets` until it passes.
- If Amazon product pages require manual review because Amazon returns an ambiguous page state, visually inspect the product page before treating the item as valid.

### Step 6: Build and Verify

- Run `npm run build` in the project directory to ensure there are no TypeScript or build errors after the data modifications.
- If the build fails, fix the source issue and rerun the build until it passes.

### Step 7: Commit and Push

- Automatically commit all product catalog, validation workflow, or supporting script changes to the `github main` branch.
- Use a specific weekly maintenance commit message, such as:

  ```bash
  cd /home/ubuntu/pauseandflourish
  git add client/src/lib/products.ts docs/weekly-product-update-playbook.md package.json scripts/validate-products.py
  git commit -m "content: weekly product update [YYYY-MM-DD] - link validation, 3 new reviews, 3 new comparisons"
  git push origin main
  ```

- When the task only changes the workflow or validation tooling, use a concise maintenance message that describes the workflow update.
- *Note: Automatically synchronize `github main` to the local folder `/Users/kyle/Library/Mobile Documents/com~apple~CloudDocs/Manus/SilkierStrands` if applicable.*
