// PauseAndFlourish.com — Search Engine Sitemap Ping Script
// Notifies Google and Bing of sitemap updates after weekly content additions
// Run automatically by GitHub Actions after each weekly update

const SITEMAP_URL = "https://pauseandflourish.com/sitemap.xml";
const SITE_URL = "https://pauseandflourish.com";

const PING_URLS = [
  // Google
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  // Bing / IndexNow
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
];

async function pingSitemap(url) {
  try {
    const response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(10000) });
    if (response.ok || response.status === 200) {
      console.log(`✅ Pinged: ${new URL(url).hostname} (${response.status})`);
    } else {
      console.log(`⚠️  ${new URL(url).hostname} responded with ${response.status}`);
    }
  } catch (err) {
    console.log(`❌ Failed to ping ${new URL(url).hostname}: ${err.message}`);
  }
}

async function pingIndexNow() {
  // IndexNow protocol — supported by Bing, Yandex, and others
  // Requires an API key file at the root of the site
  const indexNowUrl = "https://api.indexnow.org/indexnow";
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.log("ℹ️  INDEXNOW_KEY not set — skipping IndexNow ping");
    return;
  }

  const payload = {
    host: "pauseandflourish.com",
    key: key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: [
      SITE_URL,
      `${SITE_URL}/reviews`,
      `${SITE_URL}/comparisons`,
      `${SITE_URL}/category/shampoo-conditioner`,
      `${SITE_URL}/category/hair-masks`,
      `${SITE_URL}/category/serums-oils`,
      `${SITE_URL}/category/hair-dryers`,
      `${SITE_URL}/category/flat-irons`,
      `${SITE_URL}/category/curling-irons`,
    ],
  };

  try {
    const response = await fetch(indexNowUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`✅ IndexNow ping successful (${response.status})`);
    } else {
      console.log(`⚠️  IndexNow responded with ${response.status}`);
    }
  } catch (err) {
    console.log(`❌ IndexNow ping failed: ${err.message}`);
  }
}

async function main() {
  console.log("\n🔍 Pinging search engines with updated sitemap...");
  console.log(`   Sitemap: ${SITEMAP_URL}\n`);

  await Promise.all(PING_URLS.map(pingSitemap));
  await pingIndexNow();

  console.log("\n✅ Search engine ping complete\n");
}

main();
