import { ExternalLink } from "lucide-react";
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
