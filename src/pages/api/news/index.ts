import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { newsPosts } from "../../../lib/db/schema";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { eq, sql, count } from "drizzle-orm";
import { apiError, apiSuccess, apiBadRequest, apiUnavailable } from "../../../lib/api-response";
import { requireAdmin } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { createNewsSchema, validateBody } from "../../../lib/validations";
import { slugify, ensureUniqueSlug } from "../../../lib/slug";

export const prerender = false;

// GET /api/news — List all news posts (optionally with pagination and status filter)
export const GET: APIRoute = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const offset = (page - 1) * limit;
    const statusFilter = url.searchParams.get("status") || "";

    const whereCondition = statusFilter ? eq(newsPosts.status, statusFilter) : undefined;

    const [countResult, rows] = await Promise.all([
      db.select({ total: count() }).from(newsPosts).where(whereCondition),
      db.select({
        id: newsPosts.id,
        slug: newsPosts.slug,
        title: newsPosts.title,
        summary: newsPosts.summary,
        status: newsPosts.status,
        publishedAt: newsPosts.publishedAt,
        createdAt: newsPosts.createdAt,
      }).from(newsPosts).where(whereCondition).orderBy(sql`${newsPosts.publishedAt} desc`).limit(limit).offset(offset),
    ]);

    return apiSuccess({ data: rows, total: countResult[0].total, page, limit });
  } catch (error) {
    return apiError(error);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  requireAdmin(locals);
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createNewsSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError);
    const { title, summary, content, status } = data;
    const id = crypto.randomUUID();
    let slug = slugify(title);
    if (env.DB) slug = await ensureUniqueSlug(env.DB, "news_posts", slug);
    const finalStatus = status || "draft";
    await db.insert(newsPosts).values({ id, slug, title, summary: summary || null, content: content ? JSON.stringify(content) : null, status: finalStatus, publishedAt: finalStatus === "published" ? Date.now() : null });

    // Fire notification when news is published
    if (finalStatus === "published" && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env: env as Record<string, unknown> },
        {
          type: NOTIFICATION_EVENTS.NEWS_PUBLISHED,
          data: {
            newsTitle: title,
            newsUrl: `/news/${slug}`,
            summary: summary || undefined,
          },
        }
      ).catch((err) => {
        logger.error("Failed to send notification", { context: "news-create", error: String(err) });
      });
    }

    return apiSuccess({ id, slug }, 201);
  } catch (error) {
    return apiError(error);
  }
};
