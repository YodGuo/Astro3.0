import { useEffect, useState, useCallback } from 'react';
import { NOTIFICATION_EVENT_OPTIONS, TOAST_PREF_EVENTS, WEBHOOK_PLATFORM_HINTS } from './settings-shared';
import { escHtml } from './shared-utils';

function formatEventName(evt: string): string {
  const map: Record<string, string> = {
    'quote.created': 'New Inquiry',
    'quote.status_changed': 'Status Update',
    'comment.created': 'New Comment',
    'comment.pending_review': 'Review Required',
    'comment.reply_received': 'Reply Received',
    'news.published': 'News Published',
    'product.published': 'Product Published',
  };
  return map[evt] || evt;
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

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem',
};

const toggleSwitchStyle: React.CSSProperties = {
  position: 'relative', display: 'inline-block', width: '48px', height: '26px', flexShrink: 0,
};

const btnSm: React.CSSProperties = {
  padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)',
  color: 'var(--color-text-secondary)', cursor: 'pointer',
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

export default function NotificationChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [notifSettings, setNotifSettings] = useState<Record<string, any>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [modalTitle, setModalTitle] = useState('Add Notification Channel');

  // Form state
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('email');
  const [emailApiUrl, setEmailApiUrl] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailSenderName, setEmailSenderName] = useState('');
  const [emailSenderAddress, setEmailSenderAddress] = useState('');
  const [webhookPlatform, setWebhookPlatform] = useState('generic');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  // Global toggles
  const [adminEmail, setAdminEmail] = useState(true);
  const [adminWebhook, setAdminWebhook] = useState(true);
  const [userEmail, setUserEmail] = useState(true);
  const [sseEnabled, setSseEnabled] = useState(false);

  // Toast prefs
  const [toastPrefs, setToastPrefs] = useState<Record<string, boolean>>({});
  const [showToastPrefs, setShowToastPrefs] = useState(false);

  const loadNotifSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/settings');
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>;
        setNotifSettings(data);
        const admin = data.admin_channels || {};
        const user = data.user_email || {};
        setAdminEmail(admin.email !== false);
        setAdminWebhook(admin.webhook !== false);
        setUserEmail(user.enabled !== false);

        const sseSetting = data.sse_enabled;
        if (sseSetting) {
          const sse = typeof sseSetting === 'string' ? JSON.parse(sseSetting) : sseSetting;
          setSseEnabled(sse.enabled === true);
          setShowToastPrefs(sse.enabled === true);
        }

        // Load toast preferences
        let parsed: Record<string, boolean> = {};
        if (data.toast_preferences) {
          try {
            parsed = typeof data.toast_preferences === 'string' ? JSON.parse(data.toast_preferences) : data.toast_preferences;
          } catch { /* ignore */ }
        }
        setToastPrefs(parsed);
        localStorage.setItem('toast_preferences', JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
  }, []);

  const loadChannels = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/channels');
      if (!res.ok) return;
      const data = await res.json() as Record<string, unknown>;
      setChannels(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    Promise.all([loadNotifSettings(), loadChannels()]);
  }, [loadNotifSettings, loadChannels]);

  // Global toggle handlers
  async function toggleNotifSetting(group: string, key: string, value: boolean) {
    try {
      const current = notifSettings[group] || {};
      const updated = { ...current, [key]: value };
      const newSettings = { ...notifSettings, [group]: updated };
      setNotifSettings(newSettings);

      const res = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: group, value: updated }),
      });
      if (!res.ok) {
        alert('Failed to save notification setting');
        loadNotifSettings();
      }
    } catch {
      alert('Network error');
      loadNotifSettings();
    }
  }

  async function handleAdminEmailToggle(checked: boolean) {
    setAdminEmail(checked);
    await toggleNotifSetting('admin_channels', 'email', checked);
  }

  async function handleAdminWebhookToggle(checked: boolean) {
    setAdminWebhook(checked);
    await toggleNotifSetting('admin_channels', 'webhook', checked);
  }

  async function handleUserEmailToggle(checked: boolean) {
    setUserEmail(checked);
    await toggleNotifSetting('user_email', 'enabled', checked);
  }

  async function handleSseToggle(checked: boolean) {
    setSseEnabled(checked);
    setShowToastPrefs(checked);
    await toggleNotifSetting('sse_enabled', 'enabled', checked);
  }

  async function saveToastPref(eventType: string, enabled: boolean) {
    setToastPrefs(prev => {
      const prefs = { ...prev, [eventType]: enabled };
      localStorage.setItem('toast_preferences', JSON.stringify(prefs));
      return prefs;
    });
    try {
      const prefs = { ...toastPrefs, [eventType]: enabled };
      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'toast_preferences', value: prefs }),
      });
    } catch { /* ignore */ }
  }

  // Modal handlers
  function resetForm() {
    setChannelName('');
    setChannelType('email');
    setEmailApiUrl('');
    setEmailApiKey('');
    setEmailSenderName('');
    setEmailSenderAddress('');
    setWebhookPlatform('generic');
    setWebhookUrl('');
    setWebhookSecret('');
    setEventTypes([]);
    setEditId('');
  }

  function openChannelModal(modalEditId?: string) {
    resetForm();
    if (modalEditId) {
      setModalTitle('Edit Channel');
      setEditId(modalEditId);
      const ch = channels.find((c: { id: string }) => c.id === modalEditId);
      if (ch) {
        setChannelName(ch.name);
        setChannelType(ch.type);
        if (ch.type === 'email') {
          setEmailApiUrl(ch.config?.apiUrl || '');
          setEmailApiKey(ch.config?.apiKey || '');
          setEmailSenderName(ch.config?.senderName || '');
          setEmailSenderAddress(ch.config?.senderAddress || '');
        } else {
          setWebhookPlatform(ch.config?.platform || 'generic');
          setWebhookUrl(ch.config?.url || '');
          setWebhookSecret(ch.config?.secret || '');
        }
        setEventTypes(ch.subscribedEvents || []);
      }
    } else {
      setModalTitle('Add Notification Channel');
    }
    setModalOpen(true);
  }

  function closeChannelModal() {
    setModalOpen(false);
  }

  async function saveChannel(e: React.FormEvent) {
    e.preventDefault();
    const type = channelType;
    const name = channelName.trim();
    const enabled = true;

    const config: Record<string, string> = type === 'email' ? {
      apiUrl: emailApiUrl.trim(),
      apiKey: emailApiKey.trim(),
      senderName: emailSenderName.trim(),
      senderAddress: emailSenderAddress.trim(),
    } : {
      url: webhookUrl.trim(),
      secret: webhookSecret.trim(),
      platform: webhookPlatform,
    };

    try {
      if (editId) {
        const res = await fetch(`/api/notifications/channels/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type, config, enabled }),
        });
        if (!res.ok) { alert('Failed to update channel'); return; }
        await fetch('/api/notifications/subscriptions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: editId, eventTypes }),
        });
      } else {
        const res = await fetch('/api/notifications/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type, config, enabled }),
        });
        if (!res.ok) { alert('Failed to create channel'); return; }
        const data = await res.json() as Record<string, unknown>;
        if (eventTypes.length > 0) {
          await fetch('/api/notifications/subscriptions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId: data.id, eventTypes }),
          });
        }
      }
      closeChannelModal();
      await loadChannels();
    } catch (err) {
      alert('Failed to save channel: ' + String(err));
    }
  }

  async function deleteChannel(id: string, name: string) {
    if (!confirm(`Delete channel "${name}"? This will also remove all its event subscriptions.`)) return;
    try {
      const res = await fetch(`/api/notifications/channels/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) { alert('Failed to delete channel'); return; }
      await loadChannels();
    } catch {
      alert('Network error');
    }
  }

  function toggleEventCheckbox(value: string, checked: boolean) {
    if (checked) {
      setEventTypes(prev => [...prev, value]);
    } else {
      setEventTypes(prev => prev.filter((e) => e !== value));
    }
  }

  const platformInfo = WEBHOOK_PLATFORM_HINTS[webhookPlatform] || WEBHOOK_PLATFORM_HINTS.generic;

  const btnSmDanger: React.CSSProperties = {
    ...btnSm, color: '#dc2626', borderColor: '#fecaca',
  };

  const toggleSliderStyle = (checked: boolean): React.CSSProperties => ({
    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: checked ? '#10b981' : '#d1d5db', transition: '0.2s', borderRadius: '26px',
  });

  const toggleKnobStyle = (checked: boolean): React.CSSProperties => ({
    position: 'absolute', content: '""', height: '20px', width: '20px',
    left: '3px', bottom: '3px', backgroundColor: 'white', transition: '0.2s',
    borderRadius: '50%', transform: checked ? 'translateX(22px)' : 'translateX(0)',
  });

  const badgeStyle = (type: string): React.CSSProperties => {
    const colors: Record<string, { bg: string; color: string }> = {
      email: { bg: '#dbeafe', color: '#1d4ed8' },
      webhook: { bg: '#fef3c7', color: '#92400e' },
      slack: { bg: '#e8f5e9', color: '#2e7d32' },
      discord: { bg: '#ede7f6', color: '#5e35b1' },
      wechat_work: { bg: '#e3f2fd', color: '#1565c0' },
      generic: { bg: '#f3f4f6', color: '#6b7280' },
      enabled: { bg: '#d1fae5', color: '#065f46' },
      disabled: { bg: '#f3f4f6', color: '#6b7280' },
    };
    const c = colors[type] || colors.generic;
    return { display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: c.bg, color: c.color };
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={sectionTitle}>Notification Channels</h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Configure how notifications are delivered. Add email or webhook channels, then subscribe them to events.
      </p>

      {/* Global Toggles */}
      <div style={cardStyle}>
        <h3 style={{ fontWeight: 500, marginBottom: '1rem' }}>Global Notification Toggles</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Admin Email */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '0.125rem' }}>Admin Email Notifications</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Send email to admin for new inquiries and comments</p>
            </div>
            <label style={toggleSwitchStyle}>
              <input type="checkbox" checked={adminEmail} onChange={(e) => handleAdminEmailToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={toggleSliderStyle(adminEmail)}><span style={toggleKnobStyle(adminEmail)} /></span>
            </label>
          </div>
          {/* Admin Webhook */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '0.125rem' }}>Admin Webhook Notifications</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Send webhook for admin events (inquiries, comments)</p>
            </div>
            <label style={toggleSwitchStyle}>
              <input type="checkbox" checked={adminWebhook} onChange={(e) => handleAdminWebhookToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={toggleSliderStyle(adminWebhook)}><span style={toggleKnobStyle(adminWebhook)} /></span>
            </label>
          </div>
          {/* User Email */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '0.125rem' }}>User Email Notifications</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Send email to users for replies and status updates</p>
            </div>
            <label style={toggleSwitchStyle}>
              <input type="checkbox" checked={userEmail} onChange={(e) => handleUserEmailToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={toggleSliderStyle(userEmail)}><span style={toggleKnobStyle(userEmail)} /></span>
            </label>
          </div>
          {/* SSE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 500, marginBottom: '0.125rem' }}>Real-time Toast Notifications (SSE)</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>Show popup alerts in admin panel when notifications are sent. Requires page refresh to take effect.</p>
            </div>
            <label style={toggleSwitchStyle}>
              <input type="checkbox" checked={sseEnabled} onChange={(e) => handleSseToggle(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={toggleSliderStyle(sseEnabled)}><span style={toggleKnobStyle(sseEnabled)} /></span>
            </label>
          </div>
        </div>
      </div>

      {/* Toast Event Preferences */}
      {showToastPrefs && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 500, marginBottom: '0.75rem' }}>Toast Event Preferences</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
            Choose which event types trigger real-time toast notifications. Changes take effect immediately.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {TOAST_PREF_EVENTS.map((evt) => {
              const checked = toastPrefs[evt.value] !== false;
              return (
                <div key={evt.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{evt.icon}</span>
                    <span style={{ fontSize: '0.875rem' }}>{evt.label}</span>
                    <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', background: 'var(--color-surface-muted)', padding: '0.0625rem 0.375rem', borderRadius: '4px' }}>{evt.value}</code>
                  </div>
                  <label style={toggleSwitchStyle}>
                    <input type="checkbox" checked={checked} onChange={(e) => saveToastPref(evt.value, e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={toggleSliderStyle(checked)}><span style={toggleKnobStyle(checked)} /></span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Channel List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        {channels.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem' }}>
            No notification channels configured. Click "Add Channel" to get started.
          </div>
        ) : (
          channels.map((ch) => {
            const platform = ch.config?.platform || 'generic';
            const platformLabel = ({ generic: 'Generic', slack: 'Slack', discord: 'Discord', wechat_work: 'WeCom' } as Record<string, string>)[platform] || platform;
            return (
              <div key={ch.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500 }}>{escHtml(ch.name)}</span>
                    <span style={badgeStyle(ch.type)}>{ch.type}</span>
                    {ch.type === 'webhook' && <span style={badgeStyle(platform)}>{platformLabel}</span>}
                    <span style={badgeStyle(ch.enabled ? 'enabled' : 'disabled')}>{ch.enabled ? 'Active' : 'Disabled'}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
                    {ch.subscribedEvents && ch.subscribedEvents.length > 0
                      ? 'Events: ' + ch.subscribedEvents.map((e: string) => formatEventName(e)).join(', ')
                      : <em>No events subscribed</em>
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button style={btnSm} onClick={() => openChannelModal(ch.id)}>Edit</button>
                  <button style={btnSmDanger} onClick={() => deleteChannel(ch.id, ch.name)}>Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => openChannelModal()} style={{ ...btnPrimary, marginBottom: '2rem' }}>+ Add Channel</button>

      {/* Channel Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeChannelModal(); }}
        >
          <div style={{
            width: '100%', maxWidth: '32rem', maxHeight: '90vh', overflowY: 'auto',
            padding: '2rem', background: 'var(--color-surface, white)', borderRadius: '10px',
            border: '1px solid var(--color-border, #e5e7eb)',
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>{modalTitle}</h3>
            <form onSubmit={saveChannel}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Channel Name</label>
                <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g., Admin Email, Slack Webhook" required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Channel Type</label>
                <select value={channelType} onChange={(e) => setChannelType(e.target.value)} style={inputStyle}>
                  <option value="email">Email (HTTP API)</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              {/* Email Config */}
              {channelType === 'email' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>API URL</label>
                  <input type="url" value={emailApiUrl} onChange={(e) => setEmailApiUrl(e.target.value)} placeholder="https://api.resend.com/emails" style={{ ...inputStyle, marginBottom: '0.75rem' }} />
                  <label style={labelStyle}>API Key</label>
                  <input type="password" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} placeholder="re_xxxx" style={{ ...inputStyle, marginBottom: '0.75rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Sender Name</label>
                      <input type="text" value={emailSenderName} onChange={(e) => setEmailSenderName(e.target.value)} placeholder="My Company" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sender Address</label>
                      <input type="email" value={emailSenderAddress} onChange={(e) => setEmailSenderAddress(e.target.value)} placeholder="noreply@company.com" style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}

              {/* Webhook Config */}
              {channelType === 'webhook' && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={labelStyle}>Platform</label>
                    <select value={webhookPlatform} onChange={(e) => setWebhookPlatform(e.target.value)} style={inputStyle}>
                      <option value="generic">Generic (Custom JSON)</option>
                      <option value="slack">Slack</option>
                      <option value="discord">Discord</option>
                      <option value="wechat_work">WeCom</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                      {platformInfo.hint}
                    </p>
                  </div>
                  <label style={labelStyle}>Webhook URL</label>
                  <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder={platformInfo.placeholder} style={{ ...inputStyle, marginBottom: '0.75rem' }} />
                  <label style={labelStyle}>Signing Secret</label>
                  <input type="text" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder={platformInfo.secretPlaceholder} style={inputStyle} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
                    {platformInfo.secretHint}
                  </p>
                </div>
              )}

              {/* Event Subscriptions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Subscribe to Events</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {NOTIFICATION_EVENT_OPTIONS.map((evt) => (
                    <label key={evt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={eventTypes.includes(evt.value)}
                        onChange={(e) => toggleEventCheckbox(evt.value, e.target.checked)}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        <span style={{ fontWeight: 500 }}>{evt.label}</span>
                        <span style={{ color: 'var(--color-text-tertiary)' }}> — {evt.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeChannelModal} style={btnSecondary}>Cancel</button>
                <button type="submit" style={btnPrimary}>Save Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
