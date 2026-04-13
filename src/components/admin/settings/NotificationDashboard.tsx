import { useEffect, useState, useCallback } from 'react';
import { EVENT_LABELS } from './settings-shared';
import { escHtml } from './shared-utils';

interface StatRow { sent: number; failed: number; skipped: number; date?: string; event_type?: string; cnt?: number }

// ── Static Styles ────────────────────────────────────

const sectionTitle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface, white)', borderRadius: '10px',
  border: '1px solid var(--color-border, #e5e7eb)', padding: '0.75rem 1rem',
  textAlign: 'center',
};

const selectStyle: React.CSSProperties = {
  padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)',
  fontSize: '0.8125rem', background: 'var(--color-surface)', color: 'var(--color-text)',
  maxWidth: '8rem',
};

const bodyCardStyle: React.CSSProperties = {
  background: 'var(--color-surface, white)', borderRadius: '10px',
  border: '1px solid var(--color-border, #e5e7eb)', padding: '1rem',
  marginBottom: '1rem',
};

// ── Component ────────────────────────────────────────

export default function NotificationDashboard() {
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState<any>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications/stats?period=${period}`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={sectionTitle}>Notification Dashboard</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={selectStyle}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{stats ? stats.total.toLocaleString() : '\u2014'}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Sent</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#065f46' }}>{stats ? stats.sent.toLocaleString() : '\u2014'}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Failed</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#dc2626' }}>{stats ? stats.failed.toLocaleString() : '\u2014'}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Skipped</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#9ca3af' }}>{stats ? stats.skipped.toLocaleString() : '\u2014'}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Success Rate</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: stats ? (stats.successRate >= 90 ? '#065f46' : stats.successRate >= 70 ? '#d97706' : '#dc2626') : undefined }}>
            {stats ? stats.successRate + '%' : '\u2014'}
          </p>
        </div>
      </div>

      {/* Success Rate Bar */}
      <div style={bodyCardStyle}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Delivery Overview</p>
        <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#f3f4f6' }}>
          <div style={{ background: '#065f46', transition: 'width 0.5s ease', minWidth: 0, width: stats ? ((stats.sent / (stats.total || 1)) * 100) + '%' : '0%' }} />
          <div style={{ background: '#dc2626', transition: 'width 0.5s ease', minWidth: 0, width: stats ? ((stats.failed / (stats.total || 1)) * 100) + '%' : '0%' }} />
          <div style={{ background: '#d1d5db', transition: 'width 0.5s ease', minWidth: 0, width: stats ? ((stats.skipped / (stats.total || 1)) * 100) + '%' : '0%' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#065f46', borderRadius: '2px', marginRight: '4px' }} />Sent</span>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#dc2626', borderRadius: '2px', marginRight: '4px' }} />Failed</span>
          <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#d1d5db', borderRadius: '2px', marginRight: '4px' }} />Skipped</span>
        </div>
      </div>

      {/* Daily Trend */}
      <div style={bodyCardStyle}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.75rem' }}>Daily Trend</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px', overflowX: 'auto', paddingBottom: '1.5rem', position: 'relative' }}>
          {stats && stats.daily && stats.daily.length > 0 ? (() => {
            const maxVal = Math.max(...stats.daily.map((dd: StatRow) => dd.sent + dd.failed + dd.skipped), 1);
            return stats.daily.map((d: StatRow, i: number) => {
              const total = d.sent + d.failed + d.skipped;
              const heightPct = Math.max((total / maxVal) * 100, 2);
              const barColor = d.failed > 0 ? '#dc2626' : '#065f46';
              const dateLabel = d.date.slice(5);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '14px', position: 'relative' }} title={`${d.date}: ${total} total (${d.sent} sent, ${d.failed} failed, ${d.skipped} skipped)`}>
                  <div style={{ width: '100%', borderRadius: '2px 2px 0 0', background: barColor, transition: 'height 0.3s ease', minHeight: '1px', height: heightPct + '%' }} />
                  <span style={{ position: 'absolute', bottom: '-1.25rem', fontSize: '0.625rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>{dateLabel}</span>
                </div>
              );
            });
          })()
          : (
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>{stats ? 'No data for this period' : 'Loading...'}</p>
          )}
        </div>
      </div>

      {/* By Event Type */}
      <div style={bodyCardStyle}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.75rem' }}>By Event Type</p>
        <div style={{ fontSize: '0.8125rem' }}>
          {stats && stats.byEvent && Object.keys(stats.byEvent).length > 0 ? (() => {
            const maxEventTotal = Math.max(...Object.values(stats.byEvent).map((v: StatRow) => v.sent + v.failed + v.skipped), 1);
            return Object.entries(stats.byEvent).map(([type, counts]: [string, StatRow]) => {
              const total = counts.sent + counts.failed + counts.skipped;
              const label = EVENT_LABELS[type] || type;
              const barWidth = (total / maxEventTotal) * 100;
              return (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{escHtml(label)}</span>
                    <span style={{ color: 'var(--color-text-tertiary)', marginLeft: '0.5rem' }}>{total}</span>
                  </span>
                  <div style={{ width: '40%', maxWidth: '8rem', margin: '0 0.75rem' }}>
                    <div style={{ height: '6px', borderRadius: '3px', background: counts.failed > 0 ? '#d97706' : '#065f46', transition: 'width 0.3s ease', width: barWidth + '%' }} />
                  </div>
                  <span style={{ color: '#065f46', fontSize: '0.75rem', minWidth: '2.5rem', textAlign: 'right' }}>{counts.sent} sent</span>
                  {counts.failed > 0 && <span style={{ color: '#dc2626', fontSize: '0.75rem', minWidth: '2.5rem', textAlign: 'right' }}>{counts.failed} fail</span>}
                </div>
              );
            });
          })() : (
            <p style={{ color: 'var(--color-text-tertiary)' }}>{stats ? 'No data' : 'Loading...'}</p>
          )}
        </div>
      </div>

      {/* Top Failed Events */}
      {stats && stats.topFailed && stats.topFailed.length > 0 && (
        <div style={{ ...bodyCardStyle, marginBottom: 0 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.75rem', color: '#dc2626' }}>Top Failed Events</p>
          <div style={{ fontSize: '0.8125rem' }}>
            {stats.topFailed.map((item: StatRow, i: number) => {
              const label = EVENT_LABELS[item.event_type] || item.event_type;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{escHtml(label)}</span>
                  <span style={{ color: '#dc2626', fontWeight: 500 }}>{item.cnt} failures</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
