// PauseAndFlourish.com - Editorial Author Personas
// Pen-name authors. No fabricated credentials or certifications.

export interface Author {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;           // short bio shown on byline tooltip / author page
  bioLong: string;       // longer bio shown on /author/[slug] page
  photoPlaceholder: string;  // initials for avatar placeholder
  url: string;           // canonical author page URL
}

export const authors: Author[] = [
  {
    id: "diane-kessler",
    slug: "diane-kessler",
    name: "Diane Kessler",
    role: "Editorial Lead",
    bio: "Diane leads the editorial team at PauseAndFlourish, overseeing product research and review standards.",
    bioLong: `Diane Kessler is the Editorial Lead at PauseAndFlourish, where she oversees the site's review process, editorial standards, and content strategy. She has spent years researching the menopause and perimenopause supplement market, reading the clinical literature so our readers don't have to.

Diane's approach to product evaluation is straightforward: she starts with the ingredient list, cross-references it against the available peer-reviewed evidence, and then looks at what real users are actually reporting. She has no patience for proprietary blends that hide dosages, or for marketing claims that outrun the science.

At PauseAndFlourish, Diane is responsible for setting the scoring framework that underlies every review on the site, and for ensuring that our editorial independence is never compromised by affiliate relationships.`,
    photoPlaceholder: "DK",
    url: "https://pauseandflourish.com/author/diane-kessler",
  },
  {
    id: "carol-beaumont",
    slug: "carol-beaumont",
    name: "Carol Beaumont",
    role: "Reviews Editor",
    bio: "Carol writes and edits product reviews at PauseAndFlourish, focusing on real-world efficacy and value.",
    bioLong: `Carol Beaumont is the Reviews Editor at PauseAndFlourish. She writes and edits the majority of the site's product reviews and head-to-head comparisons, with a particular focus on what actually works in the real world — not just what looks good on a label.

Carol's reviews are grounded in three things: what the clinical evidence says about the key ingredients, what verified purchasers are reporting on Amazon and elsewhere, and whether the product represents genuine value for money. She is especially interested in products aimed at the later stages of the menopause transition, where the research is often thinner and the marketing louder.

Carol also manages the site's comparison framework, ensuring that head-to-head evaluations use identical criteria for both products and that winner recommendations are never influenced by price or brand recognition.`,
    photoPlaceholder: "CB",
    url: "https://pauseandflourish.com/author/carol-beaumont",
  },
];

export const authorsBySlug: Record<string, Author> = Object.fromEntries(
  authors.map(a => [a.slug, a])
);

export const authorsById: Record<string, Author> = Object.fromEntries(
  authors.map(a => [a.id, a])
);

/** Returns the author for a given author id, falling back to Diane Kessler */
export function getAuthor(authorId: string): Author {
  return authorsById[authorId] ?? authors[0];
}
