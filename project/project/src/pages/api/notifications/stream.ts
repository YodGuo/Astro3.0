import type { APIRoute } from "astro";
import { requireAdmin, AuthError } from "../../../lib/auth-guard";
import { getEnv } from "../../../lib/env";
import { apiError, apiSuccess, apiUnauthorized, apiForbidden } from "../../../lib/api-response";

export const prerender = false;

const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Cloudflare free tier limit)

// ── Global Connection Pool ───────────────────────
// Module-level Set persists across requests within the same isolate.
// Each entry is a controller that can push data to a connected SSE client.
//
// ⚠️ CROSS-ISOLATE LIMITATION (EDGE-01):
// Cloudflare Workers may spawn multiple isolates. This Set is per-isolate,
// so SSE connections in one isolate are NOT visible to POST requests in
// another isolate. This means notifications may not be pushed via SSE when
// the queue consumer runs in a different isolate than the SSE connection.
//
// MITIGATION: The client (AdminLayout.astro) has an automatic polling
// fallback that activates when SSE fails. The polling endpoint
// (/api/notifications/latest?since=<logId>) reads from D1 notification_logs,
// which is shared across all isolates. This ensures notifications are
// eventually delivered even when SSE push fails.
//
// FUTURE: Migrate to Durable Object (NotificationHub) once @astrojs/cloudflare
// supports custom entrypoint exports for DO classes.
// See: https://github.com/withastro/astro/pull/13837
// The DO class is already implemented at src/lib/notification/notification-hub.ts.

interface ClientConnection {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

const connectedClients = new Set<ClientConnection>();

// Keepalive timer: sends comment to prevent connection timeout
let keepaliveTimer: ReturnType<typeof setInterval> | null = null;

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

// ── SSE Helpers ──────────────────────────────────

function sendSSEEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: Record<string, unknown>, eventId: string) {
  const lines = [
    `id: ${eventId}`,
    `event: notification`,
    `data: ${JSON.stringify(data)}`,
    "",
    "",
  ];
  controller.enqueue(encoder.encode(lines.join("\n")));
}

// ── GET: Client SSE Connection ───────────────────
// EventSource('/api/notifications/stream')
export const GET: APIRoute = async ({ request, locals }) => {
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

  // Check if SSE is enabled (read from notification_settings)
  const env = await getEnv();
  const d1 = env.DB;
  if (d1) {
    try {
      const row = await d1
        .prepare("SELECT value FROM notification_settings WHERE key = 'sse_enabled'")
        .first() as { value: string } | null;
      if (row) {
        const parsed = JSON.parse(row.value);
        if (parsed.enabled === false) {
          return new Response("SSE is disabled", { status: 503 });
        }
      }
    } catch { /* ignore: if we can't read settings, allow connection */ }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const client: ClientConnection = { controller, encoder };
      connectedClients.add(client);
      ensureKeepalive();

      // Send initial connection confirmation
      controller.enqueue(encoder.encode(": connected\n\n"));

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        connectedClients.delete(client);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  // Derive allowed origin from site URL to prevent cross-domain SSE access.
  // Never use "*" with Allow-Credentials (browsers reject this combination).
  const siteUrl = (env.BETTER_AUTH_URL as string) || "";
  let allowedOrigin: string;

  if (siteUrl) {
    try {
      allowedOrigin = new URL(siteUrl).origin;
    } catch {
      allowedOrigin = "";
    }
  } else {
    // Fallback: derive from request Origin or host
    allowedOrigin = request.headers.get("Origin") || "";
    if (!allowedOrigin) {
      allowedOrigin = request.headers.get("X-Forwarded-Host")
        ? `${request.headers.get("X-Forwarded-Proto") || "https"}://${request.headers.get("X-Forwarded-Host")}`
        : new URL(request.url).origin;
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
      "X-Accel-Buffering": "no",
    },
  });
};

// ── POST: Internal Broadcast (called by Queue Consumer) ──
// POST /api/notifications/stream
// Body: { eventType, data, logId, status, channelType, recipient, errorMessage }
export const POST: APIRoute = async ({ request, locals }) => {
  requireAdmin(locals);
  try {
    const body = await request.json() as Record<string, unknown>;

    // Check toast preferences: skip events that admin has disabled
    const env = await getEnv();
    const d1 = env.DB;
    if (d1 && body.eventType) {
      try {
        const row = await d1
          .prepare("SELECT value FROM notification_settings WHERE key = 'toast_preferences'")
          .first() as { value: string } | null;
        if (row) {
          const prefs = JSON.parse(row.value) as Record<string, boolean>;
          if (prefs[body.eventType as string] === false) {
            return apiSuccess({ ok: true, clients: 0, skipped: true });
          }
        }
      } catch { /* ignore: broadcast all if prefs can't be read */ }
    }

    if (connectedClients.size === 0) {
      return apiSuccess({ ok: true, clients: 0 });
    }

    const eventId = (body.logId as string) || String(Date.now());
    let sent = 0;

    for (const client of connectedClients) {
      try {
        sendSSEEvent(client.controller, client.encoder, body as Record<string, unknown>, eventId);
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
