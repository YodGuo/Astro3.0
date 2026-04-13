import type { APIRoute } from "astro";
import { getDBFromEnv } from "../../lib/db";
import { pageSections } from "../../lib/db/schema";
import { requireAdmin, AuthError } from "../../lib/auth-guard";
import { getEnv } from "../../lib/env";
import { apiError, apiSuccess, apiUnavailable, apiBadRequest, apiUnauthorized, apiForbidden } from "../../lib/api-response";

export const prerender = false;

// GET /api/page-content?page=home — Retrieve all sections for a page
export const GET: APIRoute = async ({ url }) => {
  const page = url.searchParams.get("page");
  if (!page) {
    return apiBadRequest("Missing required query parameter: page", "MISSING_PAGE");
  }

  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) return apiUnavailable("D1 not available");

  try {
    const rows = await db
      .select({
        section: pageSections.section,
        field: pageSections.field,
        value: pageSections.value,
        order: pageSections.order,
      })
      .from(pageSections)
      .where(({ page: pageCol, eq }) => eq(pageCol, page));

    // Convert flat rows to nested structure: { section: { field: value } }
    const result: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      if (!result[row.section]) result[row.section] = {};
      result[row.section][row.field] = row.value;
    }

    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
};

// PUT /api/page-content — Upsert a single page_section row (admin only)
export const PUT: APIRoute = async ({ request, locals }) => {
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
    const { page, section, field, value } = body as {
      page: string;
      section: string;
      field: string;
      value: string;
    };

    if (!page || !section || !field) {
      return apiBadRequest("Missing required fields: page, section, field", "VALIDATION_ERROR");
    }

    const id = `ps-${page}-${section}-${field}`;
    const strValue = value ?? "";

    await db
      .prepare(
        `INSERT INTO page_sections (id, page, section, field, value)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(page, section, field) DO UPDATE SET value = excluded.value`
      )
      .bind(id, page, section, field, strValue)
      .run();

    return apiSuccess({ success: true, id });
  } catch (error) {
    return apiError(error);
  }
};
