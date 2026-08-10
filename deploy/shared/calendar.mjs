import { createClient } from "@libsql/client";
import { authConfigured, createAuth } from "./auth.mjs";
import calendarSeed from "../../src/data/calendar.json";

function envVal(env, key) {
  const value = env?.[key];
  if (value == null) return "";
  return String(value).trim();
}

export function dbConfigured(env = {}) {
  return Boolean(envVal(env, "AUTH_DATABASE_URL"));
}

export function getDb(env = {}) {
  return createClient({
    url: envVal(env, "AUTH_DATABASE_URL"),
    authToken: envVal(env, "AUTH_DATABASE_AUTH_TOKEN") || undefined,
  });
}

export async function ensureCalendarTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS calendar_event (
      id TEXT PRIMARY KEY NOT NULL,
      text TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      place TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      allDay INTEGER NOT NULL DEFAULT 1,
      images TEXT,
      imageAlt TEXT NOT NULL DEFAULT '',
      updatedAt TEXT NOT NULL
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_calendar_event_start ON calendar_event (start)`,
  );
}

/** Date-only JSON seed → all-day ISO range (local calendar day). */
export function seedJsonToEvents(seed = calendarSeed) {
  const items = Array.isArray(seed?.events) ? seed.events : [];
  return items.map((item) => {
    const date = String(item.date || "").slice(0, 10);
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    return {
      id: String(item.id),
      text: String(item.title || "Event"),
      description: String(item.summary || ""),
      place: String(item.place || ""),
      href: String(item.href || "/calendar"),
      start,
      end,
      allDay: true,
      images: Array.isArray(item.images) ? item.images : [],
      imageAlt: String(item.imageAlt || ""),
      updatedAt: new Date().toISOString(),
    };
  });
}

function parseImages(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowToAdmin(row) {
  return {
    id: row.id,
    text: row.text,
    description: row.description || "",
    place: row.place || "",
    href: row.href || "",
    start: row.start,
    end: row.end,
    allDay: Boolean(row.allDay),
    images: parseImages(row.images),
    imageAlt: row.imageAlt || "",
    updatedAt: row.updatedAt,
  };
}

/** Public month/list shape (matches calendar.json items). */
export function rowToPublic(row) {
  const start = String(row.start || "");
  const date = start.slice(0, 10);
  return {
    id: row.id,
    title: row.text,
    date,
    place: row.place || "",
    href: row.href || "/calendar",
    summary: row.description || "",
    imageAlt: row.imageAlt || "",
    images: parseImages(row.images),
  };
}

function normalizeEvent(input = {}) {
  const id = String(input.id || "").trim() || `evt-${crypto.randomUUID()}`;
  const text = String(input.text || input.title || "").trim();
  if (!text) return null;

  let start = input.start;
  let end = input.end;
  const allDay = input.allDay === true || input.allDay === 1 || input.allDay === "1";

  if (!start && input.date) {
    const date = String(input.date).slice(0, 10);
    start = `${date}T00:00:00.000Z`;
    end = end || `${date}T23:59:59.999Z`;
  }

  start = start instanceof Date ? start.toISOString() : String(start || "").trim();
  end = end instanceof Date ? end.toISOString() : String(end || start).trim();
  if (!start) return null;

  const images = Array.isArray(input.images)
    ? input.images.map(String)
    : parseImages(input.images);

  return {
    id,
    text,
    description: String(input.description || input.summary || "").trim(),
    place: String(input.place || "").trim(),
    href: String(input.href || "/calendar").trim() || "/calendar",
    start,
    end: end || start,
    allDay: allDay || Boolean(input.date),
    images,
    imageAlt: String(input.imageAlt || "").trim(),
    updatedAt: new Date().toISOString(),
  };
}

export async function seedIfEmpty(env) {
  const db = getDb(env);
  await ensureCalendarTable(db);
  const count = await db.execute(`SELECT COUNT(*) AS c FROM calendar_event`);
  if (Number(count.rows[0]?.c ?? 0) > 0) return { seeded: false };

  const events = seedJsonToEvents();
  for (const event of events) {
    await upsertEvent(env, event, { skipNormalize: true });
  }
  return { seeded: true, count: events.length };
}

export async function listEvents(env) {
  const db = getDb(env);
  await ensureCalendarTable(db);
  await seedIfEmpty(env);
  const result = await db.execute({
    sql: `SELECT * FROM calendar_event ORDER BY start ASC`,
    args: [],
  });
  return result.rows.map(rowToAdmin);
}

export async function listPublicEvents(env) {
  const rows = await listEvents(env);
  return rows.map(rowToPublic);
}

export async function upsertEvent(env, input, { skipNormalize = false } = {}) {
  const event = skipNormalize ? input : normalizeEvent(input);
  if (!event) return { ok: false, error: "invalid_event" };

  const db = getDb(env);
  await ensureCalendarTable(db);
  await db.execute({
    sql: `INSERT INTO calendar_event
      (id, text, description, place, href, start, end, allDay, images, imageAlt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        text = excluded.text,
        description = excluded.description,
        place = excluded.place,
        href = excluded.href,
        start = excluded.start,
        end = excluded.end,
        allDay = excluded.allDay,
        images = excluded.images,
        imageAlt = excluded.imageAlt,
        updatedAt = excluded.updatedAt`,
    args: [
      event.id,
      event.text,
      event.description,
      event.place,
      event.href,
      event.start,
      event.end,
      event.allDay ? 1 : 0,
      JSON.stringify(event.images || []),
      event.imageAlt,
      event.updatedAt,
    ],
  });
  return { ok: true, event };
}

export async function replaceAllEvents(env, inputs = []) {
  const normalized = [];
  for (const input of inputs) {
    const event = normalizeEvent(input);
    if (event) normalized.push(event);
  }

  const db = getDb(env);
  await ensureCalendarTable(db);
  await db.execute(`DELETE FROM calendar_event`);
  for (const event of normalized) {
    await upsertEvent(env, event, { skipNormalize: true });
  }
  return { ok: true, count: normalized.length };
}

export async function deleteEvent(env, id) {
  const db = getDb(env);
  await ensureCalendarTable(db);
  const existing = await db.execute({
    sql: `SELECT id FROM calendar_event WHERE id = ? LIMIT 1`,
    args: [id],
  });
  if (!existing.rows.length) return { ok: false, error: "not_found" };
  await db.execute({
    sql: `DELETE FROM calendar_event WHERE id = ?`,
    args: [id],
  });
  return { ok: true, id };
}

export async function getSessionUser(env, request) {
  if (!authConfigured(env)) return null;
  try {
    const auth = createAuth(env);
    const session = await auth.api.getSession({ headers: request.headers });
    const user = session?.user;
    if (!user?.email) return null;
    return {
      id: user.id || "",
      email: String(user.email).trim().toLowerCase(),
      name: user.name || "",
    };
  } catch {
    return null;
  }
}

export function isAdminEmail(env, email = "") {
  const raw = envVal(env, "ADMIN_EMAILS");
  if (!raw || !email) return false;
  const allowed = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(String(email).trim().toLowerCase());
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}
