globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { m as maybeRenderHead, c as addAttribute, r as renderTemplate } from "./sequence_IbtNAemG.mjs";
import { r as reactExports, a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
const $$PageContentSection = createComponent(async ($$result, $$props, $$slots) => {
  const PAGES = [
    {
      id: "home",
      label: "Home",
      sections: [
        {
          title: "Hero",
          fields: [
            { id: "home_hero_title", label: "Title", type: "text" },
            { id: "home_hero_subtitle", label: "Subtitle", type: "text" },
            { id: "home_hero_cta_primary_text", label: "Primary CTA Text", type: "text" },
            { id: "home_hero_cta_primary_url", label: "Primary CTA URL", type: "text" },
            { id: "home_hero_cta_secondary_text", label: "Secondary CTA Text", type: "text" },
            { id: "home_hero_cta_secondary_url", label: "Secondary CTA URL", type: "text" }
          ]
        },
        {
          title: "Solutions Bar",
          fields: [
            { id: "home_solutions_bar_title", label: "Title", type: "text" },
            { id: "home_solutions_bar_item_1_title", label: "Item 1 Title", type: "text" },
            { id: "home_solutions_bar_item_1_desc", label: "Item 1 Description", type: "text" },
            { id: "home_solutions_bar_item_1_url", label: "Item 1 URL", type: "text" },
            { id: "home_solutions_bar_item_2_title", label: "Item 2 Title", type: "text" },
            { id: "home_solutions_bar_item_2_desc", label: "Item 2 Description", type: "text" },
            { id: "home_solutions_bar_item_2_url", label: "Item 2 URL", type: "text" },
            { id: "home_solutions_bar_item_3_title", label: "Item 3 Title", type: "text" },
            { id: "home_solutions_bar_item_3_desc", label: "Item 3 Description", type: "text" },
            { id: "home_solutions_bar_item_3_url", label: "Item 3 URL", type: "text" }
          ]
        },
        {
          title: "CTA Section",
          fields: [
            { id: "home_cta_title", label: "Title", type: "text" },
            { id: "home_cta_description", label: "Description", type: "text" },
            { id: "home_cta_cta_text", label: "CTA Text", type: "text" },
            { id: "home_cta_cta_url", label: "CTA URL", type: "text" }
          ]
        }
      ]
    },
    {
      id: "about",
      label: "About",
      sections: [
        {
          title: "Hero",
          fields: [
            { id: "about_hero_title", label: "Title", type: "text" }
          ]
        },
        {
          title: "Story",
          fields: [
            { id: "about_story_body", label: "Body", type: "textarea" }
          ]
        },
        {
          title: "Contact",
          fields: [
            { id: "about_contact_email", label: "Email", type: "text" },
            { id: "about_contact_phone", label: "Phone", type: "text" },
            { id: "about_contact_address", label: "Address", type: "text" }
          ]
        }
      ]
    },
    {
      id: "services",
      label: "Services",
      sections: [
        {
          title: "Hero",
          fields: [
            { id: "services_hero_title", label: "Title", type: "text" },
            { id: "services_hero_subtitle", label: "Subtitle", type: "text" }
          ]
        },
        {
          title: "Service Item 1",
          fields: [
            { id: "services_item_1_title", label: "Title", type: "text" },
            { id: "services_item_1_desc", label: "Description", type: "textarea" }
          ]
        },
        {
          title: "Service Item 2",
          fields: [
            { id: "services_item_2_title", label: "Title", type: "text" },
            { id: "services_item_2_desc", label: "Description", type: "textarea" }
          ]
        },
        {
          title: "Service Item 3",
          fields: [
            { id: "services_item_3_title", label: "Title", type: "text" },
            { id: "services_item_3_desc", label: "Description", type: "textarea" }
          ]
        },
        {
          title: "Service Item 4",
          fields: [
            { id: "services_item_4_title", label: "Title", type: "text" },
            { id: "services_item_4_desc", label: "Description", type: "textarea" }
          ]
        }
      ]
    },
    {
      id: "privacy",
      label: "Privacy Policy",
      sections: [
        {
          title: "Content",
          fields: [
            { id: "privacy_content_title", label: "Title", type: "text" },
            { id: "privacy_content_body", label: "Body", type: "textarea" },
            { id: "privacy_content_last_updated", label: "Last Updated", type: "text" }
          ]
        }
      ]
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      sections: [
        {
          title: "Content",
          fields: [
            { id: "terms_content_title", label: "Title", type: "text" },
            { id: "terms_content_body", label: "Body", type: "textarea" },
            { id: "terms_content_last_updated", label: "Last Updated", type: "text" }
          ]
        }
      ]
    }
  ];
  return renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"> <h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">Page Content Management</h2> <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;"> <!-- Notice --> <div style="padding: 0.625rem 0.875rem; background: #fef3c7; border: 1px solid #f59e0b; border-radius: var(--radius-md); font-size: 0.8125rem; color: #92400e;">
&#9888;&#65039; Changes will take effect after rebuilding the site
</div> <!-- Accordion panels --> <div id="page-content-accordion"> ${PAGES.map((page2) => renderTemplate`<div class="pc-accordion-item" style="border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 0.75rem; overflow: hidden;"> <button type="button" class="pc-accordion-toggle"${addAttribute(page2.id, "data-page-id")} style="width: 100%; padding: 0.75rem 1rem; background: var(--color-surface-muted); border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.9375rem; font-weight: 600; color: var(--color-text-primary);"> <span>${page2.label}</span> <span class="pc-chevron" style="transition: transform 0.2s;">&#9660;</span> </button> <div class="pc-accordion-body"${addAttribute(page2.id, "data-page-id")} style="display: none; padding: 1rem; border-top: 1px solid var(--color-border);"> ${page2.sections.map((section) => renderTemplate`<div style="margin-bottom: 1.25rem;"> <h4 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-tertiary); margin-bottom: 0.625rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.375rem;"> ${section.title} </h4> ${section.fields.map((field) => renderTemplate`<div style="margin-bottom: 0.75rem;"> <label${addAttribute(field.id, "for")} style="display: block; font-weight: 500; margin-bottom: 0.25rem; font-size: 0.875rem;"> ${field.label} </label> ${field.type === "textarea" ? renderTemplate`<textarea${addAttribute(field.id, "id")}${addAttribute(page2.id, "data-page")} rows="4"${addAttribute(`Enter ${field.label.toLowerCase()}...`, "placeholder")} style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box; resize: vertical; font-family: inherit;"></textarea>` : renderTemplate`<input${addAttribute(field.id, "id")}${addAttribute(page2.id, "data-page")} type="text"${addAttribute(`Enter ${field.label.toLowerCase()}...`, "placeholder")} style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;">`} </div>`)} </div>`)} </div> </div>`)} </div> <!-- Save All Button --> <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--color-border);"> <button id="page-content-save-btn" type="button" class="btn-secondary" onclick="saveAllPageContent(this)">
Save All
</button> </div> <!-- Status message --> <div id="page-content-status" style="font-size: 0.8125rem; display: none;"></div> </div> </div> ${renderScript($$result, "/workspace/src/components/admin/settings/PageContentSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/PageContentSection.astro", void 0);
const $$PageVisibilitySection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PageVisibilitySection;
  const { settings, settingGroups } = Astro2.props;
  return renderTemplate`${settingGroups.map((group) => renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"><h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">${group.title}</h2><div style="display: flex; flex-direction: column; gap: 0.75rem;">${group.items.map((s) => renderTemplate`<div class="card" style="display: flex; justify-content: space-between; align-items: center;"><div><h3 style="font-weight: 500; margin-bottom: 0.125rem;">${s.label}</h3><p style="font-size: 0.8125rem; color: var(--color-text-tertiary);">${s.description}</p></div><label class="toggle-switch"><input type="checkbox"${addAttribute(s.key, "data-key")}${addAttribute(settings[s.key] !== false, "checked")} onchange="toggleSetting(this)"><span class="toggle-slider"></span></label></div>`)}</div></div>`)}${renderScript($$result, "/workspace/src/components/admin/settings/PageVisibilitySection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/PageVisibilitySection.astro", void 0);
const $$SiteBrandingSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SiteBrandingSection;
  const { settings } = Astro2.props;
  const siteName = settings.site_name || "";
  const siteDescription = settings.site_description || "";
  const siteLogoUrl = settings.site_logo_url || "";
  const siteFaviconUrl = settings.site_favicon_url || "";
  const siteOgImageUrl = settings.site_og_image_url || "";
  return renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"> <h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">Site Branding</h2> <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;"> <!-- Site Name --> <div> <label for="brand-site-name" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Site Name</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Displayed in the header, footer, page titles, and search results.</p> <input id="brand-site-name" type="text"${addAttribute(siteName, "value")} maxlength="100" placeholder="YourCompany" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> </div> <!-- Site Description --> <div> <label for="brand-site-desc" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Site Description</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Default meta description for pages without a custom description.</p> <textarea id="brand-site-desc" rows="2" maxlength="300" placeholder="Professional B2B power solutions..." style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box; resize: vertical;">${siteDescription}</textarea> </div> <!-- Logo URL --> <div> <label for="brand-logo-url" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Logo URL</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Image displayed in the header. Leave empty to show the site name as text.</p> <div style="display: flex; gap: 0.5rem; align-items: center;"> <input id="brand-logo-url" type="text"${addAttribute(siteLogoUrl, "value")} placeholder="/media/logo.png" style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> ${siteLogoUrl && renderTemplate`<img${addAttribute(siteLogoUrl, "src")} alt="Logo preview" style="height: 2rem; width: auto; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">`} </div> </div> <!-- Favicon URL --> <div> <label for="brand-favicon-url" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Favicon URL</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Browser tab icon. Supports SVG, ICO, and PNG formats.</p> <div style="display: flex; gap: 0.5rem; align-items: center;"> <input id="brand-favicon-url" type="text"${addAttribute(siteFaviconUrl, "value")} placeholder="/favicon.svg" style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> ${siteFaviconUrl && renderTemplate`<img${addAttribute(siteFaviconUrl, "src")} alt="Favicon preview" style="height: 1.5rem; width: auto; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">`} </div> </div> <!-- OG Default Image URL --> <div> <label for="brand-og-image-url" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Default OG Image URL</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Fallback image for social sharing (Open Graph). Leave empty to use /og-default.png.</p> <div style="display: flex; gap: 0.5rem; align-items: center;"> <input id="brand-og-image-url" type="text"${addAttribute(siteOgImageUrl, "value")} placeholder="/media/og-default.png" style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> ${siteOgImageUrl && renderTemplate`<img${addAttribute(siteOgImageUrl, "src")} alt="OG preview" style="height: 2rem; width: auto; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">`} </div> </div> <!-- Save Button --> <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--color-border);"> <button id="brand-save-btn" type="button" class="btn-secondary" onclick="saveBrandingSettings(this)">
Save Branding
</button> </div> <!-- Status message --> <div id="brand-status" style="font-size: 0.8125rem; display: none;"></div> </div> </div> ${renderScript($$result, "/workspace/src/components/admin/settings/SiteBrandingSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/SiteBrandingSection.astro", void 0);
const $$DomainIsolationSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$DomainIsolationSection;
  const { settings } = Astro2.props;
  const publicDomain = settings.public_domain || "";
  const adminDomain = settings.admin_domain || "";
  return renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"> <h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">Domain Isolation</h2> <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;"> <p style="font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.5;">
Separate your public website and admin panel onto different domains.
      When both fields are configured, the middleware will block admin routes on the public domain
      and redirect public pages on the admin domain.
      Leave empty to disable domain isolation.
</p> <!-- Public Domain --> <div> <label for="domain-public" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Public Domain</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">
The domain visitors use to browse your website (e.g. <code>yourcompany.com</code>).
        Admin and API routes will return 404 on this domain.
</p> <input id="domain-public" type="text"${addAttribute(publicDomain, "value")} maxlength="200" placeholder="yourcompany.com" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> </div> <!-- Admin Domain --> <div> <label for="domain-admin" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Admin Domain</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">
The domain for the admin panel (e.g. <code>admin.yourcompany.com</code>).
        Public pages will redirect to the public domain.
</p> <input id="domain-admin" type="text"${addAttribute(adminDomain, "value")} maxlength="200" placeholder="admin.yourcompany.com" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> </div> <!-- Current Status --> <div id="domain-status-display" style="padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8125rem; line-height: 1.5;"> ${publicDomain && adminDomain && publicDomain !== adminDomain ? renderTemplate`<div style="background: var(--color-success-bg); color: var(--color-brand-800); border: 1px solid var(--color-success-border);">
✓ Domain isolation is <strong>active</strong>. Public: <code>${publicDomain}</code> → Admin: <code>${adminDomain}</code> </div>` : renderTemplate`<div style="background: var(--color-warning-bg); color: var(--color-warning-text); border: 1px solid var(--color-warning-border);">
⚠ Domain isolation is <strong>disabled</strong>. ${!publicDomain && !adminDomain ? "Configure both domains below to enable." : "Both domains must be set and different to enable."} </div>`} </div> <!-- Save Button --> <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--color-border);"> <button id="domain-save-btn" type="button" class="btn-secondary" onclick="saveDomainSettings(this)">
Save Domains
</button> </div> <!-- Status message --> <div id="domain-status" style="font-size: 0.8125rem; display: none;"></div> </div> </div> ${renderScript($$result, "/workspace/src/components/admin/settings/DomainIsolationSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/DomainIsolationSection.astro", void 0);
const $$ThemeSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ThemeSection;
  const { settings } = Astro2.props;
  const brandColor = settings.theme_brand_color || "";
  const fontFamily = settings.theme_font_family || "";
  const darkModeEnabled = settings.dark_mode_enabled === "true" || settings.dark_mode_enabled === true;
  return renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"> <h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">Theme</h2> <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;"> <p style="font-size: 0.8125rem; color: var(--color-text-secondary); line-height: 1.5;">
Customize the brand color and font family. After saving, rebuild the site
      (<code style="font-size: 0.75rem; background: var(--color-surface-muted); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);">build:mock && build</code>)
      to apply changes.
</p> <!-- Brand Color --> <div> <label for="theme-brand-color" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Brand Color</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">
Primary brand color (<code>--color-brand-600</code>). A full palette (50–900) is auto-generated from this color.
        Leave empty to use the default emerald green (<code>#059669</code>).
</p> <div style="display: flex; align-items: center; gap: 0.75rem;"> <input id="theme-brand-color" type="color"${addAttribute(brandColor || "#059669", "value")} style="width: 2.5rem; height: 2.5rem; padding: 0.125rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; background: var(--color-surface);"> <input id="theme-brand-color-text" type="text"${addAttribute(brandColor, "value")} maxlength="7" placeholder="#059669" style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box; font-family: monospace;"> </div> </div> <!-- Font Family --> <div> <label for="theme-font-family" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Font Family</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">
CSS font-family string. Leave empty to use the default (<code>Plus Jakarta Sans</code>).
</p> <input id="theme-font-family" type="text"${addAttribute(fontFamily, "value")} maxlength="200" placeholder="'Inter', sans-serif" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> </div> <!-- Dark Mode Toggle --> <div> <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"> <input id="dark-mode-enabled" type="checkbox"${addAttribute(darkModeEnabled, "checked")} style="width: 1.125rem; height: 1.125rem; cursor: pointer; accent-color: var(--color-brand-600);"> <span style="font-weight: 500;">Dark Mode Toggle</span> </label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-top: 0.25rem;">
Show a dark/light mode toggle button on the public site. Disabled by default.
        The admin panel is unaffected — dark mode toggle is always available there.
</p> </div> <!-- Preview --> <div id="theme-preview" style="padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--color-border);"> <p style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-bottom: 0.5rem;">Preview</p> <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;"> <span id="preview-50" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; background: var(--color-brand-50); color: var(--color-brand-900);">50</span> <span id="preview-200" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; background: var(--color-brand-200); color: var(--color-brand-900);">200</span> <span id="preview-400" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; background: var(--color-brand-400); color: var(--color-text-inverse);">400</span> <span id="preview-600" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; background: var(--color-brand-600); color: var(--color-text-inverse);">600</span> <span id="preview-800" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; background: var(--color-brand-800); color: var(--color-text-inverse);">800</span> </div> <p id="preview-text" style="font-size: 0.875rem; color: var(--color-text-primary);">The quick brown fox jumps over the lazy dog.</p> </div> <!-- Save Button --> <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--color-border);"> <button id="theme-save-btn" type="button" class="btn-secondary" onclick="saveThemeSettings(this)">
Save Theme
</button> </div> <!-- Status message --> <div id="theme-status" style="font-size: 0.8125rem; display: none;"></div> </div> </div> ${renderScript($$result, "/workspace/src/components/admin/settings/ThemeSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/ThemeSection.astro", void 0);
const $$AnalyticsSettingsSection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AnalyticsSettingsSection;
  const { settings } = Astro2.props;
  const gaMeasurementId = settings.ga_measurement_id || "";
  return renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem;"> <h2 style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); margin-bottom: 0.75rem;">Analytics</h2> <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;"> <!-- GA Measurement ID --> <div> <label for="analytics-ga-id" style="display: block; font-weight: 500; margin-bottom: 0.25rem;">Google Analytics Measurement ID</label> <p style="font-size: 0.8125rem; color: var(--color-text-tertiary); margin-bottom: 0.375rem;">Leave empty to disable Google Analytics.</p> <input id="analytics-ga-id" type="text"${addAttribute(gaMeasurementId, "value")} maxlength="20" placeholder="G-XXXXXXXXXX" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.875rem; box-sizing: border-box;"> <p id="analytics-ga-id-error" style="font-size: 0.8125rem; color: var(--color-danger); display: none; margin-top: 0.25rem;">
GA Measurement ID must start with "G-" followed by alphanumeric characters.
</p> </div> <!-- Warning --> <div style="padding: 0.625rem 0.875rem; background: #fef3c7; border: 1px solid #f59e0b; border-radius: var(--radius-md); font-size: 0.8125rem; color: #92400e;">
&#9888;&#65039; If enabling GA, ensure your Privacy Policy mentions analytics usage
</div> <!-- Save Button --> <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--color-border);"> <button id="analytics-save-btn" type="button" class="btn-secondary" onclick="saveAnalyticsSettings(this)">
Save Analytics
</button> </div> <!-- Status message --> <div id="analytics-status" style="font-size: 0.8125rem; display: none;"></div> </div> </div> ${renderScript($$result, "/workspace/src/components/admin/settings/AnalyticsSettingsSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/components/admin/settings/AnalyticsSettingsSection.astro", void 0);
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const sectionTitle$4 = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-tertiary)",
  marginBottom: "0.75rem"
};
const cardStyle$3 = {
  background: "var(--color-surface, white)",
  borderRadius: "10px",
  border: "1px solid var(--color-border, #e5e7eb)",
  padding: "1rem",
  overflowX: "auto"
};
const thStyle = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border)",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  whiteSpace: "nowrap",
  fontSize: "0.8125rem"
};
const tdStyle = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--color-border-subtle)",
  verticalAlign: "top",
  fontSize: "0.8125rem"
};
function NotificationLogs() {
  const [logs, setLogs] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadLogs();
  }, []);
  async function loadLogs() {
    try {
      const res = await fetch("/api/notifications/logs?limit=20");
      if (!res.ok) {
        setError("Failed to load logs");
        return;
      }
      const data = await res.json();
      setLogs(data);
    } catch {
      setError("Failed to load logs");
    }
  }
  const badgeStyle = (status) => {
    const colors = {
      sent: { bg: "#d1fae5", color: "#065f46" },
      failed: { bg: "#fee2e2", color: "#991b1b" },
      skipped: { bg: "#f3f4f6", color: "#6b7280" }
    };
    const c = colors[status] || colors.skipped;
    return { display: "inline-block", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, background: c.bg, color: c.color };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: sectionTitle$4, children: "Recent Notification Logs" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$3, children: [
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)", fontSize: "0.875rem" }, children: error }) : null,
      !error && logs === null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)", fontSize: "0.875rem" }, children: "Loading logs..." }),
      !error && logs !== null && logs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)", textAlign: "center", padding: "1rem" }, children: "No notification logs yet." }),
      !error && logs !== null && logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Recipient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: thStyle, children: "Error" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: logs.map((log, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, whiteSpace: "nowrap" }, children: log.created_at ? new Date(log.created_at * 1e3).toLocaleString() : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { style: { fontSize: "0.75rem", background: "var(--color-surface-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px" }, children: escHtml(log.event_type) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: escHtml(log.channel_type || "-") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: tdStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: badgeStyle(log.status), children: log.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, maxWidth: "12rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: escHtml(log.recipient || "-") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { ...tdStyle, maxWidth: "15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#dc2626", fontSize: "0.75rem" }, title: log.error_message || "", children: escHtml(log.error_message || "-") })
        ] }, i)) })
      ] })
    ] })
  ] });
}
const sectionTitle$3 = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-tertiary)",
  marginBottom: "0.75rem"
};
const inputStyle$2 = {
  padding: "0.625rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};
function SocialLinksManager() {
  const [links, setLinks] = reactExports.useState([]);
  const [inputValue, setInputValue] = reactExports.useState("");
  const [toast, setToast] = reactExports.useState(null);
  const loadSocialLinks = reactExports.useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const settings = await res.json();
      const raw = settings["social_links"];
      if (raw && typeof raw === "string") {
        setLinks(JSON.parse(raw));
      } else {
        setLinks([]);
      }
    } catch {
      setLinks([]);
    }
  }, []);
  reactExports.useEffect(() => {
    loadSocialLinks();
  }, [loadSocialLinks]);
  reactExports.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3e3);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  function addSocialLink() {
    const url = inputValue.trim();
    if (!url || !url.startsWith("http")) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setLinks((prev) => {
      if (prev.includes(url)) {
        alert("This link already exists.");
        return prev;
      }
      return [...prev, url];
    });
    setInputValue("");
  }
  function editSocialLink(index, value) {
    if (value.startsWith("http")) {
      setLinks((prev) => {
        const updated = [...prev];
        updated[index] = value.trim();
        return updated;
      });
    }
  }
  function removeSocialLink(index) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }
  async function saveSocialLinks() {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "social_links", value: JSON.stringify(links) })
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: "Social links saved!", type: "success" });
      } else {
        setToast({ message: "Failed to save: " + (data.error || "Unknown error"), type: "error" });
      }
    } catch (e) {
      setToast({ message: "Error: " + String(e), type: "error" });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: sectionTitle$3, children: "Social Links" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }, children: "Manage social media links for SEO (Organization schema sameAs). These appear in search results and knowledge panels." }),
    toast && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      marginBottom: "0.75rem",
      fontSize: "0.875rem",
      background: toast.type === "success" ? "#d1fae5" : "#fee2e2",
      color: toast.type === "success" ? "#065f46" : "#991b1b",
      border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`
    }, children: toast.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }, children: links.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)", fontSize: "0.875rem" }, children: "No social links configured." }) : links.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "url",
          value: url,
          onChange: (e) => editSocialLink(i, e.target.value),
          style: { ...inputStyle$2, flex: 1, fontSize: "0.875rem" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => removeSocialLink(i),
          style: {
            padding: "0.375rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "6px",
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#dc2626",
            cursor: "pointer"
          },
          children: "✕"
        }
      )
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "url",
          value: inputValue,
          onChange: (e) => setInputValue(e.target.value),
          placeholder: "https://linkedin.com/company/yourcompany",
          style: { ...inputStyle$2, flex: 1 },
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSocialLink();
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: addSocialLink,
          style: {
            padding: "0.625rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: "#065f46",
            color: "white",
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap"
          },
          children: "+ Add"
        }
      )
    ] }),
    links.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: saveSocialLinks,
        style: {
          display: "inline-block",
          padding: "0.625rem 1.25rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: 500,
          background: "var(--color-surface-muted)",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border)",
          cursor: "pointer"
        },
        children: "Save Social Links"
      }
    )
  ] });
}
const NOTIFICATION_EVENT_OPTIONS = [
  { value: "quote.created", label: "New Inquiry", description: "When a customer submits a quote request" },
  { value: "quote.status_changed", label: "Inquiry Status Update", description: "When an inquiry status changes" },
  { value: "comment.created", label: "New Comment", description: "When a root comment is posted" },
  { value: "comment.pending_review", label: "Comment Awaiting Review", description: "When a reply comment needs moderation" },
  { value: "comment.reply_received", label: "Reply Received", description: "When someone replies to your comment" },
  { value: "news.published", label: "News Published", description: "When a news article is published" },
  { value: "product.published", label: "Product Published", description: "When a product is published" }
];
const EVENT_LABELS = {
  "quote.created": "New Inquiry",
  "quote.status_changed": "Status Update",
  "comment.created": "New Comment",
  "comment.pending_review": "Review Required",
  "comment.reply_received": "Reply Received",
  "news.published": "News Published",
  "product.published": "Product Published"
};
const TOAST_PREF_EVENTS = [
  { value: "quote.created", label: "New Inquiry", icon: "🆕" },
  { value: "quote.status_changed", label: "Status Update", icon: "📋" },
  { value: "comment.created", label: "New Comment", icon: "💬" },
  { value: "comment.pending_review", label: "Review Required", icon: "⚠️" },
  { value: "comment.reply_received", label: "Reply Received", icon: "↩️" },
  { value: "news.published", label: "News Published", icon: "📰" },
  { value: "product.published", label: "Product Published", icon: "📦" }
];
const WEBHOOK_PLATFORM_HINTS = {
  generic: {
    hint: "Sends raw JSON with optional HMAC-SHA256 signature.",
    placeholder: "https://your-webhook-url.com/notify",
    secretPlaceholder: "Optional — for signature verification",
    secretHint: "Sent as X-Notification-Signature header."
  },
  slack: {
    hint: "Sends Slack Block Kit format with Slack v0 signature verification.",
    placeholder: "https://hooks.slack.com/services/T.../B.../xxx",
    secretPlaceholder: "Slack signing secret",
    secretHint: "Used for X-Slack-Signature verification."
  },
  discord: {
    hint: "Sends Discord embed format. Token is embedded in the webhook URL.",
    placeholder: "https://discord.com/api/webhooks/xxx/yyy",
    secretPlaceholder: "Not needed (token in URL)",
    secretHint: "Discord uses token in webhook URL, no separate secret."
  },
  wechat_work: {
    hint: "Sends WeCom markdown format for 企业微信 group robot.",
    placeholder: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx",
    secretPlaceholder: "Not needed (token in URL)",
    secretHint: "WeCom uses key in webhook URL, no separate secret."
  }
};
const TEMPLATE_SAMPLE_DATA = {
  "quote.created": { customerName: "John Doe", customerEmail: "john@example.com", company: "Acme Corp", product: "Industrial UPS 3000VA", message: "I need a quote for 10 units with delivery to Shanghai.", quoteId: "abc-123", adminUrl: "/admin/quote-requests" },
  "quote.status_changed": { customerName: "John Doe", quoteId: "abc-123", newStatus: "quoted" },
  "comment.created": { authorName: "Jane Smith", postTitle: "How to Choose a UPS", commentPreview: "Great article! I have a question about runtime...", commentUrl: "/article/how-to-choose-ups#comment-1" },
  "comment.pending_review": { authorName: "Jane Smith", postTitle: "How to Choose a UPS", commentPreview: "This is a reply to the original comment...", reviewUrl: "/admin/news/comments" },
  "comment.reply_received": { replierName: "Admin", postTitle: "How to Choose a UPS", replyPreview: "Thanks for your question! Here is the answer...", commentUrl: "/article/how-to-choose-ups#comment-2" },
  "news.published": { newsTitle: "New Product Launch Announcement", newsUrl: "/article/new-launch", summary: "We are excited to announce our latest product line." },
  "product.published": { productName: "Industrial UPS 3000VA", productUrl: "/product/ups-3000va", summary: "High-efficiency uninterruptible power supply for data centers." }
};
const sectionTitle$2 = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-tertiary)",
  marginBottom: "0.75rem"
};
const cardStyle$2 = {
  background: "var(--color-surface, white)",
  borderRadius: "10px",
  border: "1px solid var(--color-border, #e5e7eb)",
  padding: "0.75rem 1rem",
  textAlign: "center"
};
const selectStyle = {
  padding: "0.625rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.8125rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  maxWidth: "8rem"
};
const bodyCardStyle = {
  background: "var(--color-surface, white)",
  borderRadius: "10px",
  border: "1px solid var(--color-border, #e5e7eb)",
  padding: "1rem",
  marginBottom: "1rem"
};
function NotificationDashboard() {
  const [period, setPeriod] = reactExports.useState("7d");
  const [stats, setStats] = reactExports.useState(null);
  const loadStats = reactExports.useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/stats?period=${period}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
    }
  }, [period]);
  reactExports.useEffect(() => {
    loadStats();
  }, [loadStats]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: sectionTitle$2, children: "Notification Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: period,
          onChange: (e) => setPeriod(e.target.value),
          style: selectStyle,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7d", children: "Last 7 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30d", children: "Last 30 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "90d", children: "Last 90 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All time" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, margin: 0 }, children: stats ? stats.total.toLocaleString() : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: "Sent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#065f46" }, children: stats ? stats.sent.toLocaleString() : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: "Failed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#dc2626" }, children: stats ? stats.failed.toLocaleString() : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: "Skipped" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#9ca3af" }, children: stats ? stats.skipped.toLocaleString() : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: "Success Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, margin: 0, color: stats ? stats.successRate >= 90 ? "#065f46" : stats.successRate >= 70 ? "#d97706" : "#dc2626" : void 0 }, children: stats ? stats.successRate + "%" : "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bodyCardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.5rem" }, children: "Delivery Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", background: "#f3f4f6" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#065f46", transition: "width 0.5s ease", minWidth: 0, width: stats ? stats.sent / (stats.total || 1) * 100 + "%" : "0%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dc2626", transition: "width 0.5s ease", minWidth: 0, width: stats ? stats.failed / (stats.total || 1) * 100 + "%" : "0%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#d1d5db", transition: "width 0.5s ease", minWidth: 0, width: stats ? stats.skipped / (stats.total || 1) * 100 + "%" : "0%" } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", width: "8px", height: "8px", background: "#065f46", borderRadius: "2px", marginRight: "4px" } }),
          "Sent"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", width: "8px", height: "8px", background: "#dc2626", borderRadius: "2px", marginRight: "4px" } }),
          "Failed"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", width: "8px", height: "8px", background: "#d1d5db", borderRadius: "2px", marginRight: "4px" } }),
          "Skipped"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bodyCardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem" }, children: "Daily Trend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "flex-end", gap: "2px", height: "80px", overflowX: "auto", paddingBottom: "1.5rem", position: "relative" }, children: stats && stats.daily && stats.daily.length > 0 ? (() => {
        const maxVal = Math.max(...stats.daily.map((dd) => dd.sent + dd.failed + dd.skipped), 1);
        return stats.daily.map((d, i) => {
          const total = d.sent + d.failed + d.skipped;
          const heightPct = Math.max(total / maxVal * 100, 2);
          const barColor = d.failed > 0 ? "#dc2626" : "#065f46";
          const dateLabel = d.date.slice(5);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: "14px", position: "relative" }, title: `${d.date}: ${total} total (${d.sent} sent, ${d.failed} failed, ${d.skipped} skipped)`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "100%", borderRadius: "2px 2px 0 0", background: barColor, transition: "height 0.3s ease", minHeight: "1px", height: heightPct + "%" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", bottom: "-1.25rem", fontSize: "0.625rem", color: "var(--color-text-tertiary)", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "top left" }, children: dateLabel })
          ] }, i);
        });
      })() : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }, children: stats ? "No data for this period" : "Loading..." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bodyCardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem" }, children: "By Event Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8125rem" }, children: stats && stats.byEvent && Object.keys(stats.byEvent).length > 0 ? (() => {
        const maxEventTotal = Math.max(...Object.values(stats.byEvent).map((v) => v.sent + v.failed + v.skipped), 1);
        return Object.entries(stats.byEvent).map(([type, counts]) => {
          const total = counts.sent + counts.failed + counts.skipped;
          const label = EVENT_LABELS[type] || type;
          const barWidth = total / maxEventTotal * 100;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.375rem 0", borderBottom: "1px solid var(--color-border)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: escHtml(label) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "var(--color-text-tertiary)", marginLeft: "0.5rem" }, children: total })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "40%", maxWidth: "8rem", margin: "0 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "6px", borderRadius: "3px", background: counts.failed > 0 ? "#d97706" : "#065f46", transition: "width 0.3s ease", width: barWidth + "%" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#065f46", fontSize: "0.75rem", minWidth: "2.5rem", textAlign: "right" }, children: [
              counts.sent,
              " sent"
            ] }),
            counts.failed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#dc2626", fontSize: "0.75rem", minWidth: "2.5rem", textAlign: "right" }, children: [
              counts.failed,
              " fail"
            ] })
          ] }, type);
        });
      })() : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)" }, children: stats ? "No data" : "Loading..." }) })
    ] }),
    stats && stats.topFailed && stats.topFailed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...bodyCardStyle, marginBottom: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem", color: "#dc2626" }, children: "Top Failed Events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8125rem" }, children: stats.topFailed.map((item, i) => {
        const label = EVENT_LABELS[item.event_type] || item.event_type;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "0.375rem 0", borderBottom: "1px solid var(--color-border)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: escHtml(label) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#dc2626", fontWeight: 500 }, children: [
            item.cnt,
            " failures"
          ] })
        ] }, i);
      }) })
    ] })
  ] });
}
function formatEventName(evt) {
  const map = {
    "quote.created": "New Inquiry",
    "quote.status_changed": "Status Update",
    "comment.created": "New Comment",
    "comment.pending_review": "Review Required",
    "comment.reply_received": "Reply Received",
    "news.published": "News Published",
    "product.published": "Product Published"
  };
  return map[evt] || evt;
}
const sectionTitle$1 = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-tertiary)",
  marginBottom: "0.75rem"
};
const cardStyle$1 = {
  background: "var(--color-surface, white)",
  borderRadius: "10px",
  border: "1px solid var(--color-border, #e5e7eb)",
  padding: "1rem",
  marginBottom: "1rem"
};
const inputStyle$1 = {
  padding: "0.625rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};
const labelStyle$1 = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.375rem"
};
const toggleSwitchStyle = {
  position: "relative",
  display: "inline-block",
  width: "48px",
  height: "26px",
  flexShrink: 0
};
const btnSm = {
  padding: "0.375rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-text-secondary)",
  cursor: "pointer"
};
const btnPrimary$1 = {
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "#065f46",
  color: "white",
  border: "none",
  cursor: "pointer"
};
const btnSecondary$1 = {
  display: "inline-block",
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "var(--color-surface-muted)",
  color: "var(--color-text-secondary)",
  border: "1px solid var(--color-border)",
  cursor: "pointer"
};
function NotificationChannels() {
  const [channels, setChannels] = reactExports.useState([]);
  const [notifSettings, setNotifSettings] = reactExports.useState({});
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState("");
  const [modalTitle, setModalTitle] = reactExports.useState("Add Notification Channel");
  const [channelName, setChannelName] = reactExports.useState("");
  const [channelType, setChannelType] = reactExports.useState("email");
  const [emailApiUrl, setEmailApiUrl] = reactExports.useState("");
  const [emailApiKey, setEmailApiKey] = reactExports.useState("");
  const [emailSenderName, setEmailSenderName] = reactExports.useState("");
  const [emailSenderAddress, setEmailSenderAddress] = reactExports.useState("");
  const [webhookPlatform, setWebhookPlatform] = reactExports.useState("generic");
  const [webhookUrl, setWebhookUrl] = reactExports.useState("");
  const [webhookSecret, setWebhookSecret] = reactExports.useState("");
  const [eventTypes, setEventTypes] = reactExports.useState([]);
  const [adminEmail, setAdminEmail] = reactExports.useState(true);
  const [adminWebhook, setAdminWebhook] = reactExports.useState(true);
  const [userEmail, setUserEmail] = reactExports.useState(true);
  const [sseEnabled, setSseEnabled] = reactExports.useState(false);
  const [toastPrefs, setToastPrefs] = reactExports.useState({});
  const [showToastPrefs, setShowToastPrefs] = reactExports.useState(false);
  const loadNotifSettings = reactExports.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/settings");
      if (res.ok) {
        const data = await res.json();
        setNotifSettings(data);
        const admin = data.admin_channels || {};
        const user = data.user_email || {};
        setAdminEmail(admin.email !== false);
        setAdminWebhook(admin.webhook !== false);
        setUserEmail(user.enabled !== false);
        const sseSetting = data.sse_enabled;
        if (sseSetting) {
          const sse = typeof sseSetting === "string" ? JSON.parse(sseSetting) : sseSetting;
          setSseEnabled(sse.enabled === true);
          setShowToastPrefs(sse.enabled === true);
        }
        let parsed = {};
        if (data.toast_preferences) {
          try {
            parsed = typeof data.toast_preferences === "string" ? JSON.parse(data.toast_preferences) : data.toast_preferences;
          } catch {
          }
        }
        setToastPrefs(parsed);
        localStorage.setItem("toast_preferences", JSON.stringify(parsed));
      }
    } catch {
    }
  }, []);
  const loadChannels = reactExports.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/channels");
      if (!res.ok) return;
      const data = await res.json();
      setChannels(data);
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    Promise.all([loadNotifSettings(), loadChannels()]);
  }, [loadNotifSettings, loadChannels]);
  async function toggleNotifSetting(group, key, value) {
    try {
      const current = notifSettings[group] || {};
      const updated = { ...current, [key]: value };
      const newSettings = { ...notifSettings, [group]: updated };
      setNotifSettings(newSettings);
      const res = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: group, value: updated })
      });
      if (!res.ok) {
        alert("Failed to save notification setting");
        loadNotifSettings();
      }
    } catch {
      alert("Network error");
      loadNotifSettings();
    }
  }
  async function handleAdminEmailToggle(checked) {
    setAdminEmail(checked);
    await toggleNotifSetting("admin_channels", "email", checked);
  }
  async function handleAdminWebhookToggle(checked) {
    setAdminWebhook(checked);
    await toggleNotifSetting("admin_channels", "webhook", checked);
  }
  async function handleUserEmailToggle(checked) {
    setUserEmail(checked);
    await toggleNotifSetting("user_email", "enabled", checked);
  }
  async function handleSseToggle(checked) {
    setSseEnabled(checked);
    setShowToastPrefs(checked);
    await toggleNotifSetting("sse_enabled", "enabled", checked);
  }
  async function saveToastPref(eventType, enabled) {
    setToastPrefs((prev) => {
      const prefs = { ...prev, [eventType]: enabled };
      localStorage.setItem("toast_preferences", JSON.stringify(prefs));
      return prefs;
    });
    try {
      const prefs = { ...toastPrefs, [eventType]: enabled };
      await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "toast_preferences", value: prefs })
      });
    } catch {
    }
  }
  function resetForm() {
    setChannelName("");
    setChannelType("email");
    setEmailApiUrl("");
    setEmailApiKey("");
    setEmailSenderName("");
    setEmailSenderAddress("");
    setWebhookPlatform("generic");
    setWebhookUrl("");
    setWebhookSecret("");
    setEventTypes([]);
    setEditId("");
  }
  function openChannelModal(modalEditId) {
    resetForm();
    if (modalEditId) {
      setModalTitle("Edit Channel");
      setEditId(modalEditId);
      const ch = channels.find((c) => c.id === modalEditId);
      if (ch) {
        setChannelName(ch.name);
        setChannelType(ch.type);
        if (ch.type === "email") {
          setEmailApiUrl(ch.config?.apiUrl || "");
          setEmailApiKey(ch.config?.apiKey || "");
          setEmailSenderName(ch.config?.senderName || "");
          setEmailSenderAddress(ch.config?.senderAddress || "");
        } else {
          setWebhookPlatform(ch.config?.platform || "generic");
          setWebhookUrl(ch.config?.url || "");
          setWebhookSecret(ch.config?.secret || "");
        }
        setEventTypes(ch.subscribedEvents || []);
      }
    } else {
      setModalTitle("Add Notification Channel");
    }
    setModalOpen(true);
  }
  function closeChannelModal() {
    setModalOpen(false);
  }
  async function saveChannel(e) {
    e.preventDefault();
    const type = channelType;
    const name = channelName.trim();
    const enabled = true;
    const config = type === "email" ? {
      apiUrl: emailApiUrl.trim(),
      apiKey: emailApiKey.trim(),
      senderName: emailSenderName.trim(),
      senderAddress: emailSenderAddress.trim()
    } : {
      url: webhookUrl.trim(),
      secret: webhookSecret.trim(),
      platform: webhookPlatform
    };
    try {
      if (editId) {
        const res = await fetch(`/api/notifications/channels/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, config, enabled })
        });
        if (!res.ok) {
          alert("Failed to update channel");
          return;
        }
        await fetch("/api/notifications/subscriptions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: editId, eventTypes })
        });
      } else {
        const res = await fetch("/api/notifications/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, config, enabled })
        });
        if (!res.ok) {
          alert("Failed to create channel");
          return;
        }
        const data = await res.json();
        if (eventTypes.length > 0) {
          await fetch("/api/notifications/subscriptions", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelId: data.id, eventTypes })
          });
        }
      }
      closeChannelModal();
      await loadChannels();
    } catch (err) {
      alert("Failed to save channel: " + String(err));
    }
  }
  async function deleteChannel(id, name) {
    if (!confirm(`Delete channel "${name}"? This will also remove all its event subscriptions.`)) return;
    try {
      const res = await fetch(`/api/notifications/channels/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        alert("Failed to delete channel");
        return;
      }
      await loadChannels();
    } catch {
      alert("Network error");
    }
  }
  function toggleEventCheckbox(value, checked) {
    if (checked) {
      setEventTypes((prev) => [...prev, value]);
    } else {
      setEventTypes((prev) => prev.filter((e) => e !== value));
    }
  }
  const platformInfo = WEBHOOK_PLATFORM_HINTS[webhookPlatform] || WEBHOOK_PLATFORM_HINTS.generic;
  const btnSmDanger = {
    ...btnSm,
    color: "#dc2626",
    borderColor: "#fecaca"
  };
  const toggleSliderStyle = (checked) => ({
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: checked ? "#10b981" : "#d1d5db",
    transition: "0.2s",
    borderRadius: "26px"
  });
  const toggleKnobStyle = (checked) => ({
    position: "absolute",
    content: '""',
    height: "20px",
    width: "20px",
    left: "3px",
    bottom: "3px",
    backgroundColor: "white",
    transition: "0.2s",
    borderRadius: "50%",
    transform: checked ? "translateX(22px)" : "translateX(0)"
  });
  const badgeStyle = (type) => {
    const colors = {
      email: { bg: "#dbeafe", color: "#1d4ed8" },
      webhook: { bg: "#fef3c7", color: "#92400e" },
      slack: { bg: "#e8f5e9", color: "#2e7d32" },
      discord: { bg: "#ede7f6", color: "#5e35b1" },
      wechat_work: { bg: "#e3f2fd", color: "#1565c0" },
      generic: { bg: "#f3f4f6", color: "#6b7280" },
      enabled: { bg: "#d1fae5", color: "#065f46" },
      disabled: { bg: "#f3f4f6", color: "#6b7280" }
    };
    const c = colors[type] || colors.generic;
    return { display: "inline-block", padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500, background: c.bg, color: c.color };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: sectionTitle$1, children: "Notification Channels" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }, children: "Configure how notifications are delivered. Add email or webhook channels, then subscribe them to events." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$1, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 500, marginBottom: "1rem" }, children: "Global Notification Toggles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, marginBottom: "0.125rem" }, children: "Admin Email Notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }, children: "Send email to admin for new inquiries and comments" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: toggleSwitchStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: adminEmail, onChange: (e) => handleAdminEmailToggle(e.target.checked), style: { opacity: 0, width: 0, height: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleSliderStyle(adminEmail), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleKnobStyle(adminEmail) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, marginBottom: "0.125rem" }, children: "Admin Webhook Notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }, children: "Send webhook for admin events (inquiries, comments)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: toggleSwitchStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: adminWebhook, onChange: (e) => handleAdminWebhookToggle(e.target.checked), style: { opacity: 0, width: 0, height: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleSliderStyle(adminWebhook), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleKnobStyle(adminWebhook) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, marginBottom: "0.125rem" }, children: "User Email Notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }, children: "Send email to users for replies and status updates" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: toggleSwitchStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: userEmail, onChange: (e) => handleUserEmailToggle(e.target.checked), style: { opacity: 0, width: 0, height: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleSliderStyle(userEmail), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleKnobStyle(userEmail) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, marginBottom: "0.125rem" }, children: "Real-time Toast Notifications (SSE)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }, children: "Show popup alerts in admin panel when notifications are sent. Requires page refresh to take effect." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: toggleSwitchStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: sseEnabled, onChange: (e) => handleSseToggle(e.target.checked), style: { opacity: 0, width: 0, height: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleSliderStyle(sseEnabled), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleKnobStyle(sseEnabled) }) })
          ] })
        ] })
      ] })
    ] }),
    showToastPrefs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle$1, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 500, marginBottom: "0.75rem" }, children: "Toast Event Preferences" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginBottom: "0.75rem" }, children: "Choose which event types trigger real-time toast notifications. Changes take effect immediately." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.625rem" }, children: TOAST_PREF_EVENTS.map((evt) => {
        const checked = toastPrefs[evt.value] !== false;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: evt.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem" }, children: evt.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { style: { fontSize: "0.6875rem", color: "var(--color-text-tertiary)", background: "var(--color-surface-muted)", padding: "0.0625rem 0.375rem", borderRadius: "4px" }, children: evt.value })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: toggleSwitchStyle, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: (e) => saveToastPref(evt.value, e.target.checked), style: { opacity: 0, width: 0, height: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleSliderStyle(checked), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: toggleKnobStyle(checked) }) })
          ] })
        ] }, evt.value);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }, children: channels.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...cardStyle$1, textAlign: "center", color: "var(--color-text-tertiary)", padding: "2rem" }, children: 'No notification channels configured. Click "Add Channel" to get started.' }) : channels.map((ch) => {
      const platform = ch.config?.platform || "generic";
      const platformLabel = { generic: "Generic", slack: "Slack", discord: "Discord", wechat_work: "WeCom" }[platform] || platform;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...cardStyle$1, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: escHtml(ch.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: badgeStyle(ch.type), children: ch.type }),
            ch.type === "webhook" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: badgeStyle(platform), children: platformLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: badgeStyle(ch.enabled ? "enabled" : "disabled"), children: ch.enabled ? "Active" : "Disabled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }, children: ch.subscribedEvents && ch.subscribedEvents.length > 0 ? "Events: " + ch.subscribedEvents.map((e) => formatEventName(e)).join(", ") : /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "No events subscribed" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: btnSm, onClick: () => openChannelModal(ch.id), children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: btnSmDanger, onClick: () => deleteChannel(ch.id, ch.name), children: "Delete" })
        ] })
      ] }, ch.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openChannelModal(), style: { ...btnPrimary$1, marginBottom: "2rem" }, children: "+ Add Channel" }),
    modalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1e3
        },
        onClick: (e) => {
          if (e.target === e.currentTarget) closeChannelModal();
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          width: "100%",
          maxWidth: "32rem",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          background: "var(--color-surface, white)",
          borderRadius: "10px",
          border: "1px solid var(--color-border, #e5e7eb)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 600, marginBottom: "1.5rem" }, children: modalTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveChannel, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Channel Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: channelName, onChange: (e) => setChannelName(e.target.value), placeholder: "e.g., Admin Email, Slack Webhook", required: true, style: inputStyle$1 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Channel Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: channelType, onChange: (e) => setChannelType(e.target.value), style: inputStyle$1, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "email", children: "Email (HTTP API)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "webhook", children: "Webhook" })
              ] })
            ] }),
            channelType === "email" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "API URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: emailApiUrl, onChange: (e) => setEmailApiUrl(e.target.value), placeholder: "https://api.resend.com/emails", style: { ...inputStyle$1, marginBottom: "0.75rem" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "API Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: emailApiKey, onChange: (e) => setEmailApiKey(e.target.value), placeholder: "re_xxxx", style: { ...inputStyle$1, marginBottom: "0.75rem" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Sender Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: emailSenderName, onChange: (e) => setEmailSenderName(e.target.value), placeholder: "My Company", style: inputStyle$1 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Sender Address" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: emailSenderAddress, onChange: (e) => setEmailSenderAddress(e.target.value), placeholder: "noreply@company.com", style: inputStyle$1 })
                ] })
              ] })
            ] }),
            channelType === "webhook" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "0.75rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Platform" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: webhookPlatform, onChange: (e) => setWebhookPlatform(e.target.value), style: inputStyle$1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "generic", children: "Generic (Custom JSON)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "slack", children: "Slack" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "discord", children: "Discord" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "wechat_work", children: "WeCom" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem" }, children: platformInfo.hint })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Webhook URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "url", value: webhookUrl, onChange: (e) => setWebhookUrl(e.target.value), placeholder: platformInfo.placeholder, style: { ...inputStyle$1, marginBottom: "0.75rem" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle$1, children: "Signing Secret" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: webhookSecret, onChange: (e) => setWebhookSecret(e.target.value), placeholder: platformInfo.secretPlaceholder, style: inputStyle$1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem" }, children: platformInfo.secretHint })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { ...labelStyle$1, marginBottom: "0.5rem" }, children: "Subscribe to Events" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" }, children: NOTIFICATION_EVENT_OPTIONS.map((evt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: eventTypes.includes(evt.value),
                    onChange: (e) => toggleEventCheckbox(evt.value, e.target.checked),
                    style: { marginTop: "2px" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: evt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "var(--color-text-tertiary)" }, children: [
                    " — ",
                    evt.description
                  ] })
                ] })
              ] }, evt.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.75rem", justifyContent: "flex-end" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: closeChannelModal, style: btnSecondary$1, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", style: btnPrimary$1, children: "Save Channel" })
            ] })
          ] })
        ] })
      }
    )
  ] });
}
function renderTemplatePreview(template, data) {
  return template.replace(/\{\{\{?(\w+)\}?\}\}/g, (_match, key) => {
    return data[key] || `<span style="color:#dc2626;">{{${key}}}</span>`;
  });
}
const sectionTitle = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-tertiary)",
  marginBottom: "0.75rem"
};
const cardStyle = {
  background: "var(--color-surface, white)",
  borderRadius: "10px",
  border: "1px solid var(--color-border, #e5e7eb)",
  padding: "1rem",
  marginBottom: "1rem"
};
const inputStyle = {
  padding: "0.625rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box"
};
const textareaStyle = {
  ...inputStyle,
  width: "100%",
  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
  fontSize: "0.8125rem",
  lineHeight: 1.6,
  resize: "vertical",
  minHeight: "6rem"
};
const labelStyle = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.375rem"
};
const btnPrimary = {
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "#065f46",
  color: "white",
  border: "none",
  cursor: "pointer"
};
const btnSecondary = {
  display: "inline-block",
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "var(--color-surface-muted)",
  color: "var(--color-text-secondary)",
  border: "1px solid var(--color-border)",
  cursor: "pointer"
};
function NotificationTemplates() {
  const [templatesCache, setTemplatesCache] = reactExports.useState([]);
  const [currentEventType, setCurrentEventType] = reactExports.useState("quote.created");
  const [emailSubject, setEmailSubject] = reactExports.useState("");
  const [emailBody, setEmailBody] = reactExports.useState("");
  const [webhookTitle, setWebhookTitle] = reactExports.useState("");
  const [webhookText, setWebhookText] = reactExports.useState("");
  const [variables, setVariables] = reactExports.useState([]);
  const [hasCustom, setHasCustom] = reactExports.useState(false);
  const [previewHtml, setPreviewHtml] = reactExports.useState("");
  const bodyRef = reactExports.useRef(null);
  const activeFieldRef = reactExports.useRef(null);
  const loadTemplates = reactExports.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/templates");
      if (!res.ok) return;
      const data = await res.json();
      setTemplatesCache(data);
    } catch {
    }
  }, []);
  const updatePreview = reactExports.useCallback((subject, body, title, text) => {
    const sampleData = TEMPLATE_SAMPLE_DATA[currentEventType] || {};
    const custom = subject || body || title || text;
    setHasCustom(!!custom);
    if (!custom) {
      setPreviewHtml('<p style="color:var(--color-text-tertiary);">Edit a template to see preview</p>');
      return;
    }
    let html = "";
    if (subject) {
      html += `<div style="margin-bottom:0.75rem;"><strong>Subject:</strong> ${escHtml(renderTemplatePreview(subject, sampleData))}</div>`;
    }
    if (body) {
      html += `<div style="margin-bottom:0.75rem;"><strong>Email Body:</strong><div style="margin-top:0.375rem;padding:0.75rem;background:white;border-radius:6px;border:1px solid var(--color-border);">${renderTemplatePreview(body, sampleData)}</div></div>`;
    }
    if (title) {
      html += `<div style="margin-bottom:0.375rem;"><strong>Webhook Title:</strong> ${escHtml(renderTemplatePreview(title, sampleData))}</div>`;
    }
    if (text) {
      html += `<div><strong>Webhook Text:</strong><div style="margin-top:0.375rem;padding:0.75rem;background:white;border-radius:6px;border:1px solid var(--color-border);white-space:pre-wrap;">${escHtml(renderTemplatePreview(text, sampleData))}</div></div>`;
    }
    setPreviewHtml(html);
  }, [currentEventType]);
  const onTemplateEventChange = reactExports.useCallback(() => {
    const tpl = templatesCache.find((t) => t.eventType === currentEventType);
    setEmailSubject(tpl?.subject || "");
    setEmailBody(tpl?.body || "");
    setWebhookTitle(tpl?.title || "");
    setWebhookText(tpl?.text || "");
    setVariables(tpl?.variables || []);
    updatePreview(tpl?.subject || "", tpl?.body || "", tpl?.title || "", tpl?.text || "");
  }, [templatesCache, currentEventType, updatePreview]);
  reactExports.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  reactExports.useEffect(() => {
    onTemplateEventChange();
  }, [onTemplateEventChange]);
  function onTemplateInput() {
    updatePreview(emailSubject, emailBody, webhookTitle, webhookText);
  }
  function handleEventTypeChange(newEventType) {
    setCurrentEventType(newEventType);
    const tpl = templatesCache.find((t) => t.eventType === newEventType);
    setEmailSubject(tpl?.subject || "");
    setEmailBody(tpl?.body || "");
    setWebhookTitle(tpl?.title || "");
    setWebhookText(tpl?.text || "");
    setVariables(tpl?.variables || []);
    updatePreview(tpl?.subject || "", tpl?.body || "", tpl?.title || "", tpl?.text || "");
  }
  function insertVariable(varName) {
    const insert = `{{${varName}}}`;
    const active = activeFieldRef.current || bodyRef.current;
    if (active) {
      const start = active.selectionStart ?? active.value.length;
      const end = active.selectionEnd ?? active.value.length;
      const newVal = active.value.slice(0, start) + insert + active.value.slice(end);
      if (active === bodyRef.current) {
        setEmailBody(newVal);
      } else if (active.id === "tpl-email-subject") {
        setEmailSubject(newVal);
      } else if (active.id === "tpl-webhook-title") {
        setWebhookTitle(newVal);
      } else if (active.id === "tpl-webhook-text") {
        setWebhookText(newVal);
      }
      setTimeout(() => {
        active.focus();
        active.selectionStart = active.selectionEnd = start + insert.length;
      }, 0);
    } else {
      const pos = bodyRef.current?.selectionStart ?? emailBody.length;
      const newVal = emailBody.slice(0, pos) + insert + emailBody.slice(pos);
      setEmailBody(newVal);
      setTimeout(() => {
        bodyRef.current?.focus();
      }, 0);
    }
    setTimeout(onTemplateInput, 0);
  }
  async function saveTemplate() {
    if (!emailSubject && !emailBody && !webhookTitle && !webhookText) {
      alert('Please fill in at least one field, or use "Reset to Default" to clear.');
      return;
    }
    try {
      const res = await fetch("/api/notifications/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: currentEventType,
          subject: emailSubject || void 0,
          body: emailBody || void 0,
          title: webhookTitle || void 0,
          text: webhookText || void 0
        })
      });
      if (!res.ok) {
        alert("Failed to save template");
        return;
      }
      await loadTemplates();
      alert("Template saved!");
    } catch {
      alert("Network error");
    }
  }
  async function resetTemplate() {
    if (!confirm(`Reset template for "${currentEventType}" to default?`)) return;
    try {
      const res = await fetch(`/api/notifications/templates?eventType=${encodeURIComponent(currentEventType)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        alert("Failed to reset template");
        return;
      }
      await loadTemplates();
      alert("Template reset to default.");
    } catch {
      alert("Network error");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: sectionTitle, children: "Notification Templates" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }, children: [
      "Customize email and webhook message templates per event type. Use ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { style: { background: "var(--color-surface-muted)", padding: "0.125rem 0.375rem", borderRadius: "4px", fontSize: "0.75rem" }, children: "{{variable}}" }),
      " placeholders. Leave blank to use the default template."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Event Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: currentEventType,
          onChange: (e) => handleEventTypeChange(e.target.value),
          style: { ...inputStyle, maxWidth: "24rem" },
          children: NOTIFICATION_EVENT_OPTIONS.map((evt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: evt.value, children: [
            evt.label,
            " — ",
            evt.description
          ] }, evt.value))
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.5rem" }, children: "Available Variables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.375rem" }, children: variables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }, children: "No variables for this event" }) : variables.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          onClick: () => insertVariable(v),
          title: "Click to insert",
          style: {
            display: "inline-block",
            padding: "0.25rem 0.5rem",
            background: "#dbeafe",
            color: "#1d4ed8",
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            cursor: "pointer",
            transition: "background 0.15s"
          },
          onMouseEnter: (e) => {
            e.target.style.background = "#bfdbfe";
          },
          onMouseLeave: (e) => {
            e.target.style.background = "#dbeafe";
          },
          children: `{{${v}}}`
        },
        v
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 500, marginBottom: "1rem" }, children: "Email Template" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Subject" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "tpl-email-subject",
            type: "text",
            value: emailSubject,
            onChange: (e) => {
              setEmailSubject(e.target.value);
              onTemplateInput();
            },
            onFocus: (ev) => {
              activeFieldRef.current = ev.target;
            },
            placeholder: "Leave blank for default",
            style: { ...inputStyle, outline: "none" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Body (HTML)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            ref: bodyRef,
            rows: 6,
            value: emailBody,
            onChange: (e) => {
              setEmailBody(e.target.value);
              onTemplateInput();
            },
            onFocus: (ev) => {
              activeFieldRef.current = ev.target;
            },
            placeholder: "Leave blank for default",
            style: textareaStyle
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "0.25rem" }, children: [
          "Wrapped in the standard email layout automatically. Use ",
          "{{{rawHtml}}}",
          " for unescaped HTML."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 500, marginBottom: "1rem" }, children: "Webhook Template" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "tpl-webhook-title",
            type: "text",
            value: webhookTitle,
            onChange: (e) => {
              setWebhookTitle(e.target.value);
              onTemplateInput();
            },
            onFocus: (ev) => {
              activeFieldRef.current = ev.target;
            },
            placeholder: "Leave blank for default",
            style: { ...inputStyle, outline: "none" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: labelStyle, children: "Body Text (Markdown)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            id: "tpl-webhook-text",
            rows: 4,
            value: webhookText,
            onChange: (e) => {
              setWebhookText(e.target.value);
              onTemplateInput();
            },
            onFocus: (ev) => {
              activeFieldRef.current = ev.target;
            },
            placeholder: "Leave blank for default",
            style: textareaStyle
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: cardStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 500 }, children: "Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          display: "inline-block",
          padding: "0.125rem 0.5rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 500,
          background: hasCustom ? "#d1fae5" : "#f3f4f6",
          color: hasCustom ? "#065f46" : "#6b7280"
        }, children: hasCustom ? "Custom" : "No changes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: { fontSize: "0.875rem", color: "var(--color-text-secondary)", minHeight: "3rem", padding: "1rem", background: "var(--color-surface-muted)", borderRadius: "8px" },
          dangerouslySetInnerHTML: { __html: previewHtml || '<p style="color:var(--color-text-tertiary);">Edit a template to see preview</p>' }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: saveTemplate, style: btnPrimary, children: "Save Template" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: resetTemplate, style: btnSecondary, children: "Reset to Default" })
    ] })
  ] });
}
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let settings = {};
  let brandingSettings = {};
  try {
    const env = await getEnv();
    const d1 = env.DB;
    if (d1) {
      const rows = await d1.prepare("SELECT key, value FROM site_settings").all();
      for (const row of rows.results) {
        if (row.value === "true" || row.value === "false") {
          settings[row.key] = row.value === "true";
        } else {
          brandingSettings[row.key] = row.value;
        }
      }
    }
  } catch {
  }
  const settingGroups = [
    {
      title: "Core Pages",
      items: [
        { key: "homepage_enabled", label: "Homepage", description: "Show the main landing page (/)" },
        { key: "about_enabled", label: "About Page", description: "Show /about page to visitors" },
        { key: "services_enabled", label: "Services Page", description: "Show /services page to visitors" }
      ]
    },
    {
      title: "Products & News",
      items: [
        { key: "products_enabled", label: "Products Page", description: "Show /products page and product detail pages" },
        { key: "news_enabled", label: "News Page", description: "Show /news page and article detail pages" }
      ]
    },
    {
      title: "Solutions",
      items: [
        { key: "solutions_enabled", label: "Solutions (All)", description: "Master switch — hide all solution pages and nav link" },
        { key: "solutions_data-centers_enabled", label: "Data Centers", description: "Show /solutions/data-centers page" },
        { key: "solutions_healthcare_enabled", label: "Healthcare", description: "Show /solutions/healthcare page" },
        { key: "solutions_industrial_enabled", label: "Industrial", description: "Show /solutions/industrial page" },
        { key: "solutions_telecommunications_enabled", label: "Telecommunications", description: "Show /solutions/telecommunications page" },
        { key: "solutions_finance_enabled", label: "Finance", description: "Show /solutions/finance page" },
        { key: "solutions_government_enabled", label: "Government", description: "Show /solutions/government page" }
      ]
    }
  ];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Site Settings — Admin", "currentPath": "/admin/settings", "data-astro-cid-ppx63a7i": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-ppx63a7i> <h1 class="heading-1" style="margin-bottom: 0.5rem;" data-astro-cid-ppx63a7i>Site Settings</h1> <p style="color: var(--color-text-secondary); margin-bottom: 2rem;" data-astro-cid-ppx63a7i>Control which pages are visible to visitors and configure notifications.</p> <!-- Page Content --> ${renderComponent($$result2, "PageContentSection", $$PageContentSection, { "data-astro-cid-ppx63a7i": true })} <!-- Site Branding --> ${renderComponent($$result2, "SiteBrandingSection", $$SiteBrandingSection, { "settings": brandingSettings, "data-astro-cid-ppx63a7i": true })} <!-- Domain Isolation --> ${renderComponent($$result2, "DomainIsolationSection", $$DomainIsolationSection, { "settings": brandingSettings, "data-astro-cid-ppx63a7i": true })} <!-- Theme --> ${renderComponent($$result2, "ThemeSection", $$ThemeSection, { "settings": brandingSettings, "data-astro-cid-ppx63a7i": true })} <!-- Analytics --> ${renderComponent($$result2, "AnalyticsSettingsSection", $$AnalyticsSettingsSection, { "settings": brandingSettings, "data-astro-cid-ppx63a7i": true })} <!-- Page Visibility --> ${renderComponent($$result2, "PageVisibilitySection", $$PageVisibilitySection, { "settings": settings, "settingGroups": settingGroups, "data-astro-cid-ppx63a7i": true })} <!-- Social Links --> ${renderComponent($$result2, "SocialLinksManager", SocialLinksManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/settings/SocialLinksManager", "client:component-export": "default", "data-astro-cid-ppx63a7i": true })} <!-- Notification Dashboard --> ${renderComponent($$result2, "NotificationDashboard", NotificationDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/settings/NotificationDashboard", "client:component-export": "default", "data-astro-cid-ppx63a7i": true })} <!-- Notification Channels --> ${renderComponent($$result2, "NotificationChannels", NotificationChannels, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/settings/NotificationChannels", "client:component-export": "default", "data-astro-cid-ppx63a7i": true })} <!-- Notification Logs --> ${renderComponent($$result2, "NotificationLogs", NotificationLogs, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/settings/NotificationLogs", "client:component-export": "default", "data-astro-cid-ppx63a7i": true })} <!-- Notification Templates --> ${renderComponent($$result2, "NotificationTemplates", NotificationTemplates, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/settings/NotificationTemplates", "client:component-export": "default", "data-astro-cid-ppx63a7i": true })} </div> ` })}`;
}, "/workspace/src/pages/admin/settings/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/settings/index.astro";
const $$url = "/admin/settings";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
