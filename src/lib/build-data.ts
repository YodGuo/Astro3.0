/**
 * Build-time data accessor for prerendered pages.
 *
 * During prerendering, D1/KV bindings are not available.
 * This module provides a fallback by reading from src/data/build-data.json,
 * which is generated at build time by scripts/export-build-data.mjs.
 *
 * When build-data.json doesn't exist (e.g., first build without export),
 * returns empty defaults so pages can still be generated with fallback values.
 */

export interface BuildData {
  settings: Record<string, string>;
  products: Array<{ slug: string; name: string; summary: string | null; description: string | null; brandSlug: string }>;
  news: Array<{
    slug: string; title: string; summary: string | null; content: string | null;
    publishedAt: number | null; tags: Array<{ slug: string; name: string }>;
  }>;
  productCategories: Array<{ slug: string; name: string }>;
  newsTags: Array<{ slug: string; name: string }>;
  solutions: Array<{ id: string; slug: string; industry: string; title: string; content: string | null }>;
  /** CMS-manageable page content sections */
  pages: Record<string, Record<string, Record<string, string>>>;
  /** Resolved domain names for dual-domain isolation */
  domains: {
    public: string;   // e.g. "yourcompany.com"
    admin: string;    // e.g. "admin.yourcompany.com"
  };
}

const DEFAULT_BUILD_DATA: BuildData = {
  settings: {},
  products: [],
  news: [],
  productCategories: [],
  newsTags: [],
  solutions: [],
  pages: {},
  domains: { public: '', admin: '' },
};

export async function getBuildData(): Promise<BuildData> {
  try {
    const mod = await import('../data/build-data.json' as string);
    return mod.default || DEFAULT_BUILD_DATA;
  } catch {
    return DEFAULT_BUILD_DATA;
  }
}

// ── Convenience Getters ────────────────────────────

/** Get all products */
export async function getProducts() {
  return (await getBuildData()).products;
}

/** Get all news articles (with tags) */
export async function getNews() {
  return (await getBuildData()).news;
}

/** Get all solutions (industry pages) */
export async function getSolutions() {
  return (await getBuildData()).solutions;
}

/** Get all product categories */
export async function getProductCategories() {
  return (await getBuildData()).productCategories;
}

/** Get all news tags */
export async function getNewsTags() {
  return (await getBuildData()).newsTags;
}

/** Get a single setting value (returns empty string if missing) */
export async function getSetting(key: string): Promise<string> {
  return (await getBuildData()).settings[key] ?? '';
}

/** Get all settings as a record */
export async function getSettings(): Promise<Record<string, string>> {
  return (await getBuildData()).settings;
}

/** Get domain configuration */
export async function getDomains() {
  return (await getBuildData()).domains;
}

/** Get CMS content for a specific page */
export async function getPageContent(page: string) {
  return (await getBuildData()).pages[page] || {};
}

/** Get Google Analytics measurement ID */
export async function getGaMeasurementId() {
  return (await getBuildData()).settings.ga_measurement_id || '';
}
