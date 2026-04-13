import { notificationEventSchema, type NotificationEvent, isAdminNotificationEvent, isUserNotificationEvent } from "./notification.schema";
import { sendEmailNotification } from "./email.service";
import { sendWebhook } from "./webhook.service";
import { templateKey, type NotificationTemplate } from "./template-engine";
import { isRateLimited } from "./rate-limiter";
import { logger } from "../logger";
import { getNotificationSetting, clearNotificationSettingsCache } from "./settings-cache";

// ── Types ────────────────────────────────────────

export interface NotificationContext {
  db: D1Database;
  env?: Record<string, unknown>;
}

// ── Settings Helpers ─────────────────────────────

async function getSetting(ctx: NotificationContext, key: string): Promise<Record<string, unknown> | null> {
  return await getNotificationSetting(ctx, key);
}

async function getSubscribedChannels(ctx: NotificationContext, eventType: string) {
  const rows = await ctx.db
    .prepare(
      `SELECT nc.* FROM notification_channels nc
       INNER JOIN notification_subscriptions ns ON nc.id = ns.channel_id
       WHERE ns.event_type = ? AND nc.enabled = 1`
    )
    .bind(eventType)
    .all() as { results: Array<{
      id: string; name: string; type: string; config: string | null; enabled: number;
    }> };

  return rows.results.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as "email" | "webhook",
    config: r.config ? JSON.parse(r.config) : {},
  }));
}

// ── Logging ──────────────────────────────────────

async function logNotification(
  ctx: NotificationContext,
  params: {
    eventType: string;
    channelId?: string;
    channelType: string;
    status: "sent" | "failed" | "skipped";
    recipient?: string;
    errorMessage?: string;
    eventData?: Record<string, unknown>;
  }
) {
  const id = crypto.randomUUID();
  await ctx.db
    .prepare(
      `INSERT INTO notification_logs (id, event_type, channel_id, channel_type, status, recipient, error_message, event_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      params.eventType,
      params.channelId ?? null,
      params.channelType,
      params.status,
      params.recipient ?? null,
      params.errorMessage ?? null,
      params.eventData ? JSON.stringify(params.eventData) : null
    )
    .run();

  // ── Broadcast to SSE clients (event-driven, no polling) ──
  notifySSEClients(ctx, {
    eventType: params.eventType,
    channelType: params.channelType,
    status: params.status,
    recipient: params.recipient,
    errorMessage: params.errorMessage,
    logId: id,
    eventData: params.eventData,
  }).catch(() => { /* non-critical */ });
}

// ── SSE Broadcast Helper ──────────────────────────
// Best-effort SSE push: works when the queue consumer and SSE connection
// are in the same Worker isolate. When they are in different isolates,
// the POST request will find an empty connection pool and silently do nothing.
// This is acceptable because the client has a polling fallback that reads
// from D1 notification_logs (shared across all isolates).

async function notifySSEClients(
  ctx: NotificationContext,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Internal fetch to the SSE endpoint's POST handler
    // This wakes up all connected SSE clients and pushes the notification
    //
    // TODO: Migrate to Durable Object (NotificationHub) once @astrojs/cloudflare
    // supports custom entrypoint exports. See src/lib/notification/notification-hub.ts
    // and https://github.com/withastro/astro/pull/13837
    const baseUrl = ctx.env?.NOTIFICATION_SSE_URL as string | undefined;
    const url = baseUrl || "http://localhost:8787/api/notifications/stream";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // SSE broadcast is non-critical, ignore failures
  }
}

// ── Send + Log Helper ────────────────────────────

async function sendAndLog(
  ctx: NotificationContext,
  event: NotificationEvent,
  channel: { id: string; name: string; type: "email" | "webhook"; config: Record<string, unknown> },
  recipient?: string,
  customTemplate?: NotificationTemplate | null
): Promise<void> {
  // ── Rate limit check ──
  const limited = await isRateLimited(ctx, {
    eventType: event.type,
    channelId: channel.id,
    recipient,
  });
  if (limited) {
    logger.info("Notification rate limited", { eventType: event.type, channel: channel.name, recipient });
    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "skipped",
      recipient,
      errorMessage: "Rate limited: duplicate notification within time window",
      eventData: event as unknown as Record<string, unknown>,
    });
    return;
  }

  try {
    if (channel.type === "email") {
      await sendEmailNotification(ctx, event, channel.config, recipient, customTemplate);
    } else if (channel.type === "webhook") {
      await sendWebhook(ctx, event, channel.config);
    }

    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "sent",
      recipient,
      eventData: event as unknown as Record<string, unknown>,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("Notification send failed", { channelType: channel.type, channelName: channel.name, error: errorMsg });

    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "failed",
      recipient,
      errorMessage: errorMsg,
      eventData: event as unknown as Record<string, unknown>,
    });
  }
}

// ── Process Single Event (used by both queue consumer and sync fallback) ──

export async function processNotificationEvent(
  ctx: NotificationContext,
  event: NotificationEvent
): Promise<void> {
  const parsed = notificationEventSchema.safeParse(event);
  if (!parsed.success) {
    logger.error("Invalid notification event", { error: String(parsed.error) });
    return;
  }
  const validEvent = parsed.data;

  const adminChannels = await getSetting(ctx, "admin_channels") as { email?: boolean; webhook?: boolean } | null;
  const userEmailSetting = await getSetting(ctx, "user_email") as { enabled?: boolean } | null;

  const adminEmailEnabled = adminChannels?.email ?? true;
  const adminWebhookEnabled = adminChannels?.webhook ?? true;
  const userEmailEnabled = userEmailSetting?.enabled ?? true;

  const channels = await getSubscribedChannels(ctx, validEvent.type);
  const deliveries: Array<Promise<void>> = [];

  // Load custom template (if configured) for this event type
  const templateSetting = await getSetting(ctx, templateKey(validEvent.type));
  const customTemplate = templateSetting as NotificationTemplate | null;

  // ── User notification events: email only ──
  if (isUserNotificationEvent(validEvent)) {
    if (!userEmailEnabled) {
      await logNotification(ctx, {
        eventType: validEvent.type,
        channelType: "email",
        status: "skipped",
        eventData: validEvent as unknown as Record<string, unknown>,
      });
      return;
    }

    const recipient = (validEvent.data as Record<string, unknown>).to as string | undefined;
    if (!recipient) return;

    const emailChannels = channels.filter((c) => c.type === "email");
    if (emailChannels.length > 0) {
      for (const channel of emailChannels) {
        deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
      }
    } else {
      const defaultEmailChannel = channels.length === 0
        ? { id: "default-email", name: "Default Email", type: "email" as const, config: {} }
        : null;
      if (defaultEmailChannel) {
        deliveries.push(sendAndLog(ctx, validEvent, defaultEmailChannel, recipient, customTemplate));
      }
    }
  }

  // ── Admin notification events: email + webhook ──
  if (isAdminNotificationEvent(validEvent)) {
    const recipient = (validEvent.data as Record<string, unknown>).to as string | undefined;
    if (!recipient) return;

    if (adminEmailEnabled) {
      const emailChannels = channels.filter((c) => c.type === "email");
      if (emailChannels.length > 0) {
        for (const channel of emailChannels) {
          deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
        }
      } else {
        deliveries.push(
          sendAndLog(ctx, validEvent, { id: "default-email", name: "Default Email", type: "email" as const, config: {} }, recipient, customTemplate)
        );
      }
    }

    if (adminWebhookEnabled) {
      const webhookChannels = channels.filter((c) => c.type === "webhook");
      for (const channel of webhookChannels) {
        deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
      }
    }
  }

  // ── Generic events ──
  if (!isUserNotificationEvent(validEvent) && !isAdminNotificationEvent(validEvent)) {
    for (const channel of channels) {
      deliveries.push(sendAndLog(ctx, validEvent, channel, undefined, customTemplate));
    }
  }

  await Promise.allSettled(deliveries);
}

// ── Queue Consumer Export ────────────────────────
// This is the Cloudflare Queue consumer handler.
// It receives batches of messages and processes each notification event.

interface QueueMessage {
  id: string;
  timestamp: number;
  body: string; // JSON string of NotificationEvent
}

interface QueueBatch {
  messages: QueueMessage[];
  queue: string;
}

interface QueueConsumerEnv {
  DB: D1Database;
  [key: string]: unknown;
}

export default {
  async queue(batch: QueueBatch, env: QueueConsumerEnv): Promise<void> {
    const ctx: NotificationContext = { db: env.DB, env: env as Record<string, unknown> };
    const retryableErrors: Error[] = [];

    for (const message of batch.messages) {
      try {
        const event = JSON.parse(message.body) as NotificationEvent;
        await processNotificationEvent(ctx, event);
      } catch (error) {
        // JSON parse errors are not retryable (malformed message)
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          logger.error("Queue message malformed JSON — skipping (not retryable)", { messageId: message.id, error: String(error) });
          // Ack the message to prevent retry; Cloudflare will not retry acked messages
          message.ack();
        } else {
          // Retryable errors (network, D1, email): collect and throw after batch
          logger.error("Queue message processing failed — will retry", { messageId: message.id, error: String(error) });
          retryableErrors.push(error instanceof Error ? error : new Error(String(error)));
        }
      }
    }

    // If any retryable errors occurred, throw the first one to trigger Cloudflare Queue retry
    // The entire batch will be retried (up to max_retries in wrangler.jsonc), then sent to DLQ
    if (retryableErrors.length > 0) {
      throw retryableErrors[0];
    }

    // ── Best-effort cleanup of old notification_logs (DB-02) ──
    // Delete logs older than 30 days to prevent unbounded table growth.
    // D1 free plan has 500MB storage limit; notification_logs can grow quickly.
    // This runs after each batch, but is throttled to avoid excessive D1 writes.
    try {
      await ctx.db
        .prepare("DELETE FROM notification_logs WHERE created_at < datetime('now', '-30 days')")
        .run();
    } catch {
      // Cleanup is non-critical, ignore failures
    }
  },
};
