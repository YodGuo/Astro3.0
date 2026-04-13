globalThis.process ??= {};
globalThis.process.env ??= {};
function formatEntry(level, message, ctx) {
  const entry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    message,
    ...ctx
  };
  return JSON.stringify(entry);
}
const logger = {
  info(message, ctx) {
    console.log(formatEntry("info", message, ctx));
  },
  warn(message, ctx) {
    console.warn(formatEntry("warn", message, ctx));
  },
  error(message, ctx) {
    console.error(formatEntry("error", message, ctx));
  }
};
export {
  logger as l
};
