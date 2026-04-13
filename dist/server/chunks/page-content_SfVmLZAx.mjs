globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv, p as pageSections } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { a as apiBadRequest, b as apiUnavailable, d as apiSuccess, e as apiError, f as apiUnauthorized, g as apiForbidden } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async ({ url }) => {
  const page2 = url.searchParams.get("page");
  if (!page2) {
    return apiBadRequest("Missing required query parameter: page", "MISSING_PAGE");
  }
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");
  try {
    const rows = await db.select({
      section: pageSections.section,
      field: pageSections.field,
      value: pageSections.value,
      order: pageSections.order
    }).from(pageSections).where(({ page: pageCol, eq }) => eq(pageCol, page2));
    const result = {};
    for (const row of rows) {
      if (!result[row.section]) result[row.section] = {};
      result[row.section][row.field] = row.value;
    }
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
};
const PUT = async ({ request, locals }) => {
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
    const body = await request.json();
    const { page: page2, section, field, value } = body;
    if (!page2 || !section || !field) {
      return apiBadRequest("Missing required fields: page, section, field", "VALIDATION_ERROR");
    }
    const id = `ps-${page2}-${section}-${field}`;
    const strValue = value ?? "";
    await db.prepare(
      `INSERT INTO page_sections (id, page, section, field, value)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(page, section, field) DO UPDATE SET value = excluded.value`
    ).bind(id, page2, section, field, strValue).run();
    return apiSuccess({ success: true, id });
  } catch (error) {
    return apiError(error);
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
