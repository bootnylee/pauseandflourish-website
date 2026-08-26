import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";

const EFFECTIVE_DATE = "August 26, 2026";

export default function TermsOfUse() {
  useEffect(() => {
    updateDocumentMeta({
      title: "Terms of Use | PauseAndFlourish",
      description: "Terms governing use of PauseAndFlourish.com.",
      canonical: "https://pauseandflourish.com/terms",
      ogType: "website",
    });
    injectStructuredData(
      buildBreadcrumbSchema([
        { name: "Home", url: "https://pauseandflourish.com/" },
        { name: "Terms of Use", url: "https://pauseandflourish.com/terms" },
      ]),
      "breadcrumb-schema"
    );
  }, []);

  return (
    <SiteLayout>
      <article className="container max-w-4xl mx-auto py-12 md:py-16">
        <p className="section-label mb-3">Legal</p>
        <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "#2C2C2C" }}>Terms of Use</h1>
        <p className="font-body text-sm mt-4" style={{ color: "#6C6C6C" }}>Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose max-w-none mt-10 font-body" style={{ color: "#2C2C2C" }}>
          <p>These Terms of Use (“<strong>Terms</strong>”) govern your use of <a href="https://pauseandflourish.com">https://pauseandflourish.com</a> and its content, features, and services (collectively, the “<strong>Site</strong>”). The Site is operated by [LEGAL ENTITY NAME + ADDRESS] (“<strong>PauseAndFlourish</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”). By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.</p>

          <h2>1. Informational Content; No Medical Advice</h2>
          <p>The Site provides general educational and editorial information about menopause, perimenopause, wellness products, and related topics. It is <strong>not medical advice</strong>, diagnosis, treatment, or a substitute for professional medical care. Do not use the Site to make decisions about a medical condition, medication, treatment, or emergency. Consult a qualified healthcare professional regarding questions about your health. Call emergency services if you believe you have a medical emergency.</p>
          <p>Product discussions, research summaries, comparisons, and user or editorial opinions are not guarantees of outcome. Individual responses, tolerances, contraindications, and product suitability vary. Statements about dietary supplements have not been evaluated by the Food and Drug Administration unless expressly stated otherwise by the relevant product manufacturer.</p>

          <h2>2. Affiliate Relationship</h2>
          <p>PauseAndFlourish participates in the Amazon Services LLC Associates Program and may participate in other affiliate programs. We may earn a commission when you click a qualifying affiliate link and make a purchase, at no additional cost to you.</p>
          <p>Our editorial views are our own. However, you should independently evaluate any product, verify current product details and pricing at the retailer, and review the retailer’s terms and policies before purchasing.</p>

          <h2>3. No Warranty; Limitation of Liability</h2>
          <p>The Site is provided on an “as is” and “as available” basis to the maximum extent permitted by law. We do not warrant that content is complete, current, accurate, suitable for your circumstances, uninterrupted, or error-free. You use the Site and any linked third-party site at your own risk.</p>
          <p>To the maximum extent permitted by law, [LEGAL ENTITY NAME] and its owners, employees, contractors, and contributors will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss arising from use of or reliance on the Site, a product, a link, or third-party content. Nothing in these Terms excludes liability that cannot lawfully be excluded.</p>

          <h2>4. Intellectual Property</h2>
          <p>The Site’s original text, design, logos, graphics, compilations, and other content are owned by or licensed to PauseAndFlourish and are protected by applicable intellectual-property laws. You may use the Site for personal, non-commercial purposes. You may not reproduce, distribute, modify, create derivative works from, publicly display, or exploit Site content without prior written permission, except as permitted by law.</p>
          <p>Third-party names, brands, product images, and trademarks belong to their respective owners. Reference to a third-party product does not imply endorsement by that third party.</p>

          <h2>5. Acceptable Use</h2>
          <p>You may not misuse the Site, interfere with its operation, introduce malicious code, attempt unauthorized access, scrape or harvest data in violation of applicable law or the Site’s technical controls, impersonate another person, or use the Site in a way that infringes another party’s rights.</p>

          <h2>6. Third-Party Services and Links</h2>
          <p>The Site may link to Amazon, EmailOctopus, research databases, and other third parties. We do not control and are not responsible for their content, availability, products, policies, or practices. Your dealings with those third parties are governed by their own terms and privacy notices.</p>

          <h2>7. Changes; Suspension</h2>
          <p>We may modify, suspend, or discontinue all or part of the Site or these Terms at any time. Continued use after revised Terms are posted constitutes acceptance to the extent permitted by law.</p>

          <h2>8. Governing Law and Venue</h2>
          <p>These Terms are governed by the laws of <strong>[STATE]</strong>, without regard to conflict-of-law principles. Subject to applicable law, disputes will be resolved exclusively in the state or federal courts located in <strong>[COUNTY, STATE]</strong>.</p>

          <h2>9. Contact</h2>
          <p>Questions about these Terms may be sent to <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a>.</p>
        </div>
      </article>
    </SiteLayout>
  );
}
