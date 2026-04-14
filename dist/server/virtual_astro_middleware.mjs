globalThis.process ??= {};
globalThis.process.env ??= {};
import { i as defineMiddleware, j as sequence } from "./chunks/sequence_IbtNAemG.mjs";
import { l as logger } from "./chunks/logger_CoNHAtH6.mjs";
import { g as getD1, b as batchGetSettings, i as isPageEnabled } from "./chunks/page-visibility_B2S94meR.mjs";
import { g as getEnv } from "./chunks/env_BQ1v_eSK.mjs";
import { createHash } from "node:crypto";
const store = /* @__PURE__ */ new Map();
const CLEANUP_INTERVAL_MS$1 = 6e4;
let lastCleanup$1 = 0;
function cleanup(now) {
  if (now - lastCleanup$1 < CLEANUP_INTERVAL_MS$1) return;
  lastCleanup$1 = now;
  for (const [key, timestamps] of store) {
    const cutoff = now - 3e5;
    const filtered = timestamps.filter((ts) => ts > cutoff);
    if (filtered.length === 0) {
      store.delete(key);
    } else {
      store.set(key, filtered);
    }
  }
}
function checkRateLimit(key, rule) {
  const now = Date.now();
  cleanup(now);
  const windowMs = rule.windowSeconds * 1e3;
  const cutoff = now - windowMs;
  let timestamps = store.get(key);
  if (!timestamps) {
    timestamps = [];
    store.set(key, timestamps);
  }
  const recent = timestamps.filter((ts) => ts > cutoff);
  store.set(key, recent);
  if (recent.length >= rule.maxRequests) {
    const oldestInWindow = recent[0];
    const resetAfter = Math.ceil((oldestInWindow + windowMs - now) / 1e3);
    return {
      allowed: false,
      remaining: 0,
      resetAfter: Math.max(resetAfter, 1)
    };
  }
  recent.push(now);
  store.set(key, recent);
  return {
    allowed: true,
    remaining: rule.maxRequests - recent.length,
    resetAfter: rule.windowSeconds
  };
}
function getClientIp(request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
let lastCleanup = 0;
const CLEANUP_INTERVAL_MS = 6e4;
async function cleanupExpired(d1) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  try {
    await d1.prepare("DELETE FROM rate_limits WHERE window_end < ?").bind(Math.floor(now / 1e3) - 3600).run();
  } catch {
  }
}
async function checkRateLimitD1(d1, key, rule) {
  await cleanupExpired(d1);
  const now = Math.floor(Date.now() / 1e3);
  const windowSeconds = rule.windowSeconds;
  const windowStart = now - now % windowSeconds;
  const windowEnd = windowStart + windowSeconds;
  const existing = await d1.prepare(
    "SELECT request_count FROM rate_limits WHERE bucket_key = ? AND window_start = ? AND window_end = ?"
  ).bind(key, windowStart, windowEnd).first();
  if (existing) {
    if (existing.request_count >= rule.maxRequests) {
      const resetAfter = windowEnd - now;
      return {
        allowed: false,
        remaining: 0,
        resetAfter: Math.max(resetAfter, 1)
      };
    }
    await d1.prepare(
      "UPDATE rate_limits SET request_count = request_count + 1 WHERE bucket_key = ? AND window_start = ?"
    ).bind(key, windowStart).run();
    return {
      allowed: true,
      remaining: rule.maxRequests - existing.request_count - 1,
      resetAfter: windowEnd - now
    };
  }
  await d1.prepare(
    "INSERT INTO rate_limits (bucket_key, request_count, window_start, window_end) VALUES (?, 1, ?, ?)"
  ).bind(key, windowStart, windowEnd).run();
  return {
    allowed: true,
    remaining: rule.maxRequests - 1,
    resetAfter: windowEnd - now
  };
}
const RATE_LIMIT_RULES = {
  "/api/auth/sign-in": { maxRequests: 5, windowSeconds: 300 },
  "/api/auth/sign-up": { maxRequests: 3, windowSeconds: 3600 },
  "/api/auth/forget-password": { maxRequests: 3, windowSeconds: 3600 },
  "/api/quote-requests": { maxRequests: 5, windowSeconds: 60 },
  "/api/comments": { maxRequests: 3, windowSeconds: 60 }
};
const onRequest$1 = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }
  const hostname = context.url.hostname;
  let domainSettings = /* @__PURE__ */ new Map();
  try {
    const d1 = await getD1();
    const env = await getEnv();
    domainSettings = await batchGetSettings(d1, ["public_domain", "admin_domain"], env.SETTINGS_CACHE);
  } catch {
  }
  const publicDomain = (domainSettings.get("public_domain") || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const adminDomain = (domainSettings.get("admin_domain") || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (publicDomain && adminDomain && publicDomain !== adminDomain) {
    const isOnPublicDomain = hostname === publicDomain;
    const isOnAdminDomain = hostname === adminDomain;
    if (isOnPublicDomain) {
      if (context.url.pathname.startsWith("/admin") || context.url.pathname.startsWith("/api")) {
        return new Response("Not Found", { status: 404 });
      }
    }
    if (isOnAdminDomain) {
      const allowedOnAdmin = context.url.pathname.startsWith("/admin") || context.url.pathname.startsWith("/api") || context.url.pathname === "/login" || context.url.pathname === "/favicon.svg";
      if (!allowedOnAdmin) {
        return context.redirect(`https://${publicDomain}${context.url.pathname}`, 301);
      }
    }
  }
  const { pathname } = context.url;
  const PAGE_VISIBILITY_MAP = {
    "/news": "news_enabled",
    "/products": "products_enabled",
    "/solutions": "solutions_enabled",
    "/services": "services_enabled",
    "/privacy": "privacy_enabled",
    "/terms": "terms_enabled"
  };
  for (const [prefix, settingKey] of Object.entries(PAGE_VISIBILITY_MAP)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      try {
        const d1 = await getD1();
        const env = await getEnv();
        const enabled = await isPageEnabled(d1, settingKey, env.SETTINGS_CACHE);
        if (!enabled) {
          return new Response("Not Found", { status: 404 });
        }
      } catch {
      }
      break;
    }
  }
  try {
    const { getAuth } = await import("./chunks/index_BamYI_0K.mjs").then((n) => n.e);
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: context.request.headers
    });
    if (session) {
      context.locals.user = session.user;
      context.locals.session = session.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch {
    context.locals.user = null;
    context.locals.session = null;
  }
  if (context.url.pathname.startsWith("/admin")) {
    if (!context.locals.user) {
      return context.redirect("/login");
    }
    if (context.locals.user.role !== "admin") {
      return context.redirect("/");
    }
  }
  const { searchParams } = context.url;
  if (pathname === "/products" && (searchParams.has("category") || searchParams.has("page"))) {
    const cat = searchParams.get("category") || "all";
    const pg = searchParams.get("page") || "1";
    const newUrl = pg === "1" ? `/products/${cat}` : `/products/${cat}/${pg}`;
    return context.redirect(newUrl, 301);
  }
  if (pathname === "/news" && (searchParams.has("tag") || searchParams.has("page"))) {
    const tag = searchParams.get("tag") || "all";
    const pg = searchParams.get("page") || "1";
    const newUrl = pg === "1" ? `/news/${tag}` : `/news/${tag}/${pg}`;
    return context.redirect(newUrl, 301);
  }
  if (context.request.method === "POST") {
    for (const [pathPrefix, rule] of Object.entries(RATE_LIMIT_RULES)) {
      if (context.url.pathname.startsWith(pathPrefix)) {
        const ip = getClientIp(context.request);
        const key = `${ip}:${pathPrefix}`;
        let result;
        try {
          const d1 = await getD1();
          if (d1) {
            result = await checkRateLimitD1(d1, key, rule);
          } else {
            result = checkRateLimit(key, rule);
          }
        } catch {
          result = checkRateLimit(key, rule);
        }
        if (!result.allowed) {
          return new Response(
            JSON.stringify({ error: "Too many requests. Please try again later." }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(result.resetAfter),
                "X-RateLimit-Remaining": "0"
              }
            }
          );
        }
        break;
      }
    }
  }
  const start = Date.now();
  const { method } = context.request;
  const isLoggable = pathname.startsWith("/api/") || pathname.startsWith("/admin/");
  try {
    const response = await next();
    const securityHeaders = {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
    };
    const isAdminOrLogin = pathname.startsWith("/admin") || pathname === "/login";
    const DARK_MODE_SCRIPT_HASH = "sha256-M2ZSmr5LG1uJ6pVKG4w+MZqkgWk7HQJnSJJE10ky6YM=";
    if (isAdminOrLogin) {
      securityHeaders["Content-Security-Policy"] = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob: https://www.google-analytics.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com",
        "frame-ancestors 'none'"
      ].join("; ");
    } else {
      let scriptSrc = `'self' '${DARK_MODE_SCRIPT_HASH}' https://www.googletagmanager.com`;
      try {
        const d1 = await getD1();
        const env = await getEnv();
        const gaSettings = await batchGetSettings(d1, ["ga_measurement_id"], env.SETTINGS_CACHE);
        const gaId = gaSettings.get("ga_measurement_id") || "";
        if (gaId) {
          const gtmScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
          const gtmHash = "sha256-" + createHash("sha256").update(gtmScript).digest("base64");
          scriptSrc = `'self' '${DARK_MODE_SCRIPT_HASH}' '${gtmHash}' https://www.googletagmanager.com`;
        }
      } catch {
      }
      securityHeaders["Content-Security-Policy"] = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob: https://www.google-analytics.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com",
        "frame-ancestors 'none'"
      ].join("; ");
    }
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    if (isLoggable) {
      const ms = Date.now() - start;
      const status = response.status;
      logger.info("Request completed", { method, pathname, status, ms });
    }
    return response;
  } catch (e) {
    if (isLoggable) {
      const ms = Date.now() - start;
      logger.error("Request failed", { method, pathname, ms, error: e instanceof Error ? e.message : String(e) });
    }
    if (e && typeof e === "object" && "status" in e && "message" in e) {
      const status = e.status;
      const message = e.message;
      if (status === 401 || status === 403) {
        return new Response(JSON.stringify({ error: message }), {
          status,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    throw e;
  }
});
const onRequest = sequence(
  onRequest$1
);
export {
  onRequest
};
