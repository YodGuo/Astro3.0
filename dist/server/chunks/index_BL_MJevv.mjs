globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, s as sql, q as quoteRequests, n as newsPosts, e as eq, h as products, c as comments } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let stats = { quotes: 0, news: 0, products: 0, comments: 0 };
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      const [quotes, news, prods, comms] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(quoteRequests),
        db.select({ count: sql`count(*)` }).from(newsPosts).where(eq(newsPosts.status, "published")),
        db.select({ count: sql`count(*)` }).from(products),
        db.select({ count: sql`count(*)` }).from(comments).where(eq(comments.status, "pending"))
      ]);
      stats.quotes = quotes[0]?.count ?? 0;
      stats.news = news[0]?.count ?? 0;
      stats.products = prods[0]?.count ?? 0;
      stats.comments = comms[0]?.count ?? 0;
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard — Admin", "currentPath": "/admin", "data-astro-cid-u2h3djql": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-u2h3djql> <h1 class="heading-1" style="margin-bottom: 1.5rem;" data-astro-cid-u2h3djql>Dashboard</h1> <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(4, 1fr);" data-astro-cid-u2h3djql> <div class="card" data-astro-cid-u2h3djql><p class="stat-label" data-astro-cid-u2h3djql>New Quotes</p><p class="stat-value" style="color: var(--color-info-text);" data-astro-cid-u2h3djql>${stats.quotes}</p></div> <div class="card" data-astro-cid-u2h3djql><p class="stat-label" data-astro-cid-u2h3djql>Published News</p><p class="stat-value" style="color: var(--color-success-text);" data-astro-cid-u2h3djql>${stats.news}</p></div> <div class="card" data-astro-cid-u2h3djql><p class="stat-label" data-astro-cid-u2h3djql>Products</p><p class="stat-value" style="color: var(--color-stat-purple);" data-astro-cid-u2h3djql>${stats.products}</p></div> <div class="card" data-astro-cid-u2h3djql><p class="stat-label" data-astro-cid-u2h3djql>Pending Comments</p><p class="stat-value" style="color: var(--color-stat-amber);" data-astro-cid-u2h3djql>${stats.comments}</p></div> </div> </div> ` })}`;
}, "/workspace/src/pages/admin/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/index.astro";
const $$url = "/admin";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
