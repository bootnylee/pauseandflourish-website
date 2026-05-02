/**
 * NewsletterSignup Component - PauseAndFlourish.com
 * Design: Teal + Terracotta on Ivory — Evidence-Based Menopause Wellness
 *
 * EmailOctopus integration: injects the <script data-form="..."> tag directly
 * inside the component's container div via useEffect. The EmailOctopus widget
 * finds this script tag, inserts the form HTML immediately after it
 * (parentNode.insertBefore(form, script.nextSibling)), then removes the script.
 * Because the script is inside our div, the form renders inside the component —
 * not appended to <body> as it would with a static <script> tag.
 *
 * Note: menopause stage tagging via member[fields][MenopauseStage] requires the
 * EmailOctopus form to have a custom "MenopauseStage" field configured in the
 * dashboard. The widget handles reCAPTCHA automatically.
 *
 * IMPORTANT: Replace EMAILOCTOPUS_FORM_ID below with the PauseAndFlourish
 * EmailOctopus form ID from your EmailOctopus dashboard.
 */

import { useEffect, useRef } from "react";

// TODO: Replace with the PauseAndFlourish EmailOctopus form ID
// Found in EmailOctopus dashboard → Forms → Your Form → Embed Code
const EMAILOCTOPUS_FORM_ID = "REPLACE_WITH_PAF_FORM_ID";
const EMAILOCTOPUS_SCRIPT_SRC = `https://eocampaign1.com/form/${EMAILOCTOPUS_FORM_ID}.js`;

/** Inject the EmailOctopus widget script into a container element.
 *  Returns a cleanup function that removes the script on unmount. */
function injectEmailOctopusWidget(container: HTMLElement): () => void {
  // Clear any previously injected widget (handles React hot-reload / re-mounts)
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = EMAILOCTOPUS_SCRIPT_SRC;
  script.async = true;
  script.setAttribute("data-form", EMAILOCTOPUS_FORM_ID);
  container.appendChild(script);

  return () => {
    if (container.contains(script)) container.removeChild(script);
  };
}

interface NewsletterSignupProps {
  variant?: "banner" | "footer" | "inline";
  className?: string;
}

export default function NewsletterSignup({
  variant = "banner",
  className = "",
}: NewsletterSignupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    return injectEmailOctopusWidget(containerRef.current);
  }, []);

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
          <div ref={containerRef} className="max-w-md mx-auto" />
          <p
            className="text-xs mt-4"
            style={{ color: "rgba(250,247,244,0.5)" }}
          >
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </section>
    );
  }

  if (variant === "footer") {
    return (
      <div className={className}>
        <p
          className="font-semibold text-xs mb-3 uppercase tracking-widest"
          style={{ color: "#C4722A" }}
        >
          The PauseAndFlourish Weekly
        </p>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: "rgba(250,247,244,0.7)" }}
        >
          New reviews and research every Monday. No spam, ever.
        </p>
        <div ref={containerRef} />
      </div>
    );
  }

  // inline variant
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
      <div ref={containerRef} />
    </div>
  );
}
