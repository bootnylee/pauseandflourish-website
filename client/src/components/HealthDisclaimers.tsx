export const MEDICAL_DISCLAIMER =
  "Content is for informational and educational purposes only and is not a substitute for professional medical advice. PauseAndFlourish does not endorse any specific treatment, supplement, or medical intervention. Individual responses, risks, and contraindications vary. Consult a qualified healthcare professional before making changes to your health regimen; seek prompt medical assessment for new, severe, or persistent symptoms.";

export const DSHEA_DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

function DisclaimerPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className="mt-8 rounded-sm border p-5 font-body text-sm leading-relaxed"
      style={{ backgroundColor: "#F0FAF8", borderColor: "#D4EBE7", color: "#4A5E5A" }}
    >
      <p>
        <strong>{title}:</strong> {children}
      </p>
    </section>
  );
}

export function MedicalDisclaimer() {
  return <DisclaimerPanel title="Medical Disclaimer">{MEDICAL_DISCLAIMER}</DisclaimerPanel>;
}

export function DsheaDisclaimer() {
  return <DisclaimerPanel title="Dietary Supplement Disclaimer">{DSHEA_DISCLAIMER}</DisclaimerPanel>;
}

export function HealthDisclaimers({ showDshea }: { showDshea: boolean }) {
  return (
    <div className="mt-10">
      <MedicalDisclaimer />
      {showDshea ? <DsheaDisclaimer /> : null}
    </div>
  );
}
