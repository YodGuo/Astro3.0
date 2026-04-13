globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, e as eq, c as comments, d as desc, n as newsPosts } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { v as validateBody, c as createCommentSchema } from "./validations_B2RLnuYh.mjs";
import { b as apiUnavailable, e as apiError, a as apiBadRequest, d as apiSuccess } from "./api-response_DQ3MgLJ0.mjs";
import { c as count } from "./aggregate_C5aFahLf.mjs";
const prerender = false;
const GET = async ({ url, locals }) => {
  requireAdmin(locals);
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const postId = url.searchParams.get("postId");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const whereClause = postId ? eq(comments.postId, postId) : void 0;
    const dataQuery = db.select().from(comments).orderBy(desc(comments.createdAt)).limit(limit).offset(offset);
    const [countResult, rows] = await Promise.all([
      db.select({ total: count() }).from(comments).where(whereClause),
      whereClause ? dataQuery.where(whereClause) : dataQuery
    ]);
    return new Response(
      JSON.stringify({ ok: true, data: rows, total: countResult[0].total, limit, offset }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" } }
    );
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request }) => {
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
      status: "pending"
    });
    if (env.DB) {
      const adminEmail = env.ADMIN_EMAIL || "admin@yourcompany.com";
      const post = await db.select({ title: newsPosts.title, slug: newsPosts.slug }).from(newsPosts).where(eq(newsPosts.id, postId)).limit(1);
      const postTitle = post.length > 0 ? post[0].title : "Unknown Post";
      const postSlug = post.length > 0 ? post[0].slug : postId;
      const commentUrl = `/news/${postSlug}#comment-${id}`;
      if (isReply) {
        publishNotificationEvent(
          { db: env.DB, env },
          {
            type: NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW,
            data: {
              to: adminEmail,
              postTitle,
              authorName,
              commentPreview,
              reviewUrl: "/admin/news/comments"
            }
          }
        ).catch((err) => {
          logger.error("Failed to send notification", { context: "comment-create", error: String(err) });
        });
      } else {
        publishNotificationEvent(
          { db: env.DB, env },
          {
            type: NOTIFICATION_EVENTS.COMMENT_CREATED,
            data: {
              to: adminEmail,
              postTitle,
              authorName,
              commentPreview,
              commentUrl
            }
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
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
