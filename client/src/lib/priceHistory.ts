// PauseAndFlourish.com - Price History & Price Drop Badge System
// Tracks historical prices per product ASIN and determines if current price is a deal
// Updated weekly by the GitHub Actions workflow (scripts/weekly-update.mjs)

export interface PriceRecord {
  date: string; // ISO date string
  price: number;
}

export interface ProductPriceHistory {
  asin: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  history: PriceRecord[];
  lastUpdated: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE HISTORY DATA
// This object is updated weekly by the GitHub Actions workflow.
// Each key is a product ASIN; values are historical price records.
// ─────────────────────────────────────────────────────────────────────────────
export const priceHistoryData: Record<string, ProductPriceHistory> = {
  // Pureology Hydrate Shampoo
  B001ET76AI: {
    asin: "B001ET76AI",
    currentPrice: 38.0,
    lowestPrice: 29.99,
    highestPrice: 42.0,
    averagePrice: 36.5,
    history: [
      { date: "2025-01-15", price: 38.0 },
      { date: "2025-02-01", price: 36.5 },
      { date: "2025-02-15", price: 34.99 },
      { date: "2025-03-01", price: 38.0 },
      { date: "2025-03-15", price: 38.0 },
      { date: "2025-04-01", price: 38.0 },
    ],
    lastUpdated: "2025-04-24",
  },
  // Redken All Soft Shampoo
  B000UXLPBS: {
    asin: "B000UXLPBS",
    currentPrice: 29.0,
    lowestPrice: 22.99,
    highestPrice: 32.0,
    averagePrice: 28.5,
    history: [
      { date: "2025-01-15", price: 29.0 },
      { date: "2025-02-01", price: 27.5 },
      { date: "2025-02-15", price: 29.0 },
      { date: "2025-03-01", price: 29.0 },
      { date: "2025-03-15", price: 26.99 },
      { date: "2025-04-01", price: 29.0 },
    ],
    lastUpdated: "2025-04-24",
  },
  // L'Oreal Elvive Hyaluron
  B09NWQMHVJ: {
    asin: "B09NWQMHVJ",
    currentPrice: 16.96,
    lowestPrice: 13.99,
    highestPrice: 19.99,
    averagePrice: 16.5,
    history: [
      { date: "2025-01-22", price: 16.96 },
      { date: "2025-02-01", price: 15.99 },
      { date: "2025-02-15", price: 16.96 },
      { date: "2025-03-01", price: 14.99 },
      { date: "2025-03-15", price: 16.96 },
      { date: "2025-04-01", price: 16.96 },
    ],
    lastUpdated: "2025-04-24",
  },
  // Dyson Supersonic
  B01LZXOQWD: {
    asin: "B01LZXOQWD",
    currentPrice: 429.99,
    lowestPrice: 369.99,
    highestPrice: 449.99,
    averagePrice: 419.99,
    history: [
      { date: "2025-01-15", price: 429.99 },
      { date: "2025-02-01", price: 399.99 },
      { date: "2025-02-15", price: 429.99 },
      { date: "2025-03-01", price: 429.99 },
      { date: "2025-03-15", price: 429.99 },
      { date: "2025-04-01", price: 429.99 },
    ],
    lastUpdated: "2025-04-24",
  },
  // Shark HyperAIR
  B09QXQVZLF: {
    asin: "B09QXQVZLF",
    currentPrice: 199.99,
    lowestPrice: 169.99,
    highestPrice: 229.99,
    averagePrice: 199.99,
    history: [
      { date: "2025-01-15", price: 199.99 },
      { date: "2025-02-01", price: 189.99 },
      { date: "2025-02-15", price: 199.99 },
      { date: "2025-03-01", price: 179.99 },
      { date: "2025-03-15", price: 199.99 },
      { date: "2025-04-01", price: 199.99 },
    ],
    lastUpdated: "2025-04-24",
  },
  // ghd Platinum+
  B07QHQRPNP: {
    asin: "B07QHQRPNP",
    currentPrice: 249.0,
    lowestPrice: 209.0,
    highestPrice: 269.0,
    averagePrice: 249.0,
    history: [
      { date: "2025-01-15", price: 249.0 },
      { date: "2025-02-01", price: 229.0 },
      { date: "2025-02-15", price: 249.0 },
      { date: "2025-03-01", price: 249.0 },
      { date: "2025-03-15", price: 249.0 },
      { date: "2025-04-01", price: 249.0 },
    ],
    lastUpdated: "2025-04-24",
  },
  // Olaplex No. 8
  B08HQZP4MK: {
    asin: "B08HQZP4MK",
    currentPrice: 30.0,
    lowestPrice: 24.99,
    highestPrice: 34.0,
    averagePrice: 29.5,
    history: [
      { date: "2025-01-22", price: 30.0 },
      { date: "2025-02-01", price: 27.99 },
      { date: "2025-02-15", price: 30.0 },
      { date: "2025-03-01", price: 30.0 },
      { date: "2025-03-15", price: 28.5 },
      { date: "2025-04-01", price: 30.0 },
    ],
    lastUpdated: "2025-04-24",
  },
  // Moroccanoil Treatment
  B00BPVWKFQ: {
    asin: "B00BPVWKFQ",
    currentPrice: 46.0,
    lowestPrice: 38.0,
    highestPrice: 50.0,
    averagePrice: 44.5,
    history: [
      { date: "2025-01-29", price: 46.0 },
      { date: "2025-02-01", price: 42.99 },
      { date: "2025-02-15", price: 46.0 },
      { date: "2025-03-01", price: 46.0 },
      { date: "2025-03-15", price: 46.0 },
      { date: "2025-04-01", price: 46.0 },
    ],
    lastUpdated: "2025-04-24",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRICE DROP DETECTION LOGIC
// ─────────────────────────────────────────────────────────────────────────────

export type PriceBadge =
  | { type: "all-time-low"; savingsPercent: number; label: string }
  | { type: "price-drop"; savingsPercent: number; label: string }
  | { type: "good-deal"; savingsPercent: number; label: string }
  | null;

/**
 * Determines whether a product's current price warrants a badge.
 * Returns null if the price is at or above average (no badge shown).
 */
export function getPriceBadge(asin: string, currentPrice?: number): PriceBadge {
  const history = priceHistoryData[asin];
  if (!history) return null;

  const price = currentPrice ?? history.currentPrice;
  const { lowestPrice, averagePrice, highestPrice } = history;

  // All-time low: within 5% of the lowest recorded price
  if (price <= lowestPrice * 1.05) {
    const savingsPercent = Math.round(((averagePrice - price) / averagePrice) * 100);
    return {
      type: "all-time-low",
      savingsPercent,
      label: `All-Time Low${savingsPercent > 0 ? ` - ${savingsPercent}% off avg` : ""}`,
    };
  }

  // Price drop: at least 10% below average
  const dropFromAverage = ((averagePrice - price) / averagePrice) * 100;
  if (dropFromAverage >= 10) {
    const savingsPercent = Math.round(dropFromAverage);
    return {
      type: "price-drop",
      savingsPercent,
      label: `${savingsPercent}% Below Average`,
    };
  }

  // Good deal: between 5–10% below average
  if (dropFromAverage >= 5) {
    const savingsPercent = Math.round(dropFromAverage);
    return {
      type: "good-deal",
      savingsPercent,
      label: `Good Deal - ${savingsPercent}% off avg`,
    };
  }

  return null;
}

export function getPriceHistoryForAsin(asin: string): ProductPriceHistory | null {
  return priceHistoryData[asin] ?? null;
}

/**
 * Returns a human-readable price trend description.
 */
export function getPriceTrend(asin: string): "dropping" | "rising" | "stable" | null {
  const history = priceHistoryData[asin];
  if (!history || history.history.length < 2) return null;

  const sorted = [...history.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recent = sorted.slice(-3);
  const oldest = recent[0].price;
  const newest = recent[recent.length - 1].price;
  const changePct = ((newest - oldest) / oldest) * 100;

  if (changePct <= -3) return "dropping";
  if (changePct >= 3) return "rising";
  return "stable";
}
