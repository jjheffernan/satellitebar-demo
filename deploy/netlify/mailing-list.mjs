function envOn(env, key) {
  const value = env?.[key];
  return Boolean(value && String(value).trim() && value !== "0" && value !== "false");
}

export default async (request) => {
  const env = process.env;
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!envOn(env, "PUBLIC_FEATURE_MAILING_LIST")) {
    return new Response(JSON.stringify({ ok: false, error: "mailing-list-off" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (!env.MAILING_LIST_API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: "missing-secret" }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  let email = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = String(body.email || "").trim();
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "").trim();
  }

  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ ok: false, error: "invalid-email" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};

export const config = { path: "/api/mailing-list" };
