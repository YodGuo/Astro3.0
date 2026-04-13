globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, e as eq, n as newsPosts, s as sql } from "./index_BdvyDh_N.mjs";
import { p as publishNotificationEvent } from "./notification.publisher_gE8ktshy.mjs";
import { N as NOTIFICATION_EVENTS } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
import { r as requireAdmin } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { v as validateBody, a as createNewsSchema } from "./validations_B2RLnuYh.mjs";
import { s as slugify, e as ensureUniqueSlug } from "./slug_CPOWZBpk.mjs";
import { c as count } from "./aggregate_C5aFahLf.mjs";
const prerender = false;
const GET = async ({ url }) => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const page2 = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20") || 20));
    const offset = (page2 - 1) * limit;
    const statusFilter = url.searchParams.get("status") || "";
    const whereCondition = statusFilter ? eq(newsPosts.status, statusFilter) : void 0;
    const [countResult, rows] = await Promise.all([
      db.select({ total: count() }).from(newsPosts).where(whereCondition),
      db.select({
        id: newsPosts.id,
        slug: newsPosts.slug,
        title: newsPosts.title,
        summary: newsPosts.summary,
        status: newsPosts.status,
        publishedAt: newsPosts.publishedAt,
        createdAt: newsPosts.createdAt
      }).from(newsPosts).where(whereCondition).orderBy(sql`${newsPosts.publishedAt} desc`).limit(limit).offset(offset)
    ]);
    return apiSuccess({ data: rows, total: countResult[0].total, page: page2, limit });
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request, locals }) => {
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
    if (finalStatus === "published" && env.DB) {
      publishNotificationEvent(
        { db: env.DB, env },
        {
          type: NOTIFICATION_EVENTS.NEWS_PUBLISHED,
          data: {
            newsTitle: title,
            newsUrl: `/news/${slug}`,
            summary: summary || void 0
          }
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
