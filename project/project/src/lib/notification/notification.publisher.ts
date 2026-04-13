import { notificationEventSchema, type NotificationEvent } from "./notification.schema";
import { processNotificationEvent, type NotificationContext } from "./queue-consumer";
import { logger } from "../logger";

// Re-export for backward compatibility
export type { NotificationContext } from "./queue-consumer";

// ── Queue Message Type ───────────────────────────

interface QueueProducer {
  send(message: unknown, options?: { contentType?: string; delaySeconds?: number }): Promise<void>;
}

// ── Core Publisher ───────────────────────────────

/**
 * Publish a notification event.
 *
 * In production (Cloudflare Workers with Queue): enqueues the event for async processing.
 * Falls back to synchronous processing if Queue is not available (local dev).
 *
 * This is the main entry point — all business APIs call this function.
 * It is non-blocking and fire-and-forget safe.
 */
export async function publishNotificationEvent(
  ctx: NotificationContext,
  event: NotificationEvent
): Promise<void> {
  // Validate event schema
  const parsed = notificationEventSchema.safeParse(event);
  if (!parsed.success) {
    logger.error("Invalid notification event", { error: String(parsed.error) });
    return;
  }

  // Try async queue delivery first
  const queue = ctx.env?.NOTIFICATION_QUEUE as QueueProducer | undefined;
  if (queue) {
    try {
      await queue.send(JSON.stringify(parsed.data), { contentType: "application/json" });
      return;
    } catch (error) {
      logger.warn("Queue send failed, falling back to sync", { error: String(error) });
      // Fall through to sync processing
    }
  }

  // Fallback: synchronous processing (local dev or queue unavailable)
  await processNotificationEvent(ctx, parsed.data);
}
