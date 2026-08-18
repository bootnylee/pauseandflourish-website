import { type Product } from "@/lib/products";
import { catalogIsFresh, hasVerifiedAsin } from "@/components/ProductCommerce";

const SITE = "PauseAndFlourish";
const ORIGIN = "https://pauseandflourish.com";
const TAG = "pauseandflourish-20";

type ProductLike = Pick<Product, "name" | "brand" | "shortDescription" | "heroImage" | "asin" | "price" | "priceDisplay" | "rating" | "publishDate" | "bestFor"> & { availability?: string };

export function editorialProductSchema(product: ProductLike, author?: { name: string; role?: string; url?: string }) {
  const schema: Record<string, unknown> = {
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: product.brand },
    image: product.heroImage,
    review: {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: product.rating, bestRating: 5, worstRating: 1 },
      author: author ? { "@type": "Person", name: author.name, jobTitle: author.role, url: author.url } : { "@type": "Organization", name: `${SITE} Editorial Team`, url: ORIGIN },
      publisher: { "@type": "Organization", name: SITE, url: ORIGIN },
      datePublished: product.publishDate,
      reviewBody: product.shortDescription,
    },
  };
  // AggregateRating is intentionally absent: it may only be emitted by the approved-user-review feature.
  if (catalogIsFresh() && Number(product.price) > 0 && hasVerifiedAsin(product.asin)) {
    schema.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.availability ? "https://schema.org/InStock" : undefined,
      url: `https://www.amazon.com/dp/${product.asin}?tag=${TAG}`,
      seller: { "@type": "Organization", name: "Amazon" },
    };
  }
  return schema;
}

export function commerceFaqSchema(product: ProductLike, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Who is ${product.name} best for?`, acceptedAnswer: { "@type": "Answer", text: product.bestFor } },
      { "@type": "Question", name: `Where can I find the current price for ${product.name}?`, acceptedAnswer: { "@type": "Answer", text: hasVerifiedAsin(product.asin) ? `Use the verified Amazon link on this review for the current listing and price. ${pageUrl}` : "A verified retailer destination is not currently available." } },
    ],
  };
}

export function commerceItemListSchema(products: ProductLike[], author?: { name: string; role?: string; url?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: editorialProductSchema(product, author),
    })),
  };
}

export function commerceComparisonFaqSchema(title: string, winner: ProductLike) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is the editorial winner in ${title}?`, acceptedAnswer: { "@type": "Answer", text: `${winner.name} is the editorial winner for the use case described in this comparison.` } },
      { "@type": "Question", name: "Are current Amazon prices shown?", acceptedAnswer: { "@type": "Answer", text: "Prices are displayed only after a current Amazon Creators API catalog refresh; otherwise the comparison links to the verified product listing without displaying a stale price." } },
    ],
  };
}
