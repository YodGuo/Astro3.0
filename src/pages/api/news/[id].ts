import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { newsPosts } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { apiError, apiSuccess, apiBadRequest, apiNotFound, apiUnavailable } from "../../../lib/api-response";
import { requireAdmin } from "../../../lib/auth-guard";
import { updateNewsSchema, validateBody } from "../../../lib/validations";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  const rows = await db.select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
  if (rows.length === 0) return apiNotFound("News post");
  return apiSuccess(rows[0]);
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const raw = await request.json();
    const validation = validateBody(updateNewsSchema, raw);
    if (validation.error) return apiBadRequest(validation.error);
    const body = validation.data;

    // Check if transitioning to published (fire notification)
    const shouldNotify = body.status === "published";
    if (shouldNotify && env.DB) {
      const existing = await db.select({ status: newsPosts.status, title: newsPosts.title, slug: newsPosts.slug }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
      if (existing.length > 0 && existing[0].status !== "published") {
        const post = existing[0];
        publishNotificationEvent(
          { db: env.DB, env: env as Record<string, unknown> },
          {
            type: NOTIFICATION_EVENTS.NEWS_PUBLISHED,
            data: {
              newsTitle: (body.title as string) || post.title,
              newsUrl: `/news/${post.slug}`,
              summary: (body.summary as string) || undefined,
            },
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "news-update", error: String(err) });
        });
      }
    }

    await db.update(newsPosts).set({ title: (body.title as string) ?? undefined, summary: (body.summary as string) ?? undefined, content: body.content ? JSON.stringify(body.content) : undefined, status: (body.status as string) ?? undefined, publishedAt: body.status === "published" ? Date.now() : undefined }).where(eq(newsPosts.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const existing = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
    if (existing.length === 0) return apiNotFound("Article");
    await db.delete(newsPosts).where(eq(newsPosts.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};
