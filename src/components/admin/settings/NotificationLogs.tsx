import { useEffect, useState } from 'react';
import { escHtml } from './shared-utils';

// ── Static Styles ────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface, white)', borderRadius: '10px',
  border: '1px solid var(--color-border, #e5e7eb)', padding: '1rem',
  overflowX: 'auto',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--color-border)', fontWeight: 600,
  color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.8125rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border-subtle)',
  verticalAlign: 'top', fontSize: '0.8125rem',
};

// ── Component ────────────────────────────────────────

export default function NotificationLogs() {
  const [logs, setLogs] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const res = await fetch('/api/notifications/logs?limit=20');
      if (!res.ok) { setError('Failed to load logs'); return; }
      const data: Array<Record<string, unknown>> = await res.json();
      setLogs(data);
    } catch {
      setError('Failed to load logs');
    }
  }

  const badgeStyle = (status: string): React.CSSProperties => {
    const colors: Record<string, { bg: string; color: string }> = {
      sent: { bg: '#d1fae5', color: '#065f46' },
      failed: { bg: '#fee2e2', color: '#991b1b' },
      skipped: { bg: '#f3f4f6', color: '#6b7280' },
    };
    const c = colors[status] || colors.skipped;
    return { display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: c.bg, color: c.color };
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={sectionTitle}>Recent Notification Logs</h2>
      <div style={cardStyle}>
        {error ? <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>{error}</p> : null}
        {!error && logs === null && <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>Loading logs...</p>}
        {!error && logs !== null && logs.length === 0 && (
          <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '1rem' }}>No notification logs yet.</p>
        )}
        {!error && logs !== null && logs.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>Channel</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Recipient</th>
                <th style={thStyle}>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    {log.created_at ? new Date(log.created_at * 1000).toLocaleString() : '-'}
                  </td>
                  <td style={tdStyle}>
                    <code style={{ fontSize: '0.75rem', background: 'var(--color-surface-muted)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                      {escHtml(log.event_type)}
                    </code>
                  </td>
                  <td style={tdStyle}>{escHtml(log.channel_type || '-')}</td>
                  <td style={tdStyle}><span style={badgeStyle(log.status)}>{log.status}</span></td>
                  <td style={{ ...tdStyle, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {escHtml(log.recipient || '-')}
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#dc2626', fontSize: '0.75rem' }} title={log.error_message || ''}>
                    {escHtml(log.error_message || '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
