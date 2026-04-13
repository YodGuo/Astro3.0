import type { D1Database } from "@cloudflare/workers-types";

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if a slug already exists in a table, and if so, append a numeric suffix.
 *
 * @param db - D1 database instance (raw, not Drizzle)
 * @param table - Table name (e.g., "products", "news_posts")
 * @param slug - The base slug to check
 * @param excludeId - Optional ID to exclude (for updates)
 * @returns A unique slug (either the original or with a numeric suffix)
 */
export async function ensureUniqueSlug(
  db: D1Database,
  table: string,
  slug: string,
  excludeId?: string
): Promise<string> {
  // Check if the base slug exists
  let query = `SELECT id, slug FROM ${table} WHERE slug = ?`;
  const bindings: unknown[] = [slug];

  if (excludeId) {
    query += ` AND id != ?`;
    bindings.push(excludeId);
  }

  const existing = await db.prepare(query).bind(...bindings).first<{ id: string; slug: string }>();

  if (!existing) {
    return slug;
  }

  // Find the next available numeric suffix
  const likePattern = `${slug}-%`;
  const rows = await db
    .prepare(`SELECT slug FROM ${table} WHERE slug LIKE ? ORDER BY slug`)
    .bind(likePattern)
    .all<{ slug: string }>();

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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
