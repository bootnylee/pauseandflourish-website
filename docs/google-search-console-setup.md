# Google Search Console Setup Guide for PauseAndFlourish.com

This guide walks you through verifying your domain with Google Search Console and submitting your sitemap so Google indexes PauseAndFlourish.com as quickly as possible.

---

## Step 1: Add Your Property to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click **"Add property"**
4. Choose **"Domain"** (not URL prefix) and enter: `pauseandflourish.com`
5. Click **Continue**

---

## Step 2: Verify Domain Ownership via DNS

Google will show you a TXT record to add to your DNS. This is the recommended method for domain-level verification.

1. Copy the TXT record value Google provides (it looks like: `google-site-verification=XXXXXXXXXXXX`)
2. Log in to your domain registrar (where you registered `pauseandflourish.com`)
3. Go to **DNS Settings** or **DNS Management**
4. Add a new **TXT record**:
   - **Type:** TXT
   - **Name/Host:** `@` (or leave blank — represents the root domain)
   - **Value:** Paste the full verification string from Google
   - **TTL:** 3600 (or default)
5. Save the record
6. Return to Google Search Console and click **Verify**

> **Note:** DNS changes can take up to 48 hours to propagate, but usually verify within minutes to a few hours.

---

## Step 3: Submit Your Sitemap

Once your domain is verified:

1. In Google Search Console, select your `pauseandflourish.com` property
2. In the left sidebar, click **Sitemaps**
3. In the "Add a new sitemap" field, enter: `sitemap.xml`
4. Click **Submit**

Google will begin crawling your sitemap URL: `https://pauseandflourish.com/sitemap.xml`

---

## Step 4: Request Indexing for Key Pages

After submitting the sitemap, manually request indexing for your most important pages:

1. In Google Search Console, click the **URL Inspection** tool in the left sidebar
2. Enter each URL below and click **Request Indexing**:

| Priority | URL |
|----------|-----|
| 1 | `https://pauseandflourish.com/` |
| 2 | `https://pauseandflourish.com/reviews` |
| 3 | `https://pauseandflourish.com/comparisons` |
| 4 | `https://pauseandflourish.com/category/shampoo-conditioner` |
| 5 | `https://pauseandflourish.com/category/hair-masks` |
| 6 | `https://pauseandflourish.com/category/serums-oils` |
| 7 | `https://pauseandflourish.com/category/hair-dryers` |
| 8 | `https://pauseandflourish.com/category/flat-irons` |
| 9 | `https://pauseandflourish.com/category/curling-irons` |

---

## Step 5: HTML Verification File (Alternative Method)

If DNS verification doesn't work, use the HTML file method:

1. In Google Search Console, choose **"URL prefix"** instead of "Domain"
2. Enter: `https://pauseandflourish.com`
3. Choose **"HTML file"** verification method
4. Download the verification file (e.g., `google1234567890abcdef.html`)
5. Place it in the `/home/ubuntu/pauseandflourish/client/public/` directory
6. Commit and push to GitHub — Netlify will deploy it automatically
7. Return to Google Search Console and click **Verify**

---

## Step 6: Set Up Bing Webmaster Tools (Bonus)

Bing accounts for approximately 6–8% of search traffic and is worth setting up:

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Sign in with a Microsoft account
3. Add your site: `https://pauseandflourish.com`
4. Import from Google Search Console (easiest method — automatically imports your sitemap)
5. Or manually submit sitemap: `https://pauseandflourish.com/sitemap.xml`

---

## Step 7: Monitor Performance

After setup, check these Google Search Console reports weekly:

| Report | What to Look For |
|--------|-----------------|
| **Coverage** | Ensure all pages are indexed; fix any errors |
| **Performance** | Track clicks, impressions, and average position |
| **Sitemaps** | Confirm sitemap is being read and URLs are discovered |
| **Core Web Vitals** | Monitor page speed and user experience metrics |
| **Links** | Track which pages have the most internal and external links |

---

## Automated Weekly Sitemap Pings

The GitHub Actions weekly update workflow automatically pings Google and Bing after each Monday update using the `scripts/ping-search-engines.mjs` script. This ensures new content is discovered quickly.

To enable IndexNow (faster indexing via Bing, Yandex, and others):
1. Generate a key at [indexnow.org](https://www.indexnow.org)
2. Add it as a GitHub secret named `INDEXNOW_KEY`
3. Create a file named `{your-key}.txt` in `client/public/` containing just your key
4. The ping script will automatically use it on each weekly update

---

## Expected Timeline

| Milestone | Expected Time |
|-----------|--------------|
| DNS verification | Minutes to 2 hours |
| Sitemap crawled | 24–72 hours |
| First pages indexed | 3–7 days |
| Full site indexed | 2–4 weeks |
| Ranking for target keywords | 4–12 weeks |

---

*For questions, visit [Google Search Console Help](https://support.google.com/webmasters).*
