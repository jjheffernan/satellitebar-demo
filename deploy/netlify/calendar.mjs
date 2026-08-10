import {
  dbConfigured,
  json,
  listPublicEvents,
} from "../shared/calendar.mjs";

export default async (request) => {
  if (request.method !== "GET") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const env = process.env;
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
};

export const config = { path: "/api/calendar" };
