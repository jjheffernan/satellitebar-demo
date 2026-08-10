import { authConfigured } from "../shared/auth.mjs";
import {
  dbConfigured,
  deleteEvent,
  getSessionUser,
  isAdminEmail,
  json,
  listEvents,
  replaceAllEvents,
  upsertEvent,
} from "../shared/calendar.mjs";

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

export default async (request) => {
  const env = process.env;
  const gate = await requireAdmin(env, request);
  if (gate.error) return gate.error;

  if (request.method === "GET") {
    try {
      const events = await listEvents(env);
      return json({ ok: true, events });
    } catch (error) {
      console.error("calendar admin list", error);
      return json({ ok: false, error: "list_failed" }, 500);
    }
  }

  if (request.method === "POST") {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    try {
      if (Array.isArray(body.events)) {
        const result = await replaceAllEvents(env, body.events);
        return json(result);
      }
      const result = await upsertEvent(env, body);
      if (!result.ok) return json(result, 400);
      return json(result, 201);
    } catch (error) {
      console.error("calendar admin save", error);
      return json({ ok: false, error: "save_failed" }, 500);
    }
  }

  if (request.method === "PUT") {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400);
    }
    if (!String(body.id || "").trim()) {
      return json({ ok: false, error: "missing_id" }, 400);
    }
    try {
      const result = await upsertEvent(env, body);
      if (!result.ok) return json(result, 400);
      return json(result);
    } catch (error) {
      console.error("calendar admin update", error);
      return json({ ok: false, error: "update_failed" }, 500);
    }
  }

  if (request.method === "DELETE") {
    const url = new URL(request.url);
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) return json({ ok: false, error: "missing_id" }, 400);
    try {
      const result = await deleteEvent(env, id);
      if (!result.ok) return json(result, 404);
      return json(result);
    } catch (error) {
      console.error("calendar admin delete", error);
      return json({ ok: false, error: "delete_failed" }, 500);
    }
  }

  return json({ ok: false, error: "method_not_allowed" }, 405);
};

export const config = { path: "/api/calendar/admin" };
