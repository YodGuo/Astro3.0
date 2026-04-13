import { useEffect, useState, useCallback, useRef } from 'react';
import { NOTIFICATION_EVENT_OPTIONS, TEMPLATE_SAMPLE_DATA } from './settings-shared';
import { escHtml } from './shared-utils';

function renderTemplatePreview(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{\{?(\w+)\}?\}\}/g, (_match, key: string) => {
    return data[key] || `<span style="color:#dc2626;">{{${key}}}</span>`;
  });
}

// ── Static Styles ────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface, white)', borderRadius: '10px',
  border: '1px solid var(--color-border, #e5e7eb)', padding: '1rem',
  marginBottom: '1rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.875rem', background: 'var(--color-surface)', color: 'var(--color-text)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  width: '100%', fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
  fontSize: '0.8125rem', lineHeight: 1.6, resize: 'vertical' as const, minHeight: '6rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
  background: '#065f46', color: 'white', border: 'none', cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-block', padding: '0.625rem 1.25rem', borderRadius: '8px',
  fontSize: '0.875rem', fontWeight: 500, background: 'var(--color-surface-muted)',
  color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer',
};

// ── Component ────────────────────────────────────────

export default function NotificationTemplates() {
  const [templatesCache, setTemplatesCache] = useState<any[]>([]);
  const [currentEventType, setCurrentEventType] = useState('quote.created');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [webhookTitle, setWebhookTitle] = useState('');
  const [webhookText, setWebhookText] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [hasCustom, setHasCustom] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/templates');
      if (!res.ok) return;
      const data = await res.json() as Record<string, unknown>;
      setTemplatesCache(data);
    } catch { /* ignore */ }
  }, []);

  const updatePreview = useCallback((subject: string, body: string, title: string, text: string) => {
    const sampleData = TEMPLATE_SAMPLE_DATA[currentEventType] || {};
    const custom = subject || body || title || text;
    setHasCustom(!!custom);

    if (!custom) {
      setPreviewHtml('<p style="color:var(--color-text-tertiary);">Edit a template to see preview</p>');
      return;
    }

    let html = '';
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

  const onTemplateEventChange = useCallback(() => {
    const tpl = templatesCache.find((t: { eventType: string; subject: string; body: string; title: string; text: string; variables: string[] }) => t.eventType === currentEventType);
    setEmailSubject(tpl?.subject || '');
    setEmailBody(tpl?.body || '');
    setWebhookTitle(tpl?.title || '');
    setWebhookText(tpl?.text || '');
    setVariables(tpl?.variables || []);
    updatePreview(tpl?.subject || '', tpl?.body || '', tpl?.title || '', tpl?.text || '');
  }, [templatesCache, currentEventType, updatePreview]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Sync state when templatesCache loads (e.g., after save/reset)
  useEffect(() => {
    onTemplateEventChange();
  }, [onTemplateEventChange]);

  function onTemplateInput() {
    updatePreview(emailSubject, emailBody, webhookTitle, webhookText);
  }

  function handleEventTypeChange(newEventType: string) {
    setCurrentEventType(newEventType);
    // Sync template data directly in the event handler instead of via useEffect
    const tpl = templatesCache.find((t: { eventType: string; subject: string; body: string; title: string; text: string; variables: string[] }) => t.eventType === newEventType);
    setEmailSubject(tpl?.subject || '');
    setEmailBody(tpl?.body || '');
    setWebhookTitle(tpl?.title || '');
    setWebhookText(tpl?.text || '');
    setVariables(tpl?.variables || []);
    updatePreview(tpl?.subject || '', tpl?.body || '', tpl?.title || '', tpl?.text || '');
  }

  function insertVariable(varName: string) {
    const insert = `{{${varName}}}`;
    const active = activeFieldRef.current || bodyRef.current;
    if (active) {
      const start = active.selectionStart ?? active.value.length;
      const end = active.selectionEnd ?? active.value.length;
      const newVal = active.value.slice(0, start) + insert + active.value.slice(end);
      if (active === bodyRef.current) {
        setEmailBody(newVal);
      } else if (active.id === 'tpl-email-subject') {
        setEmailSubject(newVal);
      } else if (active.id === 'tpl-webhook-title') {
        setWebhookTitle(newVal);
      } else if (active.id === 'tpl-webhook-text') {
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
      setTimeout(() => { bodyRef.current?.focus(); }, 0);
    }
    setTimeout(onTemplateInput, 0);
  }

  async function saveTemplate() {
    if (!emailSubject && !emailBody && !webhookTitle && !webhookText) {
      alert('Please fill in at least one field, or use "Reset to Default" to clear.');
      return;
    }
    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: currentEventType,
          subject: emailSubject || undefined,
          body: emailBody || undefined,
          title: webhookTitle || undefined,
          text: webhookText || undefined,
        }),
      });
      if (!res.ok) { alert('Failed to save template'); return; }
      await loadTemplates();
      alert('Template saved!');
    } catch {
      alert('Network error');
    }
  }

  async function resetTemplate() {
    if (!confirm(`Reset template for "${currentEventType}" to default?`)) return;
    try {
      const res = await fetch(`/api/notifications/templates?eventType=${encodeURIComponent(currentEventType)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { alert('Failed to reset template'); return; }
      await loadTemplates();
      alert('Template reset to default.');
    } catch {
      alert('Network error');
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={sectionTitle}>Notification Templates</h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Customize email and webhook message templates per event type. Use <code style={{ background: 'var(--color-surface-muted)', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.75rem' }}>{'{{variable}}'}</code> placeholders. Leave blank to use the default template.
      </p>

      {/* Event Type Selector */}
      <div style={cardStyle}>
        <label style={labelStyle}>Event Type</label>
        <select
          value={currentEventType}
          onChange={(e) => handleEventTypeChange(e.target.value)}
          style={{ ...inputStyle, maxWidth: '24rem' }}
        >
          {NOTIFICATION_EVENT_OPTIONS.map((evt) => (
            <option key={evt.value} value={evt.value}>{evt.label} — {evt.description}</option>
          ))}
        </select>
      </div>

      {/* Available Variables */}
      <div style={cardStyle}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Available Variables</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {variables.length === 0 ? (
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>No variables for this event</span>
          ) : (
            variables.map((v) => (
              <span
                key={v}
                onClick={() => insertVariable(v)}
                title="Click to insert"
                style={{
                  display: 'inline-block', padding: '0.25rem 0.5rem', background: '#dbeafe',
                  color: '#1d4ed8', borderRadius: '4px', fontSize: '0.75rem',
                  fontFamily: "'SF Mono', 'Fira Code', monospace", cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#bfdbfe'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#dbeafe'; }}
              >
                {`{{${v}}}`}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Email Template */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 500, marginBottom: '1rem' }}>Email Template</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Subject</label>
          <input
            id="tpl-email-subject"
            type="text"
            value={emailSubject}
            onChange={(e) => { setEmailSubject(e.target.value); onTemplateInput(); }}
            onFocus={(ev) => { activeFieldRef.current = (ev.target as HTMLInputElement); }}
            placeholder="Leave blank for default"
            style={{ ...inputStyle, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Body (HTML)</label>
          <textarea
            ref={bodyRef}
            rows={6}
            value={emailBody}
            onChange={(e) => { setEmailBody(e.target.value); onTemplateInput(); }}
            onFocus={(ev) => { activeFieldRef.current = (ev.target as HTMLTextAreaElement); }}
            placeholder="Leave blank for default"
            style={textareaStyle}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
            Wrapped in the standard email layout automatically. Use {'{{{rawHtml}}}'} for unescaped HTML.
          </p>
        </div>
      </div>

      {/* Webhook Template */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 500, marginBottom: '1rem' }}>Webhook Template</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Title</label>
          <input
            id="tpl-webhook-title"
            type="text"
            value={webhookTitle}
            onChange={(e) => { setWebhookTitle(e.target.value); onTemplateInput(); }}
            onFocus={(ev) => { activeFieldRef.current = (ev.target as HTMLInputElement); }}
            placeholder="Leave blank for default"
            style={{ ...inputStyle, outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Body Text (Markdown)</label>
          <textarea
            id="tpl-webhook-text"
            rows={4}
            value={webhookText}
            onChange={(e) => { setWebhookText(e.target.value); onTemplateInput(); }}
            onFocus={(ev) => { activeFieldRef.current = (ev.target as HTMLTextAreaElement); }}
            placeholder="Leave blank for default"
            style={textareaStyle}
          />
        </div>
      </div>

      {/* Preview */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontWeight: 500 }}>Preview</h3>
          <span style={{
            display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.75rem', fontWeight: 500,
            background: hasCustom ? '#d1fae5' : '#f3f4f6',
            color: hasCustom ? '#065f46' : '#6b7280',
          }}>
            {hasCustom ? 'Custom' : 'No changes'}
          </span>
        </div>
        <div
          style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', minHeight: '3rem', padding: '1rem', background: 'var(--color-surface-muted)', borderRadius: '8px' }}
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:var(--color-text-tertiary);">Edit a template to see preview</p>' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={saveTemplate} style={btnPrimary}>Save Template</button>
        <button onClick={resetTemplate} style={btnSecondary}>Reset to Default</button>
      </div>
    </div>
  );
}
