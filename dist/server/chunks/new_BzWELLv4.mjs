globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
const prerender = false;
const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "New Article — Admin", "currentPath": "/admin/news" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div> <h1 class="heading-1" style="margin-bottom: 1.5rem;">New Article</h1> ${renderComponent($$result2, "LazyNewsForm", null, { "client:only": "react", "mode": "create", "client:component-hydration": "only", "client:component-path": "/workspace/src/components/admin/LazyNewsForm.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "/workspace/src/pages/admin/news/new.astro", void 0);
const $$file = "/workspace/src/pages/admin/news/new.astro";
const $$url = "/admin/news/new";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
