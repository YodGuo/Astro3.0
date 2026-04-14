-- v3.0: Page sections — CMS-manageable content blocks
CREATE TABLE IF NOT EXISTS page_sections (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  field TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  "order" INTEGER DEFAULT 0,
  UNIQUE(page, section, field)
);

-- home.hero (order 0)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-home-hero-title', 'home', 'hero', 'title', 'Uninterruptible Power for Your Business', 0),
  ('ps-home-hero-subtitle', 'home', 'hero', 'subtitle', 'Enterprise-grade UPS systems, power distribution, and energy solutions tailored to your industry.', 0),
  ('ps-home-hero-cta-primary-text', 'home', 'hero', 'cta_primary_text', 'Explore Products', 0),
  ('ps-home-hero-cta-primary-url', 'home', 'hero', 'cta_primary_url', '/products', 0),
  ('ps-home-hero-cta-secondary-text', 'home', 'hero', 'cta_secondary_text', 'View Solutions', 0),
  ('ps-home-hero-cta-secondary-url', 'home', 'hero', 'cta_secondary_url', '/solutions/data-centers', 0);

-- home.solutions_bar (order 1)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-home-solutions-bar-title', 'home', 'solutions_bar', 'title', 'Industry Solutions', 1),
  ('ps-home-solutions-bar-item-1-title', 'home', 'solutions_bar', 'item_1_title', 'Data Centers', 1),
  ('ps-home-solutions-bar-item-1-desc', 'home', 'solutions_bar', 'item_1_desc', 'Uninterruptible power for mission-critical IT infrastructure', 1),
  ('ps-home-solutions-bar-item-1-url', 'home', 'solutions_bar', 'item_1_url', '/solutions/data-centers', 1),
  ('ps-home-solutions-bar-item-2-title', 'home', 'solutions_bar', 'item_2_title', 'Healthcare', 1),
  ('ps-home-solutions-bar-item-2-desc', 'home', 'solutions_bar', 'item_2_desc', 'Reliable backup power for medical equipment and facilities', 1),
  ('ps-home-solutions-bar-item-2-url', 'home', 'solutions_bar', 'item_2_url', '/solutions/healthcare', 1),
  ('ps-home-solutions-bar-item-3-title', 'home', 'solutions_bar', 'item_3_title', 'Industrial', 1),
  ('ps-home-solutions-bar-item-3-desc', 'home', 'solutions_bar', 'item_3_desc', 'Rugged power solutions for manufacturing and automation', 1),
  ('ps-home-solutions-bar-item-3-url', 'home', 'solutions_bar', 'item_3_url', '/solutions/industrial', 1);

-- home.cta (order 2)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-home-cta-title', 'home', 'cta', 'title', 'Need a Custom Power Solution?', 2),
  ('ps-home-cta-description', 'home', 'cta', 'description', 'Our engineers can design a system tailored to your exact requirements.', 2),
  ('ps-home-cta-cta-text', 'home', 'cta', 'cta_text', 'Request a Quote', 2),
  ('ps-home-cta-cta-url', 'home', 'cta', 'cta_url', '/about#contact', 2);

-- about.hero (order 0)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-about-hero-title', 'about', 'hero', 'title', 'About {site_name}', 0),
  ('ps-about-hero-subtitle', 'about', 'hero', 'subtitle', '', 0);

-- about.story (order 1)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-about-story-body', 'about', 'story', 'body', '{site_name} has been a leading provider of uninterruptible power supply (UPS) systems and power management solutions for over 20 years. We serve businesses across data centers, healthcare, industrial, and government sectors.

Our mission is to ensure your critical operations never experience downtime. From small office setups to enterprise data centers, we deliver reliable, efficient, and scalable power continuity solutions.', 1);

-- about.contact (order 2)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-about-contact-email', 'about', 'contact', 'email', 'info@yourcompany.com', 2),
  ('ps-about-contact-phone', 'about', 'contact', 'phone', '+1 (555) 123-4567', 2),
  ('ps-about-contact-address', 'about', 'contact', 'address', '123 Power Avenue, Tech City, TC 12345', 2);

-- services.hero (order 0)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-services-hero-title', 'services', 'hero', 'title', 'Our Services', 0),
  ('ps-services-hero-subtitle', 'services', 'hero', 'subtitle', 'End-to-end power continuity solutions from assessment to ongoing support.', 0);

-- services.item_1 (order 1)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-services-item-1-title', 'services', 'item_1', 'title', 'Power Assessment', 1),
  ('ps-services-item-1-desc', 'services', 'item_1', 'desc', 'Comprehensive analysis of your power needs and infrastructure requirements.', 1);

-- services.item_2 (order 2)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-services-item-2-title', 'services', 'item_2', 'title', 'System Design', 2),
  ('ps-services-item-2-desc', 'services', 'item_2', 'desc', 'Custom-engineered UPS and power distribution systems for your facility.', 2);

-- services.item_3 (order 3)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-services-item-3-title', 'services', 'item_3', 'title', 'Installation', 3),
  ('ps-services-item-3-desc', 'services', 'item_3', 'desc', 'Professional installation by certified technicians with minimal downtime.', 3);

-- services.item_4 (order 4)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-services-item-4-title', 'services', 'item_4', 'title', 'Maintenance & Support', 4),
  ('ps-services-item-4-desc', 'services', 'item_4', 'desc', '24/7 monitoring, preventive maintenance, and rapid response service.', 4);

-- privacy.content (order 0)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-privacy-content-title', 'privacy', 'content', 'title', 'Privacy Policy', 0),
  ('ps-privacy-content-body', 'privacy', 'content', 'body', '<p>We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p><h2>Information We Collect</h2><p>We may collect the following information: name, email address, company name, and phone number when you submit an inquiry through our contact form. We also collect standard log data including IP address, browser type, and pages visited.</p><h2>How We Use Your Data</h2><p>Your data is used solely to respond to your inquiries and improve our website experience. We do not sell or share your personal information with third parties.</p><h2>Data Retention</h2><p>We retain inquiry records for 2 years. You may request deletion of your data at any time by contacting us.</p><h2>Your Rights</h2><p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at the email address below.</p><h2>Contact</h2><p>If you have questions about this privacy policy, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>', 0),
  ('ps-privacy-content-last-updated', 'privacy', 'content', 'last_updated', '2026-04-13', 0);

-- terms.content (order 0)
INSERT INTO page_sections (id, page, section, field, value, "order") VALUES
  ('ps-terms-content-title', 'terms', 'content', 'title', 'Terms & Conditions', 0),
  ('ps-terms-content-body', 'terms', 'content', 'body', '<h2>1. Services</h2><p>Our website provides product information and inquiry services. All product specifications are subject to change without notice.</p><h2>2. Pricing</h2><p>Prices displayed on this website are for reference only. Final pricing is confirmed through formal quotation and mutual agreement.</p><h2>3. Intellectual Property</h2><p>All content on this website, including text, images, and product documentation, is the property of the company and protected by applicable copyright laws.</p><h2>4. Disclaimer</h2><p>While we strive for accuracy, we do not guarantee that all product specifications are error-free. Actual products may vary from descriptions on this website.</p><h2>5. External Links</h2><p>This website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.</p><h2>6. Governing Law</h2><p>These terms are governed by the laws of the jurisdiction in which the company is registered.</p><h2>7. Contact</h2><p>For questions about these terms, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>', 0),
  ('ps-terms-content-last-updated', 'terms', 'content', 'last_updated', '2026-04-13', 0);
