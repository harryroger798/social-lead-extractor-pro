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
        <button onClick={loadSettings} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  const renderInput = (key: string, label: string, type: 'text' | 'number' | 'password' | 'toggle' | 'select', options?: string[]) => {
    if (type === 'toggle') {
      const enabled = settings[key] === 'true';
      return (
        <div className="flex items-center justify-between py-4">
          <div className="pr-4">
            <p className="text-sm font-medium text-text-primary">{label}</p>
          </div>
          <button
            onClick={() => handleChange(key, enabled ? 'false' : 'true')}
            className={cn('relative w-11 h-6 rounded-full transition-colors flex-shrink-0', enabled ? 'bg-accent' : 'bg-bg-tertiary border border-border')}
          >
            <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform', enabled && 'translate-x-5')} />
          </button>
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <div className="py-4">
          <label className="text-sm font-medium text-text-primary mb-2 block">{label}</label>
          <select
            value={settings[key]} onChange={e => handleChange(key, e.target.value)}
            className="w-full max-w-xs px-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    return (
      <div className="py-4">
        <label className="text-sm font-medium text-text-primary mb-2 block">{label}</label>
        <input
          type={type} value={settings[key] || ''} onChange={e => handleChange(key, e.target.value)}
          className="w-full max-w-xs px-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">Configure your extraction preferences</p>
          </div>
        <button
          onClick={handleSave} disabled={!dirty || saving}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-[8px] text-sm font-semibold transition-all',
            dirty ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25' : 'bg-bg-secondary border border-border text-text-muted cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
      <div className="flex gap-6">
        {/* Tab Navigation */}
        <div className="w-48 flex-shrink-0">
          <nav className="bg-bg-secondary rounded-[10px] border border-border p-3 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all text-left',
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
        <div className="flex-1 bg-bg-secondary rounded-[10px] border border-border p-6">
          {activeTab === 'general' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('app_name', 'Application Name', 'text')}
              {renderInput('theme', 'Theme', 'select', ['dark', 'light', 'system'])}
              {renderInput('language', 'Language', 'select', ['en', 'es', 'fr', 'de', 'pt'])}
              {renderInput('default_export_format', 'Default Export Format', 'select', ['csv', 'xlsx', 'json', 'html'])}
            </div>
          )}

          {activeTab === 'extraction' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('pages_per_keyword', 'Pages per Keyword', 'number')}
              {renderInput('delay_between_requests', 'Delay Between Requests (seconds)', 'number')}
              {renderInput('max_concurrent_sessions', 'Max Concurrent Sessions', 'number')}
              {renderInput('auto_verify_emails', 'Auto-verify Emails (MX Check)', 'toggle')}
              {renderInput('use_google_dorking', 'Google Dorking (Primary)', 'toggle')}
              {renderInput('use_direct_scraping', 'Direct Scraping (Secondary)', 'toggle')}
              {renderInput('browser_headless', 'Headless Browser Mode', 'toggle')}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('firecrawl_api_key', 'Firecrawl API Key', 'password')}
              <div className="py-3">
                <p className="text-xs text-text-muted">Firecrawl is used for website enrichment. You have 1.18M+ credits available.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('desktop_notifications', 'Desktop Notifications', 'toggle')}
              {renderInput('email_notifications', 'Email Notifications', 'toggle')}
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('data_retention_days', 'Data Retention (days)', 'number')}
              {renderInput('auto_backup', 'Auto Backup', 'toggle')}
              <div className="py-3 flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border rounded-[8px] text-sm text-text-secondary hover:text-text-primary transition-all">
                  <RefreshCw className="w-4 h-4" />
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-1 divide-y divide-border">
              {renderInput('proxy_enabled', 'Enable Proxy', 'toggle')}
              {renderInput('proxy_rotation', 'Proxy Rotation Strategy', 'select', ['round-robin', 'random', 'fastest'])}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
