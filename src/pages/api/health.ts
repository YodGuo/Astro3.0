import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../lib/db";
import { getEnv } from "../../lib/env";
import { apiSuccess, apiUnavailable } from "../../lib/api-response";

export const prerender = false;

export const GET: APIRoute = async () => {
  const env = await getEnv();
  const db = getDBFromEnv(env);

  // Return 200 if DB is available, 503 if not configured
  // Do not expose database connection details to unauthenticated callers (SEC-11)
  if (!db) {
    return apiUnavailable("Service unavailable", "SERVICE_UNAVAILABLE");
  }

  try {
    await db.prepare("SELECT 1").first();
    return apiSuccess({ status: "ok" });
  } catch {
    return apiUnavailable("Service unavailable", "SERVICE_UNAVAILABLE");
  }
};
