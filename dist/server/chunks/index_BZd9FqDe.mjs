globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, n as newsPosts, s as sql } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let articles = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      articles = await db.select({ id: newsPosts.id, title: newsPosts.title, status: newsPosts.status, createdAt: newsPosts.createdAt, slug: newsPosts.slug }).from(newsPosts).orderBy(sql`${newsPosts.createdAt} desc`);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "News — Admin", "currentPath": "/admin/news", "data-astro-cid-kowqkul7": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-kowqkul7> <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;" data-astro-cid-kowqkul7> <h1 class="heading-1" data-astro-cid-kowqkul7>News Articles</h1> <a href="/admin/news/new" class="btn-primary" style="text-decoration: none; font-size: 0.875rem; padding: 0.5rem 1rem;" data-astro-cid-kowqkul7>+ New Article</a> </div> <div class="admin-table-wrap" data-astro-cid-kowqkul7> <table class="admin-table" data-astro-cid-kowqkul7> <thead data-astro-cid-kowqkul7><tr data-astro-cid-kowqkul7><th data-astro-cid-kowqkul7>Title</th><th data-astro-cid-kowqkul7>Status</th><th data-astro-cid-kowqkul7>Date</th></tr></thead> <tbody data-astro-cid-kowqkul7> ${articles.length > 0 ? articles.map((a) => renderTemplate`<tr data-astro-cid-kowqkul7><td data-astro-cid-kowqkul7><a${addAttribute(`/admin/news/${a.id}/edit`, "href")} style="color: var(--color-brand-600); text-decoration: none;" data-astro-cid-kowqkul7>${a.title}</a></td><td data-astro-cid-kowqkul7><span class="badge-gray" data-astro-cid-kowqkul7>${a.status || "draft"}</span></td><td data-astro-cid-kowqkul7>${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td></tr>`) : renderTemplate`<tr data-astro-cid-kowqkul7><td colspan="3" class="empty-cell" data-astro-cid-kowqkul7>No articles yet.</td></tr>`} </tbody> </table> </div> </div> ` })}`;
}, "/workspace/src/pages/admin/news/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/news/index.astro";
const $$url = "/admin/news";
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
