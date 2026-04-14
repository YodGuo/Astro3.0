globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { c as addAttribute, d as renderHead, r as renderTemplate, e as renderSlot } from "./sequence_IbtNAemG.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { g as getD1, b as batchGetSettings } from "./page-visibility_B2S94meR.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const $$AdminLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title: pageTitle, currentPath = "" } = Astro2.props;
  const user = Astro2.locals.user;
  const d1 = await getD1();
  const env = await getEnv();
  const settings = await batchGetSettings(d1, ["site_name", "site_favicon_url"], env.SETTINGS_CACHE);
  const siteName = settings.get("site_name") || "YourCompany";
  const siteFaviconUrl = settings.get("site_favicon_url") || "/favicon.svg";
  const faviconType = siteFaviconUrl.endsWith(".svg") ? "image/svg+xml" : siteFaviconUrl.endsWith(".ico") ? "image/x-icon" : "image/png";
  const title = pageTitle || `Admin — ${siteName}`;
  const ADMIN_NAV = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/quotes", label: "Quotes" },
    { href: "/admin/news", label: "News" },
    { href: "/admin/news/comments", label: "Comments" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/solutions", label: "Solutions" },
    { href: "/admin/settings", label: "Settings" }
  ];
  return renderTemplate`<html lang="en" data-astro-cid-2kanml4j> <head><meta charset="utf-8"><link rel="icon"${addAttribute(faviconType, "type")}${addAttribute(siteFaviconUrl, "href")}><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body style="margin: 0;" data-astro-cid-2kanml4j> <a href="#admin-main-content" class="skip-link" data-astro-cid-2kanml4j>Skip to main content</a> <!-- Mobile top bar --> <div class="admin-mobile-bar" data-astro-cid-2kanml4j> <button class="admin-menu-btn" id="admin-menu-btn" aria-label="Toggle sidebar" data-astro-cid-2kanml4j> <span class="admin-menu-bar" data-astro-cid-2kanml4j></span> <span class="admin-menu-bar" data-astro-cid-2kanml4j></span> <span class="admin-menu-bar" data-astro-cid-2kanml4j></span> </button> <span class="admin-mobile-title" data-astro-cid-2kanml4j>Admin</span> <a href="/" class="admin-mobile-back" data-astro-cid-2kanml4j>← Site</a> </div> <!-- Mobile overlay --> <div class="admin-overlay" id="admin-overlay" data-astro-cid-2kanml4j></div> <div style="display: flex; min-height: 100vh;" data-astro-cid-2kanml4j> <aside class="admin-sidebar" id="admin-sidebar" data-astro-cid-2kanml4j> <a href="/" class="admin-back" data-astro-cid-2kanml4j>← Back to site</a> <h2 class="admin-heading" data-astro-cid-2kanml4j>Admin Panel</h2> <nav class="admin-nav" data-astro-cid-2kanml4j> ${ADMIN_NAV.map((link) => {
    const isActive = currentPath === link.href || link.href !== "/admin" && currentPath.startsWith(link.href);
    return renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["admin-nav-link", { active: isActive }], "class:list")} data-astro-cid-2kanml4j> ${link.label} </a>`;
  })} </nav> <div class="admin-user" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--color-border);" data-astro-cid-2kanml4j> <p style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 0.5rem;" data-astro-cid-2kanml4j> ${user?.name || user?.email || "Admin"} </p> <a href="/api/auth/sign-out" style="font-size: 0.8125rem; color: var(--color-text-secondary); text-decoration: none;" data-astro-cid-2kanml4j>Sign Out</a> </div> </aside> <main id="admin-main-content" class="admin-main" data-astro-cid-2kanml4j> ${renderSlot($$result, $$slots["default"])} </main> </div> <!-- Toast Container for real-time notifications --> <div id="toast-container" data-astro-cid-2kanml4j></div> ${renderScript($$result, "/workspace/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/workspace/src/layouts/AdminLayout.astro", void 0);
export {
  $$AdminLayout as $
};
