import {
  dbConfigured,
  json,
  listPublicEvents,
} from "../../shared/calendar.mjs";

export async function onRequestGet(context) {
  const env = context.env ?? {};
  if (!dbConfigured(env)) {
    return json({ events: [] }, 200, { "cache-control": "public, max-age=30" });
  }
  try {
    const events = await listPublicEvents(env);
    return json({ events }, 200, { "cache-control": "public, max-age=30" });
  } catch (error) {
    console.error("calendar list", error);
    return json({ events: [], error: "list_failed" }, 200);
  }
}
