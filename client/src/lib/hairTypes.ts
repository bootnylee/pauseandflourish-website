// PauseAndFlourish.com - Hair Type Data & Helpers
// Defines each hair type landing page's metadata, SEO content, and product matching logic

import { allProducts, type Product } from "./products";

export interface HairType {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  challenges: string[];
  tips: string[];
  heroKeyword: string; // Primary SEO keyword
  metaTitle: string;
  metaDescription: string;
  accentColor: string;
  icon: string;
  heroImageUrl: string;
  relatedHairTypes: string[]; // slugs of related hair types
}

export const hairTypes: HairType[] = [
  {
    id: "fine",
    slug: "fine",
    name: "Fine Hair",
    tagline: "Lightweight formulas that add volume without weighing you down",
    description:
      "Fine hair has a smaller diameter per strand, which means it can easily become weighed down by heavy products and is prone to looking flat and limp. The right products make an enormous difference - lightweight formulas that hydrate without heaviness are key.",
    challenges: [
      "Gets weighed down easily by heavy products",
      "Prone to looking flat and lacking volume",
      "Builds up product residue quickly",
      "Can appear greasy faster than other hair types",
    ],
    tips: [
      "Use sulfate-free, lightweight shampoos to avoid stripping natural oils",
      "Apply conditioner only from mid-length to ends - never the roots",
      "Choose volumizing serums over heavy oils",
      "Blow-dry with a diffuser on low heat to add body",
    ],
    heroKeyword: "best hair products for fine hair",
    metaTitle: "Best Hair Products for Fine Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for fine hair. Lightweight shampoos, volumizing treatments, and styling tools that add body without weighing down fine strands.",
    accentColor: "#C4722A",
    icon: "🌾",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["normal", "color-treated"],
  },
  {
    id: "thick",
    slug: "thick",
    name: "Thick Hair",
    tagline: "Powerful formulas that tame, smooth, and manage voluminous strands",
    description:
      "Thick hair has a larger diameter per strand and more strands overall, giving it natural volume and body. The challenge is managing frizz, achieving smooth styles, and ensuring products penetrate deeply enough to make a difference.",
    challenges: [
      "Takes longer to dry, increasing heat exposure risk",
      "Prone to frizz and flyaways",
      "Needs more product to coat all strands evenly",
      "Can feel heavy and difficult to style",
    ],
    tips: [
      "Use rich, moisturizing shampoos and conditioners",
      "Deep condition weekly to maintain manageability",
      "Apply anti-frizz serums on damp hair before drying",
      "Use a high-powered dryer to reduce drying time",
    ],
    heroKeyword: "best hair products for thick hair",
    metaTitle: "Best Hair Products for Thick Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for thick hair. Moisturizing shampoos, deep conditioners, and powerful styling tools that tame and smooth thick, voluminous strands.",
    accentColor: "#2D7D6F",
    icon: "🌿",
    heroImageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["coarse", "curly"],
  },
  {
    id: "curly",
    slug: "curly",
    name: "Curly Hair",
    tagline: "Curl-enhancing formulas that define, hydrate, and fight frizz",
    description:
      "Curly hair ranges from loose waves to tight coils and requires specialized care to maintain definition, moisture, and frizz control. The unique structure of curly hair makes it more prone to dryness, so hydration is the top priority.",
    challenges: [
      "Prone to dryness due to curl structure",
      "Frizz is a constant battle in humidity",
      "Curl pattern can be disrupted by the wrong products",
      "Tangles and breakage during detangling",
    ],
    tips: [
      "Use sulfate-free, moisturizing shampoos - or co-wash",
      "Apply conditioner generously and use a wide-tooth comb",
      "Use a diffuser attachment when blow-drying",
      "Apply curl creams or gels on soaking wet hair for best definition",
    ],
    heroKeyword: "best hair products for curly hair",
    metaTitle: "Best Hair Products for Curly Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for curly hair. Moisturizing shampoos, curl-defining treatments, and diffuser-friendly styling tools for beautiful, frizz-free curls.",
    accentColor: "#6B4C8A",
    icon: "🌀",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["thick", "coarse"],
  },
  {
    id: "coarse",
    slug: "coarse",
    name: "Coarse Hair",
    tagline: "Intensive treatments that soften, smooth, and strengthen resistant strands",
    description:
      "Coarse hair has the widest strand diameter and often feels rough or wiry. It's typically resistant to moisture and can be prone to dryness and breakage. Intensive hydration and smoothing treatments are essential.",
    challenges: [
      "Resistant to moisture absorption",
      "Can feel rough and difficult to smooth",
      "Prone to dryness and breakage",
      "Takes longer to style and dry",
    ],
    tips: [
      "Use intensive moisturizing shampoos and conditioners",
      "Apply deep conditioning masks weekly",
      "Use heat protectant before any styling",
      "Flat irons with high heat settings work best for smoothing",
    ],
    heroKeyword: "best hair products for coarse hair",
    metaTitle: "Best Hair Products for Coarse Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for coarse hair. Intensive moisturizing formulas, smoothing treatments, and powerful styling tools that tame and soften coarse strands.",
    accentColor: "#5C4033",
    icon: "🪨",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["thick", "dry"],
  },
  {
    id: "dry",
    slug: "dry",
    name: "Dry Hair",
    tagline: "Deeply hydrating formulas that restore moisture and shine",
    description:
      "Dry hair lacks sufficient moisture and natural oils, resulting in a dull, brittle appearance. It can affect any hair type and is often caused by over-washing, heat styling, chemical treatments, or environmental factors. Restoring moisture is the primary goal.",
    challenges: [
      "Lacks natural shine and luster",
      "Prone to breakage and split ends",
      "Feels rough and straw-like",
      "Responds poorly to heat styling",
    ],
    tips: [
      "Wash less frequently - 2-3 times per week maximum",
      "Use hydrating hair masks weekly",
      "Apply hair oils to seal in moisture after washing",
      "Use the lowest effective heat setting when styling",
    ],
    heroKeyword: "best hair products for dry hair",
    metaTitle: "Best Hair Products for Dry Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for dry hair. Deeply hydrating shampoos, intensive masks, and nourishing oils that restore moisture, shine, and softness to dry strands.",
    accentColor: "#C0874A",
    icon: "💧",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["coarse", "color-treated"],
  },
  {
    id: "normal",
    slug: "normal",
    name: "Normal Hair",
    tagline: "Balanced formulas that maintain healthy, beautiful hair every day",
    description:
      "Normal hair has a good balance of moisture and oil, with a healthy shine and manageable texture. The goal is maintenance - keeping hair in its naturally healthy state while protecting against damage from heat, environment, and styling.",
    challenges: [
      "Maintaining balance without over-moisturizing or over-drying",
      "Protecting against heat and environmental damage",
      "Preventing gradual damage from regular styling",
      "Finding products that work without being too heavy or too light",
    ],
    tips: [
      "Use a balanced shampoo and conditioner for everyday use",
      "Apply a light serum for shine and heat protection",
      "Deep condition monthly to maintain health",
      "Use heat protectant consistently before styling",
    ],
    heroKeyword: "best hair products for normal hair",
    metaTitle: "Best Hair Products for Normal Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for normal hair. Balanced shampoos, light conditioners, and versatile styling tools that maintain healthy, beautiful hair every day.",
    accentColor: "#4A7C59",
    icon: "✨",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["fine", "thick"],
  },
  {
    id: "color-treated",
    slug: "color-treated",
    name: "Color-Treated Hair",
    tagline: "Color-safe formulas that protect vibrancy and repair chemical damage",
    description:
      "Color-treated hair has been chemically altered, making it more porous, prone to dryness, and susceptible to damage. Protecting color vibrancy while repairing and strengthening the hair structure requires specialized, gentle formulas.",
    challenges: [
      "Color fades faster with the wrong products",
      "Chemical processing weakens the hair structure",
      "More prone to breakage and split ends",
      "Requires gentle, sulfate-free formulas",
    ],
    tips: [
      "Always use sulfate-free shampoos to protect color",
      "Use a bond-building treatment (like Olaplex) regularly",
      "Wash with cool water to seal the cuticle and preserve color",
      "Apply UV protection products before sun exposure",
    ],
    heroKeyword: "best hair products for color-treated hair",
    metaTitle: "Best Hair Products for Color-Treated Hair 2025 | PauseAndFlourish",
    metaDescription:
      "Expert-tested hair products for color-treated hair. Sulfate-free shampoos, bond-building treatments, and gentle styling tools that protect vibrancy and repair chemical damage.",
    accentColor: "#C0392B",
    icon: "🎨",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    relatedHairTypes: ["dry", "fine"],
  },
];

// Map product bestFor text to hair type IDs for matching
const HAIR_TYPE_KEYWORDS: Record<string, string[]> = {
  fine: ["fine hair", "fine,", "fine to medium", "fine or", "fine and"],
  thick: ["thick hair", "thick,", "thick or", "thick and", "voluminous"],
  curly: ["curly hair", "curly,", "curly or", "wavy hair", "coils", "waves"],
  coarse: ["coarse hair", "coarse,", "coarse or", "brittle", "resistant"],
  dry: ["dry hair", "dry,", "dry or", "dehydrated", "damaged"],
  normal: ["normal hair", "normal,", "all hair types", "everyday", "multiple hair"],
  "color-treated": [
    "color-treated",
    "color treated",
    "colored hair",
    "chemically processed",
    "bleached",
  ],
};

export function getProductsForHairType(hairTypeId: string): Product[] {
  const keywords = HAIR_TYPE_KEYWORDS[hairTypeId] || [];

  return allProducts.filter((product) => {
    // Check explicit hairTypes field
    if (product.hairTypes && product.hairTypes.length > 0) {
      if (
        product.hairTypes.includes(hairTypeId) ||
        product.hairTypes.includes("all")
      ) {
        return true;
      }
    }

    // Fall back to keyword matching in bestFor and shortDescription
    const searchText = `${product.bestFor} ${product.shortDescription}`.toLowerCase();
    return keywords.some((kw) => searchText.includes(kw.toLowerCase()));
  });
}

export function getHairTypeBySlug(slug: string): HairType | undefined {
  return hairTypes.find((ht) => ht.slug === slug);
}

export function getTopProductsForHairType(
  hairTypeId: string,
  limit = 6
): Product[] {
  const products = getProductsForHairType(hairTypeId);
  // Sort: editor picks first, then by rating
  return products
    .sort((a, b) => {
      if (a.editorPick && !b.editorPick) return -1;
      if (!a.editorPick && b.editorPick) return 1;
      return b.rating - a.rating;
    })
    .slice(0, limit);
}
