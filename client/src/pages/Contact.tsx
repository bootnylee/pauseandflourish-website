import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";

export default function Contact() {
  useEffect(() => {
    updateDocumentMeta({
      title: "Contact | PauseAndFlourish",
      description: "Contact PauseAndFlourish with feedback, corrections, privacy requests, and general questions.",
      canonical: "https://pauseandflourish.com/contact",
      ogType: "website",
    });
    injectStructuredData(
      buildBreadcrumbSchema([
        { name: "Home", url: "https://pauseandflourish.com/" },
        { name: "Contact", url: "https://pauseandflourish.com/contact" },
      ]),
      "breadcrumb-schema"
    );
  }, []);

  return (
    <SiteLayout>
      <article className="container max-w-4xl mx-auto py-12 md:py-16">
        <p className="section-label mb-3">Contact</p>
        <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "#2C2C2C" }}>Contact PauseAndFlourish</h1>
        <div className="prose max-w-none mt-10 font-body" style={{ color: "#2C2C2C" }}>
          <p>PauseAndFlourish welcomes corrections, feedback, source suggestions, and general questions about the Site.</p>
          <p><strong>Email:</strong> <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a></p>
          <p>For corrections or feedback about a review, comparison, research summary, product listing, or link, please include the page URL, the specific text or issue, and any supporting source you would like us to consider. We review good-faith requests but cannot provide individualized medical advice, product recommendations, or customer service for third-party retailers.</p>
          <p><strong>Operator:</strong> [LEGAL ENTITY NAME + ADDRESS]</p>
          <p>If your message concerns privacy, use the subject line <strong>Privacy Request</strong>. If it concerns an accessibility issue, use the subject line <strong>Accessibility</strong>.</p>
        </div>
      </article>
    </SiteLayout>
  );
}
