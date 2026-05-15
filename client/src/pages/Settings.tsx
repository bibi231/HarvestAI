import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { User, Key, CreditCard, AlertTriangle, ShieldAlert, Check, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../lib/firebase';
import { api } from '../lib/api';

export default function Settings() {
  const { user, credits } = useAuthStore();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) user.getIdToken().then(setToken);
  }, [user]);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchSettings = async () => {
      try {
        const [setRes, histRes] = await Promise.all([
          api.get('/api/settings'),
          api.get('/api/credits/history')
        ]);
        setSettings(setRes.data);
        setBillingHistory(histRes.data.payments || []);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  const updateSetting = async (key: string, val: any) => {
    try {
      setSettings((s: any) => ({ ...s, [key]: val }));
      await api.patch('/api/settings', { [key]: val });
    } catch (e) { console.error('Failed update', e); }
  };

  const generateApiKey = async () => {
    if (!confirm('Generate a new API key? Any old key will be revoked immediately.')) return;
    try {
      const res = await api.post('/api/settings/generate-api-key');
      const data = res.data;
      setTempKey(data.apiKey);
      setSettings((s: any) => ({ ...s, hasApiKey: true, apiKeyCreatedAt: new Date().toISOString() }));
    } catch (e) { console.error(e); }
  };

  const revokeApiKey = async () => {
    if (!confirm('Revoke this key immediately? Active integrations will break.')) return;
    try {
      await api.delete('/api/settings/api-key');
      setTempKey(null);
      setSettings((s: any) => ({ ...s, hasApiKey: false, apiKeyCreatedAt: null }));
    } catch (e) { console.error(e); }
  };

  const deleteAccount = async () => {
    if (!confirm('DANGER: This permanently deletes your account and all harvest data. Proceed?')) return;
    try {
      await api.delete('/api/settings/account');
      signOut();
      navigate('/');
    } catch (e) { console.error(e); }
  };

  const copyToClipboard = () => {
    if (tempKey) {
      navigator.clipboard.writeText(tempKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'api', icon: Key, label: 'API Keys' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'danger', icon: AlertTriangle, label: 'Danger Zone', danger: true },
  ];

  return (
    <div className="settings-page">
      <Navbar />
      <div className="settings-main">
        <header className="settings-header">
          <h1 className="settings-title">Integrations & Settings</h1>
          <p className="settings-sub">Manage your preferences, credits, and external access tokens.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-[var(--amber)]">
            <RefreshCw className="animate-spin" size={24} />
          </div>
        ) : (
          <div className="settings-layout">
            <div className="settings-tabs">
              {navs.map(n => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActiveTab(n.id)}
                    className={`settings-tab ${activeTab === n.id ? 'on' : ''} ${n.danger ? 'danger' : ''}`}
                  >
                    <Icon size={16} />
                    {n.label}
                  </button>
                );
              })}
            </div>

            <div className="settings-content">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div key="profile" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="settings-section">
                    <div className="settings-card">
                      <div className="profile-row">
                        {settings?.photoUrl ? (
                          <img src={settings.photoUrl} alt="Avatar" className="profile-avatar" />
                        ) : (
                          <div className="profile-avatar-placeholder">
                            {settings?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="profile-name">{settings?.displayName || 'User'}</div>
                          <div className="profile-email">{settings?.email || user?.email}</div>
                        </div>
                      </div>
                      <div className="settings-stat-row">
                        <div>
                          <div className="settings-stat-v">{settings?.totalJobs || 0}</div>
                          <div className="settings-stat-l">Jobs Run</div>
                        </div>
                        <div>
                          <div className="settings-stat-v">{new Date(settings?.createdAt).toLocaleDateString()}</div>
                          <div className="settings-stat-l">Member Since</div>
                        </div>
                      </div>
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>Preferences</h2>
                        <p>Customize your HarvestAI interface and extraction defaults.</p>
                      </div>
                      
                      <div className="settings-toggle-row">
                        <div>
                          <div className="settings-toggle-label">Default Mode</div>
                          <div className="settings-toggle-sub">Which engine opens on login</div>
                        </div>
                        <div className="settings-radio-row">
                          <button onClick={() => updateSetting('defaultMode', 'leads')} className={`settings-radio-btn ${settings?.defaultMode === 'leads' ? 'on' : ''}`}>Leads</button>
                          <button onClick={() => updateSetting('defaultMode', 'extract')} className={`settings-radio-btn ${settings?.defaultMode === 'extract' ? 'on' : ''}`}>Extract</button>
                        </div>
                      </div>

                      <div className="settings-toggle-row">
                        <div>
                          <div className="settings-toggle-label">Email Notifications</div>
                          <div className="settings-toggle-sub">Receive product updates and tips</div>
                        </div>
                        <button onClick={() => updateSetting('notificationsEmail', !settings?.notificationsEmail)} className={`toggle ${settings?.notificationsEmail ? 'on' : ''}`}>
                          <div className="toggle-knob" />
                        </button>
                      </div>

                      <div className="settings-toggle-row">
                        <div>
                          <div className="settings-toggle-label">Job Completion Alerts</div>
                          <div className="settings-toggle-sub">Email when long tasks finish</div>
                        </div>
                        <button onClick={() => updateSetting('notificationsJobComplete', !settings?.notificationsJobComplete)} className={`toggle ${settings?.notificationsJobComplete ? 'on' : ''}`}>
                          <div className="toggle-knob" />
                        </button>
                      </div>
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>Webhook delivery</h2>
                        <p>HarvestAI will POST job results to this URL when any harvest completes.</p>
                      </div>
                      <div className="settings-toggle-row">
                        <div style={{ flex:1 }}>
                          <div className="settings-toggle-label">Webhook URL</div>
                          <div className="settings-toggle-sub">e.g. https://your-app.com/api/results or a Zapier webhook</div>
                        </div>
                      </div>
                      <div style={{ padding:'0 0 12px' }}>
                        <input
                          className="input"
                          style={{ fontFamily:'var(--font-m)', fontSize:13 }}
                          placeholder="https://hooks.zapier.com/..."
                          defaultValue={settings?.webhookUrl ?? ''}
                          onBlur={e => updateSetting('webhookUrl', e.target.value || null)}
                        />
                      </div>
                      <div className="settings-toggle-row">
                        <div style={{ flex:1 }}>
                          <div className="settings-toggle-label">Webhook Secret (optional)</div>
                          <div className="settings-toggle-sub">We sign payloads with HMAC-SHA256. Verify via X-HarvestAI-Signature header.</div>
                        </div>
                      </div>
                      <div style={{ padding:'0 0 4px' }}>
                        <input
                          className="input"
                          style={{ fontFamily:'var(--font-m)', fontSize:13 }}
                          placeholder="your-webhook-secret"
                          defaultValue={settings?.webhookSecret === '••••••••' ? '' : (settings?.webhookSecret ?? '')}
                          onBlur={e => updateSetting('webhookSecret', e.target.value || null)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'api' && (
                  <motion.div key="api" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="settings-section">
                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>API Integration</h2>
                        <p>Use this key to automate harvests directly from your backend or Python scripts. Do not expose this key in public client-side code.</p>
                      </div>

                      <div className="api-key-warning">
                        <ShieldAlert size={16} />
                        API access consumes your account credits automatically.
                      </div>

                      {!settings?.hasApiKey && !tempKey ? (
                        <div className="pt-4 pb-2">
                          <button onClick={generateApiKey} className="flex items-center gap-2 bg-[var(--amber-d)] text-[var(--amber)] px-4 py-2.5 rounded-lg text-sm font-bold border border-[var(--border-a)] hover:bg-[var(--amber)] hover:text-[var(--bg)] transition-colors">
                            <Key size={16} />
                            Generate Secret Key
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2">
                          {tempKey ? (
                            <div className="api-key-box">
                              <div className="api-key-value">{tempKey}</div>
                              <button onClick={copyToClipboard} className="text-[var(--text-3)] hover:text-white transition-colors p-2">
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                              </button>
                            </div>
                          ) : (
                            <div className="api-key-masked">
                              hai_••••••••••••••••••••••••••••••••••••••••••
                              <div className="api-key-meta mt-1">Generated {new Date(settings?.apiKeyCreatedAt).toLocaleDateString()}</div>
                            </div>
                          )}

                          {tempKey && (
                            <div className="text-xs text-[var(--amber)] mt-2 font-medium">
                              Copy this key now. You will not be able to see it again.
                            </div>
                          )}

                          <div className="api-key-actions">
                            <button onClick={revokeApiKey} className="px-3 py-1.5 rounded-md border border-[var(--border-2)] text-xs font-semibold text-[var(--text-2)] hover:text-white hover:border-white transition-all">Revoke Key</button>
                            {!tempKey && (
                              <button onClick={generateApiKey} className="px-3 py-1.5 rounded-md bg-[var(--bg-4)] border border-[var(--border-1)] text-xs font-semibold text-[var(--text-1)] hover:bg-[var(--amber-d)] hover:text-[var(--amber)] hover:border-[var(--border-a)] transition-all">Regenerate</button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>Quick Start (cURL)</h2>
                      </div>
                      <div className="api-code-block">
                        <div className="api-code-label">Request</div>
                        <div className="api-code">
{`curl -X POST ${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/harvest \\
  -H "Authorization: Bearer \${YOUR_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "leads",
    "businessType": "Restaurants",
    "location": "Lagos",
    "maxResults": 10
  }'`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'billing' && (
                  <motion.div key="billing" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="settings-section">
                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>Account Balances</h2>
                        <p>Credits are used for extracting pages and AI parsing. They do not expire.</p>
                      </div>
                      <div className="billing-credits-row">
                        <div>
                          <div className="billing-credit-v">{(credits?.freeRemaining ?? 0) + (credits?.paidCredits ?? 0)}</div>
                          <div className="billing-credit-l">Current Balance</div>
                        </div>
                        <div>
                          <div className="billing-credit-v text-[var(--amber)]">{settings?.totalJobs}</div>
                          <div className="billing-credit-l">Lifetime Extractions</div>
                        </div>
                      </div>
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <h2>Transaction History</h2>
                      </div>
                      <div className="billing-history">
                        <div className="billing-history-header">
                          <span>Transaction ID</span>
                          <span>Amount</span>
                          <span>Credits</span>
                          <span>Status</span>
                          <span>Date</span>
                        </div>
                        {billingHistory.length === 0 ? (
                          <div className="py-8 text-center text-[13px] text-[var(--text-3)] font-medium">No transactions found</div>
                        ) : (
                          billingHistory.map((h, i) => (
                            <div key={i} className="billing-history-row">
                              <span className="font-mono text-xs">{h.id}</span>
                              <span>{h.currency} {(h.amountMinor/100).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                              <span className="text-[var(--amber)] font-bold">+{h.credits}</span>
                              <span className="capitalize">{h.status}</span>
                              <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'danger' && (
                  <motion.div key="danger" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="settings-section">
                    <div className="settings-card danger-card">
                      <div className="settings-card-header">
                        <h2>Danger Zone</h2>
                        <p>Destructive actions that cannot be undone.</p>
                      </div>
                      <div className="delete-confirm">
                        <div className="delete-confirm-text">
                          Deleting your account will immediately remove all data, billing history, and active API keys. You will lose access to remaining credits.
                        </div>
                        <div className="delete-confirm-actions pt-2">
                          <button onClick={deleteAccount} className="flex flex-row items-center gap-2 bg-[var(--red-d)] text-[var(--red)] border border-red-500/20 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={16} />
                            Permanently Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
