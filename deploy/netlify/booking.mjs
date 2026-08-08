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

export default async (request) => {
  const env = process.env;
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!envOn(env, "PUBLIC_FEATURE_BOOKING")) {
    return Response.redirect(new URL("/book", request.url), 302);
  }

  const fields = await readFields(request);
  const outside = String(fields.scope || "") === "outside";

  const required = outside
    ? ["name", "email", "date", "guests", "region", "address", "city", "state", "zip"]
    : ["name", "email", "date", "guests", "package", "market", "address", "city", "state", "zip"];

  const missing = required.filter((key) => !String(fields[key] || "").trim());
  if (missing.length) {
    return new Response(`Missing: ${missing.join(", ")}`, { status: 400 });
  }

  const thanks = outside ? "/open?sent=1" : "/book?sent=1";
  return Response.redirect(new URL(thanks, request.url), 303);
};

export const config = { path: "/api/booking" };
