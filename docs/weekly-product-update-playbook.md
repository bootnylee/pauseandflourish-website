# Weekly Product Update Playbook — PauseAndFlourish.com

## Purpose
Every week, this automated task ensures the integrity of the product catalog by validating links and images, and expands the content by adding new product comparisons and reviews.

## Step-by-Step Process

### Step 1: Validate Product Links and Availability
- Read `/home/ubuntu/pauseandflourish/client/src/lib/products.ts` to get the list of all current products.
- For each product, check if the Amazon link (using the ASIN) is still functioning and the product is available.
- **Rule:** If a given product does not exist on Amazon or is no longer available, replace it with a similar product that is available on Amazon. Ensure the replacement product has correct and accurate pictures.

### Step 2: Validate Product Images
- Verify that each product includes an accurate and unique picture (`heroImage`).
- Ensure that no pictures are repeated across the entire site (every product must have its own distinct image).

### Step 3: Add 3 New Product Reviews
- Determine 3 new menopause-related products to review (e.g., supplements, cooling devices, skincare, etc.) that are not currently in the catalog.
- For each new product, gather:
  - `id`, `slug`, `name`, `brand`, `asin`
  - `category`, `categorySlug`, `stages`
  - `price`, `rating`, `reviewCount`, `heroImage` (must be accurate and unique)
  - `summary`, `pros`, `cons`, `ingredients`
  - `verdict`, `score`, `editorPick`, `bestFor`, `tags`
  - `shortDescription`, `fullReview`, `priceDisplay`, `publishDate`
- Add these 3 new products to the `allProducts` array in `products.ts`.

### Step 4: Add 3 New Product Comparisons
- Determine 3 new product comparisons (e.g., comparing two existing products, or newly added ones).
- For each comparison, gather:
  - `id`, `slug`, `title`, `subtitle`
  - `category`, `categorySlug`
  - `productIds` (array of two product IDs)
  - `winner`, `winnerReason`, `summary`, `verdict`, `publishDate`
- Add these 3 new comparisons to the `comparisons` array in `products.ts`.

### Step 5: Build and Verify
- Run `npm run build` in the project directory to ensure there are no TypeScript or build errors after the data modifications.

### Step 6: Commit and Push
- Automatically commit all changes to the 'github main' branch.
- Use the following commands:
  ```bash
  cd /home/ubuntu/pauseandflourish
  git add client/src/lib/products.ts
  git commit -m "content: weekly product catalog update, link validation, and new reviews/comparisons"
  git push origin main
  ```
- *Note: Automatically synchronize 'github main' to the local folder '/Users/kyle/Library/Mobile Documents/com~apple~CloudDocs/Manus/SilkierStrands' if applicable.*
