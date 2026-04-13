globalThis.process ??= {};
globalThis.process.env ??= {};
import { l as logger } from "./logger_CoNHAtH6.mjs";
function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function apiSuccess(data, status = 200) {
  return jsonResponse({ ok: true, data }, status);
}
function apiBadRequest(message, code = "VALIDATION_ERROR") {
  return jsonResponse({ ok: false, error: { message, code } }, 400);
}
function apiUnauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
  return jsonResponse({ ok: false, error: { message, code } }, 401);
}
function apiForbidden(message = "Insufficient permissions", code = "FORBIDDEN") {
  return jsonResponse({ ok: false, error: { message, code } }, 403);
}
function apiNotFound(resource = "Resource", code = "NOT_FOUND") {
  return jsonResponse({ ok: false, error: { message: `${resource} not found`, code } }, 404);
}
function apiUnavailable(message = "Service unavailable", code = "SERVICE_UNAVAILABLE") {
  return jsonResponse({ ok: false, error: { message, code } }, 503);
}
function apiError(error, status = 500, code = "INTERNAL_ERROR") {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error("API error", { status, code, detail, stack: error instanceof Error ? error.stack : void 0 });
  return jsonResponse(
    { ok: false, error: { message: "Internal server error", code } },
    status
  );
}
export {
  apiBadRequest as a,
  apiUnavailable as b,
  apiNotFound as c,
  apiSuccess as d,
  apiError as e,
  apiUnauthorized as f,
  apiForbidden as g
};
