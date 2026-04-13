globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, q as quoteRequests, s as sql } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let quotes = [];
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      quotes = await db.select({ id: quoteRequests.id, name: quoteRequests.name, company: quoteRequests.company, product: quoteRequests.product, status: quoteRequests.status, createdAt: quoteRequests.createdAt }).from(quoteRequests).orderBy(sql`${quoteRequests.createdAt} desc`);
    }
  } catch {
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Quotes — Admin", "currentPath": "/admin/quotes", "data-astro-cid-iypxbsr5": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-iypxbsr5> <h1 class="heading-1" style="margin-bottom: 1.5rem;" data-astro-cid-iypxbsr5>Quote Requests</h1> <div class="admin-table-wrap" data-astro-cid-iypxbsr5> <table class="admin-table" data-astro-cid-iypxbsr5> <thead data-astro-cid-iypxbsr5><tr data-astro-cid-iypxbsr5><th data-astro-cid-iypxbsr5>Name</th><th data-astro-cid-iypxbsr5>Company</th><th data-astro-cid-iypxbsr5>Product</th><th data-astro-cid-iypxbsr5>Status</th><th data-astro-cid-iypxbsr5>Date</th><th data-astro-cid-iypxbsr5>Actions</th></tr></thead> <tbody id="quotes-tbody" data-astro-cid-iypxbsr5> ${quotes.length > 0 ? quotes.map((q) => renderTemplate`<tr${addAttribute(q.id, "data-id")} data-astro-cid-iypxbsr5> <td data-astro-cid-iypxbsr5>${q.name || "—"}</td> <td data-astro-cid-iypxbsr5>${q.company || "—"}</td> <td data-astro-cid-iypxbsr5>${q.product || "—"}</td> <td data-astro-cid-iypxbsr5> <select class="status-select" data-role="status-select" disabled data-astro-cid-iypxbsr5> <option value="new"${addAttribute((q.status || "new") === "new", "selected")} data-astro-cid-iypxbsr5>New</option> <option value="contacted"${addAttribute(q.status === "contacted", "selected")} data-astro-cid-iypxbsr5>Contacted</option> <option value="quoted"${addAttribute(q.status === "quoted", "selected")} data-astro-cid-iypxbsr5>Quoted</option> <option value="closed"${addAttribute(q.status === "closed", "selected")} data-astro-cid-iypxbsr5>Closed</option> </select> </td> <td data-astro-cid-iypxbsr5>${q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}</td> <td style="white-space: nowrap;" data-astro-cid-iypxbsr5> <button class="btn-action btn-view" data-action="view" data-astro-cid-iypxbsr5>View</button> </td> </tr>`) : renderTemplate`<tr data-astro-cid-iypxbsr5><td colspan="6" class="empty-cell" data-astro-cid-iypxbsr5>No quote requests yet.</td></tr>`} </tbody> </table> </div> </div>  <div id="quote-modal" class="modal-overlay" style="display:none;" data-astro-cid-iypxbsr5> <div class="modal-content" data-astro-cid-iypxbsr5> <div class="modal-header" data-astro-cid-iypxbsr5> <h2 style="font-size: 1.125rem; font-weight: 600;" data-astro-cid-iypxbsr5>Quote Request Details</h2> <button id="modal-close" class="modal-close-btn" data-astro-cid-iypxbsr5>&times;</button> </div> <div id="modal-body" class="modal-body" data-astro-cid-iypxbsr5> <p style="color: var(--color-text-tertiary);" data-astro-cid-iypxbsr5>Loading...</p> </div> </div> </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/quotes/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/quotes/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/quotes/index.astro";
const $$url = "/admin/quotes";
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
