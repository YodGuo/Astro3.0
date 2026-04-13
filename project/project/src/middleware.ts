import { defineMiddleware } from "astro:middleware";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";
import { checkRateLimitD1 } from "./lib/rate-limit-d1";
import { logger } from "./lib/logger";
import { getD1, batchGetSettings, isPageEnabled } from "./lib/page-visibility";
import { getEnv } from "./lib/env";
import { createHash } from "node:crypto";

// ── Rate Limit Rules ──────────────────────────────
// Authentication endpoints use a single prefix to cover all Better Auth routes
// (sign-in, sign-up, forget-password, verify-email, passkey, etc.).
// NOTE: In-memory rate limiter is per-isolate. For production global rate limiting,
// configure Cloudflare WAF Rate Limiting rules in the dashboard.
const RATE_LIMIT_RULES: Record<string, { maxRequests: number; windowSeconds: number }> = {
  "/api/auth/sign-in": { maxRequests: 5, windowSeconds: 300 },
  "/api/auth/sign-up": { maxRequests: 3, windowSeconds: 3600 },
  "/api/auth/forget-password": { maxRequests: 3, windowSeconds: 3600 },
  "/api/quote-requests": { maxRequests: 5, windowSeconds: 60 },
  "/api/comments": { maxRequests: 3, windowSeconds: 60 },
};

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip auth during prerendering
  if (context.isPrerendered) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  // ── Domain Isolation ─────────────────────────────
  // When public_domain / admin_domain are configured, enforce separation.
  // Domain settings are cached in KV — reads are fast.
  const hostname = context.url.hostname;
  let domainSettings = new Map<string, string>();
  try {
    const d1 = await getD1();
    const env = await getEnv();
    domainSettings = await batchGetSettings(d1, ['public_domain', 'admin_domain'], env.SETTINGS_CACHE);
  } catch { /* D1/KV not available, skip domain isolation */ }

  const publicDomain = (domainSettings.get('public_domain') || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const adminDomain = (domainSettings.get('admin_domain') || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  if (publicDomain && adminDomain && publicDomain !== adminDomain) {
    const isOnPublicDomain = hostname === publicDomain;
    const isOnAdminDomain = hostname === adminDomain;

    if (isOnPublicDomain) {
      // Block admin/api routes on public domain
      if (context.url.pathname.startsWith("/admin") || context.url.pathname.startsWith("/api")) {
        return new Response("Not Found", { status: 404 });
      }
    }

    if (isOnAdminDomain) {
      // Only allow admin/api/login on admin domain
      const allowedOnAdmin = context.url.pathname.startsWith("/admin") ||
        context.url.pathname.startsWith("/api") ||
        context.url.pathname === "/login" ||
        context.url.pathname === "/favicon.svg";
      if (!allowedOnAdmin) {
        // Redirect to public domain for public pages
        return context.redirect(`https://${publicDomain}${context.url.pathname}`, 301);
      }
    }
  }
  // End Domain Isolation ────────────────────────────

  const { pathname } = context.url;

  // ── Page Visibility ──────────────────────────────
  // Check if top-level pages are enabled via site_settings.
  // Setting keys follow the pattern: {section}_enabled (e.g. news_enabled).
  // Fail-open: if D1 is unavailable, pages remain visible.
  const PAGE_VISIBILITY_MAP: Record<string, string> = {
    "/news": "news_enabled",
    "/products": "products_enabled",
    "/solutions": "solutions_enabled",
    "/services": "services_enabled",
    "/privacy": "privacy_enabled",
    "/terms": "terms_enabled",
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
      } catch { /* fail-open */ }
      break; // Only check the first matching prefix
    }
  }
  // End Page Visibility ────────────────────────────

  // Dynamic import to avoid loading better-auth during prerender
  try {
    const { getAuth } = await import("./lib/auth");
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: context.request.headers,
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

  // Protect /admin/* routes
  if (context.url.pathname.startsWith("/admin")) {
    if (!context.locals.user) {
      return context.redirect("/login");
    }
    if (context.locals.user.role !== "admin") {
      return context.redirect("/");
    }
  }

  // 301 redirect legacy product/news query URLs to path-based URLs
  const { searchParams } = context.url;

  // /products?category=X&page=Y → /products/X/Y
  if (pathname === '/products' && (searchParams.has('category') || searchParams.has('page'))) {
    const cat = searchParams.get('category') || 'all';
    const pg = searchParams.get('page') || '1';
    const newUrl = pg === '1' ? `/products/${cat}` : `/products/${cat}/${pg}`;
    return context.redirect(newUrl, 301);
  }

  // /news?tag=X&page=Y → /news/X/Y (future: when news list is refactored)
  if (pathname === '/news' && (searchParams.has('tag') || searchParams.has('page'))) {
    const tag = searchParams.get('tag') || 'all';
    const pg = searchParams.get('page') || '1';
    const newUrl = pg === '1' ? `/news/${tag}` : `/news/${tag}/${pg}`;
    return context.redirect(newUrl, 301);
  }

  // Rate limit public POST endpoints
  // Uses D1-backed rate limiter (global, cross-isolate) with in-memory fallback.
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
          // D1 unavailable, fall back to in-memory
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
                "X-RateLimit-Remaining": "0",
              },
            }
          );
        }
        break;
      }
    }
  }

  // Catch AuthError from requireAdmin() in API routes
  const start = Date.now();
  const { method } = context.request;
  const isLoggable = pathname.startsWith("/api/") || pathname.startsWith("/admin/");

  try {
    const response = await next();

    // Add security headers to all responses
    const securityHeaders: Record<string, string> = {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    };

    // CSP: Different policies for admin vs public pages.
    // - Admin/login pages: retain 'unsafe-inline' in script-src (onclick handlers in admin components).
    // - Other SSR pages: use hash-based script-src (no 'unsafe-inline').
    // - Prerendered pages: CSP is set via <meta> tag in BaseLayout.astro (middleware is skipped).
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
        "frame-ancestors 'none'",
      ].join("; ");
    } else {
      // For non-admin SSR pages, compute GTM script hash if gaId is available
      let scriptSrc = `'self' '${DARK_MODE_SCRIPT_HASH}' https://www.googletagmanager.com`;
      try {
        const d1 = await getD1();
        const env = await getEnv();
        const gaSettings = await batchGetSettings(d1, ['ga_measurement_id'], env.SETTINGS_CACHE);
        const gaId = gaSettings.get('ga_measurement_id') || '';
        if (gaId) {
          const gtmScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
          const gtmHash = 'sha256-' + createHash('sha256').update(gtmScript).digest('base64');
          scriptSrc = `'self' '${DARK_MODE_SCRIPT_HASH}' '${gtmHash}' https://www.googletagmanager.com`;
        }
      } catch { /* gaId unavailable, use default scriptSrc */ }

      securityHeaders["Content-Security-Policy"] = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob: https://www.google-analytics.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com",
        "frame-ancestors 'none'",
      ].join("; ");
    }

    // Apply security headers
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }

    // Request log for API and admin routes
    if (isLoggable) {
      const ms = Date.now() - start;
      const status = response.status;
      logger.info("Request completed", { method, pathname, status, ms });
    }

    return response;
  } catch (e: unknown) {
    if (isLoggable) {
      const ms = Date.now() - start;
      logger.error("Request failed", { method, pathname, ms, error: e instanceof Error ? e.message : String(e) });
    }

    if (e && typeof e === "object" && "status" in e && "message" in e) {
      const status = (e as { status: number }).status;
      const message = (e as { message: string }).message;
      if (status === 401 || status === 403) {
        return new Response(JSON.stringify({ error: message }), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    throw e;
  }
});
