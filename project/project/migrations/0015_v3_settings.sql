-- v3.0: Add analytics and legal page settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('ga_measurement_id', '');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('privacy_enabled', 'true');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('terms_enabled', 'true');
