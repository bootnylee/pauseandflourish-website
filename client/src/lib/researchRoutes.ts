import { researchArticles, type ResearchArticle } from "./researchArticles";

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/\.\.\.|…/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function researchSlug(article: ResearchArticle) {
  const headline = slugPart(article.headline);
  return headline ? `${headline}-${article.id}` : article.id;
}

export function researchPath(article: ResearchArticle) {
  return `/research/${researchSlug(article)}`;
}

export function getResearchArticleBySlug(slug: string) {
  return researchArticles.find((article) => researchSlug(article) === slug);
}

export function getStageMatchedResearch(stages: readonly string[] | undefined, limit = 3) {
  if (!stages?.length) return [];
  return researchArticles
    .filter((article) => stages.includes(article.stage_id))
    .sort((a, b) => b.date_added.localeCompare(a.date_added))
    .slice(0, limit);
}
