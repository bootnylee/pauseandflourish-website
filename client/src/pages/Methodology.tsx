// PauseAndFlourish.com - Editorial Methodology Page

import { useEffect } from "react";
import { Link } from "wouter";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";

export default function Methodology() {
  useEffect(() => {
    updateDocumentMeta({
      title: "Editorial Methodology | PauseAndFlourish",
      description:
        "How PauseAndFlourish evaluates menopause products: our review criteria, scoring framework, editorial independence policy, and affiliate disclosure.",
      canonical: "https://pauseandflourish.com/methodology",
    });

    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Home", url: "https://pauseandflourish.com/" },
      { name: "Editorial Methodology", url: "https://pauseandflourish.com/methodology" },
    ]);
    injectStructuredData(breadcrumbSchema, "breadcrumb-schema");

    // FAQPage schema for methodology Q&A
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does PauseAndFlourish evaluate menopause products?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We evaluate every product against five criteria: ingredient quality and clinical evidence (40%), real-world efficacy based on aggregated user data (25%), value for money (15%), safety profile (10%), and suitability for specific menopause stages (10%). Each criterion is scored 1–10 and weighted to produce a final composite score.",
          },
        },
        {
          "@type": "Question",
          name: "Does PauseAndFlourish accept payment for positive reviews?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. We do not accept payment, free products, or any other compensation in exchange for positive reviews. Our affiliate relationship with Amazon means we earn a small commission when you purchase through our links, but this never influences our ratings or recommendations.",
          },
        },
        {
          "@type": "Question",
          name: "How often are reviews updated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We publish new reviews every Monday and review existing content weekly for accuracy. Reviews are updated whenever new clinical evidence emerges, product formulations change, or pricing shifts materially. Each review displays its original publish date and any material update date.",
          },
        },
        {
          "@type": "Question",
          name: "What sources does PauseAndFlourish use for clinical evidence?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We reference peer-reviewed studies from PubMed, Cochrane Reviews, and other reputable medical databases. We also draw on guidance from the North American Menopause Society (NAMS) and the Menopause Society. We cite our sources within reviews wherever specific clinical claims are made.",
          },
        },
      ],
    };
    injectStructuredData(faqSchema, "faq-schema");
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16 max-w-3xl mx-auto">
        <p className="section-label mb-2">Transparency</p>
        <h1
          className="font-display font-bold mb-6 leading-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}
        >
          Editorial Methodology
        </h1>
        <hr className="editorial-rule w-16 mb-4" />

        {/* Author + date byline */}
        <div className="flex flex-wrap items-center gap-3 mb-8 text-xs" style={{ color: "#B8A99A" }}>
          <span>By <strong style={{ color: "#2C2C2C" }}>PauseAndFlourish Editorial Team</strong></span>
          <span>·</span>
          <span>Last updated July 2026</span>
          <span>·</span>
          <Link href="/about">
            <a className="underline hover:text-teal-700" style={{ color: "#B8A99A" }}>About Us</a>
          </Link>
        </div>

        <div className="space-y-6">
          <p className="font-body text-lg leading-relaxed" style={{ color: "#2C2C2C" }}>
            Every review and comparison published on PauseAndFlourish is produced according to
            the methodology described on this page. We believe transparency about how we
            evaluate products is essential to earning your trust.
          </p>

          {/* ── How We Score Products ───────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            How We Score Products
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            Each product receives a composite score from 1–10, calculated as a weighted
            average of five criteria:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#EDF5F3" }}>
                  <th className="text-left p-3 font-semibold" style={{ color: "#2C2C2C", border: "1px solid #D4EBE7" }}>Criterion</th>
                  <th className="text-left p-3 font-semibold" style={{ color: "#2C2C2C", border: "1px solid #D4EBE7" }}>Weight</th>
                  <th className="text-left p-3 font-semibold" style={{ color: "#2C2C2C", border: "1px solid #D4EBE7" }}>What We Evaluate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Ingredient Quality & Clinical Evidence", "40%", "Peer-reviewed studies, standardized extracts, dosage alignment with clinical trials"],
                  ["Real-World Efficacy", "25%", "Aggregated user data, verified purchase reviews, symptom-specific outcomes"],
                  ["Value for Money", "15%", "Cost per serving, subscription options, price vs. comparable products"],
                  ["Safety Profile", "10%", "Known drug interactions, contraindications, third-party testing"],
                  ["Stage Suitability", "10%", "Alignment with the target menopause stage's specific symptom profile"],
                ].map(([criterion, weight, detail], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <td className="p-3 font-medium" style={{ color: "#2C2C2C", border: "1px solid #D4EBE7" }}>{criterion}</td>
                    <td className="p-3 font-bold" style={{ color: "#2D7D6F", border: "1px solid #D4EBE7" }}>{weight}</td>
                    <td className="p-3" style={{ color: "#6C6C6C", border: "1px solid #D4EBE7" }}>{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Score Interpretation ────────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Score Interpretation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { range: "9.0 – 10.0", label: "Exceptional", desc: "Best-in-class. Editor's Pick designation.", color: "#2D7D6F" },
              { range: "8.0 – 8.9", label: "Excellent", desc: "Highly recommended. Strong evidence and real-world results.", color: "#4CAF50" },
              { range: "7.0 – 7.9", label: "Good", desc: "Worth considering. Some trade-offs.", color: "#C4722A" },
              { range: "Below 7.0", label: "Not Recommended", desc: "Significant limitations. Better alternatives exist.", color: "#E53935" },
            ].map(({ range, label, desc, color }) => (
              <div
                key={range}
                className="p-4 rounded-sm"
                style={{ backgroundColor: "#EDF5F3", border: `2px solid ${color}` }}
              >
                <p className="font-bold text-sm mb-1" style={{ color }}>{range} — {label}</p>
                <p className="font-body text-xs" style={{ color: "#6C6C6C" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* ── Head-to-Head Comparisons ────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Head-to-Head Comparisons
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            For comparison articles, both products are evaluated against identical criteria
            using the same scoring framework. The winner is the product with the higher
            composite score for the target use case. Where scores are close (within 0.3
            points), we highlight the specific use case where each product excels rather than
            declaring a single winner.
          </p>

          {/* ── Clinical Sources ────────────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Clinical Sources
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            We reference peer-reviewed studies from PubMed, Cochrane Reviews, and other
            reputable medical databases. We also draw on guidance from the{" "}
            <a
              href="https://www.menopause.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal-700"
              style={{ color: "#2D7D6F" }}
            >
              Menopause Society (NAMS)
            </a>{" "}
            and the{" "}
            <a
              href="https://www.bms.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal-700"
              style={{ color: "#2D7D6F" }}
            >
              British Menopause Society
            </a>
            . Specific clinical claims within reviews are cited inline.
          </p>

          {/* ── Editorial Independence ──────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Editorial Independence
          </h2>

          <div
            className="p-5 rounded-sm"
            style={{ backgroundColor: "#EDF5F3", border: "1px solid #D4EBE7" }}
          >
            <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
              <strong>We do not accept payment for positive reviews.</strong> We do not accept
              free products in exchange for coverage. We do not allow brands to review or
              approve content before publication. Our affiliate relationship with Amazon means
              we earn a small commission when you purchase through our links — but this never
              influences our ratings, recommendations, or which products we choose to review.
            </p>
          </div>

          {/* ── Update Policy ───────────────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Update Policy
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            We publish new reviews every Monday. Existing reviews are checked weekly and
            updated whenever: (1) new clinical evidence emerges for a key ingredient, (2) a
            product formulation changes materially, (3) pricing shifts by more than 15%, or
            (4) the aggregate user rating on Amazon changes by 0.2 stars or more. Each review
            displays its original publish date; material updates are noted with an updated
            date.
          </p>

          {/* ── FAQ ─────────────────────────────────────────────────────────── */}
          <h2
            className="font-display font-bold mt-10 mb-4"
            style={{ fontSize: "1.6rem", color: "#2C2C2C" }}
          >
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Does PauseAndFlourish accept payment for positive reviews?",
                a: "No. We do not accept payment, free products, or any other compensation in exchange for positive reviews.",
              },
              {
                q: "How often are reviews updated?",
                a: "We publish new reviews every Monday and review existing content weekly. Reviews are updated whenever new clinical evidence emerges, formulations change, or pricing shifts materially.",
              },
              {
                q: "What sources do you use for clinical evidence?",
                a: "We reference peer-reviewed studies from PubMed and Cochrane Reviews, and draw on guidance from the Menopause Society (NAMS) and the British Menopause Society.",
              },
              {
                q: "Are your Amazon ratings the same as your editorial scores?",
                a: "No. Our editorial scores (1–10) are our own assessment based on the five-factor framework above. Amazon star ratings reflect consumer reviews on Amazon and are displayed for reference only.",
              },
            ].map(({ q, a }, i) => (
              <div
                key={i}
                className="p-5 rounded-sm"
                style={{ backgroundColor: "white", border: "1px solid #D4EBE7" }}
              >
                <p className="font-body font-semibold mb-2" style={{ color: "#2C2C2C" }}>{q}</p>
                <p className="font-body text-sm leading-relaxed" style={{ color: "#6C6C6C" }}>{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link href="/about">
              <a className="btn-primary rounded-sm inline-block px-6 py-3">About Us</a>
            </Link>
            <a
              href="mailto:hello@pauseandflourish.com"
              className="rounded-sm inline-block px-6 py-3 font-semibold"
              style={{ border: "2px solid #2D7D6F", color: "#2D7D6F" }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
