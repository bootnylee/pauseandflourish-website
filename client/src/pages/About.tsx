// PauseAndFlourish.com - About Page

import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta } from "@/lib/seo";

export default function About() {
  useEffect(() => {
    updateDocumentMeta({
      title: "About PauseAndFlourish | Evidence-Based Menopause Wellness Reviews",
      description: "PauseAndFlourish is your trusted source for expert, evidence-based menopause and perimenopause product reviews and wellness guidance for women.",
      canonical: "https://pauseandflourish.com/about",
    });
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16 max-w-3xl mx-auto">
        <p className="section-label mb-2">Our Story</p>
        <h1 className="font-display font-bold mb-6 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2C2C2C" }}>
          About PauseAndFlourish
        </h1>
        <hr className="editorial-rule w-16 mb-8" />

        <div className="space-y-6">
          <p className="font-body text-lg leading-relaxed" style={{ color: "#2C2C2C" }}>
            PauseAndFlourish was built on a simple belief: every woman deserves honest, evidence-based guidance through menopause and perimenopause. With thousands of supplements, cooling products, sleep aids, and wellness tools on the market — and marketing claims that often overpromise — finding what actually works for your specific stage can feel overwhelming.
          </p>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            We research and review every product we feature — from widely available supplements to specialized wellness devices — and give you our honest assessment based on ingredient science, clinical evidence, and real-world user data. Our reviews cover menopause supplements, hot flash relief products, sleep aids, intimate health solutions, menopause skincare, bone health support, and cognitive wellness tools.
          </p>

          <blockquote className="pull-quote my-8">
            "We believe every woman deserves clear, honest guidance through menopause — not confusion, not shame, and not products that don't work."
          </blockquote>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Our Review Methodology
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            Every product we review is evaluated against a rigorous multi-factor framework: ingredient quality and clinical evidence, real-world efficacy based on aggregated user data, value for money, safety profile, and suitability for specific menopause stages. Our ratings reflect the aggregate of these factors weighted by their importance to women at that stage of the transition.
          </p>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            For head-to-head comparisons, we evaluate both products against identical criteria to ensure a fair assessment. Our winner recommendations are based on overall performance, ingredient quality, value, and suitability for the target menopause stage — not on price or brand recognition alone.
          </p>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Amazon Affiliate Disclosure
          </h2>

          <div className="p-5 rounded-sm" style={{ backgroundColor: "#EDF5F3", border: "1px solid #D4EBE7" }}>
            <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
              PauseAndFlourish is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click an Amazon link on our site and make a purchase, we may earn a small commission at no additional cost to you.
            </p>
            <p className="font-body leading-relaxed mt-3" style={{ color: "#2C2C2C" }}>
              Our affiliate relationship with Amazon does not influence our reviews or recommendations. We only recommend products we have tested and genuinely believe are worth your money. Product prices and availability are accurate as of the date of review and are subject to change.
            </p>
          </div>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Content Updates
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            We publish new content every Monday, including new product reviews and head-to-head comparisons across our eight product categories. Our content is reviewed weekly for accuracy and updated whenever new clinical evidence or product formulations emerge. We also send a weekly newsletter with our latest findings — subscribe below to stay informed.
          </p>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Contact Us
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            Have a product you'd like us to review? A question about one of our recommendations? A personal experience with menopause wellness you'd like to share? We'd love to hear from you.
          </p>
          <a href="mailto:hello@pauseandflourish.com" className="btn-primary rounded-sm inline-block px-6 py-3 mt-2">
            Get in Touch
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}
