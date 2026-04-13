globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, h as products, s as sql } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let productList = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      productList = await db.select({ id: products.id, name: products.name, slug: products.slug, published: products.published, createdAt: products.createdAt }).from(products).orderBy(sql`${products.createdAt} desc`);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Products — Admin", "currentPath": "/admin/products", "data-astro-cid-jgtptyeq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-jgtptyeq> <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;" data-astro-cid-jgtptyeq> <h1 class="heading-1" data-astro-cid-jgtptyeq>Products</h1> <a href="/admin/products/new" class="btn-primary" style="text-decoration: none; font-size: 0.875rem; padding: 0.5rem 1rem;" data-astro-cid-jgtptyeq>+ New Product</a> </div> <div class="admin-table-wrap" data-astro-cid-jgtptyeq> <table class="admin-table" data-astro-cid-jgtptyeq> <thead data-astro-cid-jgtptyeq><tr data-astro-cid-jgtptyeq><th data-astro-cid-jgtptyeq>Name</th><th data-astro-cid-jgtptyeq>Status</th><th data-astro-cid-jgtptyeq>Date</th></tr></thead> <tbody data-astro-cid-jgtptyeq> ${productList.length > 0 ? productList.map((p) => renderTemplate`<tr data-astro-cid-jgtptyeq><td data-astro-cid-jgtptyeq><a${addAttribute(`/admin/products/${p.id}/edit`, "href")} style="color: var(--color-brand-600); text-decoration: none;" data-astro-cid-jgtptyeq>${p.name}</a></td><td data-astro-cid-jgtptyeq><span class="badge-gray" data-astro-cid-jgtptyeq>${p.published ? "Published" : "Draft"}</span></td><td data-astro-cid-jgtptyeq>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td></tr>`) : renderTemplate`<tr data-astro-cid-jgtptyeq><td colspan="3" class="empty-cell" data-astro-cid-jgtptyeq>No products yet.</td></tr>`} </tbody> </table> </div> </div> ` })}`;
}, "/workspace/src/pages/admin/products/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/products/index.astro";
const $$url = "/admin/products";
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
