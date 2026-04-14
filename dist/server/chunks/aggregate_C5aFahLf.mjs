globalThis.process ??= {};
globalThis.process.env ??= {};
import { s as sql } from "./index_BdvyDh_N.mjs";
function count(expression) {
  return sql`count(${sql.raw("*")})`.mapWith(Number);
}
export {
  count as c
};
