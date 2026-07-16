/**
 * PauseAndFlourish — EmailOctopus Subscribe Function
 * ====================================================
 * Netlify Function: POST /.netlify/functions/subscribe
 *
 * Proxies email subscription to the EmailOctopus REST API v2 so the API key
 * never touches the browser. Sets the MenopauseStage custom field for
 * segmented welcome automation.
 *
 * API v2 docs: https://emailoctopus.com/api-documentation/v2
 * Base URL: https://api.emailoctopus.com
 * Auth: Authorization: Bearer {EMAILOCTOPUS_API_KEY} header — key never in body.
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * Set these two environment variables in Netlify:
 *   EMAILOCTOPUS_API_KEY   — v2 API key (not a legacy key)
 *   EMAILOCTOPUS_LIST_ID   — UUID from emailoctopus.com/lists/{id}
 *
 * ── Request body (JSON) ──────────────────────────────────────────────────────
 * {
 *   "email":     "user@example.com",
 *   "firstName": "Jane",               // optional
 *   "stage":     "Early Perimenopause" // required — stored in MenopauseStage field
 * }
 *
 * ── Response ─────────────────────────────────────────────────────────────────
 * 200  { "status": "success" }
 * 200  { "status": "already_subscribed" }   (contact existed; field updated)
 * 400  { "status": "error", "message": "<EO error type slug>" }
 * 503  { "status": "error", "message": "EmailOctopus not configured" }
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://pauseandflourish.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const EO_BASE = "https://api.emailoctopus.com";

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
    console.error("[subscribe] EMAILOCTOPUS_API_KEY or EMAILOCTOPUS_LIST_ID not set");
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

  const normalizedEmail = email.trim().toLowerCase();
  const authHeader = { "Authorization": `Bearer ${API_KEY}` };

  // ── Call EmailOctopus API v2 — create contact ─────────────────────────────
  // POST /lists/{list_id}/contacts
  // Auth: Bearer token in header — API key is never placed in the request body.
  let eoResponse;
  try {
    eoResponse = await fetch(
      `${EO_BASE}/lists/${LIST_ID}/contacts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          email_address: normalizedEmail,
          fields: {
            FirstName: (firstName || "").trim(),
            MenopauseStage: stage.trim(),
          },
          status: "subscribed",
        }),
      }
    );
  } catch (networkErr) {
    console.error("[subscribe] Network error calling EmailOctopus:", networkErr.message);
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

  // ── 2xx → success ─────────────────────────────────────────────────────────
  if (eoResponse.ok) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "success" }),
    };
  }

  // ── 409 already-exists → update MenopauseStage field, then return success ─
  // v2 already-exists: HTTP 409, type URL contains "already-exists"
  const isAlreadyExists =
    eoResponse.status === 409 &&
    typeof eoData?.type === "string" &&
    eoData.type.includes("already-exists");

  if (isAlreadyExists) {
    // Best-effort PUT to update the MenopauseStage field for the existing contact.
    // The v2 update-contact endpoint uses the contact's MD5-hashed email as the ID.
    // We use the email address directly as the identifier (v2 accepts email or MD5).
    try {
      const contactId = encodeURIComponent(normalizedEmail);
      await fetch(
        `${EO_BASE}/lists/${LIST_ID}/contacts/${contactId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            fields: {
              FirstName: (firstName || "").trim() || undefined,
              MenopauseStage: stage.trim(),
            },
          }),
        }
      );
    } catch { /* non-fatal: field update failure does not block the response */ }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "already_subscribed" }),
    };
  }

  // ── All other non-2xx → surface EO error type, never log key or list ID ───
  const errorSlug =
    (typeof eoData?.type === "string"
      ? eoData.type.split("/").pop()
      : null) ||
    String(eoResponse.status);
  console.error("[subscribe] EmailOctopus error status:", eoResponse.status, "type:", errorSlug);
  return {
    statusCode: eoResponse.status >= 400 && eoResponse.status < 500 ? 400 : 502,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: "error",
      message: errorSlug,
    }),
  };
};
