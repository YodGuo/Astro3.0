// ── Template Engine ──────────────────────────────
//
// Simple {{variable}} template replacement.
// Variables are HTML-escaped for safety in email contexts.
// Use {{{variable}}} for unescaped output (e.g., pre-built HTML blocks).

/**
 * Render a template string by replacing {{variable}} placeholders.
 *
 * Syntax:
 *   {{name}}     → HTML-escaped value
 *   {{{html}}}   → Raw unescaped value
 *
 * @param template - Template string with {{variable}} placeholders
 * @param data - Key-value data object
 * @returns Rendered string
 */
export function renderTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  return template.replace(/\{\{\{?(\w+)\}?\}\}/g, (match, key: string) => {
    const isRaw = match.startsWith("{{{");
    const value = data[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return isRaw ? String(value) : escapeHtml(String(value));
  });
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Template Storage Helpers ─────────────────────

export interface NotificationTemplate {
  subject?: string;   // Email subject (email only)
  body?: string;      // Email HTML body OR webhook text
  title?: string;     // Webhook title (webhook only)
  text?: string;      // Webhook body text (webhook only)
}

/**
 * Build the settings key for a template.
 * Example: "template:quote.created"
 */
export function templateKey(eventType: string): string {
  return `template:${eventType}`;
}

/**
 * Extract available variables from event data for documentation.
 */
export function getAvailableVariables(eventType: string): string[] {
  const vars: Record<string, string[]> = {
    "quote.created": ["customerName", "customerEmail", "company", "product", "message", "quoteId", "adminUrl"],
    "quote.status_changed": ["customerName", "quoteId", "newStatus"],
    "comment.created": ["authorName", "postTitle", "commentPreview", "commentUrl"],
    "comment.pending_review": ["authorName", "postTitle", "commentPreview", "reviewUrl"],
    "comment.reply_received": ["replierName", "postTitle", "replyPreview", "commentUrl"],
    "news.published": ["newsTitle", "newsUrl", "summary"],
    "product.published": ["productName", "productUrl", "summary"],
  };
  return vars[eventType] || [];
}
