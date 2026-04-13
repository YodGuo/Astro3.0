globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
const prerender = false;
const $$Edit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Edit;
  const url = new URL(Astro2.request.url);
  const editId = url.searchParams.get("id") || "";
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": editId ? "Edit Solution — Admin" : "New Solution — Admin", "currentPath": "/admin/solutions", "data-astro-cid-djchn6gb": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-djchn6gb> <h1 class="heading-1" style="margin-bottom: 1.5rem;" data-astro-cid-djchn6gb>${editId ? "Edit Solution" : "New Solution"}</h1> <form id="solution-form" class="solution-form" data-astro-cid-djchn6gb> <input type="hidden" id="solution-id"${addAttribute(editId, "value")} data-astro-cid-djchn6gb> <div class="form-group" data-astro-cid-djchn6gb> <label for="solution-title" data-astro-cid-djchn6gb>Title</label> <input type="text" id="solution-title" class="input" placeholder="e.g., Data Center Power Solutions" required data-astro-cid-djchn6gb> </div> <div class="form-group" data-astro-cid-djchn6gb> <label for="solution-industry" data-astro-cid-djchn6gb>Industry</label> <input type="text" id="solution-industry" class="input" placeholder="e.g., data-centers" required data-astro-cid-djchn6gb> <p class="form-hint" data-astro-cid-djchn6gb>URL-safe identifier used in /solutions/${"{industry}"}. Example: data-centers, healthcare, industrial</p> </div> <div class="form-group" data-astro-cid-djchn6gb> <label for="solution-content" data-astro-cid-djchn6gb>Content (HTML)</label> <textarea id="solution-content" class="input textarea" rows="12" placeholder="Enter HTML content for the solution page..." data-astro-cid-djchn6gb></textarea> <p class="form-hint" data-astro-cid-djchn6gb>Supports raw HTML. This content will be rendered directly on the solution page.</p> </div> <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;" data-astro-cid-djchn6gb> <button type="submit" class="btn-primary" id="submit-btn" data-astro-cid-djchn6gb>${editId ? "Update Solution" : "Create Solution"}</button> <a href="/admin/solutions" class="btn-secondary" style="text-decoration: none; display: inline-block;" data-astro-cid-djchn6gb>Cancel</a> </div> </form> </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/solutions/edit.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/solutions/edit.astro", void 0);
const $$file = "/workspace/src/pages/admin/solutions/edit.astro";
const $$url = "/admin/solutions/edit";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
