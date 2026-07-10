/**
 * QuizEmailCapture — PauseAndFlourish.com
 *
 * Shown on the quiz results screen. Captures first name + email, subscribes
 * the visitor to the EmailOctopus list with their MenopauseStage custom field
 * pre-filled, and then delivers the stage-specific lead-magnet PDF.
 *
 * ── EmailOctopus Configuration ───────────────────────────────────────────────
 * PRIMARY path (server-side, API key never exposed to browser):
 *   POST /.netlify/functions/subscribe
 *   Requires EMAILOCTOPUS_API_KEY + EMAILOCTOPUS_LIST_ID in Netlify env vars.
 *
 * FALLBACK path (embedded widget endpoint, no API key needed):
 *   POST https://emailoctopus.com/lists/{EO_LIST_ID_FALLBACK}/members/embedded/1.3/add
 *   Uses the list ID hardcoded below.
 *
 * ── TO CONFIGURE ─────────────────────────────────────────────────────────────
 * 1. Set EMAILOCTOPUS_API_KEY and EMAILOCTOPUS_LIST_ID in Netlify → Site settings
 *    → Environment variables. The Netlify Function will use these automatically.
 * 2. The EO_LIST_ID_FALLBACK constant below is the fallback list ID for the
 *    embedded widget path. Update it if your list ID changes.
 *
 * ── Lead Magnet ──────────────────────────────────────────────────────────────
 * On successful subscription, the browser is directed to download the
 * stage-specific PDF from /guides/paf-guide-{stage}.pdf (served as a static
 * asset from client/public/guides/).
 */

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Mail, ArrowRight, Loader2, Download } from "lucide-react";

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * FALLBACK EmailOctopus list ID (used when the Netlify Function is unavailable).
 * This is the UUID from dashboard.emailoctopus.com/lists/{id}.
 * The primary path uses EMAILOCTOPUS_LIST_ID set in Netlify environment variables.
 *
 * ⚠️  TO UPDATE: Replace this value with your EmailOctopus list UUID.
 */
const EO_LIST_ID_FALLBACK = "a1d7e346-40dd-11f1-90e8-0d2682659c97";

// ─── Stage label map ──────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  "early-perimenopause": "Early Perimenopause",
  "late-perimenopause": "Late Perimenopause",
  "active-menopause": "Active Menopause",
  "early-postmenopause": "Early Postmenopause",
  "late-postmenopause": "Late Postmenopause",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizEmailCaptureProps {
  stageSlug: string;
  stageColor: string;
  stageBg: string;
}

type SubmitState = "idle" | "submitting" | "success" | "error" | "already_subscribed";

// ─── Analytics helper ─────────────────────────────────────────────────────────

function fireGa4Event(eventName: string, params: Record<string, string>) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, params);
    }
  } catch {}
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizEmailCapture({
  stageSlug,
  stageColor,
  stageBg,
}: QuizEmailCaptureProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const stageLabel = STAGE_LABELS[stageSlug] ?? "Menopause";

  // Don't show if already captured on this device
  const [alreadyCaptured, setAlreadyCaptured] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("paf_email_captured") === "1") {
        setAlreadyCaptured(true);
      }
    } catch {}
  }, []);

  // ── Primary: Netlify Function proxy ────────────────────────────────────────
  async function subscribeViaFunction(
    emailVal: string,
    firstNameVal: string
  ): Promise<"success" | "already_subscribed" | "error"> {
    const res = await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailVal,
        firstName: firstNameVal,
        stage: stageLabel,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.status === "success") return "success";
    if (res.status === 409 || data.status === "already_subscribed") return "already_subscribed";
    return "error";
  }

  // ── Fallback: EmailOctopus embedded widget endpoint ────────────────────────
  async function subscribeViaEmbedded(
    emailVal: string,
    firstNameVal: string
  ): Promise<"success" | "already_subscribed" | "error"> {
    const formData = new URLSearchParams();
    formData.append("member[email_address]", emailVal);
    if (firstNameVal) formData.append("member[fields][FirstName]", firstNameVal);
    formData.append("member[fields][MenopauseStage]", stageLabel);
    formData.append("hp", "");

    const res = await fetch(
      `https://emailoctopus.com/lists/${EO_LIST_ID_FALLBACK}/members/embedded/1.3/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok || data?.status === "SUCCESS") return "success";
    if (
      data?.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS" ||
      data?.message?.toLowerCase().includes("already")
    ) return "already_subscribed";
    return "error";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "submitting" || submitState === "success") return;
    if (honeypotRef.current?.value) return; // bot trap

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    const emailVal = email.trim().toLowerCase();
    const firstNameVal = firstName.trim();

    try {
      // Try primary (Netlify Function) first; fall back to embedded endpoint
      let result: "success" | "already_subscribed" | "error";
      try {
        result = await subscribeViaFunction(emailVal, firstNameVal);
      } catch {
        result = await subscribeViaEmbedded(emailVal, firstNameVal);
      }

      if (result === "success" || result === "already_subscribed") {
        setSubmitState(result);
        try { localStorage.setItem("paf_email_captured", "1"); } catch {}

        // Set lead-magnet download URL
        setDownloadUrl(`/guides/paf-guide-${stageSlug}.pdf`);

        // Fire GA4 event
        fireGa4Event("quiz_email_capture", {
          stage: stageSlug,
          stage_label: stageLabel,
          result: result,
        });
      } else {
        setErrorMessage("Something went wrong. Please try again.");
        setSubmitState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  }

  if (alreadyCaptured) return null;

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitState === "success" || submitState === "already_subscribed") {
    return (
      <div
        className="rounded-sm p-8 text-center"
        style={{ backgroundColor: stageBg, border: `1px solid ${stageColor}30` }}
      >
        <CheckCircle size={40} className="mx-auto mb-4" style={{ color: stageColor }} />
        <h3 className="font-display font-bold text-xl mb-2" style={{ color: "#2C2C2C" }}>
          {submitState === "already_subscribed" ? "You're already on the list!" : "Check your inbox!"}
        </h3>
        <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#5C5C5C" }}>
          {submitState === "already_subscribed"
            ? `We already have your email. Your ${stageLabel} guide is ready to download below.`
            : `We've sent your personalised ${stageLabel} guide to ${email}. You can also download it directly below.`}
        </p>

        {/* Lead-magnet download button */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-label font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: stageColor,
              color: "#FDF8F4",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
            onClick={() =>
              fireGa4Event("guide_download", {
                stage: stageSlug,
                stage_label: stageLabel,
                file: `paf-guide-${stageSlug}.pdf`,
              })
            }
          >
            <Download size={16} />
            Download Your {stageLabel} Guide
          </a>
        )}
      </div>
    );
  }

  // ── Capture form ──────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-sm p-8"
      style={{ backgroundColor: stageBg, border: `1px solid ${stageColor}30` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: stageColor }}
        >
          <Mail size={18} color="#fff" />
        </div>
        <div>
          <p
            className="font-label font-bold text-xs uppercase tracking-widest"
            style={{ color: stageColor }}
          >
            Free Personalised Guide
          </p>
          <h3 className="font-display font-bold text-lg leading-tight" style={{ color: "#2C2C2C" }}>
            Get Your {stageLabel} Product Guide
          </h3>
        </div>
      </div>

      <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#5C5C5C" }}>
        Enter your email to receive our top-rated products for <strong>{stageLabel}</strong> — 
        editor's picks, evidence summaries, and a downloadable stage guide, all tailored to where you are.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from real users, visible to bots */}
        <input
          ref={honeypotRef}
          type="text"
          name="hp"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          autoComplete="off"
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-sm border text-sm font-body focus:outline-none focus:ring-2"
            style={{ borderColor: "#D4EBE7", backgroundColor: "#FFFFFF", color: "#2C2C2C" }}
            autoComplete="given-name"
          />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-sm border text-sm font-body focus:outline-none focus:ring-2"
            style={{
              borderColor: errorMessage ? "#C0392B" : "#D4EBE7",
              backgroundColor: "#FFFFFF",
              color: "#2C2C2C",
            }}
            autoComplete="email"
          />
        </div>

        {errorMessage && (
          <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-sm font-label font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{
            backgroundColor: stageColor,
            color: "#FDF8F4",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {submitState === "submitting" ? (
            <><Loader2 size={16} className="animate-spin" /> Sending…</>
          ) : (
            <>Send My Guide <ArrowRight size={16} /></>
          )}
        </button>

        <p className="text-xs mt-3 text-center" style={{ color: "#9C9C9C" }}>
          No spam, ever. Unsubscribe at any time. Your stage is saved privately on your device.
        </p>
      </form>
    </div>
  );
}
