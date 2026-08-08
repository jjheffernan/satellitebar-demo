import { authConfigured, createAuth, notConfiguredResponse } from "../../../shared/auth.mjs";

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export async function onRequest(context) {
  const env = context.env ?? {};
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (!authConfigured(env)) {
    return notConfiguredResponse(env);
  }

  try {
    const auth = createAuth(env);
    const response = await auth.handler(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(request))) {
      if (!headers.has(key)) headers.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("auth handler error", error);
    return new Response(
      JSON.stringify({
        error: "auth_handler_failed",
        message: "Auth request failed. Confirm DB schema (Better Auth migrate) and secrets.",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }
}
