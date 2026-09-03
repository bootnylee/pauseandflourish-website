import type { Product } from "@/lib/products";
import { hasVerifiedAsin } from "@/components/ProductCommerce";
import { getRenderableProductImage } from "@/lib/productImageFreshness";

const SITE = "PauseAndFlourish";
const ORIGIN = "https://pauseandflourish.com";

type ProductLike = Pick<Product, "name" | "brand" | "shortDescription" | "heroImage" | "asin" | "publishDate" | "bestFor">;

export function editorialProductSchema(product: ProductLike, author?: { name: string; role?: string; url?: string }) {
  const image = getRenderableProductImage(product);
  return {
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: product.brand },
    ...(image ? { image } : {}),
    review: {
      "@type": "Review",
      author: author ? { "@type": "Person", name: author.name, jobTitle: author.role, url: author.url } : { "@type": "Organization", name: `${SITE} Editorial Team`, url: ORIGIN },
      publisher: { "@type": "Organization", name: SITE, url: ORIGIN },
      datePublished: product.publishDate,
      reviewBody: product.shortDescription,
    },
  };
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
      { "@type": "Question", name: "Are current Amazon prices shown?", acceptedAnswer: { "@type": "Answer", text: "Current retailer pricing is available on the verified product listing when provided." } },
    ],
  };
}
