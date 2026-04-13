/**
 * NotificationHub — Durable Object for SSE connection management.
 *
 * Replaces the module-level `Set<ClientConnection>` with a stateful
 * Durable Object that survives across Worker isolates and provides
 * a single coordination point for SSE broadcasting.
 *
 * Architecture:
 *   - GET /api/notifications/stream → Worker fetches DO → DO accepts SSE connection
 *   - Queue consumer → Worker fetches DO → DO broadcasts to all connected clients
 *
 * The DO uses a single ID ("global") so all clients connect to the same instance.
 */

interface ClientConnection {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
}

export class NotificationHub {
  private state: DurableObjectState;
  private clients: Set<ClientConnection> = new Set();
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;

  // 10 minutes — Cloudflare free tier subrequest limit
  private static readonly KEEPALIVE_MS = 10 * 60 * 1000;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  private ensureKeepalive(): void {
    if (this.keepaliveTimer) return;
    this.keepaliveTimer = setInterval(() => {
      const msg = ": keepalive\n\n";
      for (const client of this.clients) {
        try {
          client.controller.enqueue(client.encoder.encode(msg));
        } catch {
          this.clients.delete(client);
        }
      }
      if (this.clients.size === 0 && this.keepaliveTimer) {
        clearInterval(this.keepaliveTimer);
        this.keepaliveTimer = null;
      }
    }, NotificationHub.KEEPALIVE_MS);
  }

  private sendSSEEvent(
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder,
    data: Record<string, unknown>,
    eventId: string
  ): void {
    const lines = [
      `id: ${eventId}`,
      `event: notification`,
      `data: ${JSON.stringify(data)}`,
      "",
      "",
    ];
    controller.enqueue(encoder.encode(lines.join("\n")));
  }

  /**
   * Handle incoming requests to the Durable Object.
   *
   * - GET  → Accept a new SSE connection (streaming response)
   * - POST → Broadcast a notification event to all connected clients
   * - DELETE → Return connection count (health check)
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    switch (request.method) {
      case "GET":
        return this.handleConnect(request);
      case "POST":
        return this.handleBroadcast(request);
      case "DELETE":
        return new Response(
          JSON.stringify({ clients: this.clients.size }),
          { headers: { "Content-Type": "application/json" } }
        );
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  }

  /**
   * Accept a new SSE client connection.
   * Returns a streaming Response that stays open until the client disconnects.
   */
  private handleConnect(request: Request): Response {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start: (controller) => {
        const client: ClientConnection = { controller, encoder };
        this.clients.add(client);
        this.ensureKeepalive();

        // Send initial connection confirmation
        controller.enqueue(encoder.encode(": connected\n\n"));

        // Clean up on disconnect
        request.signal.addEventListener("abort", () => {
          this.clients.delete(client);
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  /**
   * Broadcast a notification event to all connected SSE clients.
   * Body: { eventType, data, logId, status, channelType, recipient, errorMessage }
   */
  private async handleBroadcast(request: Request): Promise<Response> {
    try {
      const body = (await request.json()) as Record<string, unknown>;

      if (this.clients.size === 0) {
        return new Response(
          JSON.stringify({ ok: true, clients: 0 }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const eventId = (body.logId as string) || String(Date.now());
      let sent = 0;

      for (const client of this.clients) {
        try {
          this.sendSSEEvent(client.controller, client.encoder, body, eventId);
          sent++;
        } catch {
          this.clients.delete(client);
        }
      }

      return new Response(
        JSON.stringify({ ok: true, clients: sent }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch {
      return new Response(
        JSON.stringify({ ok: false, clients: 0, error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}
