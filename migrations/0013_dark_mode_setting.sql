-- Dark mode toggle setting
-- Controls whether the dark mode toggle button is shown on the public-facing site.
-- Value: "true" (enabled) or "false" (disabled, default).
-- When disabled, the theme-toggle button is hidden and dark mode CSS is not injected.
-- Admin panel is unaffected — dark mode toggle always visible in admin.
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('dark_mode_enabled', 'false');
