import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/env";
import { getDBFromEnv } from "../../../lib/db";
import { media } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { logger } from "../../../lib/logger";
import { apiError, apiUnavailable, apiNotFound, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

// DELETE /api/media/[id] — Delete a media file (admin only)
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }

  const { id } = params;
  if (!id) return apiNotFound("Media");

  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    // Fetch the media record
    const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (rows.length === 0) return apiNotFound("Media");

    const record = rows[0];

    // Delete from D1
    await db.delete(media).where(eq(media.id, id));

    // Delete from R2 (best-effort, log errors but don't fail)
    if (env.R2) {
      try {
        await env.R2.delete(record.key);
      } catch (err) {
        logger.warn("Failed to delete R2 object", { key: record.key, error: String(err) });
      }
    }

    return apiSuccess({ ok: true, deleted: record.key });
  } catch (error) {
    return apiError(error);
  }
};
