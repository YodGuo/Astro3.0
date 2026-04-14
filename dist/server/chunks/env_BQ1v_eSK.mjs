globalThis.process ??= {};
globalThis.process.env ??= {};
async function getEnv() {
  try {
    const cfEnv = await import("cloudflare:workers");
    return cfEnv.env || {};
  } catch {
    return {};
  }
}
export {
  getEnv as g
};
