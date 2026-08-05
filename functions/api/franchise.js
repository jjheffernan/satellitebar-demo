export async function onRequestPost(context) {
  const form = await context.request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const market = String(form.get("market") || "").trim();
  if (!name || !email || !market) {
    return new Response("Missing required fields", { status: 400 });
  }

  return Response.redirect(new URL("/open?sent=1", context.request.url), 303);
}
