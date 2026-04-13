globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, e as renderSlot, c as addAttribute, d as renderHead, F as Fragment, k as unescapeHTML, m as maybeRenderHead } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent, r as reactExports } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { g as getD1, b as batchGetSettings } from "./page-visibility_B2S94meR.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { createHash } from "node:crypto";
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { g as getBaseURL, c as createFetch, d as defu, a as capitalizeFirstLetter, P as PASSKEY_ERROR_CODES, b as PACKAGE_VERSION } from "./version-BqiApG_X_-KzCJfIH.mjs";
import { E as ErrorBoundary } from "./ErrorBoundary_C8rdxpLG.mjs";
const darkModeCssRaw = "/* ── Dark Mode ── */\n/* This file is conditionally imported by BaseLayout when dark_mode_enabled is true. */\n/* When dark_mode_enabled is false, this file is NOT imported, so dark mode is completely disabled. */\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    /* ── Color System (50-950) ── */\n    --color-brand-50: #022c22;\n    --color-brand-100: #064e3b;\n    --color-brand-200: #065f46;\n    --color-brand-300: #047857;\n    --color-brand-400: #059669;\n    --color-brand-500: #10b981;\n    --color-brand-600: #34d399;\n    --color-brand-700: #6ee7b7;\n    --color-brand-800: #a7f3d0;\n    --color-brand-900: #d1fae5;\n    --color-brand-950: #ecfdf5;\n\n    --color-gray-50: #030712;\n    --color-gray-100: #111827;\n    --color-gray-200: #1f2937;\n    --color-gray-300: #374151;\n    --color-gray-400: #4b5563;\n    --color-gray-500: #6b7280;\n    --color-gray-600: #9ca3af;\n    --color-gray-700: #d1d5db;\n    --color-gray-800: #e5e7eb;\n    --color-gray-900: #f3f4f6;\n    --color-gray-950: #f9fafb;\n\n    /* ── Semantic Colors ── */\n    --color-surface: #030712;\n    --color-surface-subtle: #111827;\n    --color-surface-muted: #1f2937;\n    --color-border: #374151;\n    --color-border-subtle: #1f2937;\n\n    --color-text-primary: #f9fafb;\n    --color-text-secondary: #d1d5db;\n    --color-text-tertiary: #9ca3af;\n    --color-text-inverse: #030712;\n    --color-text-brand: var(--color-brand-400);\n\n    --color-danger: #ef4444;\n    --color-danger-50: #450a0a;\n    --color-danger-100: #7f1d1d;\n    --color-danger-200: #991b1b;\n    --color-danger-300: #b91c1c;\n    --color-danger-400: #dc2626;\n    --color-danger-500: #ef4444;\n    --color-danger-600: #f87171;\n    --color-danger-700: #fca5a5;\n    --color-danger-800: #fecaca;\n    --color-danger-900: #fee2e2;\n    --color-danger-950: #fef2f2;\n    --color-danger-text: var(--color-danger-400);\n    --color-danger-bg: rgba(220, 38, 38, 0.15);\n    --color-danger-border: rgba(220, 38, 38, 0.3);\n\n    --color-warning: #f59e0b;\n    --color-warning-50: #451a03;\n    --color-warning-100: #78350f;\n    --color-warning-200: #92400e;\n    --color-warning-300: #b45309;\n    --color-warning-400: #d97706;\n    --color-warning-500: #f59e0b;\n    --color-warning-600: #fbbf24;\n    --color-warning-700: #fcd34d;\n    --color-warning-800: #fde68a;\n    --color-warning-900: #fef3c7;\n    --color-warning-950: #fffbeb;\n    --color-warning-text: var(--color-warning-400);\n    --color-warning-bg: rgba(245, 158, 11, 0.15);\n    --color-warning-border: rgba(245, 158, 11, 0.3);\n\n    --color-success: #22c55e;\n    --color-success-50: #052e16;\n    --color-success-100: #14532d;\n    --color-success-200: #166534;\n    --color-success-300: #15803d;\n    --color-success-400: #16a34a;\n    --color-success-500: #22c55e;\n    --color-success-600: #4ade80;\n    --color-success-700: #86efac;\n    --color-success-800: #bbf7d0;\n    --color-success-900: #dcfce7;\n    --color-success-950: #f0fdf4;\n    --color-success-text: var(--color-success-400);\n    --color-success-bg: rgba(34, 197, 94, 0.15);\n    --color-success-border: rgba(34, 197, 94, 0.3);\n\n    --color-info: #3b82f6;\n    --color-info-50: #172554;\n    --color-info-100: #1e3a8a;\n    --color-info-200: #1e40af;\n    --color-info-300: #1d4ed8;\n    --color-info-400: #2563eb;\n    --color-info-500: #3b82f6;\n    --color-info-600: #60a5fa;\n    --color-info-700: #93c5fd;\n    --color-info-800: #bfdbfe;\n    --color-info-900: #dbeafe;\n    --color-info-950: #eff6ff;\n    --color-info-text: var(--color-info-400);\n    --color-info-bg: rgba(37, 99, 235, 0.15);\n    --color-info-border: rgba(37, 99, 235, 0.3);\n\n    --color-stat-blue: #60a5fa;\n    --color-stat-green: #4ade80;\n    --color-stat-purple: #c084fc;\n    --color-stat-amber: #fbbf24;\n\n    /* ── Shadow System ── */\n    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.4);\n    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);\n    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);\n    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.5);\n    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6);\n    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.8);\n  }\n}\n\n/* ── Dark Mode — manual toggle (.dark class on <html>) ── */\n/* Same values as prefers-color-scheme:dark but takes priority when user explicitly toggles */\n:root.dark {\n  /* ── Color System (50-950) ── */\n  --color-brand-50: #022c22;\n  --color-brand-100: #064e3b;\n  --color-brand-200: #065f46;\n  --color-brand-300: #047857;\n  --color-brand-400: #059669;\n  --color-brand-500: #10b981;\n  --color-brand-600: #34d399;\n  --color-brand-700: #6ee7b7;\n  --color-brand-800: #a7f3d0;\n  --color-brand-900: #d1fae5;\n  --color-brand-950: #ecfdf5;\n\n  --color-gray-50: #030712;\n  --color-gray-100: #111827;\n  --color-gray-200: #1f2937;\n  --color-gray-300: #374151;\n  --color-gray-400: #4b5563;\n  --color-gray-500: #6b7280;\n  --color-gray-600: #9ca3af;\n  --color-gray-700: #d1d5db;\n  --color-gray-800: #e5e7eb;\n  --color-gray-900: #f3f4f6;\n  --color-gray-950: #f9fafb;\n\n  /* ── Semantic Colors ── */\n  --color-surface: #030712;\n  --color-surface-subtle: #111827;\n  --color-surface-muted: #1f2937;\n  --color-border: #374151;\n  --color-border-subtle: #1f2937;\n\n  --color-text-primary: #f9fafb;\n  --color-text-secondary: #d1d5db;\n  --color-text-tertiary: #9ca3af;\n  --color-text-inverse: #030712;\n  --color-text-brand: var(--color-brand-400);\n\n  --color-danger: #ef4444;\n  --color-danger-50: #450a0a;\n  --color-danger-100: #7f1d1d;\n  --color-danger-200: #991b1b;\n  --color-danger-300: #b91c1c;\n  --color-danger-400: #dc2626;\n  --color-danger-500: #ef4444;\n  --color-danger-600: #f87171;\n  --color-danger-700: #fca5a5;\n  --color-danger-800: #fecaca;\n  --color-danger-900: #fee2e2;\n  --color-danger-950: #fef2f2;\n  --color-danger-text: var(--color-danger-400);\n  --color-danger-bg: rgba(220, 38, 38, 0.15);\n  --color-danger-border: rgba(220, 38, 38, 0.3);\n\n  --color-warning: #f59e0b;\n  --color-warning-50: #451a03;\n  --color-warning-100: #78350f;\n  --color-warning-200: #92400e;\n  --color-warning-300: #b45309;\n  --color-warning-400: #d97706;\n  --color-warning-500: #f59e0b;\n  --color-warning-600: #fbbf24;\n  --color-warning-700: #fcd34d;\n  --color-warning-800: #fde68a;\n  --color-warning-900: #fef3c7;\n  --color-warning-950: #fffbeb;\n  --color-warning-text: var(--color-warning-400);\n  --color-warning-bg: rgba(245, 158, 11, 0.15);\n  --color-warning-border: rgba(245, 158, 11, 0.3);\n\n  --color-success: #22c55e;\n  --color-success-50: #052e16;\n  --color-success-100: #14532d;\n  --color-success-200: #166534;\n  --color-success-300: #15803d;\n  --color-success-400: #16a34a;\n  --color-success-500: #22c55e;\n  --color-success-600: #4ade80;\n  --color-success-700: #86efac;\n  --color-success-800: #bbf7d0;\n  --color-success-900: #dcfce7;\n  --color-success-950: #f0fdf4;\n  --color-success-text: var(--color-success-400);\n  --color-success-bg: rgba(34, 197, 94, 0.15);\n  --color-success-border: rgba(34, 197, 94, 0.3);\n\n  --color-info: #3b82f6;\n  --color-info-50: #172554;\n  --color-info-100: #1e3a8a;\n  --color-info-200: #1e40af;\n  --color-info-300: #1d4ed8;\n  --color-info-400: #2563eb;\n  --color-info-500: #3b82f6;\n  --color-info-600: #60a5fa;\n  --color-info-700: #93c5fd;\n  --color-info-800: #bfdbfe;\n  --color-info-900: #dbeafe;\n  --color-info-950: #eff6ff;\n  --color-info-text: var(--color-info-400);\n  --color-info-bg: rgba(37, 99, 235, 0.15);\n  --color-info-border: rgba(37, 99, 235, 0.3);\n\n  --color-stat-blue: #60a5fa;\n  --color-stat-green: #4ade80;\n  --color-stat-purple: #c084fc;\n  --color-stat-amber: #fbbf24;\n\n  /* ── Shadow System ── */\n  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.4);\n  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);\n  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4);\n  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.5);\n  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6);\n  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.8);\n}\n";
const DEFAULT_OPTIONS = {
  width: 1200,
  quality: 85,
  format: "auto"
};
function optimizeImage(src, options) {
  if (!src || typeof src !== "string") return src || "";
  if (src.startsWith("data:") || src.startsWith("/cdn-cgi/image/") || !src.startsWith("http")) {
    return src;
  }
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.quality) params.set("quality", String(opts.quality));
  if (opts.format) params.set("format", opts.format);
  if (opts.metadata !== void 0) params.set("metadata", opts.metadata);
  else params.set("metadata", "none");
  return `/cdn-cgi/image/${params.toString()}/${src}`;
}
const IMAGE_PRESETS = {
  /** Site logo: small, high quality */
  logo: { width: 200, quality: 90, format: "auto" }
};
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b, _c;
const $$BaseLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, description, ogImage, ogType = "website", articleMeta, buildData, noIndex } = Astro2.props;
  const siteUrl = Astro2.site?.toString().replace(/\/$/, "") || "https://yourcompany.com";
  let settings = /* @__PURE__ */ new Map();
  if (buildData && buildData.settings && Object.keys(buildData.settings).length > 0) {
    settings = new Map(Object.entries(buildData.settings));
  } else {
    const d1 = await getD1();
    const env = await getEnv();
    const allKeys = [
      "social_links",
      "products_enabled",
      "solutions_enabled",
      "services_enabled",
      "news_enabled",
      "about_enabled",
      "privacy_enabled",
      "terms_enabled",
      "site_name",
      "site_description",
      "site_logo_url",
      "site_favicon_url",
      "site_og_image_url",
      "ga_measurement_id"
    ];
    settings = await batchGetSettings(d1, allKeys, env.SETTINGS_CACHE);
  }
  const siteName = settings.get("site_name") || "YourCompany";
  const siteDescription = settings.get("site_description") || "Professional B2B power solutions — UPS systems, PDUs, and power distribution products.";
  const siteLogoUrl = settings.get("site_logo_url") || "";
  const siteFaviconUrl = settings.get("site_favicon_url") || "/favicon.svg";
  const siteOgImageUrl = settings.get("site_og_image_url") || "";
  const darkModeEnabled = settings.get("dark_mode_enabled") === "true" || settings.get("dark_mode_enabled") === true;
  const darkModeCss = darkModeEnabled ? darkModeCssRaw : "";
  const gaId = buildData?.settings?.ga_measurement_id || settings.get("ga_measurement_id") || "";
  const privacyEnabled = buildData?.settings?.privacy_enabled || settings.get("privacy_enabled") || "true";
  const termsEnabled = buildData?.settings?.terms_enabled || settings.get("terms_enabled") || "true";
  const DARK_MODE_SCRIPT_HASH = "sha256-M2ZSmr5LG1uJ6pVKG4w+MZqkgWk7HQJnSJJE10ky6YM=";
  let gtmScriptHash = "";
  if (gaId) {
    const gtmScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
    gtmScriptHash = "sha256-" + createHash("sha256").update(gtmScript).digest("base64");
  }
  const cspScriptSrc = gaId ? `'self' '${DARK_MODE_SCRIPT_HASH}' '${gtmScriptHash}' https://www.googletagmanager.com` : `'self' '${DARK_MODE_SCRIPT_HASH}' https://www.googletagmanager.com`;
  const pageTitle = title ? `${title} — ${siteName}` : `${siteName} — Uninterruptible Power Solutions`;
  const pageDescription = description || siteDescription;
  const pageOgImage = ogImage || (siteOgImageUrl ? `${siteUrl}${siteOgImageUrl}` : `${siteUrl}/og-default.png`);
  const faviconType = siteFaviconUrl.endsWith(".svg") ? "image/svg+xml" : siteFaviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
  let socialLinks = [];
  try {
    const raw = settings.get("social_links");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) socialLinks = parsed.filter((url) => typeof url === "string" && url.startsWith("http"));
    }
  } catch {
  }
  const NAV_LINKS = [
    { href: "/products", label: "Products", settingKey: "products_enabled" },
    { href: "/solutions/data-centers", label: "Solutions", settingKey: "solutions_enabled" },
    { href: "/services", label: "Services", settingKey: "services_enabled" },
    { href: "/news", label: "News", settingKey: "news_enabled" },
    { href: "/about", label: "About", settingKey: "about_enabled" }
  ];
  const visibleLinks = NAV_LINKS.filter(
    (link) => {
      const v = settings.get(link.settingKey);
      return v === void 0 || v === "true";
    }
  );
  return renderTemplate(_c || (_c = __template(['<html lang="en" data-astro-cid-37fxchfa> <head><meta charset="utf-8"><link rel="icon"', "", `><!-- Google Fonts: preconnect + preload + non-blocking stylesheet (P-02: optimized for LCP) --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" media="print" onload="this.media='all'">`, '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"></noscript><meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="generator"', "><title>", '</title><meta name="description"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type"', '><meta property="og:url"', '><link rel="canonical"', ">", '<meta property="og:image"', '><meta property="og:site_name"', '><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', ">", '<!-- Organization Structured Data --><script type="application/ld+json">', "<\/script>", '<meta http-equiv="content-security-policy"', ">", '</head> <body data-astro-cid-37fxchfa> <a href="#main-content" class="skip-link" data-astro-cid-37fxchfa>Skip to main content</a> <header class="site-header" data-astro-cid-37fxchfa> <div class="container" data-astro-cid-37fxchfa> <a href="/" class="logo" data-astro-cid-37fxchfa> ', ' </a> <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false" data-astro-cid-37fxchfa> <span class="menu-bar" data-astro-cid-37fxchfa></span> <span class="menu-bar" data-astro-cid-37fxchfa></span> <span class="menu-bar" data-astro-cid-37fxchfa></span> </button> <nav class="nav" id="main-nav" data-astro-cid-37fxchfa> ', " ", ' </nav> </div> </header> <main id="main-content" data-astro-cid-37fxchfa> ', ' </main> <footer class="site-footer" data-astro-cid-37fxchfa> <div class="container" data-astro-cid-37fxchfa> <p style="font-size: 0.875rem; color: var(--color-text-tertiary);" data-astro-cid-37fxchfa>© ', " ", ". All rights reserved.\n", " ", " </p> </div> </footer> ", " ", "</body></html>"])), addAttribute(faviconType, "type"), addAttribute(siteFaviconUrl, "href"), maybeRenderHead(), darkModeCss && renderTemplate`<style is:global>${unescapeHTML(darkModeCss)}</style>`, addAttribute(Astro2.generator, "content"), pageTitle, addAttribute(pageDescription, "content"), addAttribute(pageTitle, "content"), addAttribute(pageDescription, "content"), addAttribute(ogType, "content"), addAttribute(Astro2.url.href, "content"), addAttribute(Astro2.url.href, "href"), noIndex && renderTemplate`<meta name="robots" content="noindex, nofollow">`, addAttribute(pageOgImage, "content"), addAttribute(siteName, "content"), addAttribute(pageTitle, "content"), addAttribute(pageDescription, "content"), addAttribute(pageOgImage, "content"), articleMeta && renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-37fxchfa": true }, { "default": async ($$result2) => renderTemplate`${articleMeta.publishedTime && renderTemplate`<meta property="article:published_time"${addAttribute(articleMeta.publishedTime, "content")}>`}${articleMeta.author && renderTemplate`<meta property="article:author"${addAttribute(articleMeta.author, "content")}>`}${articleMeta.tags?.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`)}` })}`, unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": siteLogoUrl ? `${siteUrl}${siteLogoUrl}` : `${siteUrl}/logo.png`,
    "description": siteDescription,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "sales",
      "availableLanguage": ["English", "Chinese"]
    },
    "sameAs": socialLinks
  })), gaId && renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-37fxchfa": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["<script>", "<\/script><script async", "><\/script>"])), unescapeHTML(`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`), addAttribute(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "src")) })}`, addAttribute(`default-src 'self'; script-src ${cspScriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: https://www.google-analytics.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com; frame-ancestors 'none';`, "content"), renderHead(), siteLogoUrl ? renderTemplate`<img${addAttribute(optimizeImage(siteLogoUrl, IMAGE_PRESETS.logo), "src")}${addAttribute(siteName, "alt")} class="logo-img" data-astro-cid-37fxchfa>` : siteName, visibleLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class="nav-link" data-astro-cid-37fxchfa>${link.label}</a>`), darkModeEnabled && renderTemplate`<button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode" data-astro-cid-37fxchfa> <svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none" data-astro-cid-37fxchfa><circle cx="12" cy="12" r="5" data-astro-cid-37fxchfa></circle><line x1="12" y1="1" x2="12" y2="3" data-astro-cid-37fxchfa></line><line x1="12" y1="21" x2="12" y2="23" data-astro-cid-37fxchfa></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" data-astro-cid-37fxchfa></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" data-astro-cid-37fxchfa></line><line x1="1" y1="12" x2="3" y2="12" data-astro-cid-37fxchfa></line><line x1="21" y1="12" x2="23" y2="12" data-astro-cid-37fxchfa></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" data-astro-cid-37fxchfa></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" data-astro-cid-37fxchfa></line></svg> <svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-37fxchfa><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" data-astro-cid-37fxchfa></path></svg> </button>`, renderSlot($$result, $$slots["default"]), (/* @__PURE__ */ new Date()).getFullYear(), siteName, privacyEnabled !== "false" && renderTemplate`<a href="/privacy" style="color: var(--color-text-secondary); margin-left: 1rem;" data-astro-cid-37fxchfa>Privacy Policy</a>`, termsEnabled !== "false" && renderTemplate`<a href="/terms" style="color: var(--color-text-secondary); margin-left: 1rem;" data-astro-cid-37fxchfa>Terms & Conditions</a>`, renderScript($$result, "/workspace/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"), darkModeEnabled && renderTemplate(_b || (_b = __template(["<script>\n// ── Dark mode toggle ──\n(function initThemeToggle() {\n  const btn = document.getElementById('theme-toggle');\n  const sunIcon = document.getElementById('theme-icon-sun');\n  const moonIcon = document.getElementById('theme-icon-moon');\n  if (!btn || !sunIcon || !moonIcon) return;\n\n  const STORAGE_KEY = 'theme';\n\n  function getStoredTheme() {\n    return localStorage.getItem(STORAGE_KEY) || 'system';\n  }\n\n  function isDark() {\n    const theme = getStoredTheme();\n    if (theme === 'dark') return true;\n    if (theme === 'light') return false;\n    return window.matchMedia('(prefers-color-scheme: dark)').matches;\n  }\n\n  function applyTheme() {\n    const dark = isDark();\n    document.documentElement.classList.toggle('dark', dark);\n    sunIcon.style.display = dark ? 'block' : 'none';\n    moonIcon.style.display = dark ? 'none' : 'block';\n  }\n\n  btn.addEventListener('click', () => {\n    const current = getStoredTheme();\n    const next = current === 'dark' ? 'light' : 'dark';\n    localStorage.setItem(STORAGE_KEY, next);\n    applyTheme();\n  });\n\n  // Apply on load (before paint to avoid flash)\n  applyTheme();\n\n  // Listen for system preference changes when in 'system' mode\n  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {\n    if (getStoredTheme() === 'system') applyTheme();\n  });\n})();\n<\/script>"]))));
}, "/workspace/src/layouts/BaseLayout.astro", void 0);
const PROTO_POLLUTION_PATTERNS = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
};
const JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
const SPECIAL_VALUES = {
  true: true,
  false: false,
  null: null,
  undefined: void 0,
  nan: NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
};
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
  if (offsetSign) {
    const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
  }
  return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
  const { strict = false, warnings = false, reviver, parseDates = true } = options;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (trimmed.length > 0 && trimmed[0] === '"' && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('"')) return trimmed.slice(1, -1);
  const lowerValue = trimmed.toLowerCase();
  if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
  if (!JSON_SIGNATURE.test(trimmed)) {
    if (strict) throw new SyntaxError("[better-json] Invalid JSON");
    return value;
  }
  if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
    const matches = pattern.test(trimmed);
    if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
    return matches;
  }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
  try {
    const secureReviver = (key, value2) => {
      if (key === "__proto__" || key === "constructor" && value2 && typeof value2 === "object" && "prototype" in value2) {
        if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
        return;
      }
      if (parseDates && typeof value2 === "string") {
        const date = parseISODate(value2);
        if (date) return date;
      }
      return reviver ? reviver(key, value2) : value2;
    };
    return JSON.parse(trimmed, secureReviver);
  } catch (error) {
    if (strict) throw error;
    return value;
  }
}
function parseJSON(value, options = { strict: true }) {
  return betterJSONParse(value, options);
}
const redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location) try {
          window.location.href = context.data.url;
        } catch {
        }
      }
    }
  } }
};
let listenerQueue = [];
let lqIndex = 0;
const QUEUE_ITEMS_PER_LISTENER = 4;
const atom = /* @__NO_SIDE_EFFECTS__ */ (initialValue) => {
  let listeners = [];
  let $atom = {
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {
        })();
      }
      return $atom.value;
    },
    init: initialValue,
    lc: 0,
    listen(listener) {
      $atom.lc = listeners.push(listener);
      return () => {
        for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER; i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 1);
          if (!--$atom.lc) $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      let runListenerQueue = !listenerQueue.length;
      for (let listener of listeners) {
        listenerQueue.push(listener, $atom.value, oldValue, changedKey);
      }
      if (runListenerQueue) {
        for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
          listenerQueue[lqIndex](
            listenerQueue[lqIndex + 1],
            listenerQueue[lqIndex + 2],
            listenerQueue[lqIndex + 3]
          );
        }
        listenerQueue.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      if (oldValue !== newValue) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom;
};
const MOUNT = 5;
const UNMOUNT = 6;
const REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
let STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy) $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT]) destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};
function listenKeys($store, keys, listener) {
  let keysSet = new Set(keys).add(void 0);
  return $store.listen((value, oldValue, changed) => {
    if (keysSet.has(changed)) {
      listener(value, oldValue, changed);
    }
  });
}
const isServer = () => typeof window === "undefined";
const useAuthQuery = (initializedAtom, path, $fetch, options) => {
  const value = /* @__PURE__ */ atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: (queryParams) => fn(queryParams)
  });
  const fn = async (queryParams) => {
    return new Promise((resolve) => {
      const opts = typeof options === "function" ? options({
        data: value.get().data,
        error: value.get().error,
        isPending: value.get().isPending
      }) : options;
      $fetch(path, {
        ...opts,
        query: {
          ...opts?.query,
          ...queryParams?.query
        },
        async onSuccess(context) {
          value.set({
            data: context.data,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onSuccess?.(context);
        },
        async onError(context) {
          const { request } = context;
          const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
          const retryAttempt = request.retryAttempt || 0;
          if (retryAttempts && retryAttempt < retryAttempts) return;
          const isUnauthorized = context.error.status === 401;
          value.set({
            error: context.error,
            data: isUnauthorized ? null : value.get().data,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onError?.(context);
        },
        async onRequest(context) {
          const currentValue = value.get();
          value.set({
            isPending: currentValue.data === null,
            data: currentValue.data,
            error: null,
            isRefetching: true,
            refetch: value.value.refetch
          });
          await opts?.onRequest?.(context);
        }
      }).catch((error) => {
        value.set({
          error,
          data: value.get().data,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        });
      }).finally(() => {
        resolve(void 0);
      });
    });
  };
  initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
  let isMounted = false;
  for (const initAtom of initializedAtom) initAtom.subscribe(async () => {
    if (isServer()) return;
    if (isMounted) await fn();
    else onMount(value, () => {
      const timeoutId = setTimeout(async () => {
        if (!isMounted) {
          await fn();
          isMounted = true;
        }
      }, 0);
      return () => {
        value.off();
        initAtom.off();
        clearTimeout(timeoutId);
      };
    });
  });
  return value;
};
const kBroadcastChannel = /* @__PURE__ */ Symbol.for("better-auth:broadcast-channel");
const now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set();
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now$1()
      }));
    } catch {
    }
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const handler = (event) => {
      if (event.key !== this.name) return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data) return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}
const kFocusManager = /* @__PURE__ */ Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
  return globalThis[kFocusManager];
}
const kOnlineManager = /* @__PURE__ */ Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set();
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
  return globalThis[kOnlineManager];
}
const now = () => Math.floor(Date.now() / 1e3);
function normalizeSessionResponse(res) {
  if (typeof res === "object" && res !== null && "data" in res && "error" in res) return res;
  return {
    data: res,
    error: null
  };
}
const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    lastSync: 0,
    lastSessionRequest: 0,
    cachedSession: void 0
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch()) return;
    if (event?.event === "storage") {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
      return;
    }
    const currentSession = sessionAtom.get();
    const fetchSessionWithRefresh = () => {
      state.lastSessionRequest = now();
      $fetch("/get-session").then(async (res) => {
        let { data, error } = normalizeSessionResponse(res);
        if (data?.needsRefresh) try {
          const refreshRes = await $fetch("/get-session", { method: "POST" });
          ({ data, error } = normalizeSessionResponse(refreshRes));
        } catch {
        }
        const sessionData = data?.session && data?.user ? data : null;
        sessionAtom.set({
          ...currentSession,
          data: sessionData,
          error
        });
        state.lastSync = now();
        sessionSignal.set(!sessionSignal.get());
      }).catch(() => {
      });
    };
    if (event?.event === "poll") {
      fetchSessionWithRefresh();
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
      state.lastSessionRequest = now();
    }
    if (event?.event === "visibilitychange") {
      fetchSessionWithRefresh();
      return;
    }
    if (currentSession?.data === null || currentSession?.data === void 0) {
      state.lastSync = now();
      sessionSignal.set(!sessionSignal.get());
    }
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
      if (sessionAtom.get()?.data) triggerRefetch({ event: "poll" });
    }, refetchInterval * 1e3);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus) return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online) triggerRefetch({ event: "visibilitychange" });
    });
  };
  const init = () => {
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    getGlobalBroadcastChannel().setup();
    getGlobalFocusManager().setup();
    getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = void 0;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = void 0;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = void 0;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = void 0;
    }
    state.lastSync = 0;
    state.lastSessionRequest = 0;
    state.cachedSession = void 0;
  };
  return {
    init,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}
function getSessionAtom($fetch, options) {
  const $signal = /* @__PURE__ */ atom(false);
  const session = useAuthQuery($signal, "/get-session", $fetch, { method: "GET" });
  let broadcastSessionUpdate = () => {
  };
  onMount(session, () => {
    const refreshManager = createSessionRefreshManager({
      sessionAtom: session,
      sessionSignal: $signal,
      $fetch,
      options
    });
    refreshManager.init();
    broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
    return () => {
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal,
    broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
  };
}
const resolvePublicAuthUrl = (basePath) => {
  if (typeof process === "undefined") return void 0;
  const path = basePath ?? "/api/auth";
  if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
  if (typeof window === "undefined") {
    if (process.env.NEXTAUTH_URL) try {
      return process.env.NEXTAUTH_URL;
    } catch {
    }
    if (process.env.VERCEL_URL) try {
      const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
      return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
    } catch {
    }
  }
};
const getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
  const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text) return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
  const plugins = options?.plugins || [];
  let pluginsActions = {};
  const pluginsAtoms = {
    $sessionSignal,
    session
  };
  const pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
    },
    callback(path) {
      if (path === "/sign-out") broadcastSessionUpdate("signout");
      else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method) return method;
  if (fetchOptions?.method) return fetchOptions.method;
  if (body && Object.keys(body).length > 0) return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {
    }, {
      get(_, prop) {
        if (typeof prop !== "string") return;
        if (prop === "then" || prop === "catch" || prop === "finally") return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
        else {
          current = void 0;
          break;
        }
        if (typeof current === "function") return current;
        if (isAtom(current)) return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map((segment) => segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? void 0 : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal) return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length) return;
            const visited = /* @__PURE__ */ new Set();
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal) return;
              if (visited.has(match.signal)) continue;
              visited.add(match.signal);
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
              match.callback?.(routePath);
            }
          }
        });
      }
    });
  }
  return createProxy();
}
function useStore(store, options = {}) {
  const snapshotRef = reactExports.useRef(store.get());
  const { keys, deps = [store, keys] } = options;
  const subscribe = reactExports.useCallback((onChange) => {
    const emitChange = (value) => {
      if (snapshotRef.current === value) return;
      snapshotRef.current = value;
      onChange();
    };
    emitChange(store.value);
    if (keys?.length) return listenKeys(store, keys, emitChange);
    return store.listen(emitChange);
  }, deps);
  const get = () => snapshotRef.current;
  return reactExports.useSyncExternalStore(subscribe, get, get);
}
function getAtomKey(str) {
  return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = getClientConfig(options);
  const resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
function bufferToBase64URLString(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  const base64String = btoa(str);
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64URLStringToBuffer(base64URLString) {
  const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - base64.length % 4) % 4;
  const padded = base64.padEnd(base64.length + padLength, "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}
function browserSupportsWebAuthn() {
  return _browserSupportsWebAuthnInternals.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential === "function");
}
const _browserSupportsWebAuthnInternals = {
  stubThis: (value) => value
};
function toPublicKeyCredentialDescriptor(descriptor) {
  const { id } = descriptor;
  return {
    ...descriptor,
    id: base64URLStringToBuffer(id),
    /**
     * `descriptor.transports` is an array of our `AuthenticatorTransportFuture` that includes newer
     * transports that TypeScript's DOM lib is ignorant of. Convince TS that our list of transports
     * are fine to pass to WebAuthn since browsers will recognize the new value.
     */
    transports: descriptor.transports
  };
}
function isValidDomain(hostname) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(hostname)
  );
}
class WebAuthnError extends Error {
  constructor({ message, code, cause, name }) {
    super(message, { cause });
    Object.defineProperty(this, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = name ?? cause.name;
    this.code = code;
  }
}
function identifyRegistrationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "ConstraintError") {
    if (publicKey.authenticatorSelection?.requireResidentKey === true) {
      return new WebAuthnError({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: error
      });
    } else if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      options.mediation === "conditional" && publicKey.authenticatorSelection?.userVerification === "required"
    ) {
      return new WebAuthnError({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: error
      });
    } else if (publicKey.authenticatorSelection?.userVerification === "required") {
      return new WebAuthnError({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: error
      });
    }
  } else if (error.name === "InvalidStateError") {
    return new WebAuthnError({
      message: "The authenticator was previously registered",
      code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
      cause: error
    });
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "NotSupportedError") {
    const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
    if (validPubKeyCredParams.length === 0) {
      return new WebAuthnError({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
      code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = globalThis.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rp.id !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "TypeError") {
    if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
      return new WebAuthnError({
        message: "User ID was not between 1 and 64 characters",
        code: "ERROR_INVALID_USER_ID_LENGTH",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new credential",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return error;
}
class BaseWebAuthnAbortService {
  constructor() {
    Object.defineProperty(this, "controller", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  createNewAbortSignal() {
    if (this.controller) {
      const abortError = new Error("Cancelling existing WebAuthn API call for new one");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
    }
    const newController = new AbortController();
    this.controller = newController;
    return newController.signal;
  }
  cancelCeremony() {
    if (this.controller) {
      const abortError = new Error("Manually cancelling existing WebAuthn API call");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
      this.controller = void 0;
    }
  }
}
const WebAuthnAbortService = new BaseWebAuthnAbortService();
const attachments = ["cross-platform", "platform"];
function toAuthenticatorAttachment(attachment) {
  if (!attachment) {
    return;
  }
  if (attachments.indexOf(attachment) < 0) {
    return;
  }
  return attachment;
}
async function startRegistration(options) {
  if (!options.optionsJSON && options.challenge) {
    console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
    options = { optionsJSON: options };
  }
  const { optionsJSON, useAutoRegister = false } = options;
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  const publicKey = {
    ...optionsJSON,
    challenge: base64URLStringToBuffer(optionsJSON.challenge),
    user: {
      ...optionsJSON.user,
      id: base64URLStringToBuffer(optionsJSON.user.id)
    },
    excludeCredentials: optionsJSON.excludeCredentials?.map(toPublicKeyCredentialDescriptor)
  };
  const createOptions = {};
  if (useAutoRegister) {
    createOptions.mediation = "conditional";
  }
  createOptions.publicKey = publicKey;
  createOptions.signal = WebAuthnAbortService.createNewAbortSignal();
  let credential;
  try {
    credential = await navigator.credentials.create(createOptions);
  } catch (err) {
    throw identifyRegistrationError({ error: err, options: createOptions });
  }
  if (!credential) {
    throw new Error("Registration was not completed");
  }
  const { id, rawId, response, type } = credential;
  let transports = void 0;
  if (typeof response.getTransports === "function") {
    transports = response.getTransports();
  }
  let responsePublicKeyAlgorithm = void 0;
  if (typeof response.getPublicKeyAlgorithm === "function") {
    try {
      responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
    } catch (error) {
      warnOnBrokenImplementation("getPublicKeyAlgorithm()", error);
    }
  }
  let responsePublicKey = void 0;
  if (typeof response.getPublicKey === "function") {
    try {
      const _publicKey = response.getPublicKey();
      if (_publicKey !== null) {
        responsePublicKey = bufferToBase64URLString(_publicKey);
      }
    } catch (error) {
      warnOnBrokenImplementation("getPublicKey()", error);
    }
  }
  let responseAuthenticatorData;
  if (typeof response.getAuthenticatorData === "function") {
    try {
      responseAuthenticatorData = bufferToBase64URLString(response.getAuthenticatorData());
    } catch (error) {
      warnOnBrokenImplementation("getAuthenticatorData()", error);
    }
  }
  return {
    id,
    rawId: bufferToBase64URLString(rawId),
    response: {
      attestationObject: bufferToBase64URLString(response.attestationObject),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      transports,
      publicKeyAlgorithm: responsePublicKeyAlgorithm,
      publicKey: responsePublicKey,
      authenticatorData: responseAuthenticatorData
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment)
  };
}
function warnOnBrokenImplementation(methodName, cause) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${methodName}. You should report this error to them.
`, cause);
}
function browserSupportsWebAuthnAutofill() {
  if (!browserSupportsWebAuthn()) {
    return _browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
  }
  const globalPublicKeyCredential = globalThis.PublicKeyCredential;
  if (globalPublicKeyCredential?.isConditionalMediationAvailable === void 0) {
    return _browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
  }
  return _browserSupportsWebAuthnAutofillInternals.stubThis(globalPublicKeyCredential.isConditionalMediationAvailable());
}
const _browserSupportsWebAuthnAutofillInternals = {
  stubThis: (value) => value
};
function identifyAuthenticationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = globalThis.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rpId !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return error;
}
async function startAuthentication(options) {
  if (!options.optionsJSON && options.challenge) {
    console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
    options = { optionsJSON: options };
  }
  const { optionsJSON, useBrowserAutofill = false, verifyBrowserAutofillInput = true } = options;
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  let allowCredentials;
  if (optionsJSON.allowCredentials?.length !== 0) {
    allowCredentials = optionsJSON.allowCredentials?.map(toPublicKeyCredentialDescriptor);
  }
  const publicKey = {
    ...optionsJSON,
    challenge: base64URLStringToBuffer(optionsJSON.challenge),
    allowCredentials
  };
  const getOptions = {};
  if (useBrowserAutofill) {
    if (!await browserSupportsWebAuthnAutofill()) {
      throw Error("Browser does not support WebAuthn autofill");
    }
    const eligibleInputs = document.querySelectorAll("input[autocomplete$='webauthn']");
    if (eligibleInputs.length < 1 && verifyBrowserAutofillInput) {
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    }
    getOptions.mediation = "conditional";
    publicKey.allowCredentials = [];
  }
  getOptions.publicKey = publicKey;
  getOptions.signal = WebAuthnAbortService.createNewAbortSignal();
  let credential;
  try {
    credential = await navigator.credentials.get(getOptions);
  } catch (err) {
    throw identifyAuthenticationError({ error: err, options: getOptions });
  }
  if (!credential) {
    throw new Error("Authentication was not completed");
  }
  const { id, rawId, response, type } = credential;
  let userHandle = void 0;
  if (response.userHandle) {
    userHandle = bufferToBase64URLString(response.userHandle);
  }
  return {
    id,
    rawId: bufferToBase64URLString(rawId),
    response: {
      authenticatorData: bufferToBase64URLString(response.authenticatorData),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      signature: bufferToBase64URLString(response.signature),
      userHandle
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment)
  };
}
const getPasskeyActions = ($fetch, { $listPasskeys, $store }) => {
  const signInPasskey = async (opts, options) => {
    const response = await $fetch("/passkey/generate-authenticate-options", {
      method: "GET",
      throw: false
    });
    if (!response.data) return response;
    try {
      const mergedExtensions = response.data.extensions || opts?.extensions ? {
        ...response.data.extensions || {},
        ...opts?.extensions || {}
      } : void 0;
      const res = await startAuthentication({
        optionsJSON: {
          ...response.data,
          extensions: mergedExtensions
        },
        useBrowserAutofill: opts?.autoFill
      });
      const { clientExtensionResults, ...responseBody } = res;
      const verified = await $fetch("/passkey/verify-authentication", {
        body: { response: responseBody },
        ...opts?.fetchOptions,
        ...options,
        method: "POST",
        throw: false
      });
      $listPasskeys.set(Math.random());
      $store.notify("$sessionSignal");
      if (opts?.returnWebAuthnResponse) return {
        ...verified,
        webauthn: {
          response: res,
          clientExtensionResults
        }
      };
      return verified;
    } catch (err) {
      console.error(`[Better Auth] Error verifying passkey`, err);
      return {
        data: null,
        error: {
          code: "AUTH_CANCELLED",
          message: PASSKEY_ERROR_CODES.AUTH_CANCELLED.message,
          status: 400,
          statusText: "BAD_REQUEST"
        }
      };
    }
  };
  const registerPasskey = async (opts, fetchOpts) => {
    const options = await $fetch("/passkey/generate-register-options", {
      method: "GET",
      query: {
        ...opts?.authenticatorAttachment && { authenticatorAttachment: opts.authenticatorAttachment },
        ...opts?.name && { name: opts.name },
        ...opts?.context && { context: opts.context }
      },
      throw: false
    });
    if (!options.data) return options;
    try {
      const mergedExtensions = options.data.extensions || opts?.extensions ? {
        ...options.data.extensions || {},
        ...opts?.extensions || {}
      } : void 0;
      const res = await startRegistration({
        optionsJSON: {
          ...options.data,
          extensions: mergedExtensions
        },
        useAutoRegister: opts?.useAutoRegister
      });
      const { clientExtensionResults, ...responseBody } = res;
      const verified = await $fetch("/passkey/verify-registration", {
        ...opts?.fetchOptions,
        ...fetchOpts,
        body: {
          response: responseBody,
          name: opts?.name
        },
        method: "POST",
        throw: false
      });
      if (!verified.data) return verified;
      $listPasskeys.set(Math.random());
      if (opts?.returnWebAuthnResponse) return {
        ...verified,
        webauthn: {
          response: res,
          clientExtensionResults
        }
      };
      return verified;
    } catch (e) {
      if (e instanceof WebAuthnError) {
        if (e.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") return {
          data: null,
          error: {
            code: e.code,
            message: PASSKEY_ERROR_CODES.PREVIOUSLY_REGISTERED.message,
            status: 400,
            statusText: "BAD_REQUEST"
          }
        };
        if (e.code === "ERROR_CEREMONY_ABORTED") return {
          data: null,
          error: {
            code: e.code,
            message: PASSKEY_ERROR_CODES.REGISTRATION_CANCELLED.message,
            status: 400,
            statusText: "BAD_REQUEST"
          }
        };
        return {
          data: null,
          error: {
            code: e.code,
            message: e.message,
            status: 400,
            statusText: "BAD_REQUEST"
          }
        };
      }
      return {
        data: null,
        error: {
          code: "UNKNOWN_ERROR",
          message: e instanceof Error ? e.message : PASSKEY_ERROR_CODES.UNKNOWN_ERROR.message,
          status: 500,
          statusText: "INTERNAL_SERVER_ERROR"
        }
      };
    }
  };
  return {
    signIn: { passkey: signInPasskey },
    passkey: { addPasskey: registerPasskey },
    $Infer: {}
  };
};
const passkeyClient = () => {
  const $listPasskeys = /* @__PURE__ */ atom();
  return {
    id: "passkey",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    getActions: ($fetch, $store) => getPasskeyActions($fetch, {
      $listPasskeys,
      $store
    }),
    getAtoms($fetch) {
      return {
        listPasskeys: useAuthQuery($listPasskeys, "/passkey/list-user-passkeys", $fetch, { method: "GET" }),
        $listPasskeys
      };
    },
    pathMethods: {
      "/passkey/register": "POST",
      "/passkey/authenticate": "POST"
    },
    atomListeners: [{
      matcher(path) {
        return path === "/passkey/verify-registration" || path === "/passkey/delete-passkey" || path === "/passkey/update-passkey" || path === "/sign-out";
      },
      signal: "$listPasskeys"
    }, {
      matcher: (path) => path === "/passkey/verify-authentication",
      signal: "$sessionSignal"
    }],
    $ERROR_CODES: PASSKEY_ERROR_CODES
  };
};
const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include"
  },
  plugins: [
    passkeyClient()
  ]
});
const { signIn, signOut, signUp, useSession } = authClient;
const btnBase = {
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  transition: "opacity 0.15s"
};
function LoginForm() {
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [passkeyLoading, setPasskeyLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };
  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    setError(null);
    try {
      if (!window.PublicKeyCredential) {
        setError("Passkeys are not supported in this browser.");
        setPasskeyLoading(false);
        return;
      }
      const result = await authClient.signIn.passkey();
      if (result.error) {
        setError(result.error.message || "Passkey sign-in failed");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey sign-in failed");
    } finally {
      setPasskeyLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxWidth: "24rem", margin: "0 auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    padding: "2rem"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }, children: "Sign In" }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      padding: "0.75rem 1rem",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      color: "#b91c1c",
      fontSize: "0.875rem",
      marginBottom: "1rem"
    }, children: error }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: handlePasskeySignIn,
        disabled: passkeyLoading || loading,
        style: {
          ...btnBase,
          width: "100%",
          background: "#1e293b",
          color: "#fff",
          opacity: passkeyLoading ? 0.7 : 1,
          marginBottom: "0.75rem"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor" })
          ] }),
          passkeyLoading ? "Waiting for device..." : "Sign in with Passkey"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      margin: "1rem 0",
      color: "var(--color-text-tertiary)",
      fontSize: "0.75rem"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: "1px", background: "var(--color-border)" } }),
      "or continue with password",
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: "1px", background: "var(--color-border)" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "admin@yourcompany.com",
            required: true,
            style: {
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              fontSize: "0.875rem"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••••••",
            required: true,
            style: {
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              fontSize: "0.875rem"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading || passkeyLoading,
          style: {
            ...btnBase,
            background: "var(--color-brand-600)",
            color: "#fff",
            opacity: loading ? 0.7 : 1
          },
          children: loading ? "Signing in..." : "Sign In with Password"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
      marginTop: "1.5rem",
      fontSize: "0.75rem",
      color: "var(--color-text-tertiary)",
      textAlign: "center"
    }, children: "Contact your administrator to create an account." })
  ] }) });
}
const prerender = false;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Sign In" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section style="padding: 4rem 0;"> <div class="container"> ${renderComponent($$result2, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/ErrorBoundary.tsx", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/LoginForm.tsx", "client:component-export": "default" })} ` })} </div> </section> ` })}`;
}, "/workspace/src/pages/login.astro", void 0);
const $$file = "/workspace/src/pages/login.astro";
const $$url = "/login";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
