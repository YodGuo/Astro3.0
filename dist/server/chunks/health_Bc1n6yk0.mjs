globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getDBFromEnv } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { b as apiUnavailable, d as apiSuccess } from "./api-response_DQ3MgLJ0.mjs";
const prerender = false;
const GET = async () => {
  const env = await getEnv();
  const db = getDBFromEnv(env);
  if (!db) {
    return apiUnavailable("Service unavailable", "SERVICE_UNAVAILABLE");
  }
  try {
    await db.prepare("SELECT 1").first();
    return apiSuccess({ status: "ok" });
  } catch {
    return apiUnavailable("Service unavailable", "SERVICE_UNAVAILABLE");
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
