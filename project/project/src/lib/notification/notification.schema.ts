import { z } from "zod";

// ── Notification Channels ────────────────────────
export const NOTIFICATION_CHANNELS = ["email", "webhook"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

// ── Notification Events ──────────────────────────
export const NOTIFICATION_EVENTS = {
  // Quote / inquiry events
  QUOTE_CREATED: "quote.created",
  QUOTE_STATUS_CHANGED: "quote.status_changed",

  // Comment events
  COMMENT_CREATED: "comment.created",
  COMMENT_PENDING_REVIEW: "comment.pending_review",
  COMMENT_REPLY_RECEIVED: "comment.reply_received",

  // News / content events
  NEWS_PUBLISHED: "news.published",

  // Product events
  PRODUCT_PUBLISHED: "product.published",
} as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

// Admin events (sent to admin via email + webhook)
export const ADMIN_NOTIFICATION_EVENTS = [
  NOTIFICATION_EVENTS.QUOTE_CREATED,
  NOTIFICATION_EVENTS.COMMENT_CREATED,
  NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW,
] as const;

// User events (sent to end users via email)
export const USER_NOTIFICATION_EVENTS = [
  NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED,
  NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED,
] as const;

// All subscribable events
export const ALL_SUBSCRIBABLE_EVENTS = [
  ...ADMIN_NOTIFICATION_EVENTS,
  ...USER_NOTIFICATION_EVENTS,
  NOTIFICATION_EVENTS.NEWS_PUBLISHED,
  NOTIFICATION_EVENTS.PRODUCT_PUBLISHED,
] as const;

// ── Event Data Schemas ───────────────────────────

export const quoteCreatedDataSchema = z.object({
  to: z.string().describe("Recipient email (admin)"),
  quoteId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  company: z.string().optional(),
  product: z.string().optional(),
  message: z.string(),
  adminUrl: z.string().optional(),
});

export const quoteStatusChangedDataSchema = z.object({
  to: z.string().describe("Recipient email (customer)"),
  quoteId: z.string(),
  newStatus: z.string(),
  customerName: z.string(),
});

export const commentCreatedDataSchema = z.object({
  to: z.string().describe("Recipient email (admin)"),
  postTitle: z.string(),
  authorName: z.string(),
  commentPreview: z.string(),
  commentUrl: z.string(),
});

export const commentPendingReviewDataSchema = z.object({
  to: z.string().describe("Recipient email (admin)"),
  postTitle: z.string(),
  authorName: z.string(),
  commentPreview: z.string(),
  reviewUrl: z.string(),
});

export const commentReplyReceivedDataSchema = z.object({
  to: z.string().describe("Recipient email (original comment author)"),
  postTitle: z.string(),
  replierName: z.string(),
  replyPreview: z.string(),
  commentUrl: z.string(),
});

export const newsPublishedDataSchema = z.object({
  newsTitle: z.string(),
  newsUrl: z.string(),
  summary: z.string().optional(),
});

export const productPublishedDataSchema = z.object({
  productName: z.string(),
  productUrl: z.string(),
  summary: z.string().optional(),
});

// ── Unified Notification Event Schema ────────────

export type EventDataMap = {
  [NOTIFICATION_EVENTS.QUOTE_CREATED]: z.infer<typeof quoteCreatedDataSchema>;
  [NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED]: z.infer<typeof quoteStatusChangedDataSchema>;
  [NOTIFICATION_EVENTS.COMMENT_CREATED]: z.infer<typeof commentCreatedDataSchema>;
  [NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW]: z.infer<typeof commentPendingReviewDataSchema>;
  [NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED]: z.infer<typeof commentReplyReceivedDataSchema>;
  [NOTIFICATION_EVENTS.NEWS_PUBLISHED]: z.infer<typeof newsPublishedDataSchema>;
  [NOTIFICATION_EVENTS.PRODUCT_PUBLISHED]: z.infer<typeof productPublishedDataSchema>;
};

export const notificationEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(NOTIFICATION_EVENTS.QUOTE_CREATED), data: quoteCreatedDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED), data: quoteStatusChangedDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.COMMENT_CREATED), data: commentCreatedDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW), data: commentPendingReviewDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED), data: commentReplyReceivedDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.NEWS_PUBLISHED), data: newsPublishedDataSchema }),
  z.object({ type: z.literal(NOTIFICATION_EVENTS.PRODUCT_PUBLISHED), data: productPublishedDataSchema }),
]);

export type NotificationEvent = z.infer<typeof notificationEventSchema>;

// ── Webhook Endpoint Schema ──────────────────────

export const webhookEndpointSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  secret: z.string().min(1),
  enabled: z.boolean().default(true),
  events: z.array(z.string()).default([]),
  createdAt: z.number().optional(),
});

export type WebhookEndpoint = z.infer<typeof webhookEndpointSchema>;

export const createWebhookEndpointSchema = webhookEndpointSchema.omit({ id: true, createdAt: true });

// ── Notification Settings Schema ─────────────────

export const notificationSettingsSchema = z.object({
  admin: z.object({
    email: z.boolean().default(true),
    webhook: z.boolean().default(true),
  }).default({ email: true, webhook: true }),
  user: z.object({
    email: z.boolean().default(true),
  }).default({ email: true }),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

// ── Helpers ──────────────────────────────────────

export function isAdminNotificationEvent(event: NotificationEvent): boolean {
  return (ADMIN_NOTIFICATION_EVENTS as readonly string[]).includes(event.type);
}

export function isUserNotificationEvent(event: NotificationEvent): boolean {
  return (USER_NOTIFICATION_EVENTS as readonly string[]).includes(event.type);
}

export function isWebhookEventType(eventType: string): boolean {
  return (ALL_SUBSCRIBABLE_EVENTS as readonly string[]).includes(eventType);
}
