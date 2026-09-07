/**
 * PauseAndFlourish — Klaviyo Subscribe Function
 * ===============================================
 * Netlify Function: POST /.netlify/functions/subscribe
 *
 * Proxies an email subscription to Klaviyo so the private API key never touches
 * the browser. It upserts FirstName and MenopauseStage profile properties for
 * the segmented welcome automation, then records email marketing consent.
 *
 * EmailOctopus environment handling remains below for the approved rollback path.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://pauseandflourish.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const KLAVIYO_API_BASE = "https://a.klaviyo.com/api";
const KLAVIYO_REVISION = "2026-07-15";
const KLAVIYO_LIST_ID = "XUexbv";

// Retained for the EmailOctopus rollback path. Do not remove these environment
// variable reads without an approved rollback-plan change.
const EMAILOCTOPUS_API_KEY = process.env.EMAILOCTOPUS_API_KEY;
const EMAILOCTOPUS_LIST_ID = process.env.EMAILOCTOPUS_LIST_ID;
const EMAILOCTOPUS_API_BASE = "https://api.emailoctopus.com";

function klaviyoHeaders(apiKey) {
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: KLAVIYO_REVISION,
  };
}

async function responseData(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function errorMessage(response, data) {
  return (
    (typeof data?.errors?.[0]?.code === "string" && data.errors[0].code) ||
    (typeof data?.errors?.[0]?.title === "string" && data.errors[0].title) ||
    String(response.status)
  );
}

function serviceFailure(response, data) {
  const message = errorMessage(response, data);
  console.error("[subscribe] Klaviyo error status:", response.status, "code:", message);
  return {
    statusCode: response.status >= 400 && response.status < 500 ? 400 : 502,
    headers: CORS_HEADERS,
    body: JSON.stringify({ status: "error", message }),
  };
}

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

  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] KLAVIYO_API_KEY is not configured");
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Email service is not configured." }),
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFirstName = (firstName || "").trim();
  const normalizedStage = stage.trim();

  // Klaviyo requires profile properties and consent to be set through separate
  // API operations. The profile-import endpoint is a synchronous upsert and
  // therefore supports both new and already-subscribed profiles.
  let profileResponse;
  try {
    profileResponse = await fetch(`${KLAVIYO_API_BASE}/profile-import`, {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email: normalizedEmail,
            ...(normalizedFirstName ? { first_name: normalizedFirstName } : {}),
            properties: { MenopauseStage: normalizedStage },
          },
        },
      }),
    });
  } catch (networkErr) {
    console.error("[subscribe] Network error calling Klaviyo profile API:", networkErr.message);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Could not reach email service. Please try again." }),
    };
  }

  if (!profileResponse.ok) {
    return serviceFailure(profileResponse, await responseData(profileResponse));
  }

  let subscriptionResponse;
  try {
    subscriptionResponse = await fetch(`${KLAVIYO_API_BASE}/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: normalizedEmail,
                    subscriptions: {
                      email: {
                        marketing: { consent: "SUBSCRIBED" },
                      },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: { type: "list", id: KLAVIYO_LIST_ID },
            },
          },
        },
      }),
    });
  } catch (networkErr) {
    console.error("[subscribe] Network error calling Klaviyo subscription API:", networkErr.message);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "error", message: "Could not reach email service. Please try again." }),
    };
  }

  if (subscriptionResponse.ok) {
    // Consume the upstream acknowledgement before the serverless invocation
    // resolves so Netlify serializes the existing client-facing JSON body.
    try {
      await subscriptionResponse.arrayBuffer();
    } catch {
      // A successful subscription remains successful if an empty upstream body
      // cannot be read.
    }
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, status: "success" }),
    };
  }

  return serviceFailure(subscriptionResponse, await responseData(subscriptionResponse));
};
