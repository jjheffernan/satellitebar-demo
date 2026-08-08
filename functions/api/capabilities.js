import features from "../../src/data/features.json";
import { authConfigured } from "../_shared/auth.mjs";

function envOn(env, key) {
  const value = env?.[key];
  return Boolean(value && String(value).trim() && value !== "0" && value !== "false");
}

function isModuleActive(mod, env) {
  const flagsOn = (mod.publicEnv ?? []).every((key) => envOn(env, key));
  if (!flagsOn) return false;
  if (mod.id === "accounts") return authConfigured(env);
  return true;
}

export async function onRequestGet(context) {
  const env = context.env ?? {};
  const modules = features.modules.map((mod) => {
    const active = isModuleActive(mod, env);
    return { id: mod.id, title: mod.title, active };
  });

  return new Response(
    JSON.stringify({
      active: modules.filter((m) => m.active).map((m) => m.id),
      modules,
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60",
      },
    },
  );
}
