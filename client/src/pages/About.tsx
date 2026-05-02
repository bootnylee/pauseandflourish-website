// PauseAndFlourish.com - About Page

import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta } from "@/lib/seo";

export default function About() {
  useEffect(() => {
    updateDocumentMeta({
      title: "About PauseAndFlourish | Expert Hair Product Reviews",
      description: "PauseAndFlourish is your trusted source for expert, unbiased hair product reviews and recommendations for women. Learn about our review methodology.",
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
            PauseAndFlourish was built on a simple belief: every woman deserves honest, expert guidance on the hair products she spends her money on. With thousands of options on the market and marketing claims that often overpromise and underdeliver, finding the right product for your hair type can feel overwhelming.
          </p>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            We test every product we review - from drugstore staples to salon-grade formulas - and give you our honest assessment based on real-world results. Our reviews cover shampoos and conditioners, deep conditioning masks, hair serums and oils, and styling tools including hair dryers, flat irons, and curling irons.
          </p>

          <blockquote className="pull-quote my-8">
            "We believe the best hair product is the one that works for your specific hair - not the one with the biggest marketing budget."
          </blockquote>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Our Review Methodology
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            Every product we review is tested over a minimum of two weeks of consistent use. We evaluate products across multiple criteria including performance, ingredient quality, value for money, scent, texture, and ease of use. Our ratings reflect the aggregate of these factors weighted by their importance to the target user.
          </p>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            For head-to-head comparisons, we test both products simultaneously on the same hair type to ensure a fair comparison. Our winner recommendations are based on overall performance, value, and suitability for the target hair type - not on price alone.
          </p>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Amazon Affiliate Disclosure
          </h2>

          <div className="p-5 rounded-sm" style={{ backgroundColor: "#FFF8F0", border: "1px solid #E8DDD0" }}>
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
            We publish new content every Monday, including one new head-to-head comparison from each of our six product categories and two new reviews from each category. Our SEO and content quality are reviewed weekly to ensure we're providing the most accurate, helpful information possible.
          </p>

          <h2 className="font-display font-bold mt-8 mb-4" style={{ fontSize: "1.6rem", color: "#2C2C2C" }}>
            Contact Us
          </h2>

          <p className="font-body leading-relaxed" style={{ color: "#2C2C2C" }}>
            Have a product you'd like us to review? A question about one of our recommendations? We'd love to hear from you.
          </p>
          <a href="mailto:hello@pauseandflourish.com" className="btn-primary rounded-sm inline-block px-6 py-3 mt-2">
            Get in Touch
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}
