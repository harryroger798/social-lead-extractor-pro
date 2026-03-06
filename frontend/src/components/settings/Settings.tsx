import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, Save, Loader2, AlertCircle,
  Key, Globe, Shield, Bell, Database, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSettings, updateSetting } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';

const TABS = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'extraction', label: 'Extraction', icon: Globe },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  app_name: 'Social Lead Extractor Pro',
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
  const { toast } = useToast();

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

  useEffect(() => { loadSettings(); }, [loadSettings]);

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
        <div className="flex items-center justify-between py-4 min-h-[56px]">
          <div className="pr-4">
            <p className="text-sm font-medium text-text-primary">{label}</p>
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
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
        <div className="py-4">
          <label className="text-sm font-medium text-text-primary mb-2 block">{label}</label>
          {description && <p className="text-xs text-text-muted mb-2">{description}</p>}
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
      <div className="py-4">
        <label className="text-sm font-medium text-text-primary mb-2 block">{label}</label>
        {description && <p className="text-xs text-text-muted mb-2">{description}</p>}
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
            <p className="text-sm text-text-secondary mt-1">Configure your extraction preferences</p>
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
      <div className="grid grid-cols-[220px_1fr] gap-6 min-h-full">
        {/* Tab Navigation */}
        <div className="flex-shrink-0">
          <nav className="card p-3 space-y-1 sticky top-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left',
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
              <h3 className="text-base font-semibold text-text-primary mb-1">General Settings</h3>
              <p className="text-xs text-text-muted mb-4">Manage your application preferences</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
                {renderInput('app_name', 'Application Name', 'text', undefined, 'The name displayed in the app header')}
                {renderInput('theme', 'Theme', 'select', ['dark', 'light', 'system'], 'Choose your preferred color scheme')}
                {renderInput('language', 'Language', 'select', ['en', 'es', 'fr', 'de', 'pt'], 'Interface language')}
                {renderInput('default_export_format', 'Default Export Format', 'select', ['csv', 'xlsx', 'json', 'html'], 'Format used when exporting leads')}
              </div>
            </div>
          )}

          {activeTab === 'extraction' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">Extraction Settings</h3>
              <p className="text-xs text-text-muted mb-4">Configure how extractions are performed</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
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

          {activeTab === 'api' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">API Keys</h3>
              <p className="text-xs text-text-muted mb-4">Manage third-party service integrations</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
                {renderInput('firecrawl_api_key', 'Firecrawl API Key', 'password', undefined, 'Used for website enrichment — you have 1.18M+ credits available')}
              </div>
              <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-[#3f3f46]">
                <p className="text-xs text-text-muted">API keys are stored locally and encrypted. They are never sent to external servers except the respective API provider.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">Notifications</h3>
              <p className="text-xs text-text-muted mb-4">Control how you receive alerts</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
                {renderInput('desktop_notifications', 'Desktop Notifications', 'toggle')}
                {renderInput('email_notifications', 'Email Notifications', 'toggle')}
              </div>
              <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-[#3f3f46]">
                <p className="text-xs text-text-muted">Notifications are sent when extractions complete, fail, or when new leads match your criteria.</p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">Storage & Data</h3>
              <p className="text-xs text-text-muted mb-4">Manage data retention and backups</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
                {renderInput('data_retention_days', 'Data Retention (days)', 'number', undefined, 'Leads older than this will be auto-deleted')}
                {renderInput('auto_backup', 'Auto Backup', 'toggle')}
                <div className="py-4 flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all">
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
              <h3 className="text-base font-semibold text-text-primary mb-1">Security & Proxy</h3>
              <p className="text-xs text-text-muted mb-4">Configure proxy and privacy settings</p>
              <div className="space-y-1 divide-y divide-[#3f3f46]">
                {renderInput('proxy_enabled', 'Enable Proxy', 'toggle')}
                {renderInput('proxy_rotation', 'Proxy Rotation Strategy', 'select', ['round-robin', 'random', 'fastest'], 'How proxy servers are selected for each request')}
              </div>
              <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-[#3f3f46]">
                <p className="text-xs text-text-muted">Proxies help avoid rate limiting and IP bans during direct scraping. Google Dorking does not require proxies.</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
