import { createClient } from "@libsql/client";
import { authConfigured, createAuth } from "./auth.mjs";

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

export async function ensureTestimonialsTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS testimonial (
      id TEXT PRIMARY KEY NOT NULL,
      quote TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      image TEXT,
      imageAlt TEXT NOT NULL DEFAULT '',
      authorEmail TEXT NOT NULL,
      authorId TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      reviewedAt TEXT
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_testimonial_status ON testimonial (status, createdAt)`,
  );
}

function rowToItem(row) {
  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    role: row.role || "",
    image: row.image || null,
    imageAlt: row.imageAlt || "",
    status: row.status,
    authorEmail: row.authorEmail,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt || null,
  };
}

export async function listApproved(env) {
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const result = await db.execute({
    sql: `SELECT * FROM testimonial WHERE status = 'approved' ORDER BY reviewedAt DESC, createdAt DESC LIMIT 50`,
    args: [],
  });
  return result.rows.map(rowToItem);
}

export async function listPending(env) {
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const result = await db.execute({
    sql: `SELECT * FROM testimonial WHERE status = 'pending' ORDER BY createdAt ASC LIMIT 100`,
    args: [],
  });
  return result.rows.map(rowToItem);
}

export async function listRecentReviewed(env, limit = 20) {
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const result = await db.execute({
    sql: `SELECT * FROM testimonial WHERE status IN ('approved', 'rejected') ORDER BY reviewedAt DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(rowToItem);
}

export async function countRecentPendingByEmail(env, email, sinceIso) {
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const result = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM testimonial WHERE authorEmail = ? AND createdAt >= ?`,
    args: [email, sinceIso],
  });
  return Number(result.rows[0]?.c ?? 0);
}

export async function createPending(env, { quote, name, role, authorEmail, authorId }) {
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const id = `t-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO testimonial
      (id, quote, name, role, image, imageAlt, authorEmail, authorId, status, createdAt, reviewedAt)
      VALUES (?, ?, ?, ?, NULL, '', ?, ?, 'pending', ?, NULL)`,
    args: [id, quote, name, role || "", authorEmail, authorId || "", createdAt],
  });
  return { id, createdAt };
}

export async function reviewTestimonial(env, id, action) {
  const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
  if (!status) return { ok: false, error: "invalid_action" };
  const db = getDb(env);
  await ensureTestimonialsTable(db);
  const existing = await db.execute({
    sql: `SELECT id FROM testimonial WHERE id = ? AND status = 'pending' LIMIT 1`,
    args: [id],
  });
  if (!existing.rows.length) {
    return { ok: false, error: "not_found_or_reviewed" };
  }
  const reviewedAt = new Date().toISOString();
  await db.execute({
    sql: `UPDATE testimonial SET status = ?, reviewedAt = ? WHERE id = ? AND status = 'pending'`,
    args: [status, reviewedAt, id],
  });
  return { ok: true, id, status, reviewedAt };
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
