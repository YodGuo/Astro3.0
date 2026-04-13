globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, s as sql, j as productCategories } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Categories = createComponent(async ($$result, $$props, $$slots) => {
  let categoriesList = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      categoriesList = await db.select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        parentId: productCategories.parentId,
        order: productCategories.order,
        productCount: sql`(SELECT COUNT(*) FROM products WHERE category_id = product_categories.id AND published = 1)`.as("product_count")
      }).from(productCategories).orderBy(productCategories.order, productCategories.name);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categories — Admin", "currentPath": "/admin/products/categories", "data-astro-cid-6eh6gewg": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-6eh6gewg> <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;" data-astro-cid-6eh6gewg> <h1 class="heading-1" style="margin-bottom: 0;" data-astro-cid-6eh6gewg>Product Categories</h1> <button id="btn-create" class="btn-primary" data-astro-cid-6eh6gewg>+ New Category</button> </div> <!-- Create / Edit Modal --> <div id="cat-modal" class="modal-overlay" style="display: none;" data-astro-cid-6eh6gewg> <div class="modal-card" data-astro-cid-6eh6gewg> <h2 id="modal-title" style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;" data-astro-cid-6eh6gewg>Create Category</h2> <form id="cat-form" style="display: flex; flex-direction: column; gap: 0.75rem;" data-astro-cid-6eh6gewg> <input type="hidden" id="cat-id" name="id" value="" data-astro-cid-6eh6gewg> <label style="font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary);" data-astro-cid-6eh6gewg>Name</label> <input type="text" id="cat-name" name="name" required maxlength="100" placeholder="e.g. UPS Systems" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 0.875rem; background: var(--color-surface);" data-astro-cid-6eh6gewg> <label style="font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary);" data-astro-cid-6eh6gewg>Sort Order</label> <input type="number" id="cat-order" name="order" value="0" min="0" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 0.875rem; background: var(--color-surface); width: 6rem;" data-astro-cid-6eh6gewg> <p id="modal-error" style="display: none; color: var(--color-danger-text); font-size: 0.8125rem; margin: 0;" data-astro-cid-6eh6gewg></p> <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;" data-astro-cid-6eh6gewg> <button type="button" id="btn-cancel" class="btn-action" data-astro-cid-6eh6gewg>Cancel</button> <button type="submit" class="btn-primary" style="padding: 0.375rem 1rem; font-size: 0.8125rem;" data-astro-cid-6eh6gewg>Save</button> </div> </form> </div> </div> <div class="admin-table-wrap" data-astro-cid-6eh6gewg> <table class="admin-table" data-astro-cid-6eh6gewg> <thead data-astro-cid-6eh6gewg><tr data-astro-cid-6eh6gewg><th data-astro-cid-6eh6gewg>Name</th><th data-astro-cid-6eh6gewg>Slug</th><th data-astro-cid-6eh6gewg>Order</th><th data-astro-cid-6eh6gewg>Products</th><th data-astro-cid-6eh6gewg>Actions</th></tr></thead> <tbody id="cats-tbody" data-astro-cid-6eh6gewg> ${categoriesList.length > 0 ? categoriesList.map((c) => renderTemplate`<tr${addAttribute(c.id, "data-id")}${addAttribute(c.name, "data-name")}${addAttribute(String(c.order), "data-order")} data-astro-cid-6eh6gewg> <td style="font-weight: 500;" data-astro-cid-6eh6gewg>${c.name}</td> <td style="color: var(--color-text-tertiary); font-size: 0.8125rem;" data-astro-cid-6eh6gewg>${c.slug}</td> <td data-astro-cid-6eh6gewg><span class="badge-gray" data-astro-cid-6eh6gewg>${c.order}</span></td> <td data-astro-cid-6eh6gewg><span class="badge-gray" data-astro-cid-6eh6gewg>${c.productCount}</span></td> <td style="white-space: nowrap;" data-astro-cid-6eh6gewg> <button class="btn-action btn-edit" data-action="edit" data-astro-cid-6eh6gewg>Edit</button> <button class="btn-action btn-delete" data-action="delete" data-astro-cid-6eh6gewg>Delete</button> </td> </tr>`) : renderTemplate`<tr data-astro-cid-6eh6gewg><td colspan="5" class="empty-cell" data-astro-cid-6eh6gewg>No categories yet.</td></tr>`} </tbody> </table> </div> </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/products/categories.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/products/categories.astro", void 0);
const $$file = "/workspace/src/pages/admin/products/categories.astro";
const $$url = "/admin/products/categories";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Categories,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
