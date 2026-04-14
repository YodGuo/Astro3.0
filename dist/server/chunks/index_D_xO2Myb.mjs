globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, k as solutions } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
import { v as validateBody, h as createSolutionSchema } from "./validations_B2RLnuYh.mjs";
import { s as slugify, e as ensureUniqueSlug } from "./slug_CPOWZBpk.mjs";
const prerender = false;
const GET = async () => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const rows = await db.select({
      id: solutions.id,
      slug: solutions.slug,
      industry: solutions.industry,
      title: solutions.title,
      content: solutions.content
    }).from(solutions);
    return apiSuccess(rows);
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      return e.status === 401 ? apiUnauthorized(e.message) : apiForbidden(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const parsedBody = await request.json();
    const { data, error: validationError } = validateBody(createSolutionSchema, parsedBody);
    if (validationError || !data) return apiBadRequest(validationError || "Validation failed");
    const { title, industry, content } = data;
    const id = crypto.randomUUID();
    let slug = slugify(title);
    if (env.DB) slug = await ensureUniqueSlug(env.DB, "solutions", slug);
    await db.insert(solutions).values({ id, slug, industry, title, content: content || null });
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
