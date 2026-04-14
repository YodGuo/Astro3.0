-- Domain isolation: separate public and admin domains
-- When configured, the middleware will:
--   - Block /admin/* and /api/* on the public domain (return 404)
--   - Block public pages on the admin domain (redirect to public domain)
--   - Use public_domain for sitemap, OG tags, and canonical URLs

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('public_domain', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('admin_domain', '');
