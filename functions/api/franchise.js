function envOn(env, key) {
  const value = env?.[key];
  return Boolean(value && String(value).trim() && value !== "0" && value !== "false");
}

export async function onRequestPost(context) {
  const env = context.env ?? {};
  if (!envOn(env, "PUBLIC_FEATURE_FRANCHISE")) {
    return new Response("Franchise module off", { status: 404 });
  }

  const form = await context.request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const market = String(form.get("market") || "").trim();
  if (!name || !email || !market) {
    return new Response("Missing required fields", { status: 400 });
  }

  return Response.redirect(new URL("/open?sent=1", context.request.url), 303);
}
