import { ArrowRight, CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { Link } from "wouter";
import type React from "react";
import { type Product, amazonLink } from "@/lib/products";
import { isProductPriceFresh } from "@/lib/priceFreshness.generated";
import { trackAffiliateClick } from "@/lib/analytics";

type CommerceProduct = Pick<Product, "asin" | "name" | "shortDescription" | "bestFor" | "price" | "priceDisplay"> & {
  availability?: string;
  isBuyBoxWinner?: boolean;
};

export function hasVerifiedAsin(asin?: string): boolean {
  return Boolean(asin && /^[A-Z0-9]{10}$/i.test(asin));
}

export function catalogIsFresh(product?: CommerceProduct): boolean {
  return Boolean(product && isProductPriceFresh(product.asin));
}

export function currentPriceNumber(price: unknown): number {
  return Number(String(price ?? "").replace(/[^0-9.]/g, "")) || 0;
}

export function FreshCatalogPrice({ product, className = "", color = "var(--pf-primary)" }: { product: CommerceProduct; className?: string; color?: string }) {
  if (!catalogIsFresh(product) || !product.priceDisplay || currentPriceNumber(product.price) <= 0) return null;
  return (
    <span className={`inline-flex items-baseline flex-wrap gap-x-1.5 font-label font-bold ${className}`} style={{ color }}>
      <span className="whitespace-nowrap">{product.priceDisplay}</span>
      {product.availability ? <><span aria-hidden="true" style={{ color: "var(--pf-soft)" }}>·</span><span className="font-body text-xs font-normal whitespace-nowrap" style={{ color: "var(--pf-soft-ink)" }}>{product.availability}</span></> : null}
    </span>
  );
}

export function VerifiedAmazonCta({ product, label = "Check Price on Amazon", className = "", compact = false }: { product: CommerceProduct; label?: string; className?: string; compact?: boolean }) {
  if (!hasVerifiedAsin(product.asin)) {
    return <span className={`font-body text-xs ${className}`} style={{ color: "var(--pf-soft)" }}>No verified link</span>;
  }
  const href = amazonLink(product.asin);
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`btn-amazon inline-flex items-center justify-center gap-2 rounded-sm ${compact ? "py-2 px-3 text-xs" : "py-2.5 px-4 text-sm"} ${className}`}
      onClick={() => trackAffiliateClick(product.name, href, product.asin)}
    >
      {label} <ExternalLink size={compact ? 10 : 12} />
    </a>
  );
}

function keySpec(product: CommerceProduct): string {
  const description = product.shortDescription?.split(/[.!?]/)[0]?.trim();
  return description || `Best for: ${product.bestFor}`;
}

export function ProductComparisonTable({ products }: { products: CommerceProduct[] }) {
  return (
    <section className="mb-10 overflow-x-auto" aria-label="Product comparison">
      <div className="rounded-sm border min-w-[680px]" style={{ borderColor: "var(--pf-line)", background: "#FAFDFC" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--pf-line)" }}>
          <h2 className="font-display font-bold text-2xl" style={{ color: "var(--pf-ink)" }}>Compare the Top Picks</h2>
          <p className="font-body text-xs mt-1" style={{ color: "var(--pf-soft-ink)" }}>Prices appear only when a current Amazon catalog response is available.</p>
        </div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead><tr className="font-label text-xs uppercase tracking-wide" style={{ color: "var(--pf-soft-ink)" }}>
            <th className="px-5 py-3 min-w-[190px]">Product</th><th className="px-5 py-3 min-w-[250px]">Key detail</th><th className="px-5 py-3 min-w-[160px]">Price</th><th className="px-5 py-3 min-w-[185px]">Buy</th>
          </tr></thead>
          <tbody>
            {products.map((product) => <tr key={product.asin || product.name} className="border-t" style={{ borderColor: "#E4F1EE" }}>
              <td className="px-5 py-4 font-body font-semibold text-sm" style={{ color: "var(--pf-ink)" }}>{product.name}</td>
              <td className="px-5 py-4 font-body text-xs leading-relaxed" style={{ color: "var(--pf-soft-ink)" }}>{keySpec(product)}</td>
              <td className="px-5 py-4 whitespace-nowrap align-middle"><FreshCatalogPrice product={product} className="text-sm" />{!catalogIsFresh(product) || currentPriceNumber(product.price) <= 0 ? <span className="font-body text-xs" style={{ color: "var(--pf-soft)" }}>{hasVerifiedAsin(product.asin) ? "See price on Amazon" : "Not linked"}</span> : null}</td>
              <td className="px-5 py-4 whitespace-nowrap align-middle"><VerifiedAmazonCta product={product} compact /></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * HeadToHeadTable — the standardized two-product comparison table (PF-OVERHAUL-0917, Phase C).
 * One row per thing that decides a head-to-head; the winner column is marked. Uses the editorial
 * score (1–10) and editor's pick — never a static Amazon rating (commerce gate).
 */
export function HeadToHeadTable({ products, winnerId, stageMeta }: { products: Product[]; winnerId: string; stageMeta?: Record<string, { label: string; color: string; bg: string }> }) {
  const rows: [string, (p: Product) => React.ReactNode][] = [
    ["Our score", (p) => <span className="font-display font-bold text-xl" style={{ color: p.id === winnerId ? "var(--pf-accent)" : "var(--pf-ink)" }}>{p.score}<span className="font-body text-xs font-normal" style={{ color: "var(--pf-muted)" }}> / 10</span></span>],
    ["Editor's pick", (p) => p.editorPick ? <span className="inline-flex items-center gap-1" style={{ color: "var(--pf-primary)" }}><CheckCircle size={14} /> Yes</span> : <span style={{ color: "var(--pf-muted)" }}>—</span>],
    ["Best for", (p) => p.bestFor],
    ["Category", (p) => p.category],
    ["Stages", (p) => <span className="flex flex-wrap gap-1">{p.stages.map((st) => <span key={st} className="font-label text-[10px] px-2 py-0.5 rounded-sm" style={{ background: stageMeta?.[st]?.bg ?? "var(--pf-tint)", color: stageMeta?.[st]?.color ?? "var(--pf-primary)" }}>{stageMeta?.[st]?.label ?? st}</span>)}</span>],
    ["Strengths", (p) => <ul className="space-y-1">{p.pros.slice(0, 3).map((x, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--pf-primary)" }} /><span>{x}</span></li>)}</ul>],
    ["Trade-offs", (p) => <ul className="space-y-1">{p.cons.slice(0, 2).map((x, i) => <li key={i} className="flex items-start gap-1.5"><XCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--pf-accent)" }} /><span>{x}</span></li>)}</ul>],
    ["Price", (p) => <span><FreshCatalogPrice product={p} className="text-base" />{(!catalogIsFresh(p) || currentPriceNumber(p.price) <= 0) && <span className="font-body text-xs" style={{ color: "var(--pf-soft)" }}>{hasVerifiedAsin(p.asin) ? "See price on Amazon" : "Not linked"}</span>}</span>],
    ["Buy", (p) => <VerifiedAmazonCta product={p} compact />],
    ["Full review", (p) => <Link href={`/review/${p.slug}`}><a className="inline-flex items-center gap-1 font-semibold underline" style={{ color: "var(--pf-primary)" }}>Read our review <ArrowRight size={13} /></a></Link>],
  ];
  return (
    <section className="mb-10 overflow-x-auto" aria-label="Side by side">
      <table className="w-full text-left border-collapse min-w-[560px]">
        <thead>
          <tr className="font-label text-xs uppercase tracking-wide" style={{ color: "var(--pf-soft-ink)" }}>
            <th className="py-3 pr-4 w-40"></th>
            {products.map((p) => (
              <th key={p.id} className="py-3 px-4 align-bottom" style={{ color: p.id === winnerId ? "var(--pf-accent)" : "var(--pf-ink)", borderBottom: p.id === winnerId ? "3px solid var(--pf-accent)" : "3px solid var(--pf-line)" }}>
                {p.id === winnerId ? "🏆 " : ""}{p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body text-sm" style={{ color: "var(--pf-ink)" }}>
          {rows.map(([label, cell]) => (
            <tr key={label} className="border-t align-top" style={{ borderColor: "var(--pf-line)" }}>
              <th scope="row" className="py-4 pr-4 font-label text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--pf-soft-ink)" }}>{label}</th>
              {products.map((p) => (
                <td key={p.id} className="py-4 px-4" style={{ background: p.id === winnerId ? "var(--pf-tint)" : "transparent" }}>{cell(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
