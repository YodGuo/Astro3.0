globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, c as comments, e as eq, n as newsPosts } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { a as apiBadRequest, b as apiUnavailable, c as apiNotFound, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async ({ params, locals }) => {
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
const PUT = async ({ params, request, locals }) => {
  requireAdmin(locals);
  const { id } = params;
  if (!id) return apiBadRequest("Missing id");
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const body = await request.json();
    const { status } = body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return apiBadRequest("status must be one of: approved, rejected, pending");
    }
    const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (existing.length === 0) {
      return apiNotFound("Comment");
    }
    const comment = existing[0];
    await db.update(comments).set({ status }).where(eq(comments.id, id));
    if (status === "approved" && comment.status === "pending" && comment.parentId && env.DB) {
      const parentComment = await db.select().from(comments).where(eq(comments.id, comment.parentId)).limit(1);
      if (parentComment.length > 0) {
        const parent = parentComment[0];
        if (parent.authorEmail !== comment.authorEmail) {
          const post = await db.select({ title: newsPosts.title, slug: newsPosts.slug }).from(newsPosts).where(eq(newsPosts.id, comment.postId)).limit(1);
          const postTitle = post.length > 0 ? post[0].title : "Unknown Post";
          const postSlug = post.length > 0 ? post[0].slug : comment.postId;
          const commentContent = comment.content;
          const replyPreview = commentContent.length > 100 ? commentContent.slice(0, 100) + "..." : commentContent;
          const commentUrl = `/news/${postSlug}#comment-${comment.id}`;
          publishNotificationEvent(
            { db: env.DB, env },
            {
              type: NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED,
              data: {
                to: parent.authorEmail,
                postTitle,
                replierName: comment.authorName,
                replyPreview,
                commentUrl
              }
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
const DELETE = async ({ params, locals }) => {
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
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
