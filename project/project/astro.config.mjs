// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  // NOTE: This is a placeholder. In production, canonical URLs and sitemap are generated
  // from build-data.json domains.public (see BaseLayout.astro and sitemap.xml.ts).
  // Astro uses this for <link rel="canonical"> and sitemap generation only when
  // build-data is not available (e.g., during dev).
  site: 'https://yourcompany.com',
  adapter: cloudflare(),
  vite: {
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.astro']
    },
    ssr: {
      noExternal: ['@better-auth/passkey'],
    },
  },
  integrations: [
    react(),
  ],
  // Disable Shiki syntax highlighting — project has no .md/.mdx content files,
  // and Shiki's inline styles are incompatible with CSP (Content Security Policy).
  markdown: {
    syntaxHighlight: false,
  },
  // CSP is injected via middleware.ts (Content-Security-Policy header) rather than
  // Astro's built-in CSP, because Astro's type union only supports 2 directives.
  // See SEC-05 in CHANGELOG for directive list.
  // security: { csp: false },
});
