/**
 * Unified API response helpers.
 *
 * All responses follow a consistent JSON format:
 *   Success: { ok: true, data: ... }
 *   Error:   { ok: false, error: { message, code } }
 *
 * The `code` field is a machine-readable string (e.g. "NOT_FOUND", "VALIDATION_ERROR")
 * that clients can use for programmatic error handling.
 *
 * Usage:
 *   return apiSuccess({ id: "123" });
 *   return apiBadRequest("Email is required");
 *   return apiNotFound("Product");
 *   catch (error) { return apiError(error); }
 */

import { logger } from "./logger";

// ── Internal helper ──────────────────────────────

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Success ──────────────────────────────────────

export function apiSuccess<T>(data: T, status: number = 200): Response {
  return jsonResponse({ ok: true as const, data }, status);
}

// ── Client Errors (4xx) ──────────────────────────

export function apiBadRequest(message: string, code: string = "VALIDATION_ERROR"): Response {
  return jsonResponse({ ok: false as const, error: { message, code } }, 400);
}

export function apiUnauthorized(message: string = "Authentication required", code: string = "UNAUTHORIZED"): Response {
  return jsonResponse({ ok: false as const, error: { message, code } }, 401);
}

export function apiForbidden(message: string = "Insufficient permissions", code: string = "FORBIDDEN"): Response {
  return jsonResponse({ ok: false as const, error: { message, code } }, 403);
}

export function apiNotFound(resource: string = "Resource", code: string = "NOT_FOUND"): Response {
  return jsonResponse({ ok: false as const, error: { message: `${resource} not found`, code } }, 404);
}

export function apiRateLimited(message: string = "Too many requests", retryAfter?: number): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return new Response(
    JSON.stringify({ ok: false as const, error: { message, code: "RATE_LIMITED" } }),
    { status: 429, headers }
  );
}

// ── Server Errors (5xx) ──────────────────────────

export function apiUnavailable(message: string = "Service unavailable", code: string = "SERVICE_UNAVAILABLE"): Response {
  return jsonResponse({ ok: false as const, error: { message, code } }, 503);
}

/**
 * Generic error handler for catch blocks.
 * Logs the full error server-side, returns a generic message to the client.
 */
export function apiError(
  error: unknown,
  status: number = 500,
  code: string = "INTERNAL_ERROR"
): Response {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error("API error", { status, code, detail, stack: error instanceof Error ? error.stack : undefined });

  return jsonResponse(
    { ok: false as const, error: { message: "Internal server error", code } },
    status
  );
}
