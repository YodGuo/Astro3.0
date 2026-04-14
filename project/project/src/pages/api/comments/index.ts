import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { requireAdmin } from "../../../lib/auth-guard";
import { comments, newsPosts } from "../../../lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { createCommentSchema, validateBody } from "../../../lib/validations";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess } from "../../../lib/api-response";

export const prerender = false;

// GET /api/comments?postId=xxx&limit=50&offset=0 — List comments (optionally filtered by post)
export const GET: APIRoute = async ({ url, locals }) => {
  requireAdmin(locals);
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const postId = url.searchParams.get("postId");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const whereClause = postId ? eq(comments.postId, postId) : undefined;

    // Get total count and paginated results in parallel
    const dataQuery = db.select().from(comments).orderBy(desc(comments.createdAt)).limit(limit).offset(offset);
    const [countResult, rows] = await Promise.all([
      db.select({ total: count() }).from(comments).where(whereClause),
      whereClause ? dataQuery.where(whereClause) : dataQuery,
    ]);

    // Custom response with Cache-Control (paginated list endpoint)
    return new Response(
      JSON.stringify({ ok: true, data: rows, total: countResult[0].total, limit, offset }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
    );
  } catch (error) {
    return apiError(error);
  }
};

// POST /api/comments — Create a comment
//
// Notification logic:
//   - Root comment (no parentId) → comment.created (notify admin)
//   - Reply comment (has parentId) → comment.pending_review (notify admin to review)
export const POST: APIRoute = async ({ request }) => {
  // NOTE: Rate limiting is handled by Cloudflare WAF Rate Limiting rules
  // configured in the Cloudflare dashboard. See S-05 in CHANGELOG.

  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createCommentSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Invalid request body");
    const { postId, parentId, authorName, authorEmail, content } = data;

    const id = crypto.randomUUID();
    const isReply = !!parentId;
    const commentPreview = content.length > 100 ? content.slice(0, 100) + "..." : content;

    await db.insert(comments).values({
      id,
      postId,
      parentId: parentId || null,
      authorName,
      authorEmail,
      content,
      status: "pending",
    });

    // Fire notification (non-blocking)
    if (env.DB) {
      const adminEmail = env.ADMIN_EMAIL || "admin@yourcompany.com";

      // Look up the post title for the notification
      const post = await db
        .select({ title: newsPosts.title, slug: newsPosts.slug })
        .from(newsPosts)
        .where(eq(newsPosts.id, postId))
        .limit(1);

      const postTitle = post.length > 0 ? post[0].title : "Unknown Post";
      const postSlug = post.length > 0 ? post[0].slug : postId;
      const commentUrl = `/news/${postSlug}#comment-${id}`;

      if (isReply) {
        // Reply → notify admin to review
        publishNotificationEvent(
          { db: env.DB, env: env as Record<string, unknown> },
          {
            type: NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW,
            data: {
              to: adminEmail,
              postTitle,
              authorName,
              commentPreview,
              reviewUrl: "/admin/news/comments",
            },
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "comment-create", error: String(err) });
        });
      } else {
        // Root comment → notify admin
        publishNotificationEvent(
          { db: env.DB, env: env as Record<string, unknown> },
          {
            type: NOTIFICATION_EVENTS.COMMENT_CREATED,
            data: {
              to: adminEmail,
              postTitle,
              authorName,
              commentPreview,
              commentUrl,
            },
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "comment-status-change", error: String(err) });
        });
      }
    }

    return apiSuccess({ id, status: "pending" }, 201);
  } catch (error) {
    return apiError(error);
  }
};
