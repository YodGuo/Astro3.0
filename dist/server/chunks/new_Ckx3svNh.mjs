globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { P as ProductForm } from "./ProductForm_D-seQb0Z.mjs";
const prerender = false;
const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "New Product — Admin", "currentPath": "/admin/products" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div> <h1 class="heading-1" style="margin-bottom: 1.5rem;">New Product</h1> ${renderComponent($$result2, "ProductForm", ProductForm, { "client:load": true, "mode": "create", "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/ProductForm.tsx", "client:component-export": "default" })} </div> ` })}`;
}, "/workspace/src/pages/admin/products/new.astro", void 0);
const $$file = "/workspace/src/pages/admin/products/new.astro";
const $$url = "/admin/products/new";
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
