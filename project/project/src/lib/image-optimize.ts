/**
 * Cloudflare Images URL optimization utility.
 *
 * Uses `/cdn-cgi/image/` endpoint for on-the-fly image transformation
 * (resize, format conversion, quality adjustment) without requiring
 * separate upload to Cloudflare Images service.
 *
 * Works with any publicly accessible image URL, including R2 public buckets.
 * Falls back to the original URL if the source is not optimizable.
 *
 * @see https://developers.cloudflare.com/images/transform-images/
 */

/** Default transformation options */
const DEFAULT_OPTIONS: ImageTransformOptions = {
  width: 1200,
  quality: 85,
  format: "auto",
};

export interface ImageTransformOptions {
  /** Maximum width in pixels. Cloudflare will maintain aspect ratio. */
  width?: number;
  /** Maximum height in pixels. */
  height?: number;
  /** Image quality (1-100). Default: 85 */
  quality?: number;
  /** Output format: "auto" (WebP/AVIF), "webp", "avif", or "jpeg". Default: "auto" */
  format?: "auto" | "webp" | "avif" | "jpeg";
  /** Whether to use "on-the-fly" mode (no metadata). Default: true */
  metadata?: "none";
}

/**
 * Build a Cloudflare Images optimized URL.
 *
 * Only processes URLs that are:
 * - Absolute HTTP(S) URLs
 * - Not already using /cdn-cgi/image/
 * - Not data: URIs (used for small inline images)
 *
 * @param src - Original image URL
 * @param options - Transformation options (merged with defaults)
 * @returns Optimized URL or original URL if not optimizable
 */
export function optimizeImage(src: string, options?: ImageTransformOptions): string {
  if (!src || typeof src !== "string") return src || "";

  // Skip data URIs, relative paths, and already-optimized URLs
  if (
    src.startsWith("data:") ||
    src.startsWith("/cdn-cgi/image/") ||
    !src.startsWith("http")
  ) {
    return src;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const params = new URLSearchParams();

  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.quality) params.set("quality", String(opts.quality));
  if (opts.format) params.set("format", opts.format);
  if (opts.metadata !== undefined) params.set("metadata", opts.metadata);
  else params.set("metadata", "none"); // strip EXIF by default

  return `/cdn-cgi/image/${params.toString()}/${src}`;
}

/**
 * Preset configurations for common image use cases.
 */
export const IMAGE_PRESETS = {
  /** Site logo: small, high quality */
  logo: { width: 200, quality: 90, format: "auto" as const },
  /** Article content image: responsive, good quality */
  article: { width: 1200, quality: 85, format: "auto" as const },
  /** Thumbnail: small, moderate quality */
  thumbnail: { width: 400, quality: 80, format: "auto" as const },
  /** OG/Twitter card image: fixed dimensions */
  og: { width: 1200, height: 630, quality: 85, format: "auto" as const },
} satisfies Record<string, ImageTransformOptions>;
