globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getAuth } from "./index_BamYI_0K.mjs";
const prerender = false;
const ALL = async (ctx) => {
  const auth = await getAuth();
  return auth.handler(ctx.request);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ALL,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
