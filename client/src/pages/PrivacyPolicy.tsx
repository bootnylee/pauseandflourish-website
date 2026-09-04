import { useEffect } from "react";
import SiteLayout from "@/components/SiteLayout";
import { updateDocumentMeta, buildBreadcrumbSchema, injectStructuredData } from "@/lib/seo";

const EFFECTIVE_DATE = "August 26, 2026";

export default function PrivacyPolicy() {
  useEffect(() => {
    updateDocumentMeta({
      title: "Privacy Policy | PauseAndFlourish",
      description: "How PauseAndFlourish collects, uses, and protects information.",
      canonical: "https://pauseandflourish.com/privacy",
      ogType: "website",
    });
    injectStructuredData(
      buildBreadcrumbSchema([
        { name: "Home", url: "https://pauseandflourish.com/" },
        { name: "Privacy Policy", url: "https://pauseandflourish.com/privacy" },
      ]),
      "breadcrumb-schema"
    );
  }, []);

  return (
    <SiteLayout>
      <article className="container max-w-4xl mx-auto py-12 md:py-16">
        <p className="section-label mb-3">Legal</p>
        <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "#2C2C2C" }}>Privacy Policy</h1>
        <p className="font-body text-sm mt-4" style={{ color: "#6C6C6C" }}>Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose max-w-none mt-10 font-body" style={{ color: "#2C2C2C" }}>
          <p>PauseAndFlourish (“<strong>PauseAndFlourish</strong>,” “<strong>we</strong>,” “<strong>us</strong>,” or “<strong>our</strong>”) operates <a href="https://pauseandflourish.com">https://pauseandflourish.com</a> (the “<strong>Site</strong>”). This Privacy Policy explains how we collect, use, disclose, and protect information when you visit the Site, subscribe to updates, complete the menopause-stage quiz, or interact with our content.</p>
          <p><strong>Controller / business identity:</strong><br />Brightpath Digital Media, LLC<br />506 S Spring St #13308<br />SMB#21914<br />Los Angeles, CA, 90013</p>
          <p><strong>Contact:</strong> <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a></p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us. This may include your email address; your first name if you provide it; and, when you use the menopause-stage quiz or request a stage-specific guide, the menopause stage or quiz result you submit or select. We use this information to send the updates, guides, or other communications you request and to tailor the stage-related materials you choose to receive.</p>
          <p>We also collect or receive limited technical and usage information. Depending on your browser settings and the services enabled on the Site, this may include device, browser, approximate location inferred from IP address, referral or UTM information, page-view and interaction information, and events such as affiliate-link clicks, quiz-email capture, and guide-download activity. The Site uses Google Analytics 4 when analytics is enabled in the deployed configuration.</p>
          <p>The Site uses browser local storage for functional purposes. Current application code uses local storage to retain a quiz-stage result, whether an email was captured for a guide, and a limited recently viewed-review list. Local storage is stored in your browser and can generally be cleared through browser settings. The Site may also receive technical request and security logs from its hosting provider, Netlify.</p>

          <h2>2. How We Use Information</h2>
          <p>We use information to operate and secure the Site; respond to you; deliver the newsletter, requested guide, or stage-specific communications; maintain subscription preferences; measure and improve Site performance and content; understand aggregated usage; attribute affiliate-link performance; prevent fraud or abuse; and comply with legal obligations.</p>
          <p>We do not use the menopause-stage field to make medical decisions, diagnose a condition, or provide individualized medical care. It is used only to segment the communications and guide materials you request.</p>

          <h2>3. Service Providers and Disclosures</h2>
          <p>We disclose information to service providers that process it on our behalf and under their instructions. These include:</p>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Recipient</th><th>Information / function</th></tr></thead>
              <tbody>
                <tr><td><strong>EmailOctopus</strong></td><td>Email address, optional first name, and MenopauseStage custom field used to store the subscription and send requested email communications.</td></tr>
                <tr><td><strong>Google Analytics 4</strong></td><td>Technical and interaction data used for measurement, including page views and configured events.</td></tr>
                <tr><td><strong>Netlify</strong></td><td>Website hosting, delivery, serverless subscription-function operations, and associated technical and security processing.</td></tr>
                <tr><td><strong>Amazon and other destination sites</strong></td><td>When you click an affiliate or external link, the destination receives information under its own privacy policy.</td></tr>
              </tbody>
            </table>
          </div>
          <p>We may also disclose information when required by law, to protect rights, safety, and security, or in connection with a corporate transaction. We do not sell personal information for money. We do not knowingly share personal information for cross-context behavioral advertising beyond the processing described above; if that practice changes, we will provide the required notices and opt-out choices before it occurs.</p>

          <h2>4. Cookies, Local Storage, Analytics, and Choices</h2>
          <p>Google Analytics and similar technologies may use cookies or comparable identifiers to measure Site use. Local storage is used for the functional settings described above. You can manage cookies and local storage in your browser. Where required by applicable law, we will provide a consent or preference mechanism before setting non-essential analytics technologies.</p>
          <p>You may opt out of marketing emails at any time by using the unsubscribe link in the message or by contacting <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a>. Disabling functional storage may affect quiz continuity, guide-delivery flow, or recently viewed content. For Google Analytics, you may use Google’s available opt-out tools and browser controls.</p>

          <h2>5. Retention</h2>
          <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including maintaining your subscription, honoring your choices, resolving disputes, enforcing agreements, and meeting legal obligations. EmailOctopus retention and deletion are administered through our email-list management process. Technical and analytics retention are subject to the settings and policies of the relevant provider.</p>

          <h2>6. Your Privacy Rights</h2>
          <p>Depending on where you live, you may have rights to request access to, correction of, deletion of, portability of, or restriction of processing of your personal information; to object to certain processing; and to withdraw consent where processing is based on consent. To exercise a right, email <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a> with the subject line <strong>Privacy Request</strong> and describe your request. We may need to verify your identity before responding.</p>
          <h3>California Privacy Rights — CCPA/CPRA</h3>
          <p>If you are a California resident and the CCPA/CPRA applies to our processing, you may have the right to know, delete, correct, opt out of sale or sharing, limit certain sensitive-information uses, and receive non-discriminatory treatment for exercising your rights. We do not sell personal information for money. If we begin a practice that constitutes a sale or sharing under applicable law, we will provide the required notice and opt-out mechanism, including recognition of applicable opt-out preference signals where required.</p>
          <h3>European Economic Area, United Kingdom, and Switzerland — GDPR</h3>
          <p>If the GDPR or analogous law applies, we process information to provide requested services, based on consent where required, to pursue legitimate interests in operating, securing, and improving the Site, and to meet legal obligations. You may have rights of access, rectification, erasure, restriction, objection, portability, and withdrawal of consent. You may also have the right to complain to your local data-protection authority.</p>
          <p>Because our service providers may process data in the United States or other countries, information may be transferred outside your country. We will use appropriate safeguards when required by law. <strong>[Confirm cross-border transfer mechanism and lead supervisory authority, if applicable.]</strong></p>

          <h2>7. Children’s Privacy</h2>
          <p>The Site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided personal information, contact <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a> so that we can take appropriate steps to delete it.</p>

          <h2>8. Security</h2>
          <p>We use reasonable administrative, technical, and organizational measures designed to protect information. No online system is perfectly secure; please do not send sensitive medical, financial, or other highly sensitive information to us through Site forms or email.</p>

          <h2>9. Third-Party Links and Affiliate Relationships</h2>
          <p>The Site contains links to third-party sites, including Amazon. Those sites have their own privacy practices and terms. When you follow an affiliate link, the third party may collect information directly from you and may set or recognize cookies under its own policies. We are not responsible for third-party privacy practices.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this Policy from time to time. We will post the revised version with an updated effective date. Material changes will be handled as required by applicable law.</p>

          <h2>11. Contact</h2>
          <p>For questions or requests about this Policy, contact <a href="mailto:hello@pauseandflourish.com">hello@pauseandflourish.com</a>.</p>
        </div>
      </article>
    </SiteLayout>
  );
}
