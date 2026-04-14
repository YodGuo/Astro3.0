/**
 * Structured JSON logger for Cloudflare Workers.
 *
 * Outputs JSON-formatted log lines compatible with Cloudflare Logpush,
 * Grafana Loki, and other structured log aggregation systems.
 *
 * Usage:
 *   import { logger } from "../lib/logger";
 *   logger.info("Request completed", { method: "GET", path: "/api/health", status: 200, ms: 12 });
 *   logger.warn("Cache miss", { key: "settings" });
 *   logger.error("Database query failed", { error: err.message, stack: err.stack });
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function formatEntry(level: LogLevel, message: string, ctx?: Record<string, unknown>): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...ctx,
  };
  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, ctx?: Record<string, unknown>): void {
    console.log(formatEntry("info", message, ctx));
  },

  warn(message: string, ctx?: Record<string, unknown>): void {
    console.warn(formatEntry("warn", message, ctx));
  },

  error(message: string, ctx?: Record<string, unknown>): void {
    console.error(formatEntry("error", message, ctx));
  },
};
