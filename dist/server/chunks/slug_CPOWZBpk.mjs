globalThis.process ??= {};
globalThis.process.env ??= {};
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
async function ensureUniqueSlug(db, table, slug, excludeId) {
  let query = `SELECT id, slug FROM ${table} WHERE slug = ?`;
  const bindings = [slug];
  const existing = await db.prepare(query).bind(...bindings).first();
  if (!existing) {
    return slug;
  }
  const likePattern = `${slug}-%`;
  const rows = await db.prepare(`SELECT slug FROM ${table} WHERE slug LIKE ? ORDER BY slug`).bind(likePattern).all();
  let maxNum = 0;
  for (const row of rows.results) {
    const match = row.slug.match(new RegExp(`^${escapeRegex(slug)}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `${slug}-${maxNum + 1}`;
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export {
  ensureUniqueSlug as e,
  slugify as s
};
