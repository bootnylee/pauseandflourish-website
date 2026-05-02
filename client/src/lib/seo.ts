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

export function buildProductSchema(product: {
  name: string;
  description: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  heroImage: string;
  asin: string;
}): object {
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
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.amazon.com/dp/${product.asin}?tag=pauseandflourish-20`,
      seller: {
        "@type": "Organization",
        name: "Amazon",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
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
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    author: {
      "@type": "Organization",
      name: "PauseAndFlourish Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "PauseAndFlourish",
      url: "https://pauseandflourish.com",
    },
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
