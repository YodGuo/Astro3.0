import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../../lib/db";
import { comments, newsPosts } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "../../../lib/notification";
import { requireAdmin } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { apiError, apiUnavailable, apiBadRequest, apiNotFound, apiSuccess } from "../../../lib/api-response";

export const prerender = false;

// GET /api/comments/[id] — Get a single comment
export const GET: APIRoute = async ({ params, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const rows = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (rows.length === 0) {
      return apiNotFound("Comment");
    }
    return apiSuccess(rows[0]);
  } catch (error) {
    return apiError(error);
  }
};

// PUT /api/comments/[id] — Update a comment (e.g., approve/reject)
//
// Notification logic:
//   - Reply comment approved (pending → approved) → comment.reply_received
//     (notify the original comment author, unless they're the same person)
export const PUT: APIRoute = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return apiBadRequest("status must be one of: approved, rejected, pending");
    }

    // Fetch the existing comment
    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (existing.length === 0) {
      return apiNotFound("Comment");
    }

    const comment = existing[0];

    // Update the comment status
    await db
      .update(comments)
      .set({ status })
      .where(eq(comments.id, id));

    // Fire notification when a reply comment is approved
    if (status === "approved" && comment.status === "pending" && comment.parentId && env.DB) {
      // 1. Find the parent comment (the one being replied to)
      const parentComment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, comment.parentId as string))
        .limit(1);

      if (parentComment.length > 0) {
        const parent = parentComment[0];

        // 2. Don't notify if replying to yourself
        if (parent.authorEmail !== comment.authorEmail) {
          // 3. Look up the post title
          const post = await db
            .select({ title: newsPosts.title, slug: newsPosts.slug })
            .from(newsPosts)
            .where(eq(newsPosts.id, comment.postId as string))
            .limit(1);

          const postTitle = post.length > 0 ? post[0].title : "Unknown Post";
          const postSlug = post.length > 0 ? post[0].slug : comment.postId as string;
          const commentContent = comment.content as string;
          const replyPreview = commentContent.length > 100
            ? commentContent.slice(0, 100) + "..."
            : commentContent;
          const commentUrl = `/news/${postSlug}#comment-${comment.id}`;

          // 4. Notify the original comment author
          publishNotificationEvent(
            { db: env.DB, env: env as Record<string, unknown> },
            {
              type: NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED,
              data: {
                to: parent.authorEmail as string,
                postTitle,
                replierName: comment.authorName as string,
                replyPreview,
                commentUrl,
              },
            }
          ).catch((err) => {
            logger.error("Failed to send notification", { context: "comment-reply", error: String(err) });
          });
        }
      }
    }

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};

// DELETE /api/comments/[id] — Delete a comment
export const DELETE: APIRoute = async ({ params, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (existing.length === 0) {
      return apiNotFound("Comment");
    }
    await db.delete(comments).where(eq(comments.id, id));
    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error);
  }
};
