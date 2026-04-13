import type { APIRoute } from "astro";

export const prerender = true;

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority: number;
}

function formatDate(d: string | number | null): string | undefined {
  if (!d) return undefined;
  return new Date(typeof d === 'number' ? d * 1000 : d).toISOString().split('T')[0];
}

function renderEntry(e: SitemapEntry): string {
  let xml = `  <url>\n    <loc>${e.loc}</loc>`;
  if (e.lastmod) xml += `\n    <lastmod>${e.lastmod}</lastmod>`;
  if (e.changefreq) xml += `\n    <changefreq>${e.changefreq}</changefreq>`;
  xml += `\n    <priority>${e.priority.toFixed(1)}</priority>`;
  xml += `\n  </url>`;
  return xml;
}

export const GET: APIRoute = async ({ site }) => {
  // Use public_domain from build-data if available, otherwise fall back to site config
  let origin = site?.href.replace(/\/$/, "") || "https://yourcompany.com";
  try {
    const { default: data } = await import("../data/build-data.json");
    if (data?.domains?.public) {
      origin = `https://${data.domains.public.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`;
    }
  } catch { /* no build-data, use site config */ }

  // Read build-data for dynamic pages (products, news) and page visibility settings
  interface BuildData {
    settings?: Record<string, string>;
    products?: Array<{ slug: string }>;
    news?: Array<{ slug: string; publishedAt?: number }>;
  }
  let buildData: BuildData = {};
  try {
    const imported = await import("../data/build-data.json");
    buildData = imported.default;
  } catch { /* build-data.json not generated yet */ }

  const settings = buildData.settings || {};
  const isEnabled = (key: string) => settings[key] !== 'false';

  const entries: SitemapEntry[] = [];

  // Static pages (respect visibility settings)
  if (isEnabled('about_enabled')) {
    entries.push({ loc: `${origin}/about`, changefreq: "monthly", priority: 0.7 });
  }
  if (isEnabled('services_enabled')) {
    entries.push({ loc: `${origin}/services`, changefreq: "monthly", priority: 0.7 });
  }
  if (isEnabled('news_enabled')) {
    entries.push({ loc: `${origin}/news`, changefreq: "daily", priority: 0.8 });
  }
  if (isEnabled('products_enabled')) {
    entries.push({ loc: `${origin}/products`, changefreq: "weekly", priority: 0.9 });
  }

  // Legal pages (respect visibility settings)
  if (isEnabled('privacy_enabled')) {
    entries.push({ loc: `${origin}/privacy`, changefreq: "yearly", priority: 0.3 });
  }
  if (isEnabled('terms_enabled')) {
    entries.push({ loc: `${origin}/terms`, changefreq: "yearly", priority: 0.3 });
  }

  // Solutions (respect visibility settings)
  if (isEnabled('solutions_enabled')) {
    const validIndustries = ['data-centers', 'healthcare', 'industrial', 'telecommunications', 'finance', 'government'];
    for (const industry of validIndustries) {
      entries.push({ loc: `${origin}/solutions/${industry}`, changefreq: "monthly", priority: 0.6 });
    }
  }

  // Products from build-data (respect products_enabled)
  if (isEnabled('products_enabled')) {
    const products = buildData.products || [];
    for (const p of products) {
      entries.push({ loc: `${origin}/products/${p.brandSlug || 'other'}/${p.slug}`, changefreq: "monthly", priority: 0.7 });
    }
  }

  // News from build-data (respect news_enabled)
  if (isEnabled('news_enabled')) {
    const news = buildData.news || [];
    for (const n of news) {
      entries.push({
        loc: `${origin}/news/${n.tags?.[0]?.slug || 'all'}/${n.slug}`,
        lastmod: formatDate(n.publishedAt),
        changefreq: "monthly",
        priority: 0.6,
      });
    }
  }

  const urls = entries.map(renderEntry).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
