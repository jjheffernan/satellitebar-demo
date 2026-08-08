import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";

function envVal(env, key) {
  const value = env?.[key];
  if (value == null) return "";
  return String(value).trim();
}

function envOn(env, key) {
  const value = envVal(env, key);
  return Boolean(value && value !== "0" && value !== "false");
}

/** True when flag + Google + Better Auth + DB are all present. */
export function authConfigured(env = {}) {
  const secret = envVal(env, "BETTER_AUTH_SECRET") || envVal(env, "AUTH_SECRET");
  return (
    envOn(env, "PUBLIC_FEATURE_ACCOUNTS") &&
    Boolean(secret) &&
    envOn(env, "BETTER_AUTH_URL") &&
    envOn(env, "GOOGLE_CLIENT_ID") &&
    envOn(env, "GOOGLE_CLIENT_SECRET") &&
    envOn(env, "AUTH_DATABASE_URL")
  );
}

export function authMissing(env = {}) {
  const need = [
    "PUBLIC_FEATURE_ACCOUNTS",
    "BETTER_AUTH_SECRET|AUTH_SECRET",
    "BETTER_AUTH_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "AUTH_DATABASE_URL",
  ];
  const missing = [];
  if (!envOn(env, "PUBLIC_FEATURE_ACCOUNTS")) missing.push("PUBLIC_FEATURE_ACCOUNTS");
  if (!envVal(env, "BETTER_AUTH_SECRET") && !envVal(env, "AUTH_SECRET")) {
    missing.push("BETTER_AUTH_SECRET");
  }
  for (const key of ["BETTER_AUTH_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AUTH_DATABASE_URL"]) {
    if (!envOn(env, key)) missing.push(key);
  }
  return { ok: missing.length === 0, missing, need };
}

/**
 * Better Auth instance for Google SSO (Gmail) only.
 * @param {Record<string, string | undefined>} env
 */
export function createAuth(env = {}) {
  const secret = envVal(env, "BETTER_AUTH_SECRET") || envVal(env, "AUTH_SECRET");
  const baseURL = envVal(env, "BETTER_AUTH_URL").replace(/\/$/, "");
  const databaseUrl = envVal(env, "AUTH_DATABASE_URL");
  const authToken = envVal(env, "AUTH_DATABASE_AUTH_TOKEN") || undefined;

  const dialect = new LibsqlDialect({
    client: createClient({
      url: databaseUrl,
      authToken,
    }),
  });

  return betterAuth({
    baseURL,
    secret,
    database: {
      dialect,
      type: "sqlite",
    },
    socialProviders: {
      google: {
        clientId: envVal(env, "GOOGLE_CLIENT_ID"),
        clientSecret: envVal(env, "GOOGLE_CLIENT_SECRET"),
        prompt: "select_account",
      },
    },
    trustedOrigins: [baseURL],
  });
}

export function notConfiguredResponse(env = {}) {
  const { missing } = authMissing(env);
  return new Response(
    JSON.stringify({
      error: "accounts_not_configured",
      message: "Gmail SSO is not configured on this deploy.",
      missing,
    }),
    {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}
