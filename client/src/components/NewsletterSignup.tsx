import { useId, useState } from "react";

const GENERAL_NEWSLETTER_STAGE = "General Newsletter";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface NewsletterSignupProps {
  variant?: "banner" | "footer" | "inline";
  className?: string;
}

export default function NewsletterSignup({
  variant = "banner",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const statusId = useId();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting" || submitState === "success") return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/.netlify/functions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          stage: GENERAL_NEWSLETTER_STAGE,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setSubmitState("success");
        return;
      }

      setErrorMessage(data.message ?? "Something went wrong. Please try again.");
      setSubmitState("error");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  }

  const isFooter = variant === "footer";
  const accentColor = isFooter ? "#7ECEC4" : "#C4722A";
  const mutedTextColor = isFooter ? "rgba(250,247,244,0.7)" : "#5C5C5C";

  const form = (
    <form onSubmit={handleSubmit} noValidate aria-describedby={statusId}>
      <div className={isFooter ? "flex flex-col gap-2" : "flex flex-col sm:flex-row gap-3"}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          autoComplete="email"
          required
          disabled={submitState === "submitting" || submitState === "success"}
          className="flex-1 px-4 py-3 rounded-sm border text-sm font-body focus:outline-none focus:ring-2 disabled:opacity-70"
          style={{
            borderColor: errorMessage ? "#C0392B" : isFooter ? "#4A5A58" : "#D4EBE7",
            backgroundColor: isFooter ? "#FFFFFF" : "#FFFFFF",
            color: "#2C2C2C",
          }}
        />
        <button
          type="submit"
          disabled={submitState === "submitting" || submitState === "success"}
          className="px-5 py-3 rounded-sm font-label font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{
            backgroundColor: accentColor,
            color: isFooter ? "#2C2C2C" : "#FFFFFF",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {submitState === "submitting" ? "Joining…" : submitState === "success" ? "You’re In" : "Subscribe"}
        </button>
      </div>
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="text-xs mt-3"
        style={{ color: submitState === "error" ? "#C0392B" : submitState === "success" ? accentColor : mutedTextColor }}
      >
        {submitState === "success"
          ? "Thanks — you’re subscribed to the PauseAndFlourish Weekly."
          : submitState === "error"
            ? errorMessage
            : <>No spam, ever. Unsubscribe at any time. By subscribing, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.</>}
      </p>
    </form>
  );

  if (variant === "banner") {
    return (
      <section
        className={`relative overflow-hidden ${className}`}
        style={{
          background:
            "linear-gradient(135deg, #1E5C54 0%, #2D7D6F 50%, #1A4A44 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #C4722A 0%, transparent 50%), radial-gradient(circle at 80% 50%, #E8F5F2 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div
            className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1 rounded-full"
            style={{ background: "#C4722A", color: "#fff" }}
          >
            Join the Community
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "#FDF8F4",
            }}
          >
            Evidence-Based Menopause Guidance
            <br />
            <span style={{ color: "#A8D8D0" }}>Delivered Every Monday</span>
          </h2>
          <p
            className="text-lg mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(250,247,244,0.85)" }}
          >
            Join thousands of women who receive our latest product reviews,
            clinical research summaries, and stage-specific wellness tips every week.
          </p>
          <div className="max-w-md mx-auto">{form}</div>
        </div>
      </section>
    );
  }

  if (variant === "footer") {
    return (
      <div className={className}>
        <p
          className="font-semibold text-xs mb-3 uppercase tracking-widest"
          style={{ color: "#7ECEC4" }}
        >
          The PauseAndFlourish Weekly
        </p>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: "rgba(250,247,244,0.7)" }}
        >
          New reviews and research every Monday. No spam, ever.
        </p>
        {form}
      </div>
    );
  }

  return (
    <div
      className={`rounded-sm p-6 ${className}`}
      style={{ backgroundColor: "#EDF5F3", border: "1px solid #D4EBE7" }}
    >
      <p
        className="font-semibold text-xs mb-2 uppercase tracking-widest"
        style={{ color: "#2D7D6F" }}
      >
        Stay Informed
      </p>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A4A4A" }}>
        Get new menopause product reviews and clinical insights in your inbox every Monday.
      </p>
      {form}
    </div>
  );
}
