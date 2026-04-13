import { useEffect, useState, useCallback } from 'react';

// ── Static Styles ────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.875rem', background: 'var(--color-surface)', color: 'var(--color-text)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

// ── Component ────────────────────────────────────────

export default function SocialLinksManager() {
  const [links, setLinks] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadSocialLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const settings = await res.json() as Record<string, unknown>;
      const raw = settings['social_links'];
      if (raw && typeof raw === 'string') {
        setLinks(JSON.parse(raw));
      } else {
        setLinks([]);
      }
    } catch {
      setLinks([]);
    }
  }, []);

  useEffect(() => {
    loadSocialLinks();
  }, [loadSocialLinks]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function addSocialLink() {
    const url = inputValue.trim();
    if (!url || !url.startsWith('http')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setLinks(prev => {
      if (prev.includes(url)) {
        alert('This link already exists.');
        return prev;
      }
      return [...prev, url];
    });
    setInputValue('');
  }

  function editSocialLink(index: number, value: string) {
    if (value.startsWith('http')) {
      setLinks(prev => {
        const updated = [...prev];
        updated[index] = value.trim();
        return updated;
      });
    }
  }

  function removeSocialLink(index: number) {
    setLinks(prev => prev.filter((_, i) => i !== index));
  }

  async function saveSocialLinks() {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'social_links', value: JSON.stringify(links) }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (data.success) {
        setToast({ message: 'Social links saved!', type: 'success' });
      } else {
        setToast({ message: 'Failed to save: ' + (data.error || 'Unknown error'), type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Error: ' + String(e), type: 'error' });
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={sectionTitle}>Social Links</h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Manage social media links for SEO (Organization schema sameAs). These appear in search results and knowledge panels.
      </p>

      {toast && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.875rem',
          background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {links.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>No social links configured.</p>
        ) : (
          links.map((url, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="url"
                value={url}
                onChange={(e) => editSocialLink(i, e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: '0.875rem' }}
              />
              <button
                onClick={() => removeSocialLink(i)}
                style={{
                  padding: '0.375rem 0.75rem', fontSize: '0.875rem', borderRadius: '6px',
                  border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                }}
              >
                &#x2715;
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="url"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://linkedin.com/company/yourcompany"
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSocialLink(); } }}
        />
        <button
          onClick={addSocialLink}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
            background: '#065f46', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          + Add
        </button>
      </div>

      {links.length > 0 && (
        <button
          onClick={saveSocialLinks}
          style={{
            display: 'inline-block', padding: '0.625rem 1.25rem', borderRadius: '8px',
            fontSize: '0.875rem', fontWeight: 500, background: 'var(--color-surface-muted)',
            color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer',
          }}
        >
          Save Social Links
        </button>
      )}
    </div>
  );
}
