globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, s as sql, t as tags } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Tags = createComponent(async ($$result, $$props, $$slots) => {
  let tagsList = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      tagsList = await db.select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postCount: sql`(SELECT COUNT(*) FROM news_post_tags WHERE tag_id = ${tags.id})`.as("post_count")
      }).from(tags).orderBy(sql`post_count desc`);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Tags — Admin", "currentPath": "/admin/news/tags", "data-astro-cid-3rwky2io": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-3rwky2io> <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;" data-astro-cid-3rwky2io> <h1 class="heading-1" style="margin-bottom: 0;" data-astro-cid-3rwky2io>Tags</h1> <button id="btn-create" class="btn-primary" data-astro-cid-3rwky2io>+ New Tag</button> </div> <!-- Create / Edit Modal --> <div id="tag-modal" class="modal-overlay" style="display: none;" data-astro-cid-3rwky2io> <div class="modal-card" data-astro-cid-3rwky2io> <h2 id="modal-title" style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;" data-astro-cid-3rwky2io>Create Tag</h2> <form id="tag-form" style="display: flex; flex-direction: column; gap: 0.75rem;" data-astro-cid-3rwky2io> <input type="hidden" id="tag-id" name="id" value="" data-astro-cid-3rwky2io> <label style="font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary);" data-astro-cid-3rwky2io>Name</label> <input type="text" id="tag-name" name="name" required maxlength="50" placeholder="e.g. Data Center" style="padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 0.875rem; background: var(--color-surface);" data-astro-cid-3rwky2io> <p id="modal-error" style="display: none; color: var(--color-danger-text); font-size: 0.8125rem; margin: 0;" data-astro-cid-3rwky2io></p> <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;" data-astro-cid-3rwky2io> <button type="button" id="btn-cancel" class="btn-action" data-astro-cid-3rwky2io>Cancel</button> <button type="submit" class="btn-primary" style="padding: 0.375rem 1rem; font-size: 0.8125rem;" data-astro-cid-3rwky2io>Save</button> </div> </form> </div> </div> <div class="admin-table-wrap" data-astro-cid-3rwky2io> <table class="admin-table" data-astro-cid-3rwky2io> <thead data-astro-cid-3rwky2io><tr data-astro-cid-3rwky2io><th data-astro-cid-3rwky2io>Name</th><th data-astro-cid-3rwky2io>Slug</th><th data-astro-cid-3rwky2io>Posts</th><th data-astro-cid-3rwky2io>Actions</th></tr></thead> <tbody id="tags-tbody" data-astro-cid-3rwky2io> ${tagsList.length > 0 ? tagsList.map((t) => renderTemplate`<tr${addAttribute(t.id, "data-id")}${addAttribute(t.name, "data-name")} data-astro-cid-3rwky2io> <td style="font-weight: 500;" data-astro-cid-3rwky2io>${t.name}</td> <td style="color: var(--color-text-tertiary); font-size: 0.8125rem;" data-astro-cid-3rwky2io>${t.slug}</td> <td data-astro-cid-3rwky2io><span class="badge-gray" data-astro-cid-3rwky2io>${t.postCount}</span></td> <td style="white-space: nowrap;" data-astro-cid-3rwky2io> <button class="btn-action btn-edit" data-action="edit" data-astro-cid-3rwky2io>Edit</button> <button class="btn-action btn-delete" data-action="delete" data-astro-cid-3rwky2io>Delete</button> </td> </tr>`) : renderTemplate`<tr data-astro-cid-3rwky2io><td colspan="4" class="empty-cell" data-astro-cid-3rwky2io>No tags yet.</td></tr>`} </tbody> </table> </div> </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/news/tags.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/news/tags.astro", void 0);
const $$file = "/workspace/src/pages/admin/news/tags.astro";
const $$url = "/admin/news/tags";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Tags,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
