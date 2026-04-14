-- Theme customization: brand color and font family
-- theme_brand_color: hex color for --color-brand-600 (e.g. #2563eb for blue)
-- theme_font_family: CSS font-family string (e.g. 'Inter, sans-serif')
-- When set, scripts/inject-theme.mjs generates theme-overrides.css that overrides global.css defaults

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('theme_brand_color', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('theme_font_family', '');
