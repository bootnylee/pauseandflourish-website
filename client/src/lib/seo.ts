// PauseAndFlourish.com - SEO Utilities
// Handles meta tags, structured data, and canonical URLs

export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

export function buildPageTitle(pageTitle: string): string {
  return `${pageTitle} | PauseAndFlourish`;
}

export function updateDocumentMeta(meta: SEOMeta): void {
  // Update title
  document.title = meta.title;

  // Helper to set or create meta tag
  const setMeta = (name: string, content: string, property = false) => {
    const attr = property ? "property" : "name";
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMeta("description", meta.description);
  if (meta.keywords) setMeta("keywords", meta.keywords);
  if (meta.noIndex) setMeta("robots", "noindex, nofollow");

  // Open Graph
  setMeta("og:title", meta.title, true);
  setMeta("og:description", meta.description, true);
  setMeta("og:type", meta.ogType || "website", true);
  if (meta.ogImage) setMeta("og:image", meta.ogImage, true);

  // Twitter
  setMeta("twitter:title", meta.title);
  setMeta("twitter:description", meta.description);

  // Canonical
  if (meta.canonical) {
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", meta.canonical);
  }
}

/**
 * Build a Product schema node with an editorial Review.
 * NOTE: We intentionally do NOT include aggregateRating here because the
 * Amazon review counts are third-party data and Google's review-snippet
 * guidelines require that aggregate ratings reflect genuine first-party
 * reviews on the page.  Only the editorial rating (derived from our score
 * field, 1–10 → 1–5) is marked up.
 */
export function buildProductSchema(product: {
  name: string;
  description: string;
  brand: string;
  price: number | string;
  score?: number;   // 1–10 editorial score
  heroImage: string;
  asin: string;
  publishDate?: string;
  reviewBody?: string;
  author?: { name: string; url: string; id: string };
}): object {
  const editorialRating = product.score
    ? Math.round((product.score / 10) * 5 * 10) / 10
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    image: product.heroImage,
    offers: {
      "@type": "Offer",
      price: String(product.price).replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.amazon.com/dp/${product.asin}?tag=pauseandflourish-20`,
      seller: {
        "@type": "Organization",
        name: "Amazon",
      },
    },
    // Editorial review only — no fabricated aggregateRating
    ...(editorialRating
      ? {
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: editorialRating,
              bestRating: 5,
              worstRating: 1,
            },
            author: product.author
              ? {
                  "@type": "Person",
                  "@id": `https://pauseandflourish.com/author/${product.author.id}`,
                  name: product.author.name,
                  url: product.author.url,
                }
              : {
                  "@type": "Organization",
                  name: "PauseAndFlourish Editorial Team",
                  url: "https://pauseandflourish.com",
                },
            publisher: {
              "@type": "Organization",
              name: "PauseAndFlourish",
              url: "https://pauseandflourish.com",
            },
            datePublished: product.publishDate || new Date().toISOString().split("T")[0],
            ...(product.reviewBody ? { reviewBody: product.reviewBody } : {}),
          },
        }
      : {}),
  };
}

export function buildReviewSchema(review: {
  productName: string;
  reviewBody: string;
  rating: number;
  datePublished: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: review.productName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    author: {
      "@type": "Organization",
      name: "PauseAndFlourish Editorial Team",
      url: "https://pauseandflourish.com",
    },
    publisher: {
      "@type": "Organization",
      name: "PauseAndFlourish",
      url: "https://pauseandflourish.com",
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: url,
    })),
  };
}

export function buildPersonSchema(author: {
  name: string;
  role: string;
  url: string;
  id: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://pauseandflourish.com/author/${author.id}`,
    name: author.name,
    jobTitle: author.role,
    url: author.url,
    worksFor: {
      "@type": "Organization",
      "@id": "https://pauseandflourish.com/#organization",
      name: "PauseAndFlourish",
    },
  };
}

export function buildOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://pauseandflourish.com/#organization",
    name: "PauseAndFlourish",
    url: "https://pauseandflourish.com",
    logo: {
      "@type": "ImageObject",
      url: "https://pauseandflourish.com/logo.png",
    },
    description:
      "Evidence-based menopause and perimenopause product reviews and wellness guidance for women.",
  };
}

export function buildArticleSchema(article: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "PauseAndFlourish Editorial Team",
      url: "https://pauseandflourish.com",
    },
    publisher: {
      "@type": "Organization",
      name: "PauseAndFlourish",
      url: "https://pauseandflourish.com",
      logo: {
        "@type": "ImageObject",
        url: "https://pauseandflourish.com/logo.png",
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    url: article.url,
    mainEntityOfPage: article.url,
  };
}

export function injectStructuredData(data: object, id: string): void {
  const existingScript = document.getElementById(id);
  if (existingScript) existingScript.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
