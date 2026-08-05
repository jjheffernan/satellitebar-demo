function envOn(env, key) {
  const value = env?.[key];
  return Boolean(value && String(value).trim() && value !== "0" && value !== "false");
}

async function readFields(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function onRequestPost(context) {
  const env = context.env ?? {};
  if (!envOn(env, "PUBLIC_FEATURE_BOOKING")) {
    return Response.redirect(new URL("/book", context.request.url), 302);
  }

  const fields = await readFields(context.request);
  const required = ["name", "email", "date", "guests", "package", "market", "address", "city", "state", "zip"];
  const missing = required.filter((key) => !String(fields[key] || "").trim());
  if (missing.length) {
    return new Response(`Missing: ${missing.join(", ")}`, { status: 400 });
  }

  // Queue / CRM adapter lands here. Acknowledge with a static thanks page redirect for now.
  return Response.redirect(new URL("/book?sent=1", context.request.url), 303);
}
