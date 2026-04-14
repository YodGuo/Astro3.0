#!/usr/bin/env node

/**
 * Export build-time data from remote D1 for prerendered pages.
 *
 * Usage:
 *   node scripts/export-build-data.mjs              # uses wrangler.jsonc DB config
 *   node scripts/export-build-data.mjs --local       # uses local D1 via wrangler dev
 *   node scripts/export-build-data.mjs --remote      # uses remote D1 (default)
 *
 * Output: src/data/build-data.json
 *
 * The exported JSON is consumed by src/lib/build-data.ts during astro build
 * to populate getStaticPaths() for prerendered product/news detail pages.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Parse --local / --remote flag
const mode = process.argv.includes('--local') ? 'local' : 'remote';
const DB_NAME = 'my-b2b-db'; // must match wrangler.jsonc

/**
 * Execute a D1 SQL query and return rows as parsed JSON.
 */
function d1Query(sql) {
  const flag = mode === 'local' ? '--local' : '--remote';
  const cmd = `npx wrangler d1 execute ${DB_NAME} ${flag} --command="${sql.replace(/"/g, '\\"')}" --json`;
  try {
    const stdout = execSync(cmd, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 });
    const parsed = JSON.parse(stdout);
    // wrangler v4 returns array directly; v3 returns { results: [] }
    return Array.isArray(parsed) ? parsed : (parsed.results || []);
  } catch (err) {
    console.error(`[WARN] D1 query failed (${mode}): ${err.message}`);
    return [];
  }
}

function main() {
  console.log(`[export-build-data] Exporting from ${mode} D1 (${DB_NAME})...`);

  // 1. Settings
  const settingsRows = d1Query(
    `SELECT key, value FROM site_settings WHERE key IN (
      'site_name', 'site_description', 'site_logo_url', 'site_favicon_url', 'site_og_image_url',
      'social_links', 'public_domain', 'admin_domain',
      'theme_brand_color', 'theme_font_family', 'dark_mode_enabled',
      'ga_measurement_id',
      'about_enabled', 'services_enabled', 'products_enabled', 'news_enabled', 'solutions_enabled',
      'privacy_enabled', 'terms_enabled'
    )`
  );
  const settings = {};
  let publicDomain = '';
  let adminDomain = '';
  for (const row of settingsRows) {
    try {
      const val = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
      settings[row.key] = val;
      if (row.key === 'public_domain') publicDomain = val;
      if (row.key === 'admin_domain') adminDomain = val;
    } catch { /* skip */ }
  }

  // 2. Products (published only) — include description for prerendered detail pages
  const productRows = d1Query(
    `SELECT p.slug, p.name, p.summary, p.description, c.slug AS brand_slug
     FROM products p
     LEFT JOIN product_categories c ON c.id = p.category_id
     WHERE p.published = 1
     ORDER BY p.created_at DESC`
  );

  // 3. News posts (published only) — include content (TipTap JSON) for prerendered detail pages
  const newsRows = d1Query(
    `SELECT id, slug, title, summary, content, published_at FROM news_posts WHERE status = 'published' ORDER BY published_at DESC`
  );

  // 3b. News post ↔ tag associations (for prerendered article pages)
  const newsTagAssocRows = d1Query(
    `SELECT npt.post_id, t.slug AS tag_slug, t.name AS tag_name
     FROM news_post_tags npt
     INNER JOIN tags t ON t.id = npt.tag_id`
  );
  // Build a map: postId → [{ slug, name }]
  const newsTagsByPostId = {};
  for (const row of newsTagAssocRows) {
    const pid = String(row.post_id);
    if (!newsTagsByPostId[pid]) newsTagsByPostId[pid] = [];
    newsTagsByPostId[pid].push({ slug: row.tag_slug, name: row.tag_name });
  }

  // 4. Product categories
  const categoryRows = d1Query(
    `SELECT slug, name FROM product_categories ORDER BY \`order\`, name`
  );

  // 5. News tags
  const tagRows = d1Query(
    `SELECT slug, name FROM tags ORDER BY name`
  );

  // 6. Solutions (industry pages)
  const solutionRows = d1Query(
    `SELECT id, slug, industry, title, content FROM solutions ORDER BY industry, title`
  );

  // 7. Page sections
  const pageSectionRows = d1Query(
    `SELECT page, section, field, value, "order" FROM page_sections ORDER BY page, section, "order"`
  );

  const buildData = {
    _meta: {
      exportedAt: new Date().toISOString(),
      mode,
      database: DB_NAME,
    },
    settings,
    products: productRows.map(r => ({
      slug: r.slug,
      name: r.name,
      summary: r.summary || null,
      description: r.description || null,
      brandSlug: r.brand_slug || 'other',
    })),
    news: newsRows.map(r => ({
      slug: r.slug,
      title: r.title,
      summary: r.summary || null,
      content: r.content || null,
      publishedAt: r.published_at || null,
      tags: newsTagsByPostId[String(r.id)] || [],
    })),
    productCategories: categoryRows.map(r => ({
      slug: r.slug,
      name: r.name,
    })),
    newsTags: tagRows.map(r => ({
      slug: r.slug,
      name: r.name,
    })),
    solutions: solutionRows.map(r => ({
      id: r.id,
      slug: r.slug,
      industry: r.industry,
      title: r.title,
      content: r.content || null,
    })),
    domains: {
      public: publicDomain,
      admin: adminDomain,
    },
    pages: pageSectionRows.reduce((acc, r) => {
      if (!acc[r.page]) acc[r.page] = {};
      if (!acc[r.page][r.section]) acc[r.page][r.section] = {};
      acc[r.page][r.section][r.field] = r.value;
      return acc;
    }, {}),
  };

  const outPath = resolve(ROOT, 'src/data/build-data.json');
  writeFileSync(outPath, JSON.stringify(buildData, null, 2) + '\n', 'utf-8');

  console.log(`[export-build-data] Written to ${outPath}`);
  console.log(`  Settings:     ${Object.keys(settings).length} keys`);
  console.log(`  Products:     ${buildData.products.length}`);
  console.log(`  News:         ${buildData.news.length}`);
  console.log(`  Categories:   ${buildData.productCategories.length}`);
  console.log(`  Tags:         ${buildData.newsTags.length}`);
  console.log(`  Solutions:    ${buildData.solutions.length}`);
  console.log(`  Page sections: ${Object.keys(buildData.pages).length} pages`);
}

main();
