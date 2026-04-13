import type { APIRoute } from "astro";
import { getEnv } from "../../../lib/env";
import { getDBFromEnv } from "../../../lib/db";
import { media } from "../../../lib/db/schema";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { desc, lt, like, sql } from "drizzle-orm";
import { apiError, apiUnavailable, apiBadRequest, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

// ── MIME Type Detection ────────────────────────────

/**
 * Detect MIME type from file magic bytes
 * @param file File object to analyze
 * @returns Detected MIME type or null if unknown
 */
async function detectMimeType(file: File): Promise<string | null> {
  const SIGNATURES: Record<string, string> = {
    'ffd8ff': 'image/jpeg',
    '89504e47': 'image/png',
    '47494638': 'image/gif',
    '52494646': 'image/webp', // RIFF....WEBP
  };

  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

  for (const [sig, mime] of Object.entries(SIGNATURES)) {
    if (hex.startsWith(sig)) {
      // Special case for WebP which requires additional check
      if (mime === 'image/webp' && hex.slice(8, 16) !== '57454250') {
        continue;
      }
      return mime;
    }
  }
  return null;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w.-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 80)
    || 'file';
}

export const prerender = false;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // NOTE: image/svg+xml is intentionally excluded to prevent stored XSS.
  // SVG files can contain <script> tags that execute when accessed directly
  // or embedded via set:html. See audit report S-01.
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// GET /api/media — List media (admin only)
// Query params: ?cursor={id}&limit=20&search={keyword}
export const GET: APIRoute = async ({ url, locals }) => {
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

    // Build where conditions
    const conditions = [];
    if (cursor) {
      conditions.push(lt(media.id, cursor));
    }
    if (search) {
      // Escape SQL LIKE special characters
      const escaped = search.replace(/[%_\\]/g, '\\$&');
      conditions.push(like(media.filename, `%${escaped}%`));
    }

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, cond) => (acc ? sql`${acc} AND ${cond}` : cond))
      : undefined;

    // Fetch limit+1 to determine if there are more results
    const rows = await db
      .select({
        id: media.id,
        key: media.key,
        url: media.url,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        uploadedBy: media.uploadedBy,
        createdAt: media.createdAt,
      })
      .from(media)
      .where(whereClause)
      .orderBy(desc(media.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return apiSuccess({ data, nextCursor, hasMore });
  } catch (error) {
    return apiError(error);
  }
};

// POST /api/media — Upload a file (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
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
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiBadRequest("No file provided. Use 'file' field in multipart form data.");
    }

    // Validate MIME type using magic bytes
    const detectedMime = await detectMimeType(file);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return apiBadRequest(
        `Invalid file type. Detected: ${detectedMime || 'unknown'}. Allowed types: ${[...ALLOWED_MIME_TYPES].join(", ")}`
      );
    }

    // Use detected MIME type instead of client-provided one
    const mimeToUse = detectedMime;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiBadRequest(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB.`
      );
    }

    // Generate unique key
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const key = `uploads/${year}/${month}/${uuid}-${sanitizeFilename(file.name)}`;

    // Upload to R2
    const fileStream = file.stream();
    await env.R2.put(key, fileStream, {
      httpMetadata: { contentType: mimeToUse },
    });

    // Insert record into media table
    const id = crypto.randomUUID();
    const url = `/media/${key}`;
    const currentUser = locals.user as Record<string, unknown> | null;

    await db.insert(media).values({
      id,
      key,
      url,
      filename: file.name,
      mimeType: mimeToUse,
      size: file.size,
      uploadedBy: currentUser?.id as string | null,
    });

    return apiSuccess({
      id,
      key,
      url,
      filename: file.name,
      mimeType: mimeToUse,
      size: file.size,
    }, 201);
  } catch (error) {
    return apiError(error);
  }
};
