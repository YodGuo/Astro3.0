globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as requireAdmin, A as AuthError } from "./auth-guard_B5bfjxXB.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { f as apiUnauthorized, g as apiForbidden, d as apiSuccess, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1e3;
const connectedClients = /* @__PURE__ */ new Set();
let keepaliveTimer = null;
function ensureKeepalive() {
  if (keepaliveTimer) return;
  keepaliveTimer = setInterval(() => {
    const msg = ": keepalive\n\n";
    for (const client of connectedClients) {
      try {
        client.controller.enqueue(client.encoder.encode(msg));
      } catch {
        connectedClients.delete(client);
      }
    }
    if (connectedClients.size === 0 && keepaliveTimer) {
      clearInterval(keepaliveTimer);
      keepaliveTimer = null;
    }
  }, KEEPALIVE_INTERVAL_MS);
}
function sendSSEEvent(controller, encoder, data, eventId) {
  const lines = [
    `id: ${eventId}`,
    `event: notification`,
    `data: ${JSON.stringify(data)}`,
    "",
    ""
  ];
  controller.enqueue(encoder.encode(lines.join("\n")));
}
const GET = async ({ request, locals }) => {
  try {
    requireAdmin(locals);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.status === 401) return apiUnauthorized(e.message);
      return apiForbidden(e.message);
    }
    throw e;
  }
  const accept = request.headers.get("Accept") || "";
  if (!accept.includes("text/event-stream")) {
    return new Response("Expected EventSource client", { status: 400 });
  }
  const env = await getEnv();
  const d1 = env.DB;
  if (d1) {
    try {
      const row = await d1.prepare("SELECT value FROM notification_settings WHERE key = 'sse_enabled'").first();
      if (row) {
        const parsed = JSON.parse(row.value);
        if (parsed.enabled === false) {
          return new Response("SSE is disabled", { status: 503 });
        }
      }
    } catch {
    }
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const client = { controller, encoder };
      connectedClients.add(client);
      ensureKeepalive();
      controller.enqueue(encoder.encode(": connected\n\n"));
      request.signal.addEventListener("abort", () => {
        connectedClients.delete(client);
        try {
          controller.close();
        } catch {
        }
      });
    }
  });
  const siteUrl = env.BETTER_AUTH_URL || "";
  let allowedOrigin;
  if (siteUrl) {
    try {
      allowedOrigin = new URL(siteUrl).origin;
    } catch {
      allowedOrigin = "";
    }
  } else {
    allowedOrigin = request.headers.get("Origin") || "";
    if (!allowedOrigin) {
      allowedOrigin = request.headers.get("X-Forwarded-Host") ? `${request.headers.get("X-Forwarded-Proto") || "https"}://${request.headers.get("X-Forwarded-Host")}` : new URL(request.url).origin;
    }
  }
  if (!allowedOrigin) {
    return new Response("Forbidden: unable to determine allowed origin", { status: 403 });
  }
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "X-Accel-Buffering": "no"
    }
  });
};
const POST = async ({ request, locals }) => {
  requireAdmin(locals);
  try {
    const body = await request.json();
    const env = await getEnv();
    const d1 = env.DB;
    if (d1 && body.eventType) {
      try {
        const row = await d1.prepare("SELECT value FROM notification_settings WHERE key = 'toast_preferences'").first();
        if (row) {
          const prefs = JSON.parse(row.value);
          if (prefs[body.eventType] === false) {
            return apiSuccess({ ok: true, clients: 0, skipped: true });
          }
        }
      } catch {
      }
    }
    if (connectedClients.size === 0) {
      return apiSuccess({ ok: true, clients: 0 });
    }
    const eventId = body.logId || String(Date.now());
    let sent = 0;
    for (const client of connectedClients) {
      try {
        sendSSEEvent(client.controller, client.encoder, body, eventId);
        sent++;
      } catch {
        connectedClients.delete(client);
      }
    }
    return apiSuccess({ ok: true, clients: sent });
  } catch (e) {
    return apiError(e);
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
