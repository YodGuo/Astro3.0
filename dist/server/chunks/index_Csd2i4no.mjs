globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, k as solutions, s as sql } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let solutionList = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      solutionList = await db.select({ id: solutions.id, title: solutions.title, slug: solutions.slug, industry: solutions.industry }).from(solutions).orderBy(sql`${solutions.industry} asc`);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Solutions — Admin", "currentPath": "/admin/solutions", "data-astro-cid-wmtgs7zb": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-wmtgs7zb> <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;" data-astro-cid-wmtgs7zb> <h1 class="heading-1" data-astro-cid-wmtgs7zb>Solutions</h1> <a href="/admin/solutions/edit" class="btn-primary" style="text-decoration: none; font-size: 0.875rem; padding: 0.5rem 1rem;" data-astro-cid-wmtgs7zb>+ New Solution</a> </div> <div class="admin-table-wrap" data-astro-cid-wmtgs7zb> <table class="admin-table" data-astro-cid-wmtgs7zb> <thead data-astro-cid-wmtgs7zb><tr data-astro-cid-wmtgs7zb><th data-astro-cid-wmtgs7zb>Title</th><th data-astro-cid-wmtgs7zb>Industry</th><th data-astro-cid-wmtgs7zb>Slug</th><th data-astro-cid-wmtgs7zb>Actions</th></tr></thead> <tbody data-astro-cid-wmtgs7zb> ${solutionList.length > 0 ? solutionList.map((s) => renderTemplate`<tr data-astro-cid-wmtgs7zb> <td data-astro-cid-wmtgs7zb><a${addAttribute(`/admin/solutions/edit?id=${s.id}`, "href")} style="color: var(--color-brand-600); text-decoration: none;" data-astro-cid-wmtgs7zb>${s.title}</a></td> <td data-astro-cid-wmtgs7zb><span class="badge-gray" data-astro-cid-wmtgs7zb>${s.industry}</span></td> <td style="color: var(--color-text-tertiary); font-size: 0.8125rem;" data-astro-cid-wmtgs7zb>${s.slug}</td> <td style="white-space: nowrap;" data-astro-cid-wmtgs7zb> <a${addAttribute(`/admin/solutions/edit?id=${s.id}`, "href")} class="btn-action btn-edit" data-astro-cid-wmtgs7zb>Edit</a> <button class="btn-action btn-delete"${addAttribute(s.id, "data-id")}${addAttribute(s.title, "data-title")} data-astro-cid-wmtgs7zb>Delete</button> </td> </tr>`) : renderTemplate`<tr data-astro-cid-wmtgs7zb><td colspan="4" class="empty-cell" data-astro-cid-wmtgs7zb>No solutions yet.</td></tr>`} </tbody> </table> </div> </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/solutions/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/solutions/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/solutions/index.astro";
const $$url = "/admin/solutions";
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
