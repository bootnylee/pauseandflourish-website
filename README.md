# PauseAndFlourish.com

**Empowering women through menopause and perimenopause with science-backed product reviews, comparisons, and wellness guidance.**

A magazine-style React website featuring expert reviews, head-to-head comparisons, and Amazon affiliate links for menopause supplements, cooling technology, skincare, and intimate health products. Organized around a stage-of-transition quiz that personalizes the experience for each visitor. Updated automatically every Monday via GitHub Actions + Netlify.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/bootnylee/pauseandflourish-website.git
cd pauseandflourish-website

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open in browser
# http://localhost:3000
```

---

## 📁 Project Structure

```
pauseandflourish-website/
├── client/
│   ├── public/
│   │   ├── robots.txt          # SEO: search engine directives
│   │   └── sitemap.xml         # SEO: auto-generated sitemap
│   └── src/
│       ├── components/
│       │   ├── SiteLayout.tsx  # Header + Footer wrapper
│       │   ├── ProductCard.tsx # Product review card
│       │   └── ComparisonCard.tsx
│       ├── lib/
│       │   ├── products.ts     # ALL product data + comparisons
│       │   └── seo.ts          # SEO utilities + structured data
│       └── pages/
│           ├── Home.tsx
│           ├── CategoryPage.tsx
│           ├── ProductReview.tsx
│           ├── ComparisonPage.tsx
│           ├── AllReviews.tsx
│           ├── AllComparisons.tsx
│           └── About.tsx
├── scripts/
│   ├── weekly-update.mjs       # Adds new weekly content to products.ts
│   ├── generate-sitemap.mjs    # Regenerates sitemap.xml
│   └── seo-audit.mjs           # Weekly SEO health check
├── .github/workflows/
│   └── weekly-update.yml       # GitHub Actions: runs every Monday 6AM ET
└── netlify.toml                # Netlify build + redirect + header config
```

---

## 📝 Adding Content

### Adding New Products

All product data lives in `client/src/lib/products.ts`. To add a new product:

1. Find the appropriate category array (e.g., `shampooProducts`)
2. Add a new product object following the `Product` interface
3. Add the product's slug to `scripts/generate-sitemap.mjs`
4. Run `node scripts/generate-sitemap.mjs` to update the sitemap

### Adding New Comparisons

Add to the `comparisons` array in `client/src/lib/products.ts` following the `Comparison` interface.

### Weekly Content Queue

The automated weekly updates pull from the queue in `scripts/weekly-update.mjs`. To add content to future weeks:

1. Open `scripts/weekly-update.mjs`
2. Add new product objects to the `weeklyProducts` array
3. Add new comparison objects to the `weeklyComparisons` array
4. The script cycles through weeks using `WEEK_NUMBER % weeklyProducts.length`

---

## 🤖 Automated Weekly Updates

Every **Monday at 6:00 AM ET**, GitHub Actions automatically:

1. Pulls the next batch of products and comparisons from the queue
2. Adds them to `products.ts`
3. Regenerates `sitemap.xml`
4. Runs the SEO audit
5. Builds the site to verify no errors
6. Commits and pushes the changes
7. Triggers a Netlify deploy via build hook

### Required GitHub Secrets

Set these in your GitHub repository under **Settings → Secrets → Actions**:

| Secret | Description |
|--------|-------------|
| `NETLIFY_BUILD_HOOK` | Your Netlify build hook URL (see Netlify setup below) |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint (optional) |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID (optional) |

### Manual Trigger

You can manually trigger the weekly update from GitHub Actions:
1. Go to your repo → **Actions** → **Weekly Content Update**
2. Click **Run workflow**
3. Optionally check **Dry run** to test without committing

---

## 🌐 Netlify Setup & Domain Configuration

### Step 1: Connect GitHub to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in (or create a free account)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select the **`pauseandflourish-website`** repository
5. Configure build settings:
   - **Build command:** `pnpm install && node scripts/generate-sitemap.mjs && pnpm build`
   - **Publish directory:** `dist/public`
   - **Node version:** `20`
6. Click **"Deploy site"**

### Step 2: Get Your Build Hook URL

1. In Netlify, go to **Site settings → Build & deploy → Build hooks**
2. Click **"Add build hook"**
3. Name it `GitHub Actions Weekly Update`
4. Copy the generated URL
5. Add it to GitHub as a secret named `NETLIFY_BUILD_HOOK`

### Step 3: Configure Your Custom Domain

1. In Netlify, go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Enter `pauseandflourish.com` and click **Verify**
4. Netlify will show you DNS records to add

### Step 4: Update DNS at Your Domain Registrar

Log in to wherever you registered `pauseandflourish.com` and update DNS:

**Option A: Use Netlify DNS (Recommended)**
- Change your nameservers to Netlify's:
  - `dns1.p01.nsone.net`
  - `dns2.p01.nsone.net`
  - `dns3.p01.nsone.net`
  - `dns4.p01.nsone.net`

**Option B: Keep Your Current DNS Provider**
Add these records:
```
Type: A     Name: @     Value: 75.2.60.5
Type: CNAME Name: www   Value: [your-netlify-subdomain].netlify.app
```

### Step 5: Enable HTTPS

1. In Netlify → **Domain management → HTTPS**
2. Click **"Verify DNS configuration"**
3. Once verified, click **"Provision certificate"**
4. SSL will be active within minutes (free via Let's Encrypt)

### Step 6: Submit Sitemap to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://pauseandflourish.com`
3. Verify ownership (Netlify makes this easy — add the HTML file to `client/public/`)
4. Go to **Sitemaps** and submit: `https://pauseandflourish.com/sitemap.xml`

---

## 🔗 Amazon Affiliate Links

All Amazon links use the affiliate tag `pauseandflourish-20` via the `amazonLink()` helper:

```typescript
import { amazonLink } from "@/lib/products";
// Returns: https://www.amazon.com/dp/{ASIN}?tag=pauseandflourish-20
```

**Important:** Per Amazon Associates policy, the affiliate disclosure banner is displayed on every page.

---

## 📊 SEO Features

- **Structured data:** Product schema, Review schema, WebSite schema
- **Dynamic meta tags:** Title, description, OG tags updated per page
- **Canonical URLs:** Set dynamically on every page
- **Sitemap:** Auto-generated with all 52+ URLs
- **robots.txt:** Configured to allow all crawlers
- **Weekly SEO audit:** Automated health check with scoring

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| Primary color | `#1A6B6B` (Deep Teal) |
| Accent color | `#C4622D` (Warm Terracotta) |
| Background | `#FAF7F2` (Soft Ivory) |
| Display font | Playfair Display |
| Label font | Montserrat |
| Body font | Inter |

---

## 📦 Local Sync

To sync this repository to your local machine:

```bash
git clone https://github.com/bootnylee/pauseandflourish-website.git \
  "/Users/kyle/Library/Mobile Documents/com~apple~CloudDocs/Manus/PauseAndFlourish.com"
```

To pull future updates:
```bash
cd "/Users/kyle/Library/Mobile Documents/com~apple~CloudDocs/Manus/PauseAndFlourish.com"
git pull origin main
```

---

## 📄 License

© 2025 PauseAndFlourish.com — All rights reserved.
