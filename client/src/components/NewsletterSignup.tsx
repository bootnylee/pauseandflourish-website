/**
 * NewsletterSignup Component - PauseAndFlourish.com
 * Design: Bold Magazine - Burgundy (#8B1A2F) + Amber (#D4822A) + Cream (#FDF6EE)
 *
 * EmailOctopus integration: injects the <script data-form="..."> tag directly
 * inside the component's container div via useEffect. The EmailOctopus widget
 * finds this script tag, inserts the form HTML immediately after it
 * (parentNode.insertBefore(form, script.nextSibling)), then removes the script.
 * Because the script is inside our div, the form renders inside the component —
 * not appended to <body> as it would with a static <script> tag.
 *
 * Note: hair type tagging via member[fields][HairType] requires the EmailOctopus
 * form to have a custom "HairType" field configured in the dashboard. The widget
 * handles reCAPTCHA automatically, which is why direct POST approaches fail.
 */

import { useEffect, useRef } from "react";

const EMAILOCTOPUS_FORM_ID = "aeb1d42c-40de-11f1-aa22-35d9c85d0d35";
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
            "linear-gradient(135deg, #8B1A2F 0%, #6B1423 50%, #4A0E1A 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #D4822A 0%, transparent 50%), radial-gradient(circle at 80% 50%, #F2C4CE 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div
            className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-4 py-1 rounded-full"
            style={{ background: "#D4822A", color: "#fff" }}
          >
            Join the Community
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "#FDF6EE",
            }}
          >
            Get Expert Hair Tips
            <br />
            <span style={{ color: "#F2C4CE" }}>Delivered Weekly</span>
          </h2>
          <p
            className="text-lg mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(253,246,238,0.8)" }}
          >
            Join thousands of women who receive our curated product reviews,
            exclusive deals, and expert styling advice every week.
          </p>
          <div ref={containerRef} className="max-w-md mx-auto" />
          <p
            className="text-xs mt-4"
            style={{ color: "rgba(253,246,238,0.5)" }}
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
          style={{ color: "#D4822A" }}
        >
          The PauseAndFlourish Weekly
        </p>
        <p
          className="text-sm mb-4 leading-relaxed"
          style={{ color: "rgba(253,246,238,0.7)" }}
        >
          New reviews every Monday. No spam, ever.
        </p>
        <div ref={containerRef} />
      </div>
    );
  }

  // inline variant
  return (
    <div
      className={`rounded-sm p-6 ${className}`}
      style={{ backgroundColor: "#FFF8F0", border: "1px solid #E8DDD0" }}
    >
      <p
        className="font-semibold text-xs mb-2 uppercase tracking-widest"
        style={{ color: "#8B1A2F" }}
      >
        Stay Updated
      </p>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "#4A4A4A" }}>
        Get new reviews and comparisons in your inbox every Monday.
      </p>
      <div ref={containerRef} />
    </div>
  );
}
