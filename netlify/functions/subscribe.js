/**
 * PauseAndFlourish — EmailOctopus Subscribe Function
 * ====================================================
 * Netlify Function: POST /.netlify/functions/subscribe
 *
 * Proxies email subscription to the EmailOctopus REST API so the API key
 * never touches the browser. Sets the MenopauseStage custom field for
 * segmented welcome automation.
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * Set these two environment variables in Netlify:
 *   EMAILOCTOPUS_API_KEY   — from dashboard.emailoctopus.com/api
 *   EMAILOCTOPUS_LIST_ID   — UUID from dashboard.emailoctopus.com/lists/{id}
 *
 * If either variable is missing, the function falls back gracefully and
 * returns a 503 with a clear error message.
 *
 * ── Request body (JSON) ──────────────────────────────────────────────────────
 * {
 *   "email":     "user@example.com",
 *   "firstName": "Jane",              // optional
 *   "stage":     "Early Perimenopause" // required — stored in MenopauseStage field
 * }
 *
 * ── Response ─────────────────────────────────────────────────────────────────
 * 200  { "status": "success" }
 * 409  { "status": "already_subscribed" }
 * 4xx  { "status": "error", "message": "..." }
 * 503  { "status": "error", "message": "EmailOctopus not configured" }
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://pauseandflourish.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Method not allowed" }),
    };
  }

  // ── Read config from environment ─────────────────────────────────────────
  const API_KEY = process.env.EMAILOCTOPUS_API_KEY;
  const LIST_ID = process.env.EMAILOCTOPUS_LIST_ID;

  if (!API_KEY || !LIST_ID) {
    console.warn("[subscribe] EMAILOCTOPUS_API_KEY or EMAILOCTOPUS_LIST_ID not set");
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: "error",
        message: "EmailOctopus is not configured. Set EMAILOCTOPUS_API_KEY and EMAILOCTOPUS_LIST_ID in Netlify environment variables.",
      }),
    };
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Invalid JSON body" }),
    };
  }

  const { email, firstName, stage } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "A valid email address is required." }),
    };
  }

  if (!stage || typeof stage !== "string") {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Stage is required." }),
    };
  }

  // ── Call EmailOctopus REST API ────────────────────────────────────────────
  // Docs: https://emailoctopus.com/api-documentation
  const payload = {
    api_key: API_KEY,
    email_address: email.trim().toLowerCase(),
    fields: {
      FirstName: (firstName || "").trim(),
      MenopauseStage: stage.trim(),
    },
    status: "SUBSCRIBED",
  };

  let eoResponse;
  try {
    eoResponse = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  } catch (networkErr) {
    console.error("[subscribe] Network error calling EmailOctopus:", networkErr);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Could not reach EmailOctopus. Please try again." }),
    };
  }

  let eoData;
  try {
    eoData = await eoResponse.json();
  } catch {
    eoData = {};
  }

  // ── Handle EmailOctopus response ──────────────────────────────────────────
  if (eoResponse.ok) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "success" }),
    };
  }

  const errorCode = eoData?.error?.code || "";

  if (
    errorCode === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS" ||
    eoResponse.status === 409
  ) {
    // Contact already exists — update their MenopauseStage field
    // (best-effort PATCH; ignore failures)
    try {
      const contactId = encodeURIComponent(email.trim().toLowerCase());
      await fetch(
        `https://emailoctopus.com/api/1.6/lists/${LIST_ID}/contacts/${contactId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: API_KEY,
            fields: {
              FirstName: (firstName || "").trim() || undefined,
              MenopauseStage: stage.trim(),
            },
          }),
        }
      );
    } catch {}

    return {
      statusCode: 409,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "already_subscribed" }),
    };
  }

  console.error("[subscribe] EmailOctopus error:", eoData);
  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: "error",
      message: eoData?.error?.message || "Subscription failed. Please try again.",
    }),
  };
};
