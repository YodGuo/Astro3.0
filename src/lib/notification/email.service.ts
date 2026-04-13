import { Resend } from "resend";
import type { NotificationEvent } from "./notification.schema";
import { NOTIFICATION_EVENTS } from "./notification.schema";
import type { NotificationContext } from "./queue-consumer";
import { renderTemplate, escapeHtml, type NotificationTemplate } from "./template-engine";
import { logger } from "../logger";

// ── Email Config ─────────────────────────────────

export interface EmailConfig {
  apiUrl?: string;
  apiKey?: string;
  senderName?: string;
  senderAddress?: string;
}

// ── Email Message ────────────────────────────────

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

// ── HTML Email Layout ────────────────────────────

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#065f46;padding:24px 32px;">
              <h1 style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">B2B Website</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This is an automated notification from B2B Website.
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Event → Email Mapping ────────────────────────

function mapEventToEmail(event: NotificationEvent): EmailMessage | null {
  const data = event.data as Record<string, unknown>;

  switch (event.type) {
    case NOTIFICATION_EVENTS.QUOTE_CREATED:
      return {
        to: data.to as string,
        subject: `[New Inquiry] from ${escapeHtml(String(data.customerName ?? ''))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Inquiry Received</h2>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml(String(data.customerName ?? ''))}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml(String(data.customerEmail ?? ''))}</td></tr>
            ${data.company ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Company</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml(String(data.company))}</td></tr>` : ""}
            ${data.product ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Product</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml(String(data.product))}</td></tr>` : ""}
          </table>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml(String(data.message ?? ''))}</p>
          </div>
          ${data.adminUrl ? `<a href="${escapeHtml(String(data.adminUrl))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View in Admin Panel</a>` : ""}
        `),
      };

    case NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED:
      return {
        to: data.to as string,
        subject: `[Update] Your inquiry status has changed`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Inquiry Status Update</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;">Dear ${escapeHtml(String(data.customerName ?? ''))},</p>
          <p style="margin:0 0 8px;font-size:14px;color:#374151;">Your inquiry <strong>#${escapeHtml(String(data.quoteId ?? ''))}</strong> status has been updated to:</p>
          <div style="display:inline-block;padding:6px 16px;background-color:#d1fae5;color:#065f46;border-radius:9999px;font-size:14px;font-weight:600;margin-bottom:20px;">${escapeHtml(String(data.newStatus ?? ''))}</div>
        `),
      };

    case NOTIFICATION_EVENTS.COMMENT_CREATED:
      return {
        to: data.to as string,
        subject: `[New Comment] on "${escapeHtml(String(data.postTitle ?? ''))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Comment</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml(String(data.authorName ?? ''))}</strong> commented on "${escapeHtml(String(data.postTitle ?? ''))}":</p>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(String(data.commentPreview ?? ''))}</p>
          </div>
          <a href="${escapeHtml(String(data.commentUrl ?? ''))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Comment</a>
        `),
      };

    case NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW:
      return {
        to: data.to as string,
        subject: `[Review Required] New comment on "${escapeHtml(String(data.postTitle ?? ''))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Comment Awaiting Review</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml(String(data.authorName ?? ''))}</strong> submitted a comment on "${escapeHtml(String(data.postTitle ?? ''))}":</p>
          <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">${escapeHtml(String(data.commentPreview ?? ''))}</p>
          </div>
          <a href="${escapeHtml(String(data.reviewUrl ?? ''))}" style="display:inline-block;padding:10px 20px;background-color:#f59e0b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Review in Admin Panel</a>
        `),
      };

    case NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED:
      return {
        to: data.to as string,
        subject: `[Reply] ${escapeHtml(String(data.replierName ?? ''))} replied to your comment on "${escapeHtml(String(data.postTitle ?? ''))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Reply to Your Comment</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml(String(data.replierName ?? ''))}</strong> replied:</p>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(String(data.replyPreview ?? ''))}</p>
          </div>
          <a href="${escapeHtml(String(data.commentUrl ?? ''))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Reply</a>
        `),
      };

    case NOTIFICATION_EVENTS.NEWS_PUBLISHED:
      return {
        to: "",
        subject: `[News] ${escapeHtml(String(data.newsTitle ?? ''))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(String(data.newsTitle ?? ''))}</h2>
          ${data.summary ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(String(data.summary))}</p>` : ""}
          <a href="${escapeHtml(String(data.newsUrl ?? ''))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Read More</a>
        `),
      };

    case NOTIFICATION_EVENTS.PRODUCT_PUBLISHED:
      return {
        to: "",
        subject: `[Product] ${escapeHtml(String(data.productName ?? ''))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(String(data.productName ?? ''))}</h2>
          ${data.summary ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(String(data.summary))}</p>` : ""}
          <a href="${escapeHtml(String(data.productUrl ?? ''))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Product</a>
        `),
      };

    default:
      return null;
  }
}

// ── Resend Client Singleton ──────────────────────

let resendClient: Resend | null = null;

function getResendClient(apiKey: string): Resend {
  if (!resendClient || (resendClient as any)._apiKey !== apiKey) { // eslint-disable-line @typescript-eslint/no-explicit-any -- Resend SDK internal API
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// ── Send Email ───────────────────────────────────

/**
 * Send an email notification via Resend.
 *
 * Priority order for configuration:
 *   1. Environment variable RESEND_API_KEY (recommended for production)
 *   2. Channel config from database (admin settings UI)
 *   3. Console log fallback (development)
 */
export async function sendEmailNotification(
  ctx: NotificationContext,
  event: NotificationEvent,
  channelConfig: Record<string, unknown>,
  recipient?: string,
  customTemplate?: NotificationTemplate | null
): Promise<void> {
  const data = event.data as Record<string, unknown>;
  const defaultEmail = mapEventToEmail(event);

  // Use custom template if provided, otherwise fall back to default
  let subject: string;
  let html: string;

  if (customTemplate?.subject || customTemplate?.body) {
    subject = customTemplate.subject
      ? renderTemplate(customTemplate.subject, data)
      : (defaultEmail?.subject || event.type);
    const rawBody = customTemplate.body || "";
    html = rawBody
      ? emailLayout(renderTemplate(rawBody, data))
      : (defaultEmail?.html || "");
  } else if (defaultEmail) {
    subject = defaultEmail.subject;
    html = defaultEmail.html;
  } else {
    logger.info("No email template for event type", { eventType: event.type });
    return;
  }

  const to = recipient || defaultEmail?.to || "";
  if (!to) {
    logger.info("No email recipient specified, skipping");
    return;
  }

  // Determine API key: env var > channel config
  const envApiKey = (ctx.env?.RESEND_API_KEY as string) || "";
  const config = channelConfig as EmailConfig;
  const apiKey = envApiKey || config.apiKey || "";

  // Determine sender: env var > channel config > default
  const envFrom = (ctx.env?.EMAIL_FROM as string) || "";
  const fromAddress = envFrom || config.senderAddress || "onboarding@resend.dev";
  const fromName = config.senderName || "B2B Website";
  const from = `${fromName} <${fromAddress}>`;

  // No API key → development mode
  if (!apiKey) {
    logger.info("Email dev mode (no API key)", { to, from, subject });
    return;
  }

  // Send via Resend SDK
  try {
    const resend = getResendClient(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      throw new Error(`Resend error: ${error.name} — ${error.message}`);
    }

    logger.info("Email sent", { to, emailId: data?.id });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to send email: ${errorMsg}`, { cause: error });
  }
}
