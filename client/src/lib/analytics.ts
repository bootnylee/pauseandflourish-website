/**
 * PauseAndFlourish — Analytics Library
 * ======================================
 * Thin wrapper around Google Analytics 4 (gtag.js).
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * The GA4 Measurement ID is read from the window.__PAF_GA4_ID__ global, which
 * is injected by index.html. To set your real Measurement ID:
 *
 *   1. Open client/index.html
 *   2. Find the line:  window.__PAF_GA4_ID__ = "G-XXXXXXXXXX";
 *   3. Replace "G-XXXXXXXXXX" with your actual Measurement ID from
 *      Google Analytics → Admin → Data Streams → Web stream → Measurement ID
 *
 * ── Events fired ─────────────────────────────────────────────────────────────
 * affiliate_click   — fired on every outbound Amazon/buy link click
 *   params: { product_name, destination_url, asin? }
 *
 * quiz_email_capture — fired on successful email subscription from quiz
 *   params: { stage, stage_label, result }
 *
 * guide_download    — fired when the lead-magnet PDF download button is clicked
 *   params: { stage, stage_label, file }
 *
 * ── UTM Parameters ───────────────────────────────────────────────────────────
 * GA4 automatically preserves and attributes inbound UTM parameters
 * (utm_source, utm_medium, utm_campaign, utm_content, utm_term) without any
 * additional configuration. No custom code is needed.
 */

declare global {
  interface Window {
    __PAF_GA4_ID__?: string;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// ─── Initialise GA4 ───────────────────────────────────────────────────────────

/**
 * Loads the gtag.js script and initialises GA4 with the configured
 * Measurement ID. Safe to call multiple times (idempotent).
 */
export function initGA4(): void {
  if (typeof window === "undefined") return;

  const measurementId = window.__PAF_GA4_ID__;
  if (!measurementId || measurementId === "G-XXXXXXXXXX") {
    // Placeholder not yet replaced — skip loading to avoid polluting GA
    if (import.meta.env.DEV) {
      console.info("[analytics] GA4 Measurement ID not configured — analytics disabled.");
    }
    return;
  }

  // Idempotency guard
  if (window.gtag) return;

  // Inject gtag.js script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialise dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    // GA4 automatically handles UTM parameters — no extra config needed
    send_page_view: true,
  });
}

// ─── Generic event helper ─────────────────────────────────────────────────────

export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean>
): void {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  } catch {
    // Silently ignore — analytics must never break the page
  }
}

// ─── Affiliate click event ────────────────────────────────────────────────────

/**
 * Fire the "affiliate_click" GA4 custom event.
 * Call this on every outbound Amazon/buy link click.
 *
 * @param productName   Human-readable product name (e.g. "Remifemin Menopause Supplement")
 * @param destinationUrl Full destination URL (e.g. "https://www.amazon.com/dp/B000...")
 * @param asin          Optional Amazon ASIN
 */
export function trackAffiliateClick(
  productName: string,
  destinationUrl: string,
  asin?: string
): void {
  trackEvent("affiliate_click", {
    product_name: productName,
    destination_url: destinationUrl,
    ...(asin ? { asin } : {}),
  });
}
