globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { b as apiUnavailable, a as apiBadRequest, c as apiNotFound, e as apiError } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const ALLOWED_FORMATS = ["webp", "avif", "jpeg", "png"];
const MAX_DIMENSION = 4e3;
const MIN_DIMENSION = 1;
const DEFAULT_QUALITY = 80;
const FORMAT_TO_MIME = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
  png: "image/png"
};
const ALLOWED_FITS = ["scale-down", "cover", "contain", "crop"];
function negotiateFormat(acceptHeader) {
  if (!acceptHeader) return void 0;
  const accept = acceptHeader.toLowerCase();
  if (accept.includes("image/avif")) return "avif";
  if (accept.includes("image/webp")) return "webp";
  return void 0;
}
const GET = async ({ params, url, request }) => {
  const env = await getEnv();
  if (!env.R2) {
    return apiUnavailable("R2 not available");
  }
  const path = params.path;
  if (!path) {
    return apiBadRequest("No file path provided");
  }
  const key = path;
  const queryW = url.searchParams.get("w");
  const queryH = url.searchParams.get("h");
  const queryQ = url.searchParams.get("q");
  const queryF = url.searchParams.get("f");
  const queryFit = url.searchParams.get("fit");
  const queryOriginal = url.searchParams.get("original");
  const width = queryW ? parseInt(queryW, 10) : void 0;
  const height = queryH ? parseInt(queryH, 10) : void 0;
  const quality = queryQ ? parseInt(queryQ, 10) : void 0;
  const format = queryF;
  const fit = queryFit;
  const forceOriginal = queryOriginal === "true";
  const viaHeader = request.headers.get("via") || "";
  const isLoop = viaHeader.includes("image-resizing");
  const hasTransform = !forceOriginal && !isLoop && (width !== void 0 || height !== void 0 || format !== void 0 || quality !== void 0 || fit !== void 0);
  if (hasTransform) {
    if (width !== void 0 && (isNaN(width) || width < MIN_DIMENSION || width > MAX_DIMENSION)) {
      return apiBadRequest(`Invalid width. Must be ${MIN_DIMENSION}-${MAX_DIMENSION}`);
    }
    if (height !== void 0 && (isNaN(height) || height < MIN_DIMENSION || height > MAX_DIMENSION)) {
      return apiBadRequest(`Invalid height. Must be ${MIN_DIMENSION}-${MAX_DIMENSION}`);
    }
    if (quality !== void 0 && (isNaN(quality) || quality < 1 || quality > 100)) {
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
    if (!hasTransform) {
      const headers2 = new Headers();
      const contentType = object.httpMetadata?.contentType || "application/octet-stream";
      headers2.set("Content-Type", contentType);
      headers2.set("Content-Length", String(object.size));
      headers2.set("ETag", object.httpEtag);
      headers2.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers: headers2 });
    }
    const images = env.IMAGES;
    if (!images) {
      const headers2 = new Headers();
      headers2.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers2.set("Content-Length", String(object.size));
      headers2.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers: headers2 });
    }
    const transformOptions = {};
    if (width) transformOptions.width = width;
    if (height) transformOptions.height = height;
    if (quality) transformOptions.quality = quality;
    else transformOptions.quality = DEFAULT_QUALITY;
    const effectiveFormat = format || negotiateFormat(request.headers.get("accept"));
    if (effectiveFormat) transformOptions.format = effectiveFormat;
    transformOptions.fit = fit || "scale-down";
    const imageBuffer = await object.arrayBuffer();
    const transformed = await images.transform(imageBuffer, transformOptions);
    const outputFormat = effectiveFormat || "jpeg";
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
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
