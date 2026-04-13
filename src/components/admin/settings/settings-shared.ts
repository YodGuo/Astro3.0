// Shared constants for admin settings pages

export const NOTIFICATION_EVENT_OPTIONS = [
  { value: 'quote.created', label: 'New Inquiry', description: 'When a customer submits a quote request' },
  { value: 'quote.status_changed', label: 'Inquiry Status Update', description: 'When an inquiry status changes' },
  { value: 'comment.created', label: 'New Comment', description: 'When a root comment is posted' },
  { value: 'comment.pending_review', label: 'Comment Awaiting Review', description: 'When a reply comment needs moderation' },
  { value: 'comment.reply_received', label: 'Reply Received', description: 'When someone replies to your comment' },
  { value: 'news.published', label: 'News Published', description: 'When a news article is published' },
  { value: 'product.published', label: 'Product Published', description: 'When a product is published' },
] as const;

export const EVENT_LABELS: Record<string, string> = {
  'quote.created': 'New Inquiry',
  'quote.status_changed': 'Status Update',
  'comment.created': 'New Comment',
  'comment.pending_review': 'Review Required',
  'comment.reply_received': 'Reply Received',
  'news.published': 'News Published',
  'product.published': 'Product Published',
};

export const TOAST_PREF_EVENTS = [
  { value: 'quote.created', label: 'New Inquiry', icon: '\u{1F195}' },
  { value: 'quote.status_changed', label: 'Status Update', icon: '\u{1F4CB}' },
  { value: 'comment.created', label: 'New Comment', icon: '\u{1F4AC}' },
  { value: 'comment.pending_review', label: 'Review Required', icon: '\u26A0\uFE0F' },
  { value: 'comment.reply_received', label: 'Reply Received', icon: '\u21A9\uFE0F' },
  { value: 'news.published', label: 'News Published', icon: '\u{1F4F0}' },
  { value: 'product.published', label: 'Product Published', icon: '\u{1F4E6}' },
] as const;

export const WEBHOOK_PLATFORM_HINTS: Record<string, { hint: string; placeholder: string; secretPlaceholder: string; secretHint: string }> = {
  generic: {
    hint: 'Sends raw JSON with optional HMAC-SHA256 signature.',
    placeholder: 'https://your-webhook-url.com/notify',
    secretPlaceholder: 'Optional \u2014 for signature verification',
    secretHint: 'Sent as X-Notification-Signature header.',
  },
  slack: {
    hint: 'Sends Slack Block Kit format with Slack v0 signature verification.',
    placeholder: 'https://hooks.slack.com/services/T.../B.../xxx',
    secretPlaceholder: 'Slack signing secret',
    secretHint: 'Used for X-Slack-Signature verification.',
  },
  discord: {
    hint: 'Sends Discord embed format. Token is embedded in the webhook URL.',
    placeholder: 'https://discord.com/api/webhooks/xxx/yyy',
    secretPlaceholder: 'Not needed (token in URL)',
    secretHint: 'Discord uses token in webhook URL, no separate secret.',
  },
  wechat_work: {
    hint: 'Sends WeCom markdown format for \u4F01\u4E1A\u5FAE\u4FE1 group robot.',
    placeholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx',
    secretPlaceholder: 'Not needed (token in URL)',
    secretHint: 'WeCom uses key in webhook URL, no separate secret.',
  },
};

export const TEMPLATE_SAMPLE_DATA: Record<string, Record<string, string>> = {
  'quote.created': { customerName: 'John Doe', customerEmail: 'john@example.com', company: 'Acme Corp', product: 'Industrial UPS 3000VA', message: 'I need a quote for 10 units with delivery to Shanghai.', quoteId: 'abc-123', adminUrl: '/admin/quote-requests' },
  'quote.status_changed': { customerName: 'John Doe', quoteId: 'abc-123', newStatus: 'quoted' },
  'comment.created': { authorName: 'Jane Smith', postTitle: 'How to Choose a UPS', commentPreview: 'Great article! I have a question about runtime...', commentUrl: '/article/how-to-choose-ups#comment-1' },
  'comment.pending_review': { authorName: 'Jane Smith', postTitle: 'How to Choose a UPS', commentPreview: 'This is a reply to the original comment...', reviewUrl: '/admin/news/comments' },
  'comment.reply_received': { replierName: 'Admin', postTitle: 'How to Choose a UPS', replyPreview: 'Thanks for your question! Here is the answer...', commentUrl: '/article/how-to-choose-ups#comment-2' },
  'news.published': { newsTitle: 'New Product Launch Announcement', newsUrl: '/article/new-launch', summary: 'We are excited to announce our latest product line.' },
  'product.published': { productName: 'Industrial UPS 3000VA', productUrl: '/product/ups-3000va', summary: 'High-efficiency uninterruptible power supply for data centers.' },
};
