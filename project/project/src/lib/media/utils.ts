/**
 * Media utility functions for URL generation and content-type detection.
 */

/**
 * Generate an optimized image URL with Cloudflare Images transform parameters.
 * @param key - R2 object key (e.g. "uploads/2024/01/uuid-photo.jpg")
 * @param width - Optional target width (1-2000px)
 * @param format - Optional output format ("webp", "avif", "jpeg", "png")
 * @param quality - Optional quality (1-100, default 80)
 */
export function getOptimizedImageUrl(
  key: string,
  options?: { width?: number; format?: string; quality?: number }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.set("w", String(options.width));
  if (options?.format) params.set("f", options.format);
  if (options?.quality) params.set("q", String(options.quality));
  if (!params.has("q")) params.set("q", "80");

  const qs = params.toString();
  return `/media/${key}${qs ? `?${qs}` : ""}`;
}

/**
 * Infer content type from a file extension.
 */
export function getContentTypeFromKey(key: string): string | null {
  const ext = key.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    pdf: "application/pdf",
  };
  return ext ? (map[ext] ?? null) : null;
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Escape SQL LIKE pattern special characters.
 */
export function escapeLikeString(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}
