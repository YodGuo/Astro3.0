globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { g as getDBFromEnv, l as lt, m as media, a as like, s as sql, d as desc } from "./index_BdvyDh_N.mjs";
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { f as apiUnauthorized, g as apiForbidden, b as apiUnavailable, d as apiSuccess, e as apiError, a as apiBadRequest } from "./api-response_DQ3MgLJ0.mjs";
async function detectMimeType(file) {
  const SIGNATURES = {
    "ffd8ff": "image/jpeg",
    "89504e47": "image/png",
    "47494638": "image/gif",
    "52494646": "image/webp"
    // RIFF....WEBP
  };
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  for (const [sig, mime] of Object.entries(SIGNATURES)) {
    if (hex.startsWith(sig)) {
      if (mime === "image/webp" && hex.slice(8, 16) !== "57454250") {
        continue;
      }
      return mime;
    }
  }
  return null;
}
function sanitizeFilename(name) {
  return name.replace(/[^\w.-]/g, "_").replace(/\.{2,}/g, "_").replace(/^\.+/, "").slice(0, 80) || "file";
}
const prerender = false;
const ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
  // NOTE: image/svg+xml is intentionally excluded to prevent stored XSS.
  // SVG files can contain <script> tags that execute when accessed directly
  // or embedded via set:html. See audit report S-01.
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const GET = async ({ url, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) {
    return apiUnavailable("D1 not available");
  }
  try {
    const cursor = url.searchParams.get("cursor");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const search = url.searchParams.get("search")?.trim();
    const conditions = [];
    if (cursor) {
      conditions.push(lt(media.id, cursor));
    }
    if (search) {
      const escaped = search.replace(/[%_\\]/g, "\\$&");
      conditions.push(like(media.filename, `%${escaped}%`));
    }
    const whereClause = conditions.length > 0 ? conditions.reduce((acc, cond) => acc ? sql`${acc} AND ${cond}` : cond) : void 0;
    const rows = await db.select({
      id: media.id,
      key: media.key,
      url: media.url,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      uploadedBy: media.uploadedBy,
      createdAt: media.createdAt
    }).from(media).where(whereClause).orderBy(desc(media.id)).limit(limit + 1);
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;
    return apiSuccess({ data, nextCursor, hasMore });
  } catch (error) {
    return apiError(error);
  }
};
const POST = async ({ request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) {
    return apiUnavailable("D1 not available");
  }
  if (!env.R2) {
    return apiUnavailable("R2 not available");
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return apiBadRequest("No file provided. Use 'file' field in multipart form data.");
    }
    const detectedMime = await detectMimeType(file);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return apiBadRequest(
        `Invalid file type. Detected: ${detectedMime || "unknown"}. Allowed types: ${[...ALLOWED_MIME_TYPES].join(", ")}`
      );
    }
    const mimeToUse = detectedMime;
    if (file.size > MAX_FILE_SIZE) {
      return apiBadRequest(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB.`
      );
    }
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const key = `uploads/${year}/${month}/${uuid}-${sanitizeFilename(file.name)}`;
    const fileStream = file.stream();
    await env.R2.put(key, fileStream, {
      httpMetadata: { contentType: mimeToUse }
    });
    const id = crypto.randomUUID();
    const url = `/media/${key}`;
    const currentUser = locals.user;
    await db.insert(media).values({
      id,
      key,
      url,
      filename: file.name,
      mimeType: mimeToUse,
      size: file.size,
      uploadedBy: currentUser?.id
    });
    return apiSuccess({
      id,
      key,
      url,
      filename: file.name,
      mimeType: mimeToUse,
      size: file.size
    }, 201);
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
