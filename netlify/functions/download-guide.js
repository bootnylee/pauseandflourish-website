/**
 * PauseAndFlourish — Lead Magnet Download Function
 * ==================================================
 * Netlify Function: GET /.netlify/functions/download-guide?stage={slug}
 *
 * Returns a redirect to the stage-specific PDF guide stored in /public/guides/.
 * The PDF files are committed to the repo and served as static assets by Netlify.
 *
 * Valid stage slugs:
 *   early-perimenopause | late-perimenopause | active-menopause |
 *   early-postmenopause | late-postmenopause
 *
 * The function validates the stage parameter before redirecting to prevent
 * open-redirect abuse.
 */

const VALID_STAGES = new Set([
  "early-perimenopause",
  "late-perimenopause",
  "active-menopause",
  "early-postmenopause",
  "late-postmenopause",
]);

exports.handler = async function (event) {
  const stage = (event.queryStringParameters?.stage || "").toLowerCase().trim();

  if (!VALID_STAGES.has(stage)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid or missing stage parameter." }),
    };
  }

  // Redirect to the static PDF asset
  const pdfUrl = `/guides/paf-guide-${stage}.pdf`;

  return {
    statusCode: 302,
    headers: {
      Location: pdfUrl,
      "Cache-Control": "no-store",
    },
    body: "",
  };
};
