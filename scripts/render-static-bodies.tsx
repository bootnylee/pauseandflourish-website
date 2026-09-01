import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import { allProducts, categories, comparisons } from "../client/src/lib/products";
import { menopauseStages } from "../client/src/lib/menopauseStages";
import { authors } from "../client/src/lib/authors";
import { researchArticles } from "../client/src/lib/researchArticles";
import { researchPath } from "../client/src/lib/researchRoutes";
import { isProductPriceFresh } from "../client/src/lib/priceFreshness.generated";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "static-bodies.json");

(globalThis as typeof globalThis & { React: typeof React }).React = React;
const { default: App } = await import("../client/src/App");

const routes = [
  "/",
  "/reviews",
  "/comparisons",
  "/about",
  "/quiz",
  "/news-and-articles",
  "/methodology",
  "/privacy",
  "/terms",
  "/contact",
  ...categories.map((category) => `/category/${category.slug}`),
  ...menopauseStages.map((stage) => `/stage/${stage.slug}`),
  ...allProducts.map((product) => `/review/${product.slug}`),
  ...comparisons.map((comparison) => `/comparison/${comparison.slug}`),
  ...authors.map((author) => `/author/${author.slug}`),
  ...researchArticles.map(researchPath),
];

const uniqueRoutes = [...new Set(routes)];
const bodies: Record<string, string> = {};
const allPricesStale = allProducts.every((product) => !isProductPriceFresh(product.asin));
const STALE_PRICE_TEXT = /\$\s*\d+(?:,\d{3})*(?:\.\d{1,2})?(?:\s*(?:to|[-–])\s*\$?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?)?/g;

function redactStalePriceText(markup: string): string {
  return allPricesStale ? markup.replace(STALE_PRICE_TEXT, "current pricing") : markup;
}

for (const route of uniqueRoutes) {
  bodies[route] = redactStalePriceText(renderToStaticMarkup(
    <WouterRouter ssrPath={route}>
      <App />
    </WouterRouter>
  ));
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(bodies), "utf8");
console.log(`Rendered ${uniqueRoutes.length} complete route bodies -> ${outputPath}`);
