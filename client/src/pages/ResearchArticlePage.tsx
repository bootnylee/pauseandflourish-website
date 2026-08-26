import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useParams } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import NotFound from "@/pages/NotFound";
import { updateDocumentMeta } from "@/lib/seo";
import { getResearchArticleBySlug } from "@/lib/researchRoutes";

export default function ResearchArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getResearchArticleBySlug(slug) : undefined;

  useEffect(() => {
    if (!article || !slug) return;
    updateDocumentMeta({
      title: article.headline,
      description: article.takeaway,
      canonical: `https://pauseandflourish.com/research/${slug}`,
      ogType: "article",
    });
  }, [article, slug]);

  if (!article) return <NotFound />;

  return (
    <SiteLayout>
      <article className="container max-w-3xl mx-auto py-12">
        <nav className="font-body text-sm mb-8" style={{ color: "#6C6C6C" }} aria-label="Breadcrumb">
          <Link href="/"><a>Home</a></Link>
          <span> / </span>
          <Link href="/news-and-articles"><a>News &amp; Articles</a></Link>
          <span> / </span>
          <span>{article.headline}</span>
        </nav>
        <p className="section-label mb-3">{article.study_type}</p>
        <h1 className="font-display font-bold leading-tight mb-6" style={{ color: "#1A2E2A", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {article.headline}
        </h1>
        <p className="font-body text-lg leading-relaxed mb-8" style={{ color: "#4A5E5A" }}>
          {article.takeaway}
        </p>
        <section className="border-t pt-6" style={{ borderColor: "#E8F0EE" }}>
          <p className="section-label mb-2">Citation</p>
          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>{article.citation}</p>
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-label text-sm font-semibold mt-5" style={{ color: "#2D7D6F" }}>
              View Source <ExternalLink size={14} />
            </a>
          )}
        </section>
      </article>
    </SiteLayout>
  );
}
