import { authConfigured } from "../../../../shared/auth.mjs";
import {
  dbConfigured,
  getSessionUser,
  isAdminEmail,
  json,
  replaceAllEvents,
} from "../../../../shared/calendar.mjs";

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

export async function onRequestPost(context) {
  const env = context.env ?? {};
  const gate = await requireAdmin(env, context.request);
  if (gate.error) return gate.error;

  const contentType = context.request.headers.get("content-type") || "";

  try {
    if (contentType.includes("text/calendar") || contentType.includes("text/plain")) {
      // Client should parse .ics and POST JSON; text body accepted as opaque no-op hint
      return json({ ok: false, error: "use_json_events" }, 400);
    }

    const body = await context.request.json();
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
}
