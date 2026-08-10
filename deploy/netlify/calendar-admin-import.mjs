import { authConfigured } from "../shared/auth.mjs";
import {
  dbConfigured,
  getSessionUser,
  isAdminEmail,
  json,
  replaceAllEvents,
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
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const env = process.env;
  const gate = await requireAdmin(env, request);
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const events = Array.isArray(body.events) ? body.events : null;
    if (!events) {
      return json({ ok: false, error: "invalid_body" }, 400);
    }
    const result = await replaceAllEvents(env, events);
    return json(result);
  } catch (error) {
    console.error("calendar admin import", error);
    return json({ ok: false, error: "import_failed" }, 500);
  }
};

export const config = { path: "/api/calendar/admin/import" };
