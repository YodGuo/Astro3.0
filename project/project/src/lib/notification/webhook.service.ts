import type { NotificationEvent } from "./notification.schema";
import type { NotificationContext } from "./queue-consumer";
import { logger } from "../logger";

const BLOCKED_RANGES = [
  [0, 0, 0, 0, 8], [10, 0, 0, 0, 8], [100, 64, 0, 0, 10],
  [127, 0, 0, 0, 8], [169, 254, 0, 0, 16], [172, 16, 0, 0, 12],
  [192, 0, 0, 0, 24], [192, 0, 2, 0, 24], [192, 168, 0, 0, 16],
  [198, 18, 0, 0, 15], [198, 51, 100, 0, 24], [203, 0, 113, 0, 24],
] as const;

function ipInRange(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p))) return true;
  const ipNum = ipToInt(parts);
  for (const [r0, r1, r2, r3, cidr] of BLOCKED_RANGES) {
    const shift = 32 - cidr;
    const mask = shift === 32 ? 0 : ((0xFFFFFFFF << shift) >>> 0);
    const rangeNum = ipToInt([r0, r1, r2, r3]);
    if (((ipNum & mask) >>> 0) === ((rangeNum & mask) >>> 0)) return true;
  }
  return false;
}

function ipToInt(parts: number[]): number {
  return (parts[0] * 0x1000000 + parts[1] * 0x10000 + parts[2] * 0x100 + parts[3]) >>> 0;
}

export function validateWebhookUrl(url: string): { valid: true } | { valid: false; reason: string } {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { valid: false, reason: "Invalid URL format" }; }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: `Protocol "${parsed.protocol}" is not allowed.` };
  }
  const hostname = parsed.hostname;
  const bareHost = hostname.replace(/^\[|\]$/g, '');
  if (bareHost === '::1' || bareHost.startsWith('fc00:') || bareHost.startsWith('fe80:')) {
    return { valid: false, reason: "IPv6 loopback or unique-local addresses are not allowed" };
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (ipInRange(hostname)) return { valid: false, reason: "Private/loopback/link-local IP addresses are not allowed" };
  }
  const blockedHostnames = ['metadata.google.internal', 'metadata.goog'];
  if (blockedHostnames.includes(hostname.toLowerCase())) {
    return { valid: false, reason: "Cloud metadata hostnames are not allowed" };
  }
  if (hostname.toLowerCase() === 'localhost' || hostname.endsWith('.local')) {
    return { valid: false, reason: "Localhost addresses are not allowed" };
  }
  return { valid: true };
}

export interface WebhookConfig { url?: string; secret?: string; headers?: Record<string, string>; }

export async function sendWebhook(ctx: NotificationContext, event: NotificationEvent, channelConfig: Record<string, unknown>): Promise<void> {
  const config = channelConfig as WebhookConfig;
  const url = config.url;
  if (!url || typeof url !== "string") throw new Error("Webhook URL is not configured");
  const validation = validateWebhookUrl(url);
  if (!validation.valid) throw new Error(`Webhook URL rejected: ${validation.reason}`);

  const payload = { event: event.type, data: event.data, timestamp: new Date().toISOString() };
  const headers: Record<string, string> = { "Content-Type": "application/json", ...config.headers };

  if (config.secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(config.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const bodyStr = JSON.stringify(payload);
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyStr));
    headers["X-Webhook-Signature"] = btoa(String.fromCharCode(...new Uint8Array(sig)));
  }

  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
    if (!response.ok) {
      const responseText = await response.text().catch(() => "[unreadable]");
      logger.error("Webhook target returned error", { status: response.status, eventType: event.type, url, response: responseText.slice(0, 500) });
      throw new Error(`Webhook target returned HTTP ${response.status}`);
    }
    logger.info("Webhook delivered", { eventType: event.type, url: maskUrl(url) });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) throw new Error("Failed to connect to webhook target", { cause: error });
    if (error instanceof Error) throw error;
    throw new Error("Webhook delivery failed", { cause: error });
  }
}

function maskUrl(url: string): string {
  try { const p = new URL(url); return `${p.protocol}//${p.hostname}${p.port ? ':' + p.port : ''}/...`; } catch { return "[invalid-url]"; }
}
