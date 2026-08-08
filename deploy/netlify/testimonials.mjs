import { authConfigured } from "../shared/auth.mjs";
import {
  countRecentPendingByEmail,
  createPending,
  dbConfigured,
  getSessionUser,
  json,
  listApproved,
} from "../shared/testimonials.mjs";

export default async (request) => {
  const env = process.env;

  if (request.method === "GET") {
    if (!dbConfigured(env)) {
      return json({ items: [] }, 200, { "cache-control": "public, max-age=30" });
    }
    try {
      const items = await listApproved(env);
      return json(
        {
          items: items.map(({ id, quote, name, role, image, imageAlt }) => ({
            id,
            quote,
            name,
            role,
            image,
            imageAlt,
          })),
        },
        200,
        { "cache-control": "public, max-age=30" },
      );
    } catch (error) {
      console.error("testimonials list", error);
      return json({ items: [], error: "list_failed" }, 200);
    }
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  if (!authConfigured(env) || !dbConfigured(env)) {
    return json({ ok: false, error: "accounts_not_configured" }, 503);
  }

  const user = await getSessionUser(env, request);
  if (!user) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const quote = String(body.quote || "").trim();
  const name = String(body.name || user.name || "").trim();
  const role = String(body.role || "").trim();

  if (quote.length < 12 || quote.length > 600) {
    return json({ ok: false, error: "invalid_quote" }, 400);
  }
  if (!name || name.length > 80) {
    return json({ ok: false, error: "invalid_name" }, 400);
  }
  if (role.length > 120) {
    return json({ ok: false, error: "invalid_role" }, 400);
  }

  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recent = await countRecentPendingByEmail(env, user.email, since);
    if (recent >= 3) {
      return json({ ok: false, error: "rate_limited" }, 429);
    }

    const created = await createPending(env, {
      quote,
      name,
      role,
      authorEmail: user.email,
      authorId: user.id,
    });
    return json({ ok: true, id: created.id, status: "pending" }, 201);
  } catch (error) {
    console.error("testimonials create", error);
    return json({ ok: false, error: "create_failed" }, 500);
  }
};

export const config = { path: "/api/testimonials" };
