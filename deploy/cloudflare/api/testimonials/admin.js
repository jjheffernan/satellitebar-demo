import { authConfigured } from "../../../shared/auth.mjs";
import {
  dbConfigured,
  getSessionUser,
  isAdminEmail,
  json,
  listPending,
  listRecentReviewed,
  reviewTestimonial,
} from "../../../shared/testimonials.mjs";

async function requireAdmin(env, request) {
  if (!authConfigured(env) || !dbConfigured(env)) {
    return { error: json({ ok: false, error: "accounts_not_configured" }, 503) };
  }
  const user = await getSessionUser(env, request);
  if (!user) {
    return { error: json({ ok: false, error: "unauthorized" }, 401) };
  }
  if (!isAdminEmail(env, user.email)) {
    return { error: json({ ok: false, error: "forbidden" }, 403) };
  }
  return { user };
}

export async function onRequestGet(context) {
  const env = context.env ?? {};
  const gate = await requireAdmin(env, context.request);
  if (gate.error) return gate.error;

  try {
    const [pending, recent] = await Promise.all([
      listPending(env),
      listRecentReviewed(env, 20),
    ]);
    return json({ ok: true, pending, recent });
  } catch (error) {
    console.error("testimonials admin list", error);
    return json({ ok: false, error: "list_failed" }, 500);
  }
}

export async function onRequestPost(context) {
  const env = context.env ?? {};
  const gate = await requireAdmin(env, context.request);
  if (gate.error) return gate.error;

  let body = {};
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const id = String(body.id || "").trim();
  const action = String(body.action || "").trim();
  if (!id || (action !== "approve" && action !== "reject")) {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  try {
    const result = await reviewTestimonial(env, id, action);
    if (!result.ok) {
      return json(result, 404);
    }
    return json(result);
  } catch (error) {
    console.error("testimonials admin review", error);
    return json({ ok: false, error: "review_failed" }, 500);
  }
}
