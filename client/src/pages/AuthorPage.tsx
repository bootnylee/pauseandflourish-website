// PauseAndFlourish.com - Author Page
// Renders a bio page for each pen-name editorial author at /author/[slug]

import { useEffect } from "react";
import { useParams, Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta, buildPersonSchema, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";
import { authorsBySlug } from "@/lib/authors";
import { allProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const author = authorsBySlug[slug ?? ""];

  useEffect(() => {
    if (!author) return;

    updateDocumentMeta({
      title: `${author.name}, ${author.role} | PauseAndFlourish`,
      description: author.bio,
      canonical: author.url,
    });

    injectStructuredData(buildPersonSchema({
      name: author.name,
      role: author.role,
      url: author.url,
      id: author.id,
    }), "person-schema");

    injectStructuredData(buildBreadcrumbSchema([
      { name: "Home", url: "https://pauseandflourish.com/" },
      { name: "About", url: "https://pauseandflourish.com/about" },
      { name: author.name, url: author.url },
    ]), "breadcrumb-schema");
  }, [author]);

  if (!author) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl" style={{ color: "#2C2C2C" }}>Author Not Found</h1>
          <Link href="/about">
            <button className="btn-primary mt-6 rounded-sm px-6 py-3">About PauseAndFlourish</button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // Show the most recent reviews attributed to this author
  const authorProducts = allProducts
    .filter(p => (p as any).authorId === author.id)
    .sort((a, b) => (b.publishDate > a.publishDate ? 1 : -1))
    .slice(0, 6);

  return (
    <SiteLayout>
      <div className="container py-16 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs" style={{ color: "#B8A99A" }}>
          <Link href="/"><span className="cursor-pointer hover:text-teal-700">Home</span></Link>
          <span>/</span>
          <Link href="/about"><span className="cursor-pointer hover:text-teal-700">About</span></Link>
          <span>/</span>
          <span style={{ color: "#2C2C2C" }}>{author.name}</span>
        </div>

        {/* Author header */}
        <div className="flex items-start gap-6 mb-8">
          {/* Photo placeholder */}
          <div
            className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-2xl select-none"
            style={{ backgroundColor: "#2D7D6F", color: "#FDF8F4", letterSpacing: "0.05em" }}
            aria-label={`${author.name} photo placeholder`}
          >
            {author.photoPlaceholder}
          </div>

          <div>
            <p className="section-label mb-1">PauseAndFlourish Editorial Team</p>
            <h1
              className="font-display font-bold leading-tight mb-1"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#2C2C2C" }}
            >
              {author.name}
            </h1>
            <p className="font-body text-sm font-semibold" style={{ color: "#2D7D6F" }}>
              {author.role}
            </p>
          </div>
        </div>

        <hr className="editorial-rule w-16 mb-8" />

        {/* Long bio */}
        <div className="space-y-5 mb-12">
          {author.bioLong.split("\n\n").map((para, i) => (
            <p key={i} className="font-body leading-relaxed" style={{ color: "#2C2C2C", fontSize: "1.05rem" }}>
              {para}
            </p>
          ))}
        </div>

        {/* Editorial standards callout */}
        <div
          className="p-5 rounded-sm mb-12"
          style={{ backgroundColor: "#EDF5F3", border: "1px solid #D4EBE7" }}
        >
          <p className="font-body text-sm leading-relaxed" style={{ color: "#2C2C2C" }}>
            All reviews published under {author.name.split(" ")[0]}'s byline follow the{" "}
            <Link href="/methodology">
              <a className="underline hover:text-teal-700" style={{ color: "#2D7D6F" }}>
                PauseAndFlourish Editorial Methodology
              </a>
            </Link>
            . We do not accept payment for positive reviews, and our affiliate relationships
            never influence our ratings or recommendations.
          </p>
        </div>

        {/* Recent reviews by this author */}
        {authorProducts.length > 0 && (
          <section>
            <p className="section-label mb-2">Recent Reviews</p>
            <h2
              className="font-display font-bold mb-8"
              style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
            >
              Reviews by {author.name.split(" ")[0]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {authorProducts.map(p => (
                <ProductCard key={p.id} product={p} variant="default" />
              ))}
            </div>
            <div className="mt-8">
              <Link href="/reviews">
                <a className="btn-primary rounded-sm inline-block px-6 py-3">
                  Browse All Reviews →
                </a>
              </Link>
            </div>
          </section>
        )}

        {authorProducts.length === 0 && (
          <div className="text-center py-8">
            <Link href="/reviews">
              <a className="btn-primary rounded-sm inline-block px-6 py-3">
                Browse All Reviews →
              </a>
            </Link>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
