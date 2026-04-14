#!/usr/bin/env node

/**
 * Generate mock build-data.json for local development and CI testing.
 *
 * Usage:
 *   node scripts/generate-mock-data.mjs
 *
 * Output: src/data/build-data.json
 *
 * This script creates realistic mock data that exercises all prerendered routes:
 *   - Product detail pages with full content (name, summary, description, category)
 *   - News detail pages with full content (title, summary, TipTap JSON content, tags)
 *   - Product category pages (getStaticPaths from productCategories)
 *   - News tag pages (getStaticPaths from newsTags)
 *   - Pagination pages (products/news > 12 items trigger page 2)
 *   - Branding settings (site_name, site_description, etc.)
 *   - Domain settings (public_domain, admin_domain)
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Mock Product Categories ──────────────────────
const productCategories = [
  { slug: 'ups-systems', name: 'UPS Systems' },
  { slug: 'pdu', name: 'PDUs' },
  { slug: 'power-distribution', name: 'Power Distribution' },
  { slug: 'racks', name: 'Server Racks' },
  { slug: 'cooling', name: 'Cooling Solutions' },
];

const catMap = Object.fromEntries(productCategories.map(c => [c.slug, c.name]));

// ── Helper: generate product description HTML ────
function productDescription(name, category) {
  return `<h2>Overview</h2>
<p>The <strong>${name}</strong> is designed for modern data center environments that demand reliable, efficient power infrastructure. Built with industry-leading components and backed by our comprehensive warranty program, this product delivers the performance and peace of mind your operations require.</p>

<h2>Key Features</h2>
<ul>
<li>High efficiency operation reducing energy costs by up to 30%</li>
<li>Hot-swappable modules for zero-downtime maintenance</li>
<li>Advanced monitoring via SNMP v3, HTTP/HTTPS, and Modbus TCP</li>
<li>Compact form factor optimized for high-density rack environments</li>
<li>Wide input voltage range for compatibility with diverse power sources</li>
</ul>

<h2>Technical Specifications</h2>
<p>Input Voltage: 200–240V AC, 50/60Hz single-phase or 380–415V three-phase<br/>
Output Capacity: As specified in product name<br/>
Efficiency: >96% at typical load<br/>
Operating Temperature: 0–40°C<br/>
MTBF: >200,000 hours</p>

<h2>Applications</h2>
<p>Ideal for ${category} deployments in enterprise data centers, colocation facilities, edge computing sites, and critical infrastructure environments. Suitable for both new installations and retrofit projects.</p>

<h2>Why PowerTech?</h2>
<p>With over 15 years of experience in critical power solutions, PowerTech provides expert consultation, professional installation, and 24/7 technical support. All products undergo rigorous quality testing and come with industry-leading warranties.</p>`;
}

// ── Mock Products (20 items — triggers pagination at PAGE_SIZE=12) ──
const products = [
  { slug: 'ups-3000va-online', name: 'UPS 3000VA Online Double-Conversion', summary: 'High-performance online UPS for critical IT infrastructure with rack-mount design.', category: 'ups-systems' },
  { slug: 'ups-6000va-tower', name: 'UPS 6000VA Tower UPS', summary: 'Tower-form UPS with extended runtime capability for mid-size data centers.', category: 'ups-systems' },
  { slug: 'ups-10kva-rackmount', name: 'UPS 10kVA Rackmount', summary: 'Enterprise-grade rackmount UPS with hot-swappable batteries.', category: 'ups-systems' },
  { slug: 'ups-1500va-line-interactive', name: 'UPS 1500VA Line-Interactive', summary: 'Compact line-interactive UPS for workstations and network equipment.', category: 'ups-systems' },
  { slug: 'ups-20kva-modular', name: 'UPS 20kVA Modular', summary: 'Scalable modular UPS system with N+1 redundancy support.', category: 'ups-systems' },
  { slug: 'pdu-basic-8way', name: 'Basic PDU 8-Way', summary: 'Cost-effective 8-outlet power distribution unit for standard racks.', category: 'pdu' },
  { slug: 'pdu-metered-16way', name: 'Metered PDU 16-Way', summary: '16-outlet metered PDU with per-outlet current monitoring.', category: 'pdu' },
  { slug: 'pdu-switched-24way', name: 'Switched PDU 24-Way', summary: '24-outlet switched PDU with remote on/off control via SNMP/HTTP.', category: 'pdu' },
  { slug: 'pdu-intelligent-32way', name: 'Intelligent PDU 32-Way', summary: '32-outlet intelligent PDU with environmental monitoring sensors.', category: 'pdu' },
  { slug: 'pdu-vertical-6way', name: 'Vertical PDU 6-Way', summary: 'Zero-U vertical mount PDU for maximizing rack outlet density.', category: 'pdu' },
  { slug: 'power-distribution-panel-125a', name: 'Power Distribution Panel 125A', summary: '125A main breaker distribution panel for data center power zones.', category: 'power-distribution' },
  { slug: 'power-distribution-panel-200a', name: 'Power Distribution Panel 200A', summary: '200A distribution panel with multiple branch circuits for high-density racks.', category: 'power-distribution' },
  { slug: 'power-distribution-whip', name: 'Power Distribution Whip', summary: 'Pre-terminated power whip for quick rack power connection.', category: 'power-distribution' },
  { slug: 'rack-42u-open-frame', name: '42U Open Frame Rack', summary: 'Standard 42U open frame server rack with adjustable depth.', category: 'racks' },
  { slug: 'rack-42u-enclosed', name: '42U Enclosed Cabinet', summary: 'Secure 42U enclosed server cabinet with front/rear doors and side panels.', category: 'racks' },
  { slug: 'rack-22u-wallmount', name: '22U Wallmount Cabinet', summary: 'Compact 22U wallmount cabinet for edge computing and small offices.', category: 'racks' },
  { slug: 'rack-48u-high-density', name: '48U High-Density Rack', summary: '48U rack designed for high-density computing with enhanced cable management.', category: 'racks' },
  { slug: 'cooling-unit-5kw', name: 'Precision Cooling Unit 5kW', summary: '5kW precision air conditioning unit for small server rooms.', category: 'cooling' },
  { slug: 'cooling-unit-12kw', name: 'Precision Cooling Unit 12kW', summary: '12kW precision cooling with humidity control for medium data centers.', category: 'cooling' },
  { slug: 'cooling-unit-20kw', name: 'Precision Cooling Unit 20kW', summary: '20kW high-capacity cooling for enterprise data center environments.', category: 'cooling' },
].map(p => ({
  ...p,
  description: productDescription(p.name, catMap[p.category] || p.category),
}));

// ── Mock News Tags ───────────────────────────────
const newsTags = [
  { slug: 'product-launch', name: 'Product Launch' },
  { slug: 'data-center', name: 'Data Center' },
  { slug: 'sustainability', name: 'Sustainability' },
  { slug: 'partnership', name: 'Partnership' },
  { slug: 'industry-trends', name: 'Industry Trends' },
];

// ── Solutions (industry pages) ─────────
const solutions = [
  {
    id: 'sol-dc-001',
    slug: 'data-centers',
    industry: 'data-centers',
    title: 'Data Centers Solutions',
    content: '<p>High-availability UPS systems with N+1 redundancy, custom power distribution architecture, 24/7 remote monitoring and alerting, and preventive maintenance programs designed for mission-critical IT infrastructure.</p>',
  },
  {
    id: 'sol-hc-001',
    slug: 'healthcare',
    industry: 'healthcare',
    title: 'Healthcare Solutions',
    content: '<p>Medical-grade power protection ensuring zero downtime for life-saving equipment, compliant with healthcare facility regulations, with rapid-response support and maintenance programs.</p>',
  },
  {
    id: 'sol-ind-001',
    slug: 'industrial',
    industry: 'industrial',
    title: 'Industrial Solutions',
    content: '<p>Rugged power solutions engineered for harsh manufacturing environments, with comprehensive surge protection, voltage regulation, and scalable architectures for growing operations.</p>',
  },
  {
    id: 'sol-tel-001',
    slug: 'telecommunications',
    industry: 'telecommunications',
    title: 'Telecommunications Solutions',
    content: '<p>Carrier-grade power systems for telecom infrastructure, including -48V DC power plants, backup battery systems, and remote site monitoring for uninterrupted connectivity.</p>',
  },
  {
    id: 'sol-fin-001',
    slug: 'finance',
    industry: 'finance',
    title: 'Financial Services Solutions',
    content: '<p>Enterprise power infrastructure for banks and financial institutions, meeting strict regulatory requirements for uptime, data integrity, and disaster recovery readiness.</p>',
  },
  {
    id: 'sol-gov-001',
    slug: 'government',
    industry: 'government',
    title: 'Government Solutions',
    content: '<p>Secure and reliable power systems for government facilities, meeting federal procurement standards with comprehensive support, monitoring, and compliance reporting.</p>',
  },
];

// ── Page Sections (flat rows) ─────────────────────
const pageSections = [
  // home.hero
  { page: 'home', section: 'hero', field: 'title', value: 'Uninterruptible Power for Your Business', order: 0 },
  { page: 'home', section: 'hero', field: 'subtitle', value: 'Enterprise-grade UPS systems, power distribution, and energy solutions tailored to your industry.', order: 0 },
  { page: 'home', section: 'hero', field: 'cta_primary_text', value: 'Explore Products', order: 0 },
  { page: 'home', section: 'hero', field: 'cta_primary_url', value: '/products', order: 0 },
  { page: 'home', section: 'hero', field: 'cta_secondary_text', value: 'View Solutions', order: 0 },
  { page: 'home', section: 'hero', field: 'cta_secondary_url', value: '/solutions/data-centers', order: 0 },
  // home.solutions_bar
  { page: 'home', section: 'solutions_bar', field: 'title', value: 'Industry Solutions', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_1_title', value: 'Data Centers', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_1_desc', value: 'Uninterruptible power for mission-critical IT infrastructure', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_1_url', value: '/solutions/data-centers', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_2_title', value: 'Healthcare', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_2_desc', value: 'Reliable backup power for medical equipment and facilities', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_2_url', value: '/solutions/healthcare', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_3_title', value: 'Industrial', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_3_desc', value: 'Rugged power solutions for manufacturing and automation', order: 1 },
  { page: 'home', section: 'solutions_bar', field: 'item_3_url', value: '/solutions/industrial', order: 1 },
  // home.cta
  { page: 'home', section: 'cta', field: 'title', value: 'Need a Custom Power Solution?', order: 2 },
  { page: 'home', section: 'cta', field: 'description', value: 'Our engineers can design a system tailored to your exact requirements.', order: 2 },
  { page: 'home', section: 'cta', field: 'cta_text', value: 'Request a Quote', order: 2 },
  { page: 'home', section: 'cta', field: 'cta_url', value: '/about#contact', order: 2 },
  // about.hero
  { page: 'about', section: 'hero', field: 'title', value: 'About {site_name}', order: 0 },
  { page: 'about', section: 'hero', field: 'subtitle', value: '', order: 0 },
  // about.story
  { page: 'about', section: 'story', field: 'body', value: '{site_name} has been a leading provider of uninterruptible power supply (UPS) systems and power management solutions for over 20 years. We serve businesses across data centers, healthcare, industrial, and government sectors.\n\nOur mission is to ensure your critical operations never experience downtime. From small office setups to enterprise data centers, we deliver reliable, efficient, and scalable power continuity solutions.', order: 1 },
  // about.contact
  { page: 'about', section: 'contact', field: 'email', value: 'info@yourcompany.com', order: 2 },
  { page: 'about', section: 'contact', field: 'phone', value: '+1 (555) 123-4567', order: 2 },
  { page: 'about', section: 'contact', field: 'address', value: '123 Power Avenue, Tech City, TC 12345', order: 2 },
  // services.hero
  { page: 'services', section: 'hero', field: 'title', value: 'Our Services', order: 0 },
  { page: 'services', section: 'hero', field: 'subtitle', value: 'End-to-end power continuity solutions from assessment to ongoing support.', order: 0 },
  // services.item_1
  { page: 'services', section: 'item_1', field: 'title', value: 'Power Assessment', order: 1 },
  { page: 'services', section: 'item_1', field: 'desc', value: 'Comprehensive analysis of your power needs and infrastructure requirements.', order: 1 },
  // services.item_2
  { page: 'services', section: 'item_2', field: 'title', value: 'System Design', order: 2 },
  { page: 'services', section: 'item_2', field: 'desc', value: 'Custom-engineered UPS and power distribution systems for your facility.', order: 2 },
  // services.item_3
  { page: 'services', section: 'item_3', field: 'title', value: 'Installation', order: 3 },
  { page: 'services', section: 'item_3', field: 'desc', value: 'Professional installation by certified technicians with minimal downtime.', order: 3 },
  // services.item_4
  { page: 'services', section: 'item_4', field: 'title', value: 'Maintenance & Support', order: 4 },
  { page: 'services', section: 'item_4', field: 'desc', value: '24/7 monitoring, preventive maintenance, and rapid response service.', order: 4 },
  // privacy.content
  { page: 'privacy', section: 'content', field: 'title', value: 'Privacy Policy', order: 0 },
  { page: 'privacy', section: 'content', field: 'body', value: '<p>We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p><h2>Information We Collect</h2><p>We may collect the following information: name, email address, company name, and phone number when you submit an inquiry through our contact form. We also collect standard log data including IP address, browser type, and pages visited.</p><h2>How We Use Your Data</h2><p>Your data is used solely to respond to your inquiries and improve our website experience. We do not sell or share your personal information with third parties.</p><h2>Data Retention</h2><p>We retain inquiry records for 2 years. You may request deletion of your data at any time by contacting us.</p><h2>Your Rights</h2><p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at the email address below.</p><h2>Contact</h2><p>If you have questions about this privacy policy, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>', order: 0 },
  { page: 'privacy', section: 'content', field: 'last_updated', value: '2026-04-13', order: 0 },
  // terms.content
  { page: 'terms', section: 'content', field: 'title', value: 'Terms & Conditions', order: 0 },
  { page: 'terms', section: 'content', field: 'body', value: '<h2>1. Services</h2><p>Our website provides product information and inquiry services. All product specifications are subject to change without notice.</p><h2>2. Pricing</h2><p>Prices displayed on this website are for reference only. Final pricing is confirmed through formal quotation and mutual agreement.</p><h2>3. Intellectual Property</h2><p>All content on this website, including text, images, and product documentation, is the property of the company and protected by applicable copyright laws.</p><h2>4. Disclaimer</h2><p>While we strive for accuracy, we do not guarantee that all product specifications are error-free. Actual products may vary from descriptions on this website.</p><h2>5. External Links</h2><p>This website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.</p><h2>6. Governing Law</h2><p>These terms are governed by the laws of the jurisdiction in which the company is registered.</p><h2>7. Contact</h2><p>For questions about these terms, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>', order: 0 },
  { page: 'terms', section: 'content', field: 'last_updated', value: '2026-04-13', order: 0 },
];

// ── Helper: generate TipTap JSON content ─────────
function newsContent(title, summary) {
  return JSON.stringify({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: summary }] },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Key Highlights' }] },
      {
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'text', text: 'Designed for enterprise-grade reliability and performance' }] },
          { type: 'listItem', content: [{ type: 'text', text: 'Backed by comprehensive warranty and 24/7 technical support' }] },
          { type: 'listItem', content: [{ type: 'text', text: 'Compatible with existing infrastructure for easy deployment' }] },
        ],
      },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'What This Means for Our Customers' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'At PowerTech Solutions, we are committed to delivering innovative power infrastructure that meets the evolving demands of modern data centers. This announcement reflects our ongoing investment in research and development, ensuring our customers have access to the latest technologies and solutions.' },
        ],
      },
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Next Steps' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Contact our sales team at ' },
          { type: 'text', text: 'sales@powertech.example.com', marks: [{ type: 'link', attrs: { href: 'mailto:sales@powertech.example.com' } }] },
          { type: 'text', text: ' to learn more about this solution and how it can benefit your organization. Our engineers are available for on-site consultations and custom design proposals.' },
        ],
      },
    ],
  });
}

// ── Mock News (15 items — triggers pagination at PAGE_SIZE=12) ──
const now = Math.floor(Date.now() / 1000);
const DAY = 86400;

const newsTagAssignments = [
  ['product-launch'],
  ['data-center', 'industry-trends'],
  ['partnership', 'sustainability'],
  ['product-launch'],
  ['data-center', 'industry-trends'],
  ['sustainability'],
  ['product-launch', 'data-center'],
  ['data-center'],
  ['product-launch'],
  ['industry-trends'],
  ['data-center', 'partnership'],
  ['product-launch'],
  ['data-center', 'industry-trends'],
  ['sustainability'],
  ['data-center'],
];

const news = [
  { slug: 'new-ups-3000va-launched', title: 'Introducing the UPS 3000VA Online Double-Conversion', summary: 'Our latest online UPS delivers industry-leading efficiency and reliability for mission-critical applications.', publishedAt: now - 2 * DAY },
  { slug: 'data-center-efficiency-tips', title: '5 Ways to Improve Data Center Power Efficiency', summary: 'Practical strategies to reduce PUE and lower energy costs in your data center.', publishedAt: now - 5 * DAY },
  { slug: 'partnership-with-green-energy', title: 'Partnership with Green Energy Corp', summary: 'We are excited to announce a strategic partnership to deliver sustainable power solutions.', publishedAt: now - 10 * DAY },
  { slug: 'pdu-range-expansion', title: 'Expanded PDU Range Now Available', summary: 'New metered and switched PDUs join our product lineup for enhanced power management.', publishedAt: now - 15 * DAY },
  { slug: 'edge-computing-power-needs', title: 'Powering the Edge: Meeting New Infrastructure Demands', summary: 'How edge computing is reshaping power distribution requirements.', publishedAt: now - 20 * DAY },
  { slug: 'sustainability-report-2025', title: '2025 Sustainability Report Published', summary: 'Our commitment to environmental responsibility and carbon-neutral operations.', publishedAt: now - 30 * DAY },
  { slug: 'modular-ups-benefits', title: 'The Benefits of Modular UPS Architecture', summary: 'Why modular UPS systems are becoming the preferred choice for scalable data centers.', publishedAt: now - 35 * DAY },
  { slug: 'cooling-best-practices', title: 'Cooling Best Practices for High-Density Racks', summary: 'Expert recommendations for maintaining optimal temperatures in high-density environments.', publishedAt: now - 45 * DAY },
  { slug: 'new-rack-48u-announced', title: 'New 48U High-Density Rack Announced', summary: 'Purpose-built for AI/ML workloads with enhanced cable management and airflow.', publishedAt: now - 50 * DAY },
  { slug: 'industry-trends-2025-q1', title: 'Industry Trends Q1 2025: Power & Cooling', summary: 'Key trends shaping the data center power and cooling landscape in 2025.', publishedAt: now - 60 * DAY },
  { slug: 'case-study-financial-services', title: 'Case Study: Power Infrastructure for Financial Services', summary: 'How we helped a leading bank upgrade their data center power distribution.', publishedAt: now - 70 * DAY },
  { slug: 'new-pdu-intelligent-32way', title: 'Intelligent PDU 32-Way: Smart Power Management', summary: 'Monitor and control power delivery at the outlet level with our new intelligent PDU.', publishedAt: now - 80 * DAY },
  { slug: 'data-center-expansion-guide', title: 'Planning Your Data Center Power Expansion', summary: 'A comprehensive guide to scaling power infrastructure for growing data centers.', publishedAt: now - 90 * DAY },
  { slug: 'green-certification-achieved', title: 'ISO 14001 Environmental Certification Achieved', summary: 'Our manufacturing facilities have achieved ISO 14001 environmental management certification.', publishedAt: now - 100 * DAY },
  { slug: 'webinar-recording-power-monitoring', title: 'Webinar Recording: Real-Time Power Monitoring', summary: 'Watch the recording of our popular webinar on implementing real-time power monitoring.', publishedAt: now - 110 * DAY },
].map((n, i) => ({
  ...n,
  content: newsContent(n.title, n.summary),
  tags: (newsTagAssignments[i] || []).map(slug => {
    const tag = newsTags.find(t => t.slug === slug);
    return tag ? { slug: tag.slug, name: tag.name } : null;
  }).filter(Boolean),
}));

// ── Mock Settings ────────────────────────────────
const settings = {
  site_name: 'PowerTech Solutions',
  site_description: 'Professional B2B power solutions — UPS systems, PDUs, and power distribution products for data centers and enterprises.',
  site_logo_url: '/media/logo.png',
  site_favicon_url: '/favicon.svg',
  site_og_image_url: '/media/og-default.png',
  social_links: JSON.stringify([
    { platform: 'linkedin', url: 'https://linkedin.com/company/powertech' },
    { platform: 'twitter', url: 'https://twitter.com/powertech' },
  ]),
  public_domain: 'powertech.example.com',
  admin_domain: 'admin.powertech.example.com',
  theme_brand_color: '',
  theme_font_family: '',
  dark_mode_enabled: 'false',
  ga_measurement_id: '',
  privacy_enabled: 'true',
  terms_enabled: 'true',
};

// ── Build Output ─────────────────────────────────
const buildData = {
  _meta: {
    generatedAt: new Date().toISOString(),
    source: 'mock-data-generator',
  },
  settings,
  products,
  news,
  productCategories,
  newsTags,
  solutions,
  domains: {
    public: settings.public_domain,
    admin: settings.admin_domain,
  },
  pages: pageSections.reduce((acc, r) => {
    if (!acc[r.page]) acc[r.page] = {};
    if (!acc[r.page][r.section]) acc[r.page][r.section] = {};
    acc[r.page][r.section][r.field] = r.value;
    return acc;
  }, {}),
};

const outPath = resolve(ROOT, 'src/data/build-data.json');
writeFileSync(outPath, JSON.stringify(buildData, null, 2) + '\n', 'utf-8');

console.log(`[generate-mock-data] Written to ${outPath}`);
console.log(`  Settings:     ${Object.keys(settings).length} keys`);
console.log(`  Products:     ${products.length} (with description + category)`);
console.log(`  News:         ${news.length} (with TipTap content + tags)`);
console.log(`  Categories:   ${productCategories.length}`);
console.log(`  Tags:         ${newsTags.length}`);
console.log(`  Solutions:    ${solutions.length}`);
console.log(`  Page sections: ${Object.keys(buildData.pages).length} pages`);
console.log(`  Public Domain: ${settings.public_domain}`);
console.log(`  Admin Domain:  ${settings.admin_domain}`);
