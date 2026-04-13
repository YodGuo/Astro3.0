import type { APIRoute } from "astro";
import { getEnv } from "../../lib/env";
import { apiUnavailable, apiBadRequest, apiNotFound, apiError } from "../../lib/api-response";

export const prerender = false;

const ALLOWED_FORMATS = ["webp", "avif", "jpeg", "png"] as const;
type ImageFormat = (typeof ALLOWED_FORMATS)[number];
const MAX_DIMENSION = 4000;
const MIN_DIMENSION = 1;
const DEFAULT_QUALITY = 80;

const FORMAT_TO_MIME: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
  png: "image/png",
};

const ALLOWED_FITS = ["scale-down", "cover", "contain", "crop"] as const;
type FitMode = (typeof ALLOWED_FITS)[number];

/**
 * Infer the best image format from the Accept header.
 * Priority: AVIF > WebP > JPEG (fallback)
 */
function negotiateFormat(acceptHeader: string | null): ImageFormat | undefined {
  if (!acceptHeader) return undefined;
  const accept = acceptHeader.toLowerCase();
  if (accept.includes("image/avif")) return "avif";
  if (accept.includes("image/webp")) return "webp";
  return undefined;
}

export const GET: APIRoute = async ({ params, url, request }) => {
  const env = await getEnv();

  if (!env.R2) {
    return apiUnavailable("R2 not available");
  }

  const path = params.path;
  if (!path) {
    return apiBadRequest("No file path provided");
  }

  const key = path;

  // Parse transformation parameters
  const queryW = url.searchParams.get("w");
  const queryH = url.searchParams.get("h");
  const queryQ = url.searchParams.get("q");
  const queryF = url.searchParams.get("f");
  const queryFit = url.searchParams.get("fit");
  const queryOriginal = url.searchParams.get("original");

  const width = queryW ? parseInt(queryW, 10) : undefined;
  const height = queryH ? parseInt(queryH, 10) : undefined;
  const quality = queryQ ? parseInt(queryQ, 10) : undefined;
  const format = queryF as ImageFormat | undefined;
  const fit = queryFit as FitMode | undefined;

  // ?original=true bypasses all transformations
  const forceOriginal = queryOriginal === "true";

  // Anti-loop detection: if this request was already transformed, return original
  const viaHeader = request.headers.get("via") || "";
  const isLoop = viaHeader.includes("image-resizing");

  // Validate parameters
  const hasTransform = !forceOriginal && !isLoop && (width !== undefined || height !== undefined || format !== undefined || quality !== undefined || fit !== undefined);

  if (hasTransform) {
    if (width !== undefined && (isNaN(width) || width < MIN_DIMENSION || width > MAX_DIMENSION)) {
      return apiBadRequest(`Invalid width. Must be ${MIN_DIMENSION}-${MAX_DIMENSION}`);
    }
    if (height !== undefined && (isNaN(height) || height < MIN_DIMENSION || height > MAX_DIMENSION)) {
      return apiBadRequest(`Invalid height. Must be ${MIN_DIMENSION}-${MAX_DIMENSION}`);
    }
    if (quality !== undefined && (isNaN(quality) || quality < 1 || quality > 100)) {
      return apiBadRequest("Invalid quality. Must be 1-100");
    }
    if (format && !ALLOWED_FORMATS.includes(format)) {
      return apiBadRequest(`Invalid format. Allowed: ${ALLOWED_FORMATS.join(", ")}`);
    }
    if (fit && !ALLOWED_FITS.includes(fit)) {
      return apiBadRequest(`Invalid fit. Allowed: ${ALLOWED_FITS.join(", ")}`);
    }
  }

  try {
    const object = await env.R2.get(key);

    if (!object) {
      return apiNotFound("File");
    }

    // No transformation: return original file from R2
    if (!hasTransform) {
      const headers = new Headers();
      const contentType = object.httpMetadata?.contentType || "application/octet-stream";
      headers.set("Content-Type", contentType);
      headers.set("Content-Length", String(object.size));
      headers.set("ETag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new Response(object.body, { headers });
    }

    // Use Cloudflare Images binding for transformation
    const images = env.IMAGES as ImagesBinding | undefined;
    if (!images) {
      // Fallback: return original if Images binding is not available
      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers.set("Content-Length", String(object.size));
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    }

    // Build transformation options
    const transformOptions: Record<string, unknown> = {};

    if (width) transformOptions.width = width;
    if (height) transformOptions.height = height;
    if (quality) transformOptions.quality = quality;
    else transformOptions.quality = DEFAULT_QUALITY;

    // Format: explicit param > Accept header negotiation
    const effectiveFormat = format || negotiateFormat(request.headers.get("accept"));
    if (effectiveFormat) transformOptions.format = effectiveFormat;

    // Fit mode: default to scale-down for safety
    transformOptions.fit = fit || "scale-down";

    // Read the R2 object into an ArrayBuffer for Cloudflare Images
    const imageBuffer = await object.arrayBuffer();

    const transformed = await images.transform(imageBuffer, transformOptions);

    // Determine output content type
    const outputFormat = (effectiveFormat || "jpeg") as string;
    const outputContentType = FORMAT_TO_MIME[outputFormat] || "image/jpeg";

    const headers = new Headers();
    headers.set("Content-Type", outputContentType);
    headers.set("Content-Length", String(transformed.byteLength));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Vary", "Accept");

    return new Response(transformed, { headers });
  } catch (error) {
    return apiError(error);
  }
};
