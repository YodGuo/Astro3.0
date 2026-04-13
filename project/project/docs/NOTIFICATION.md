# Notification System

## Architecture Overview

```
Business API (POST/PUT)
  └→ publishNotificationEvent(event)
       ├→ [Production] Cloudflare Queue → async consumer → email / webhook
       │                                                  └→ SSE broadcast → admin toast
       └→ [Development] Sync fallback → email / webhook
```

- **Producer**: Business APIs call `publishNotificationEvent()` — a lightweight enqueue operation that never blocks the API response.
- **Consumer**: A Cloudflare Queue consumer (`queue-consumer.ts`) processes messages asynchronously, reads channel subscriptions from D1, and dispatches to email/webhook.
- **Real-time Push**: After each delivery, the consumer calls the SSE endpoint's POST handler to push notifications to all connected admin clients via Server-Sent Events (event-driven, no polling).
- **Fallback**: When the Queue binding is unavailable (local development), the system falls back to synchronous processing automatically.

---

## Quick Start

### 1. Enable Email (Resend)

```bash
# Set Resend API key as a Cloudflare secret
npx wrangler secret put RESEND_API_KEY
# Enter: re_xxxxxxxxxxxx

# (Optional) Override sender address
npx wrangler secret put EMAIL_FROM
# Enter: B2B Website <noreply@yourcompany.com>
```

Get an API key at [resend.com/api-keys](https://resend.com/api-keys). Verify your sender domain in the Resend dashboard.

### 2. Add a Webhook Channel

Go to **Admin → Settings → Notification Channels → Add Channel**:

| Platform | URL Format | Secret |
|----------|-----------|--------|
| Slack | `https://hooks.slack.com/services/T.../B.../xxx` | Slack signing secret |
| Discord | `https://discord.com/api/webhooks/xxx/yyy` | Not needed (in URL) |
| WeCom | `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx` | Not needed (in URL) |
| Generic | Any HTTP endpoint | Optional HMAC secret |

### 3. Subscribe Channels to Events

When creating or editing a channel, select which event types to receive. See [Event Reference](#event-reference) below.

### 4. Enable Real-time Toasts (Optional)

Go to **Admin → Settings → Notification Channels → Global Notification Toggles**:

1. Enable **Real-time Toast Notifications (SSE)**
2. Configure **Toast Event Preferences** to choose which event types trigger popups
3. Refresh the admin page — toasts will appear in the top-right corner

> **Default: OFF**. SSE is disabled by default to avoid unnecessary resource usage. Enable it only when you want live popup alerts.

---

## Event Reference

### 7 Event Types

| Event | Trigger | Recipient | Channel |
|-------|---------|-----------|---------|
| `quote.created` | New inquiry submitted | Admin | Email + Webhook |
| `quote.status_changed` | Inquiry status updated | Customer | Email |
| `comment.created` | Root comment posted | Admin | Email + Webhook |
| `comment.pending_review` | Reply needs moderation | Admin | Email + Webhook |
| `comment.reply_received` | Reply approved | Original author | Email |
| `news.published` | News article published | Subscribers | Email + Webhook |
| `product.published` | Product published | Subscribers | Email + Webhook |

### Event Data Schemas

#### `quote.created`

```json
{
  "type": "quote.created",
  "data": {
    "to": "admin@company.com",
    "quoteId": "uuid",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "company": "Acme Corp",
    "product": "Industrial UPS 3000VA",
    "message": "I need a quote for...",
    "adminUrl": "/admin/quote-requests"
  }
}
```

#### `quote.status_changed`

```json
{
  "type": "quote.status_changed",
  "data": {
    "to": "john@example.com",
    "quoteId": "uuid",
    "newStatus": "quoted",
    "customerName": "John Doe"
  }
}
```

Status values: `new` → `contacted` → `quoted` → `closed`

#### `comment.created`

```json
{
  "type": "comment.created",
  "data": {
    "to": "admin@company.com",
    "postTitle": "How to Choose a UPS",
    "authorName": "Jane",
    "commentPreview": "Great article! I have a question...",
    "commentUrl": "/news/how-to-choose-ups#comment-uuid"
  }
}
```

#### `comment.pending_review`

```json
{
  "type": "comment.pending_review",
  "data": {
    "to": "admin@company.com",
    "postTitle": "How to Choose a UPS",
    "authorName": "Jane",
    "commentPreview": "This is a reply to the original comment...",
    "reviewUrl": "/admin/news/comments"
  }
}
```

#### `comment.reply_received`

```json
{
  "type": "comment.reply_received",
  "data": {
    "to": "original-author@example.com",
    "postTitle": "How to Choose a UPS",
    "replierName": "Admin",
    "replyPreview": "Thanks for your question! Here's the answer...",
    "commentUrl": "/news/how-to-choose-ups#comment-uuid"
  }
}
```

Note: Self-replies (same email) are automatically skipped.

#### `news.published`

```json
{
  "type": "news.published",
  "data": {
    "newsTitle": "New Product Launch Announcement",
    "newsUrl": "/news/new-product-launch",
    "summary": "We are excited to announce..."
  }
}
```

#### `product.published`

```json
{
  "type": "product.published",
  "data": {
    "productName": "Industrial UPS 3000VA",
    "productUrl": "/products/industrial-ups-3000va",
    "summary": "High-efficiency uninterruptible power supply..."
  }
}
```

---

## API Endpoints

### Channel Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/channels` | List all channels (with subscribed events) |
| `POST` | `/api/notifications/channels` | Create a channel |
| `GET` | `/api/notifications/channels/:id` | Get single channel |
| `PUT` | `/api/notifications/channels/:id` | Update a channel |
| `DELETE` | `/api/notifications/channels/:id` | Delete channel (cascades to subscriptions) |

**Create channel body:**

```json
{
  "name": "Slack Alerts",
  "type": "webhook",
  "config": {
    "url": "https://hooks.slack.com/services/...",
    "secret": "slack-signing-secret",
    "platform": "slack"
  },
  "enabled": true
}
```

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/subscriptions?channelId=xxx` | List subscriptions for a channel |
| `PUT` | `/api/notifications/subscriptions` | Replace subscriptions for a channel |

**Set subscriptions body:**

```json
{
  "channelId": "uuid",
  "eventTypes": ["quote.created", "comment.created", "comment.pending_review"]
}
```

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/settings` | Get all notification settings |
| `PUT` | `/api/notifications/settings` | Update a setting |

**Settings keys:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `admin_channels` | `{"email": bool, "webhook": bool}` | `{"email":true,"webhook":true}` | Admin notification channels |
| `user_email` | `{"enabled": bool}` | `{"enabled":true}` | User email notifications |
| `sse_enabled` | `{"enabled": bool}` | `{"enabled":false}` | Real-time SSE toast notifications |
| `toast_preferences` | `{"event_type": bool, ...}` | all `true` | Per-event toast visibility |
| `rate_limit` | `{"enabled": bool, "windowSeconds": number}` | `{"enabled":true,"windowSeconds":300}` | Rate limiting config |
| `template:{event_type}` | `{"subject": str, "body": str, "title": str, "text": str}` | `null` | Custom notification template |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/templates` | List all templates (with available variables) |
| `PUT` | `/api/notifications/templates` | Save a custom template |
| `DELETE` | `/api/notifications/templates?eventType=xxx` | Reset template to default |

**Save template body:**

```json
{
  "eventType": "quote.created",
  "subject": "[新询价] {{customerName}} - {{product}}",
  "body": "<h2>新询价通知</h2><p><strong>{{customerName}}</strong> ({{customerEmail}})</p>",
  "title": "🆕 新询价: {{customerName}}",
  "text": "来自 **{{customerName}}** 的询价\n产品: {{product}}"
}
```

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/stats?period=7d` | Get notification statistics |

Query parameters: `period` = `7d` | `30d` | `90d` | `all`

**Response:**

```json
{
  "period": "7d",
  "total": 150,
  "sent": 130,
  "failed": 8,
  "skipped": 12,
  "successRate": 87,
  "failureRate": 5,
  "skipRate": 8,
  "byEvent": { "quote.created": { "sent": 50, "failed": 2, "skipped": 5 } },
  "byChannel": { "email": { "sent": 80, "failed": 3, "skipped": 0 } },
  "daily": [{ "date": "2025-01-15", "sent": 20, "failed": 1, "skipped": 2 }],
  "topFailed": [{ "event_type": "comment.created", "cnt": 3 }]
}
```

### Real-time Stream (SSE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/stream` | SSE client connection (EventSource) |
| `POST` | `/api/notifications/stream` | Internal broadcast (called by queue consumer) |

**Client usage:**

```javascript
const es = new EventSource('/api/notifications/stream');
es.addEventListener('notification', (e) => {
  const data = JSON.parse(e.data);
  // data: { eventType, channelType, status, recipient, errorMessage, logId }
});
```

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/logs?eventType=xxx&status=xxx&limit=50&offset=0` | Query notification logs |

Log statuses: `sent`, `failed`, `skipped`

---

## Custom Templates

### Template Syntax

Templates use `{{variable}}` placeholder syntax. Variables are HTML-escaped for safety.

```
{{name}}     → HTML-escaped value
{{{html}}}   → Raw unescaped value (for pre-built HTML blocks)
```

### Available Variables per Event

| Event | Variables |
|-------|-----------|
| `quote.created` | `customerName`, `customerEmail`, `company`, `product`, `message`, `quoteId`, `adminUrl` |
| `quote.status_changed` | `customerName`, `quoteId`, `newStatus` |
| `comment.created` | `authorName`, `postTitle`, `commentPreview`, `commentUrl` |
| `comment.pending_review` | `authorName`, `postTitle`, `commentPreview`, `reviewUrl` |
| `comment.reply_received` | `replierName`, `postTitle`, `replyPreview`, `commentUrl` |
| `news.published` | `newsTitle`, `newsUrl`, `summary` |
| `product.published` | `productName`, `productUrl`, `summary` |

### Template Priority

1. **Custom template** from `notification_settings` (key: `template:{event_type}`)
2. **Default hardcoded template** in `email.service.ts` / `webhook.service.ts`

### Template Editor

Go to **Admin → Settings → Notification Templates**:

- Select an event type from the dropdown
- Click variable tags to insert `{{variable}}` at cursor position
- Edit email subject/body (HTML) and webhook title/text (Markdown)
- Preview renders with sample data in real-time
- Unresolved variables shown in red

---

## Rate Limiting

### How It Works

The system deduplicates notifications to avoid sending the same notification repeatedly within a short time window.

**Deduplication key:** `event_type + channel_id + recipient`

```
sendAndLog(event, channel, recipient)
  └→ isRateLimited(event_type, channel_id, recipient)
       └→ SELECT COUNT(*) FROM notification_logs
           WHERE event_type = ? AND channel_id = ? AND recipient = ?
             AND status = 'sent' AND created_at > (now - window)
       └→ if count > 0 → log "skipped" + return
       └→ if count = 0 → proceed to send
```

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Enable or disable rate limiting |
| `windowSeconds` | `300` (5 min) | Time window in seconds |

```bash
# Disable rate limiting
curl -X PUT /api/notifications/settings \
  -d '{"key":"rate_limit","value":{"enabled":false}}'

# Set 1-minute window
curl -X PUT /api/notifications/settings \
  -d '{"key":"rate_limit","value":{"enabled":true,"windowSeconds":60}}'
```

Rate-limited notifications are logged with status `skipped` and error message `"Rate limited: duplicate notification within time window"`.

---

## Real-time Toast Notifications (SSE)

### Architecture

The SSE system uses an **event-driven push** model (no polling):

```
Queue Consumer delivers notification
  └→ logNotification() writes to D1
       └→ notifySSEClients() → POST /api/notifications/stream
            └→ Iterates in-memory connection pool (Set<ClientConnection>)
                 └→ Pushes SSE event to each connected admin
                      └→ AdminLayout EventSource → showToast()
```

### Enabling SSE

1. Go to **Admin → Settings → Notification Channels**
2. Toggle **Real-time Toast Notifications (SSE)** to ON
3. Refresh the admin page

SSE is **disabled by default** to avoid unnecessary resource consumption on Cloudflare's free tier.

### Toast Preferences

After enabling SSE, configure which event types trigger toasts:

1. **Toast Event Preferences** card appears below the SSE toggle
2. Each of the 7 event types has an individual toggle (default: all ON)
3. Changes take effect immediately (no page refresh needed)

**Filtering is dual-layered:**
- **Server-side**: POST broadcast checks `toast_preferences` in DB before pushing
- **Client-side**: `showToast()` checks `localStorage` before rendering

### Keepalive

SSE keepalive comments are sent every **10 minutes** (Cloudflare free tier limit). The timer automatically stops when no clients are connected.

### Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NOTIFICATION_SSE_URL` | Var | Internal SSE URL for broadcast (default: `http://localhost:8787/api/notifications/stream`) |

---

## Webhook Payload Formats

### Generic

Raw JSON with full event data. Optional HMAC-SHA256 signature.

```json
{
  "event": "quote.created",
  "data": { ... },
  "timestamp": 1712345678901
}
```

**Headers:**
- `X-Notification-Event`: event type
- `X-Notification-Platform`: `generic`
- `X-Notification-Signature`: `sha256=<base64url>` (if secret configured)

**Signature verification:**
```
HMAC-SHA256(secret, raw_body) → base64url
```

### Slack

Slack Block Kit format with Slack v0 signature.

```json
{
  "text": "*🆕 New Inquiry*\nFrom **John** (john@example.com)...",
  "blocks": [
    { "type": "header", "text": { "type": "plain_text", "text": "🆕 New Inquiry", "emoji": true } },
    { "type": "section", "text": { "type": "mrkdwn", "text": "From **John**..." } },
    { "type": "context", "elements": [{ "type": "mrkdwn", "text": "_2025-01-01T00:00:00.000Z_" }] }
  ]
}
```

**Headers:**
- `X-Slack-Signature`: `v0=<hex>` (Slack v0 signature)
- `X-Slack-Request-Timestamp`: Unix timestamp

**Signature verification:**
```
base_string = "v0:" + timestamp + ":" + raw_body
HMAC-SHA256(signing_secret, base_string) → hex
```

### Discord

Discord embed format with colored sidebar.

```json
{
  "content": "**🆕 New Inquiry**\nFrom John (john@example.com)...",
  "embeds": [
    {
      "title": "🆕 New Inquiry",
      "description": "From John (john@example.com)...",
      "color": 4282686,
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

No signature headers. Authentication is via token embedded in the webhook URL.

### WeCom (企业微信)

Markdown format for WeCom group robot.

```json
{
  "msgtype": "markdown",
  "markdown": {
    "content": "## 🆕 New Inquiry\n\nFrom John (john@example.com)..."
  }
}
```

No signature headers. Authentication is via key embedded in the webhook URL.

---

## Email Configuration

### Priority Order

1. **Environment variable** `RESEND_API_KEY` (recommended for production)
2. **Database channel config** (admin settings UI, per-channel API key)
3. **Console log** (development fallback when no API key)

### Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `RESEND_API_KEY` | Secret | Resend API key |
| `EMAIL_FROM` | Var | Sender address, e.g. `B2B Website <noreply@company.com>` |
| `ADMIN_EMAIL` | Var | Admin email for receiving notifications |

### Email Templates

All emails use a professional HTML layout with:
- Green branded header
- Responsive table-based design (email client compatible)
- Colored content blocks (green = info, yellow = warning)
- CTA buttons for admin actions
- Auto-notification footer

Custom email templates can be configured per event type (see [Custom Templates](#custom-templates)).

---

## Notification Dashboard

Go to **Admin → Settings → Notification Dashboard** to view:

### Summary Cards

| Metric | Description |
|--------|-------------|
| Total | Total notification attempts in the period |
| Sent | Successfully delivered notifications |
| Failed | Notifications that encountered an error |
| Skipped | Notifications skipped by rate limiting |
| Success Rate | Percentage of sent / total (color-coded: green ≥90%, amber ≥70%, red <70%) |

### Charts

- **Delivery Overview**: Stacked bar showing sent/failed/skipped ratio
- **Daily Trend**: CSS bar chart showing per-day volume (red bars for days with failures)
- **By Event Type**: Horizontal bar chart with sent/failed counts per event
- **Top Failed Events**: Ranked list of event types with most failures (hidden when zero)

### Period Selector

Choose from: **Last 7 days** / **Last 30 days** / **Last 90 days** / **All time**

---

## Database Tables

### `notification_channels`

Stores configured notification channels (email/webhook endpoints).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `name` | TEXT | Channel display name |
| `type` | TEXT | `email` or `webhook` |
| `config` | TEXT (JSON) | Channel-specific config |
| `enabled` | INTEGER | 1 = active, 0 = disabled |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `notification_subscriptions`

Maps channels to event types.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `channel_id` | TEXT FK | References `notification_channels.id` |
| `event_type` | TEXT | Event type string |
| `created_at` | INTEGER | Unix timestamp |

### `notification_logs`

Records every notification delivery attempt.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `event_type` | TEXT | Event type |
| `channel_id` | TEXT FK | References `notification_channels.id` |
| `channel_type` | TEXT | `email` or `webhook` |
| `status` | TEXT | `sent`, `failed`, or `skipped` |
| `recipient` | TEXT | Recipient email or webhook URL |
| `error_message` | TEXT | Error details (if failed) |
| `event_data` | TEXT (JSON) | Full event payload |
| `created_at` | INTEGER | Unix timestamp |

### `notification_settings`

Key-value store for global notification settings.

| Column | Type | Description |
|--------|------|-------------|
| `key` | TEXT PK | Setting key |
| `value` | TEXT | JSON string |
| `updated_at` | INTEGER | Unix timestamp |

**Common keys:** `admin_channels`, `user_email`, `sse_enabled`, `toast_preferences`, `rate_limit`, `template:{event_type}`

---

## File Structure

```
src/lib/notification/
├── index.ts                  # Barrel exports
├── notification.schema.ts    # Event types, Zod schemas, helpers
├── notification.publisher.ts # Entry point: enqueue event
├── queue-consumer.ts         # Queue consumer + delivery + SSE broadcast
├── email.service.ts          # Resend SDK integration + templates
├── webhook.service.ts        # Multi-platform webhook (Slack/Discord/WeCom/Generic)
├── template-engine.ts        # {{variable}} template rendering
└── rate-limiter.ts           # Dedup rate limiting

src/pages/api/notifications/
├── channels.ts               # Channel CRUD API
├── channels/[id].ts          # Single channel API
├── subscriptions.ts          # Subscription management API
├── settings.ts               # Settings API
├── templates.ts              # Template CRUD API
├── stats.ts                  # Statistics API
├── logs.ts                   # Log query API
└── stream.ts                 # SSE endpoint (GET: client, POST: broadcast)

src/layouts/
└── AdminLayout.astro         # Global toast UI + SSE client

src/pages/admin/settings/
└── index.astro               # Dashboard, channels, templates, prefs UI

migrations/
├── 0001_notification_system.sql   # Core tables
└── 0002_notification_rate_limit.sql # Rate limit index + default setting
```

---

## Programmatic Usage

```typescript
import { publishNotificationEvent, NOTIFICATION_EVENTS } from "@/lib/notification";

// Fire a notification from any API handler
await publishNotificationEvent(
  { db: env.DB, env },
  {
    type: NOTIFICATION_EVENTS.QUOTE_CREATED,
    data: {
      to: "admin@company.com",
      quoteId: "uuid",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      message: "I need a quote...",
    },
  }
);
```

The call is non-blocking. If the Queue is available, the event is enqueued and the function returns immediately. If not (local dev), it falls back to synchronous delivery.
