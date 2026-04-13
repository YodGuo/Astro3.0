-- Create site_settings table for page visibility control
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT 'true'
);

-- Insert default page visibility settings (all enabled)
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('about_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('services_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('products_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('news_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('solutions_enabled', 'true');
