import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, Save, Loader2, AlertCircle,
  Key, Globe, Shield, Bell, Database, RefreshCw,
  Wifi, Plus, Trash2, Play, Upload, X, CheckCircle, XCircle,
  Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSettings, updateSetting, fetchProxies, addProxy, bulkImportProxies, testProxy, testAllProxies, deleteProxy, deleteAllProxies, checkFirecrawlCredits } from '@/lib/api';
import type { ProxyItem } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';

const TABS = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'extraction', label: 'Extraction', icon: Globe },
  { id: 'proxies', label: 'Proxies', icon: Wifi },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  app_name: 'SnapLeads',
  theme: 'dark',
  language: 'en',
  default_export_format: 'csv',
  pages_per_keyword: '3',
  delay_between_requests: '2',
  auto_verify_emails: 'true',
  use_google_dorking: 'true',
  use_direct_scraping: 'false',
  browser_headless: 'true',
  firecrawl_api_key: '',
  serper_api_key: '',
  proxy_enabled: 'false',
  proxy_rotation: 'round-robin',
  max_concurrent_sessions: '3',
  data_retention_days: '90',
  auto_backup: 'false',
  email_notifications: 'false',
  desktop_notifications: 'true',
};

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [dirty, setDirty] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { toast } = useToast();

  // Proxy state
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [proxiesLoading, setProxiesLoading] = useState(false);
  const [showAddProxy, setShowAddProxy] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [newProxy, setNewProxy] = useState({ host: '', port: '', username: '', password: '', protocol: 'http' });
  const [addingProxy, setAddingProxy] = useState(false);
  const [testingProxy, setTestingProxy] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [firecrawlCredits, setFirecrawlCredits] = useState<number | null>(null);
  const [checkingCredits, setCheckingCredits] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProxies = useCallback(async () => {
    try {
      setProxiesLoading(true);
      const data = await fetchProxies();
      setProxies(data);
    } catch { /* ignore */ } finally {
      setProxiesLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); loadProxies(); }, [loadSettings, loadProxies]);

  const handleAddProxy = async () => {
    if (!newProxy.host || !newProxy.port) { toast('warning', 'Host and port are required'); return; }
    try {
      setAddingProxy(true);
      await addProxy({ host: newProxy.host, port: parseInt(newProxy.port) || 8080, username: newProxy.username, password: newProxy.password, protocol: newProxy.protocol });
      setNewProxy({ host: '', port: '', username: '', password: '', protocol: 'http' });
      setShowAddProxy(false);
      toast('success', 'Proxy added');
      await loadProxies();
    } catch { toast('error', 'Failed to add proxy'); } finally { setAddingProxy(false); }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) { toast('warning', 'Enter proxy list'); return; }
    try {
      setAddingProxy(true);
      const result = await bulkImportProxies(bulkText);
      setBulkText('');
      setShowBulkImport(false);
      toast('success', `Imported ${result.added} proxies`);
      await loadProxies();
    } catch { toast('error', 'Failed to import proxies'); } finally { setAddingProxy(false); }
  };

  const handleTestProxy = async (proxyId: string) => {
    try {
      setTestingProxy(proxyId);
      const result = await testProxy(proxyId);
      toast(result.status === 'active' ? 'success' : 'error',
        result.status === 'active' ? `Active — ${result.speed}ms (${result.ip})` : `Failed: ${result.error}`);
      await loadProxies();
    } catch { toast('error', 'Test failed'); } finally { setTestingProxy(null); }
  };

  const handleTestAll = async () => {
    try {
      setTestingAll(true);
      const result = await testAllProxies();
      toast('success', `Tested ${result.tested}: ${result.active} active, ${result.failed} failed`);
      await loadProxies();
    } catch { toast('error', 'Test all failed'); } finally { setTestingAll(false); }
  };

  const handleDeleteProxy = async (proxyId: string) => {
    try {
      await deleteProxy(proxyId);
      toast('success', 'Proxy deleted');
      await loadProxies();
    } catch { toast('error', 'Failed to delete proxy'); }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllProxies();
      toast('success', `Deleted ${result.count} proxies`);
      await loadProxies();
    } catch { toast('error', 'Failed to delete proxies'); }
  };

  const handleCheckCredits = async () => {
    try {
      setCheckingCredits(true);
      const result = await checkFirecrawlCredits();
      if (result.success) {
        setFirecrawlCredits(result.remaining_credits ?? 0);
        toast('success', `Firecrawl: ${(result.remaining_credits ?? 0).toLocaleString()} credits remaining`);
      } else {
        toast('error', result.error ?? 'Failed to check credits');
      }
    } catch { toast('error', 'Failed to check credits'); } finally { setCheckingCredits(false); }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const promises = Object.entries(settings).map(([key, value]) => updateSetting(key, value));
      await Promise.all(promises);
      setDirty(false);
      toast('success', 'Settings saved successfully');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load settings</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadSettings} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent/25">Retry</button>
      </div>
    );
  }

  const renderInput = (key: string, label: string, type: 'text' | 'number' | 'password' | 'toggle' | 'select', options?: string[], description?: string) => {
    if (type === 'toggle') {
      const enabled = settings[key] === 'true';
      return (
        <div className="flex items-center justify-between py-5 min-h-[56px]">
          <div className="pr-4">
            <p className="text-sm font-medium text-text-primary">{label}</p>
            {description && <p className="text-xs text-text-muted pt-1">{description}</p>}
          </div>
          <button
            onClick={() => handleChange(key, enabled ? 'false' : 'true')}
            className={cn('relative w-11 h-6 rounded-full transition-all flex-shrink-0', enabled ? 'bg-accent shadow-inner shadow-accent/30' : 'bg-bg-tertiary border border-[#52525b]')}
          >
            <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200', enabled && 'translate-x-5')} />
          </button>
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <div className="py-5">
          <label className="text-sm font-medium text-text-primary pb-3 block">{label}</label>
          {description && <p className="text-xs text-text-muted pb-3">{description}</p>}
          <select
            value={settings[key]} onChange={e => handleChange(key, e.target.value)}
            className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    return (
      <div className="py-5">
        <label className="text-sm font-medium text-text-primary pb-3 block">{label}</label>
        {description && <p className="text-xs text-text-muted pb-3">{description}</p>}
        <input
          type={type} value={settings[key] || ''} onChange={e => handleChange(key, e.target.value)}
          className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 page-header">
        <div className="flex items-center justify-between px-10 py-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Settings</h1>
            <p className="text-sm text-text-secondary pt-1">Configure your extraction preferences</p>
          </div>
        <button
          onClick={handleSave} disabled={!dirty || saving}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            dirty ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25' : 'bg-bg-card border border-[#3f3f46] text-text-muted cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-5">

      {/* How to Use */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">How to Use Settings</span>
          </div>
          {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </button>
        {showGuide && (
          <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Settings Tabs</h4>
              <ul className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">General:</strong> App name, theme, language, default export format</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Extraction:</strong> Pages per keyword, delay, concurrent sessions, dorking/scraping toggles</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Proxies:</strong> Add, test, and manage proxy servers from any provider</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">API Keys:</strong> Firecrawl API key for enhanced web scraping</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Notifications:</strong> Email and desktop notification preferences</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Storage:</strong> Data retention and auto-backup settings</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Security:</strong> Privacy and security configuration</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">How to Save</h4>
              <ul className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />Make changes in any tab — the "Save Changes" button activates automatically</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />All settings persist across sessions and apply immediately after saving</li>
              </ul>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Start with the Extraction tab to optimize your scraping speed and method. Enable Google Dorking for the safest extraction with zero ban risk.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6 min-h-[500px]">
        {/* Tab Navigation */}
        <div className="flex-shrink-0">
          <nav className="card p-3 flex flex-col gap-1 sticky top-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all text-left',
                    activeTab === tab.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card p-8 min-h-[500px] overflow-hidden">
          <div className="max-w-[640px]">
          {activeTab === 'general' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">General Settings</h3>
              <p className="text-xs text-text-muted pb-6">Manage your application preferences</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('app_name', 'Application Name', 'text', undefined, 'The name displayed in the app header')}
                {renderInput('theme', 'Theme', 'select', ['dark', 'light', 'system'], 'Choose your preferred color scheme')}
                {renderInput('language', 'Language', 'select', ['en', 'es', 'fr', 'de', 'pt'], 'Interface language')}
                {renderInput('default_export_format', 'Default Export Format', 'select', ['csv', 'xlsx', 'json', 'html'], 'Format used when exporting leads')}
              </div>
            </div>
          )}

          {activeTab === 'extraction' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">Extraction Settings</h3>
              <p className="text-xs text-text-muted pb-6">Configure how extractions are performed</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('pages_per_keyword', 'Pages per Keyword', 'number', undefined, 'Number of search result pages to scrape per keyword')}
                {renderInput('delay_between_requests', 'Delay Between Requests (seconds)', 'number', undefined, 'Wait time between requests to avoid rate limiting')}
                {renderInput('max_concurrent_sessions', 'Max Concurrent Sessions', 'number', undefined, 'Maximum parallel extraction sessions')}
                {renderInput('auto_verify_emails', 'Auto-verify Emails (MX Check)', 'toggle')}
                {renderInput('use_google_dorking', 'Google Dorking (Primary)', 'toggle')}
                {renderInput('use_direct_scraping', 'Direct Scraping (Secondary)', 'toggle')}
                {renderInput('browser_headless', 'Headless Browser Mode', 'toggle')}
              </div>
            </div>
          )}

          {activeTab === 'proxies' && (
            <div className="max-w-none">
              <div className="flex items-center justify-between pb-6">
                <div>
                  <h3 className="text-base font-semibold text-text-primary pb-1">Proxy Management</h3>
                  <p className="text-xs text-text-muted">Add proxies from any provider — supports HTTP, HTTPS, and SOCKS5</p>
                </div>
                <div className="flex items-center gap-2">
                  {proxies.length > 0 && (
                    <>
                      <button onClick={handleTestAll} disabled={testingAll}
                        className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg text-xs font-medium text-accent hover:bg-accent/20 transition-all disabled:opacity-50">
                        {testingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        Test All
                      </button>
                      <button onClick={handleDeleteAll}
                        className="flex items-center gap-1.5 px-3 py-2 bg-error/10 border border-error/20 rounded-lg text-xs font-medium text-error hover:bg-error/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Add Proxy Actions */}
              <div className="flex gap-2 pb-5">
                <button onClick={() => { setShowAddProxy(!showAddProxy); setShowBulkImport(false); }}
                  className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all',
                    showAddProxy ? 'bg-accent text-white' : 'bg-bg-input border border-[#3f3f46] text-text-secondary hover:text-text-primary hover:border-[#52525b]')}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Proxy
                </button>
                <button onClick={() => { setShowBulkImport(!showBulkImport); setShowAddProxy(false); }}
                  className={cn('flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all',
                    showBulkImport ? 'bg-accent text-white' : 'bg-bg-input border border-[#3f3f46] text-text-secondary hover:text-text-primary hover:border-[#52525b]')}>
                  <Upload className="w-3.5 h-3.5" />
                  Bulk Import
                </button>
              </div>

              {/* Add Single Proxy Form */}
              {showAddProxy && (
                <div className="p-5 bg-zinc-800/30 rounded-xl border border-[#3f3f46] mb-5">
                  <div className="flex items-center justify-between pb-4">
                    <p className="text-sm font-medium text-text-primary">Add Single Proxy</p>
                    <button onClick={() => setShowAddProxy(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-3">
                    <div>
                      <label className="text-xs text-text-muted pb-1.5 block">Host *</label>
                      <input type="text" value={newProxy.host} onChange={e => setNewProxy(p => ({ ...p, host: e.target.value }))}
                        placeholder="e.g. network.joinmassive.com"
                        className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted pb-1.5 block">Port *</label>
                      <input type="text" value={newProxy.port} onChange={e => setNewProxy(p => ({ ...p, port: e.target.value }))}
                        placeholder="e.g. 65534"
                        className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted pb-1.5 block">Username</label>
                      <input type="text" value={newProxy.username} onChange={e => setNewProxy(p => ({ ...p, username: e.target.value }))}
                        placeholder="Optional"
                        className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted pb-1.5 block">Password</label>
                      <input type="password" value={newProxy.password} onChange={e => setNewProxy(p => ({ ...p, password: e.target.value }))}
                        placeholder="Optional"
                        className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4">
                    <div className="flex-1">
                      <label className="text-xs text-text-muted pb-1.5 block">Protocol</label>
                      <select value={newProxy.protocol} onChange={e => setNewProxy(p => ({ ...p, protocol: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all">
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks5">SOCKS5</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleAddProxy} disabled={addingProxy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                    {addingProxy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Proxy
                  </button>
                </div>
              )}

              {/* Bulk Import Form */}
              {showBulkImport && (
                <div className="p-5 bg-zinc-800/30 rounded-xl border border-[#3f3f46] mb-5">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Bulk Import Proxies</p>
                      <p className="text-xs text-text-muted pt-0.5">One proxy per line: host:port:username:password</p>
                    </div>
                    <button onClick={() => setShowBulkImport(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
                  </div>
                  <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
                    rows={6}
                    placeholder={"proxy1.example.com:8080:user:pass\nproxy2.example.com:3128\n192.168.1.1:1080:admin:secret"}
                    className="w-full px-3 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none font-mono mb-3" />
                  <button onClick={handleBulkImport} disabled={addingProxy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                    {addingProxy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Import Proxies
                  </button>
                </div>
              )}

              {/* Proxy List */}
              {proxiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
              ) : proxies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-4">
                    <Wifi className="w-7 h-7 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-primary pb-1">No proxies configured</p>
                  <p className="text-xs text-text-muted max-w-xs">Add proxies from any provider to enable proxy rotation during extraction. Supports HTTP, HTTPS, and SOCKS5.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-text-muted pb-2">
                    {proxies.length} prox{proxies.length === 1 ? 'y' : 'ies'} · {proxies.filter(p => p.status === 'active').length} active
                  </div>
                  {proxies.map(proxy => (
                    <div key={proxy.id} className="flex items-center gap-3 p-3.5 bg-zinc-800/20 rounded-lg border border-[#3f3f46] hover:border-[#52525b] transition-all">
                      <div className="flex-shrink-0">
                        {proxy.status === 'active' ? (
                          <CheckCircle className="w-4.5 h-4.5 text-success" />
                        ) : proxy.status === 'failed' ? (
                          <XCircle className="w-4.5 h-4.5 text-error" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {proxy.host}:{proxy.port}
                        </p>
                        <p className="text-xs text-text-muted">
                          {proxy.protocol.toUpperCase()}
                          {proxy.username && ` · ${proxy.username}`}
                          {proxy.speed > 0 && ` · ${proxy.speed}ms`}
                          {proxy.last_tested && ` · Tested ${new Date(proxy.last_tested).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleTestProxy(proxy.id)} disabled={testingProxy === proxy.id}
                          className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-all disabled:opacity-50"
                          title="Test proxy">
                          {testingProxy === proxy.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDeleteProxy(proxy.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
                          title="Delete proxy">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 p-4 bg-zinc-800/30 rounded-xl border border-[#3f3f46] mt-5">
                <p className="text-xs text-text-muted">Proxies route your extraction requests through different IP addresses to avoid rate limiting. Works with any provider: Massive, BrightData, Oxylabs, SmartProxy, etc.</p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">API Keys</h3>
              <p className="text-xs text-text-muted pb-6">Manage third-party service integrations</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('firecrawl_api_key', 'Firecrawl API Key', 'password', undefined, 'Used for website enrichment — scrapes business websites to find additional contact info')}
                {renderInput('serper_api_key', 'Serper API Key (Optional Fallback)', 'password', undefined, 'Google search API fallback — only used if Patchright browser engine is unavailable. Free tier: 2,500 searches/month at serper.dev')}
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button onClick={handleCheckCredits} disabled={checkingCredits}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/20 rounded-lg text-xs font-medium text-accent hover:bg-accent/20 transition-all disabled:opacity-50">
                  {checkingCredits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Check Credits
                </button>
                {firecrawlCredits !== null && (
                  <span className="text-xs text-success font-medium">{firecrawlCredits.toLocaleString()} credits remaining</span>
                )}
              </div>
              <div className="pt-6 p-4 bg-zinc-800/30 rounded-xl border border-[#3f3f46] mt-4">
                <p className="text-xs text-text-muted">API keys are stored locally and encrypted. They are never sent to external servers except the respective API provider.</p>
              </div>
              <div className="pt-3 p-4 bg-green-500/5 rounded-xl border border-green-500/20 mt-3">
                <p className="text-xs text-green-400 font-medium">v2.0 Engine: Patchright browser is the primary extraction method (FREE, no API key needed). Serper is only used as a fallback if Patchright encounters issues.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">Notifications</h3>
              <p className="text-xs text-text-muted pb-6">Control how you receive alerts</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('desktop_notifications', 'Desktop Notifications', 'toggle')}
                {renderInput('email_notifications', 'Email Notifications', 'toggle')}
              </div>
              <div className="pt-6 p-4 bg-zinc-800/30 rounded-xl border border-[#3f3f46]">
                <p className="text-xs text-text-muted">Notifications are sent when extractions complete, fail, or when new leads match your criteria.</p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">Storage & Data</h3>
              <p className="text-xs text-text-muted pb-6">Manage data retention and backups</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('data_retention_days', 'Data Retention (days)', 'number', undefined, 'Leads older than this will be auto-deleted')}
                {renderInput('auto_backup', 'Auto Backup', 'toggle')}
                <div className="py-4 flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all">
                    <RefreshCw className="w-4 h-4" />
                    Clear Cache
                  </button>
                  <span className="text-xs text-text-muted">Free up space by clearing cached search results</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary pb-2">Security & Privacy</h3>
              <p className="text-xs text-text-muted pb-6">Configure proxy rotation and privacy settings</p>
              <div className="divide-y divide-[#3f3f46]">
                {renderInput('proxy_enabled', 'Enable Proxy Rotation', 'toggle', undefined, 'Route extraction requests through your configured proxies')}
                {renderInput('proxy_rotation', 'Rotation Strategy', 'select', ['round-robin', 'random', 'fastest'], 'How proxy servers are selected for each request')}
              </div>
              <div className="pt-6 p-4 bg-zinc-800/30 rounded-xl border border-[#3f3f46]">
                <p className="text-xs text-text-muted">Proxies help avoid rate limiting and IP bans during extraction. Configure your proxies in the Proxies tab. Google Dorking does not require proxies.</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
