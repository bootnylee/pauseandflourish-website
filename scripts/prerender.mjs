/**
 * PauseAndFlourish.com — Static Prerender Script
 * ================================================
 * Runs at build time (before `vite build`) and writes a unique index.html
 * for every route into dist/public/.  Each file contains the correct:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - Open Graph tags (og:title, og:description, og:url, og:image, og:type)
 *   - Twitter Card tags
 *   - JSON-LD (Organization + WebSite + page-specific schema)
 *
 * Netlify's SPA fallback rule (`/* → /index.html, status 200`) means that
 * when a crawler requests /review/remifemin-menopause-supplement it gets the
 * pre-built HTML for that exact route — with JS disabled the correct title,
 * canonical, and body text are already present.
 *
 * Usage: node scripts/prerender.mjs
 * (called automatically by the Netlify build command in netlify.toml)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist", "public");
const BASE_URL = "https://pauseandflourish.com";

// ── Helper: escape HTML entities ─────────────────────────────────────────────
function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Helper: truncate to max length ───────────────────────────────────────────
function trunc(str = "", max = 155) {
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

// ── Read the base index.html template ────────────────────────────────────────
const BASE_HTML = readFileSync(resolve(ROOT, "client", "index.html"), "utf8");

// ── Build a full HTML page from page-specific meta ───────────────────────────
function buildHtml({
  title,
  description,
  canonical,
  ogImage = `${BASE_URL}/og-image.jpg`,
  ogType = "website",
  jsonLd,
}) {
  const safeTitle = esc(title);
  const safeDesc = esc(trunc(description, 155));
  const safeCanonical = esc(canonical);
  const safeOgImage = esc(ogImage);

  // Replace the default shell meta tags with page-specific ones
  let html = BASE_HTML;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${safeCanonical}" />`
  );

  // OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${safeOgImage}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${esc(ogType)}" />`
  );

  // Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${safeOgImage}" />`
  );

  // Replace the site-wide JSON-LD with page-specific JSON-LD (if provided)
  if (jsonLd) {
    const jsonLdStr = JSON.stringify(jsonLd, null, 0);
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n    ${jsonLdStr}\n    </script>`
    );
  }

  return html;
}

// ── Write a route's HTML file ─────────────────────────────────────────────────
function writeRoute(urlPath, meta) {
  const dir = resolve(DIST, ...urlPath.replace(/^\//, "").split("/"));
  mkdirSync(dir, { recursive: true });
  const html = buildHtml(meta);
  writeFileSync(resolve(dir, "index.html"), html, "utf8");
  console.log(`  ✓ ${urlPath}`);
}

// ── Shared JSON-LD graph nodes ────────────────────────────────────────────────
const ORG_NODE = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "PauseAndFlourish",
  url: BASE_URL,
  logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
  description:
    "Evidence-based menopause and perimenopause product reviews and wellness guidance for women.",
};

const WEBSITE_NODE = {
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: "PauseAndFlourish",
  url: BASE_URL,
  publisher: { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/reviews?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function siteGraph(...extra) {
  return { "@context": "https://schema.org", "@graph": [ORG_NODE, WEBSITE_NODE, ...extra] };
}

function breadcrumb(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: url,
    })),
  };
}

// ── Load product/comparison/author data from pre-extracted JSON ───────────────
// The data is extracted by scripts/extract-data.ts (run via tsx before this
// script) and saved to scripts/site-data.json.

let allProducts = [], categories = [], comparisons = [], authors = [];
const dataPath = resolve(ROOT, "scripts", "site-data.json");
if (existsSync(dataPath)) {
  try {
    const siteData = JSON.parse(readFileSync(dataPath, "utf8"));
    allProducts = siteData.allProducts || [];
    categories = siteData.categories || [];
    comparisons = siteData.comparisons || [];
    authors = siteData.authors || [];
    console.log(`   Loaded ${allProducts.length} products, ${comparisons.length} comparisons, ${authors.length} authors from site-data.json`);
  } catch (e) {
    console.warn("⚠ Could not parse site-data.json — using fallback slugs from sitemap.");
  }
} else {
  console.warn("⚠ site-data.json not found — using fallback slugs from sitemap.");
}

// ── Author lookup helper ──────────────────────────────────────────────────────
const authorsById = Object.fromEntries(authors.map(a => [a.id, a]));
const FALLBACK_AUTHOR = {
  id: "diane-kessler",
  slug: "diane-kessler",
  name: "Diane Kessler",
  role: "Editorial Lead",
  url: `${BASE_URL}/author/diane-kessler`,
};
function getAuthor(id) {
  return authorsById[id] || authors[0] || FALLBACK_AUTHOR;
}

function personNode(author) {
  return {
    "@type": "Person",
    "@id": `${BASE_URL}/author/${author.id}`,
    name: author.name,
    jobTitle: author.role,
    url: author.url || `${BASE_URL}/author/${author.id}`,
    worksFor: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "PauseAndFlourish",
    },
  };
}

// ── Menopause stages (hardcoded for build-time reliability) ─────────────────
const menopauseStages = [
  {
    slug: "early-perimenopause",
    name: "Early Perimenopause",
    description:
      "Early perimenopause typically begins in the late 30s to mid-40s. Cycles may become irregular, and subtle hormonal changes can cause mood shifts, sleep disruption, and fatigue.",
  },
  {
    slug: "late-perimenopause",
    name: "Late Perimenopause",
    description:
      "Late perimenopause (typically ages 45–52) brings more pronounced hormonal fluctuations. Hot flashes, night sweats, brain fog, and weight changes become more common.",
  },
  {
    slug: "active-menopause",
    name: "Active Menopause",
    description:
      "Active menopause is defined as 12 consecutive months without a menstrual period (typically ages 50–55). Symptoms are often at their peak.",
  },
  {
    slug: "early-postmenopause",
    name: "Early Postmenopause",
    description:
      "Early postmenopause (typically ages 55–60) is a time of stabilization. Acute symptoms ease but long-term health priorities — bone density, cardiovascular health — come to the fore.",
  },
  {
    slug: "late-postmenopause",
    name: "Late Postmenopause",
    description:
      "Late postmenopause is about thriving in your next chapter. Focus shifts to maintaining vitality, protecting bone and cognitive health, and enjoying life with confidence.",
  },
];

// ── Fallback slugs from the sitemap (in case eval fails) ─────────────────────
const SITEMAP_PRODUCT_SLUGS = [
  "hum-fan-club-menopause-probiotic", "vmagic-vulva-balm-menopause",
  "thorne-hormone-advantage-dim", "remifemin-menopause-supplement",
  "estroven-complete-menopause-relief", "bonafide-relizen-hot-flash-relief",
  "natrol-melatonin-10mg-sleep-aid", "doctors-best-magnesium-glycinate",
  "olly-goodbye-stress-gummies", "chill-pal-mesh-cooling-towel",
  "bedfan-personal-bed-fan", "amberen-multi-symptom-menopause-relief",
  "citracal-petites-calcium-d3", "garden-of-life-mykind-bone-strength",
  "replens-long-lasting-vaginal-moisturizer", "hyalogic-hyaluronic-acid-intimate-serum",
  "vital-proteins-collagen-peptides", "neutrogena-rapid-firming-retinol-serum",
  "perifit-kegel-exerciser-app", "optimum-nutrition-gold-standard-whey",
  "double-wood-alpha-gpc-cognitive-support", "nootropics-depot-rhodiola-rosea",
  "jarrow-formulas-methyl-b12",
];

// ── Main prerender ────────────────────────────────────────────────────────────

console.log("\n🔧 PauseAndFlourish prerender starting…");
console.log(`   Output directory: ${DIST}`);

if (!existsSync(DIST)) {
  console.log("   dist/public not found — creating it.");
  mkdirSync(DIST, { recursive: true });
}

// 1. Homepage
console.log("\n📄 Static pages:");
writeRoute("/", {
  title: "PauseAndFlourish — Menopause & Perimenopause Product Reviews",
  description:
    "Expert reviews of menopause supplements, cooling products, sleep aids, and wellness tools. Evidence-based guidance for every stage of the transition.",
  canonical: `${BASE_URL}/`,
  ogType: "website",
  jsonLd: siteGraph({
    "@type": "WebPage",
    "@id": `${BASE_URL}/#webpage`,
    url: `${BASE_URL}/`,
    name: "PauseAndFlourish — Menopause & Perimenopause Product Reviews",
    isPartOf: { "@id": `${BASE_URL}/#website` },
    about: { "@id": `${BASE_URL}/#organization` },
    description:
      "Expert reviews of menopause supplements, cooling products, sleep aids, and wellness tools.",
  }),
});

// 2. /reviews
writeRoute("/reviews", {
  title: "All Menopause Product Reviews | PauseAndFlourish",
  description:
    "Browse all expert menopause product reviews across supplements, cooling, sleep, skincare, bone health, and intimate wellness.",
  canonical: `${BASE_URL}/reviews`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "All Reviews", url: `${BASE_URL}/reviews` },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${BASE_URL}/reviews#webpage`,
      url: `${BASE_URL}/reviews`,
      name: "All Menopause Product Reviews",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      description: "Browse all expert menopause product reviews.",
    }
  ),
});

// 3. /comparisons
writeRoute("/comparisons", {
  title: "Menopause Product Comparisons | PauseAndFlourish",
  description:
    "Head-to-head comparisons of top menopause supplements, cooling products, sleep aids, and wellness tools to help you choose the right option.",
  canonical: `${BASE_URL}/comparisons`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "Comparisons", url: `${BASE_URL}/comparisons` },
    ])
  ),
});

// 4. /about
writeRoute("/about", {
  title: "About PauseAndFlourish | Evidence-Based Menopause Reviews",
  description:
    "PauseAndFlourish is your trusted source for expert, evidence-based menopause and perimenopause product reviews and wellness guidance for women.",
  canonical: `${BASE_URL}/about`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "About", url: `${BASE_URL}/about` },
    ])
  ),
});

// 5. /quiz
writeRoute("/quiz", {
  title: "Menopause Stage Quiz — Find Your Stage | PauseAndFlourish",
  description:
    "Take our 2-minute quiz to identify your menopause or perimenopause stage and get personalized product recommendations tailored to where you are.",
  canonical: `${BASE_URL}/quiz`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "Menopause Stage Quiz", url: `${BASE_URL}/quiz` },
    ])
  ),
});

// 6. /news-and-articles
writeRoute("/news-and-articles", {
  title: "Menopause Research & Articles | PauseAndFlourish",
  description:
    "Latest research, articles, and evidence-based guidance on menopause, perimenopause, and women's midlife health.",
  canonical: `${BASE_URL}/news-and-articles`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "News & Articles", url: `${BASE_URL}/news-and-articles` },
    ])
  ),
});

// 7. /methodology
writeRoute("/methodology", {
  title: "Editorial Methodology | PauseAndFlourish",
  description:
    "How PauseAndFlourish evaluates menopause products: our review criteria, scoring framework, editorial independence policy, and affiliate disclosure.",
  canonical: `${BASE_URL}/methodology`,
  jsonLd: siteGraph(
    breadcrumb([
      { name: "Home", url: `${BASE_URL}/` },
      { name: "Editorial Methodology", url: `${BASE_URL}/methodology` },
    ])
  ),
});

// 8. Author pages
console.log("\n👤 Author pages:");
const authorList = authors.length > 0 ? authors : [FALLBACK_AUTHOR];
for (const author of authorList) {
  writeRoute(`/author/${author.slug}`, {
    title: `${author.name}, ${author.role} | PauseAndFlourish`,
    description: author.bio || `${author.name} is a member of the PauseAndFlourish editorial team.`,
    canonical: author.url || `${BASE_URL}/author/${author.slug}`,
    jsonLd: siteGraph(
      breadcrumb([
        { name: "Home", url: `${BASE_URL}/` },
        { name: "About", url: `${BASE_URL}/about` },
        { name: author.name, url: author.url || `${BASE_URL}/author/${author.slug}` },
      ]),
      personNode(author)
    ),
  });
}

// 9. Category pages
console.log("\n📂 Category pages:");
const categoryDefs = categories.length > 0 ? categories : [
  { slug: "multi-symptom-supplements", name: "Multi-Symptom Supplements", description: "Comprehensive formulas targeting hot flashes, mood, sleep, and energy simultaneously." },
  { slug: "sleep-mood-support", name: "Sleep & Mood Support", description: "Supplements and tools to restore restful sleep and stabilize mood during hormonal shifts." },
  { slug: "hot-flash-cooling", name: "Hot Flash & Cooling", description: "Products designed to reduce hot flash frequency and intensity, and keep you cool." },
  { slug: "bone-joint-health", name: "Bone & Joint Health", description: "Calcium, vitamin D, and collagen supplements to protect bone density during menopause." },
  { slug: "vaginal-intimate-health", name: "Vaginal & Intimate Health", description: "Moisturizers, lubricants, and supplements for vaginal dryness and intimate comfort." },
  { slug: "menopause-skincare", name: "Menopause Skincare", description: "Collagen supplements, moisturizers, and serums formulated for menopausal skin changes." },
  { slug: "fitness-pelvic-health", name: "Fitness & Pelvic Health", description: "Resistance training tools, pelvic floor devices, and protein supplements for midlife fitness." },
  { slug: "cognitive-energy-support", name: "Cognitive & Energy Support", description: "Supplements targeting brain fog, memory, focus, and fatigue common in perimenopause." },
];

for (const cat of categoryDefs) {
  const catProducts = allProducts.filter(p => p.categorySlug === cat.slug);
  const itemListSchema = catProducts.length > 0 ? {
    "@type": "ItemList",
    name: `${cat.name} Reviews`,
    url: `${BASE_URL}/category/${cat.slug}`,
    numberOfItems: catProducts.length,
    itemListElement: catProducts.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/review/${p.slug}`,
      name: p.name,
    })),
  } : null;

  writeRoute(`/category/${cat.slug}`, {
    title: `${cat.name} Reviews | PauseAndFlourish`,
    description: trunc(`${cat.description} Read our expert reviews and comparisons.`, 155),
    canonical: `${BASE_URL}/category/${cat.slug}`,
    jsonLd: siteGraph(
      breadcrumb([
        { name: "Home", url: `${BASE_URL}/` },
        { name: "Reviews", url: `${BASE_URL}/reviews` },
        { name: cat.name, url: `${BASE_URL}/category/${cat.slug}` },
      ]),
      ...(itemListSchema ? [itemListSchema] : [])
    ),
  });
}

// 10. Stage pages
console.log("\n🌿 Stage pages:");
for (const stage of menopauseStages) {
  const stageProducts = allProducts.filter(p =>
    Array.isArray(p.stages) && p.stages.includes(stage.slug)
  );
  const itemListSchema = stageProducts.length > 0 ? {
    "@type": "ItemList",
    name: `${stage.name} Products`,
    url: `${BASE_URL}/stage/${stage.slug}`,
    numberOfItems: stageProducts.length,
    itemListElement: stageProducts.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/review/${p.slug}`,
      name: p.name,
    })),
  } : null;

  writeRoute(`/stage/${stage.slug}`, {
    title: `${stage.name} Products & Guide | PauseAndFlourish`,
    description: trunc(`Expert-reviewed products and guidance for ${stage.name}. ${stage.description}`, 155),
    canonical: `${BASE_URL}/stage/${stage.slug}`,
    jsonLd: siteGraph(
      breadcrumb([
        { name: "Home", url: `${BASE_URL}/` },
        { name: "Stage Guide", url: `${BASE_URL}/quiz` },
        { name: stage.name, url: `${BASE_URL}/stage/${stage.slug}` },
      ]),
      ...(itemListSchema ? [itemListSchema] : [])
    ),
  });
}

// 11. Product review pages
console.log("\n📦 Product review pages:");
const productList = allProducts.length > 0 ? allProducts : SITEMAP_PRODUCT_SLUGS.map(s => ({ slug: s, name: s, brand: "", shortDescription: "", category: "", categorySlug: "", score: 0, heroImage: "", publishDate: "", fullReview: "", authorId: "" }));

for (const product of productList) {
  const slug = product.slug;
  const name = product.name || slug;
  const brand = product.brand || "";
  const desc = product.shortDescription
    ? trunc(`Expert review of ${name} by ${brand}. ${product.shortDescription}`, 155)
    : trunc(`Expert review of ${name}. Evidence-based menopause product review by PauseAndFlourish.`, 155);

  // Editorial review schema (no fabricated aggregate rating)
  const editorialRating = product.score ? Math.round((product.score / 10) * 5 * 10) / 10 : null;

  // Author for this product
  const productAuthor = getAuthor(product.authorId || "");

  const productSchema = {
    "@type": "Product",
    name,
    description: product.shortDescription || name,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    image: product.heroImage || undefined,
    offers: product.asin ? {
      "@type": "Offer",
      price: product.price ? String(product.price).replace(/[^0-9.]/g, "") : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.amazon.com/dp/${product.asin}?tag=pauseandflourish-20`,
      seller: { "@type": "Organization", name: "Amazon" },
    } : undefined,
    // Editorial review only — no fabricated aggregateRating
    review: editorialRating ? {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: editorialRating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        "@id": `${BASE_URL}/author/${productAuthor.id}`,
        name: productAuthor.name,
        url: productAuthor.url || `${BASE_URL}/author/${productAuthor.id}`,
      },
      publisher: { "@type": "Organization", name: "PauseAndFlourish", url: BASE_URL },
      datePublished: product.publishDate || "2026-01-01",
      reviewBody: product.fullReview ? product.fullReview.substring(0, 500) : undefined,
    } : undefined,
  };

  // Remove undefined keys
  const cleanSchema = JSON.parse(JSON.stringify(productSchema));

  writeRoute(`/review/${slug}`, {
    title: trunc(`${name} Review | PauseAndFlourish`, 60),
    description: desc,
    canonical: `${BASE_URL}/review/${slug}`,
    ogImage: product.heroImage || `${BASE_URL}/og-image.jpg`,
    ogType: "article",
    jsonLd: siteGraph(
      breadcrumb([
        { name: "Home", url: `${BASE_URL}/` },
        { name: product.category || "Reviews", url: product.categorySlug ? `${BASE_URL}/category/${product.categorySlug}` : `${BASE_URL}/reviews` },
        { name, url: `${BASE_URL}/review/${slug}` },
      ]),
      cleanSchema,
      personNode(productAuthor)
    ),
  });
}

// 12. Comparison pages
console.log("\n⚖️  Comparison pages:");
for (const comp of comparisons) {
  const slug = comp.slug;
  const title = comp.title || slug;
  const subtitle = comp.subtitle || "";
  const summary = comp.verdict || comp.summary || "";

  const compAuthor = getAuthor(comp.authorId || "");

  const articleSchema = {
    "@type": "Article",
    headline: trunc(title, 110),
    description: trunc(`${subtitle}. ${summary}`, 155),
    author: {
      "@type": "Person",
      "@id": `${BASE_URL}/author/${compAuthor.id}`,
      name: compAuthor.name,
      url: compAuthor.url || `${BASE_URL}/author/${compAuthor.id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "PauseAndFlourish",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    datePublished: comp.publishDate || "2026-01-01",
    dateModified: comp.publishDate || "2026-01-01",
    url: `${BASE_URL}/comparison/${slug}`,
    mainEntityOfPage: `${BASE_URL}/comparison/${slug}`,
  };

  writeRoute(`/comparison/${slug}`, {
    title: trunc(`${title} | PauseAndFlourish`, 60),
    description: trunc(`${subtitle}. ${summary}`, 155),
    canonical: `${BASE_URL}/comparison/${slug}`,
    ogType: "article",
    jsonLd: siteGraph(
      breadcrumb([
        { name: "Home", url: `${BASE_URL}/` },
        { name: "Comparisons", url: `${BASE_URL}/comparisons` },
        { name: title, url: `${BASE_URL}/comparison/${slug}` },
      ]),
      articleSchema,
      personNode(compAuthor)
    ),
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────
const total = 7 + authorList.length + categoryDefs.length + menopauseStages.length + productList.length + comparisons.length;
console.log(`\n✅ Prerender complete — ${total} HTML files written to dist/public/\n`);
