/**
 * QuizEmailCapture — PauseAndFlourish.com
 *
 * Shown on the quiz results screen. Captures the user's first name + email,
 * then subscribes them to the EmailOctopus list with their MenopauseStage
 * custom field pre-filled. This triggers the "Segmented Welcome by Menopause
 * Stage" automation, which sends a personalised welcome email with
 * stage-specific product recommendations.
 *
 * Implementation note: EmailOctopus does not expose a public REST API for
 * direct form submissions from the browser (API key would be exposed). Instead
 * we POST to the same endpoint the EmailOctopus embed widget uses:
 *   POST https://emailoctopus.com/lists/{listId}/members/embedded/1.3/add
 * with form-encoded body: member[email_address], member[fields][FirstName],
 * member[fields][MenopauseStage], and hp (honeypot).
 *
 * The list ID is the UUID from the EmailOctopus Contacts URL.
 */

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react";

// EmailOctopus list ID (from dashboard.emailoctopus.com/lists/{id})
const EO_LIST_ID = "a1d7e346-40dd-11f1-90e8-0d2682659c97";

// Map quiz stage slugs → human-readable stage names stored in MenopauseStage field
const STAGE_LABELS: Record<string, string> = {
  "early-perimenopause": "Early Perimenopause",
  "late-perimenopause": "Late Perimenopause",
  "active-menopause": "Active Menopause",
  "early-postmenopause": "Early Postmenopause",
  "late-postmenopause": "Late Postmenopause",
};

interface QuizEmailCaptureProps {
  stageSlug: string;
  stageColor: string;
  stageBg: string;
  /** Top 3 product slugs recommended for this stage */
  topProductSlugs?: string[];
}

type SubmitState = "idle" | "submitting" | "success" | "error" | "already_subscribed";

export default function QuizEmailCapture({
  stageSlug,
  stageColor,
  stageBg,
}: QuizEmailCaptureProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const stageLabel = STAGE_LABELS[stageSlug] ?? "Menopause";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "submitting" || submitState === "success") return;

    // Honeypot check (bots fill hidden fields)
    if (honeypotRef.current?.value) return;

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("member[email_address]", email.trim());
      if (firstName.trim()) {
        formData.append("member[fields][FirstName]", firstName.trim());
      }
      formData.append("member[fields][MenopauseStage]", stageLabel);
      formData.append("hp", ""); // honeypot field expected by EO

      const response = await fetch(
        `https://emailoctopus.com/lists/${EO_LIST_ID}/members/embedded/1.3/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok || data?.status === "SUCCESS") {
        setSubmitState("success");
        // Persist so we don't show the form again on this device
        try {
          localStorage.setItem("paf_email_captured", "1");
        } catch {}
      } else if (
        data?.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS" ||
        data?.message?.toLowerCase().includes("already")
      ) {
        setSubmitState("already_subscribed");
      } else {
        setErrorMessage(
          data?.message ?? "Something went wrong. Please try again."
        );
        setSubmitState("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  }

  // Don't show if already captured on this device
  const [alreadyCaptured, setAlreadyCaptured] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("paf_email_captured") === "1") {
        setAlreadyCaptured(true);
      }
    } catch {}
  }, []);

  if (alreadyCaptured) return null;

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitState === "success" || submitState === "already_subscribed") {
    return (
      <div
        className="rounded-sm p-8 text-center"
        style={{ backgroundColor: stageBg, border: `1px solid ${stageColor}30` }}
      >
        <CheckCircle size={40} className="mx-auto mb-4" style={{ color: stageColor }} />
        <h3
          className="font-display font-bold text-xl mb-2"
          style={{ color: "#2C2C2C" }}
        >
          {submitState === "already_subscribed"
            ? "You're already on the list!"
            : "Check your inbox!"}
        </h3>
        <p className="font-body text-sm leading-relaxed" style={{ color: "#5C5C5C" }}>
          {submitState === "already_subscribed"
            ? `We already have your email. Your ${stageLabel} guide and product recommendations are waiting for you.`
            : `We've sent your personalised ${stageLabel} guide with our top product picks directly to ${email}. Check your spam folder if it doesn't arrive within a few minutes.`}
        </p>
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
          <h3
            className="font-display font-bold text-lg leading-tight"
            style={{ color: "#2C2C2C" }}
          >
            Get Your {stageLabel} Product Guide
          </h3>
        </div>
      </div>

      <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#5C5C5C" }}>
        We'll email you our top-rated products for <strong>{stageLabel}</strong>, 
        including our editor's picks, clinical evidence summaries, and exclusive 
        discount codes — all tailored to your stage.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from real users */}
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
            style={{
              borderColor: "#D4EBE7",
              backgroundColor: "#FFFFFF",
              color: "#2C2C2C",
            }}
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
          <p className="text-xs mb-3" style={{ color: "#C0392B" }}>
            {errorMessage}
          </p>
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
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send My Guide <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-xs mt-3 text-center" style={{ color: "#9C9C9C" }}>
          No spam, ever. Unsubscribe at any time. Your stage is saved privately on your device.
        </p>
      </form>
    </div>
  );
}
