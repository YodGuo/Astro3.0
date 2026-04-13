// Notification system barrel export
export { publishNotificationEvent } from "./notification.publisher";
export type { NotificationContext } from "./queue-consumer";
export {
  NOTIFICATION_EVENTS,
  NOTIFICATION_CHANNELS,
  ADMIN_NOTIFICATION_EVENTS,
  USER_NOTIFICATION_EVENTS,
  ALL_SUBSCRIBABLE_EVENTS,
  notificationEventSchema,
  webhookEndpointSchema,
  createWebhookEndpointSchema,
  notificationSettingsSchema,
  isAdminNotificationEvent,
  isUserNotificationEvent,
  isWebhookEventType,
} from "./notification.schema";
export type {
  NotificationEvent,
  NotificationChannel,
  NotificationEventType,
  WebhookEndpoint,
  NotificationSettings,
} from "./notification.schema";
export { renderTemplate, templateKey, getAvailableVariables } from "./template-engine";
export type { NotificationTemplate } from "./template-engine";
export { isRateLimited, getRateLimitSettings } from "./rate-limiter";
export type { RateLimitConfig } from "./rate-limiter";
