globalThis.process ??= {};
globalThis.process.env ??= {};
import { h as discriminatedUnion, o as object, l as literal, s as string, n as number, a as array, b as boolean } from "./sequence_IbtNAemG.mjs";
const NOTIFICATION_EVENTS = {
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
  PRODUCT_PUBLISHED: "product.published"
};
const ADMIN_NOTIFICATION_EVENTS = [
  NOTIFICATION_EVENTS.QUOTE_CREATED,
  NOTIFICATION_EVENTS.COMMENT_CREATED,
  NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW
];
const USER_NOTIFICATION_EVENTS = [
  NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED,
  NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED
];
const ALL_SUBSCRIBABLE_EVENTS = [
  ...ADMIN_NOTIFICATION_EVENTS,
  ...USER_NOTIFICATION_EVENTS,
  NOTIFICATION_EVENTS.NEWS_PUBLISHED,
  NOTIFICATION_EVENTS.PRODUCT_PUBLISHED
];
const quoteCreatedDataSchema = object({
  to: string().describe("Recipient email (admin)"),
  quoteId: string(),
  customerName: string(),
  customerEmail: string(),
  company: string().optional(),
  product: string().optional(),
  message: string(),
  adminUrl: string().optional()
});
const quoteStatusChangedDataSchema = object({
  to: string().describe("Recipient email (customer)"),
  quoteId: string(),
  newStatus: string(),
  customerName: string()
});
const commentCreatedDataSchema = object({
  to: string().describe("Recipient email (admin)"),
  postTitle: string(),
  authorName: string(),
  commentPreview: string(),
  commentUrl: string()
});
const commentPendingReviewDataSchema = object({
  to: string().describe("Recipient email (admin)"),
  postTitle: string(),
  authorName: string(),
  commentPreview: string(),
  reviewUrl: string()
});
const commentReplyReceivedDataSchema = object({
  to: string().describe("Recipient email (original comment author)"),
  postTitle: string(),
  replierName: string(),
  replyPreview: string(),
  commentUrl: string()
});
const newsPublishedDataSchema = object({
  newsTitle: string(),
  newsUrl: string(),
  summary: string().optional()
});
const productPublishedDataSchema = object({
  productName: string(),
  productUrl: string(),
  summary: string().optional()
});
const notificationEventSchema = discriminatedUnion("type", [
  object({ type: literal(NOTIFICATION_EVENTS.QUOTE_CREATED), data: quoteCreatedDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED), data: quoteStatusChangedDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.COMMENT_CREATED), data: commentCreatedDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW), data: commentPendingReviewDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED), data: commentReplyReceivedDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.NEWS_PUBLISHED), data: newsPublishedDataSchema }),
  object({ type: literal(NOTIFICATION_EVENTS.PRODUCT_PUBLISHED), data: productPublishedDataSchema })
]);
const webhookEndpointSchema = object({
  id: string(),
  name: string().min(1),
  url: string().url(),
  secret: string().min(1),
  enabled: boolean().default(true),
  events: array(string()).default([]),
  createdAt: number().optional()
});
webhookEndpointSchema.omit({ id: true, createdAt: true });
object({
  admin: object({
    email: boolean().default(true),
    webhook: boolean().default(true)
  }).default({ email: true, webhook: true }),
  user: object({
    email: boolean().default(true)
  }).default({ email: true })
});
function isAdminNotificationEvent(event) {
  return ADMIN_NOTIFICATION_EVENTS.includes(event.type);
}
function isUserNotificationEvent(event) {
  return USER_NOTIFICATION_EVENTS.includes(event.type);
}
function renderTemplate(template, data) {
  return template.replace(/\{\{\{?(\w+)\}?\}\}/g, (match, key) => {
    const isRaw = match.startsWith("{{{");
    const value = data[key];
    if (value === void 0 || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return isRaw ? String(value) : escapeHtml(String(value));
  });
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function templateKey(eventType) {
  return `template:${eventType}`;
}
function getAvailableVariables(eventType) {
  const vars = {
    "quote.created": ["customerName", "customerEmail", "company", "product", "message", "quoteId", "adminUrl"],
    "quote.status_changed": ["customerName", "quoteId", "newStatus"],
    "comment.created": ["authorName", "postTitle", "commentPreview", "commentUrl"],
    "comment.pending_review": ["authorName", "postTitle", "commentPreview", "reviewUrl"],
    "comment.reply_received": ["replierName", "postTitle", "replyPreview", "commentUrl"],
    "news.published": ["newsTitle", "newsUrl", "summary"],
    "product.published": ["productName", "productUrl", "summary"]
  };
  return vars[eventType] || [];
}
export {
  ALL_SUBSCRIBABLE_EVENTS as A,
  NOTIFICATION_EVENTS as N,
  isAdminNotificationEvent as a,
  escapeHtml as e,
  getAvailableVariables as g,
  isUserNotificationEvent as i,
  notificationEventSchema as n,
  renderTemplate as r,
  templateKey as t
};
