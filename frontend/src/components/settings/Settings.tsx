import { useState } from 'react';
import {
  Key,
  Globe,
  Shield,
  Bell,
  Database,
  Download,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsState {
  licenseKey: string;
  licenseStatus: 'active' | 'inactive' | 'expired';
  serperApiKey: string;
  firecrawlApiKey: string;
  defaultExportFormat: string;
  autoVerifyEmails: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  maxConcurrentRequests: number;
  defaultDelay: number;
  databasePath: string;
  autoBackup: boolean;
  backupInterval: number;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    licenseKey: '',
    licenseStatus: 'inactive',
    serperApiKey: '',
    firecrawlApiKey: '',
    defaultExportFormat: 'excel',
    autoVerifyEmails: true,
    notificationsEnabled: true,
    soundEnabled: false,
    maxConcurrentRequests: 3,
    defaultDelay: 3,
    databasePath: './data/leads.db',
    autoBackup: true,
    backupInterval: 24,
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('license');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const activateLicense = () => {
    if (settings.licenseKey.length > 0) {
      updateSetting('licenseStatus', 'active');
    }
  };

  const tabs = [
    { id: 'license', label: 'License', icon: Key },
    { id: 'api', label: 'API Keys', icon: Globe },
    { id: 'extraction', label: 'Extraction', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
          <p className="text-sm text-text-secondary mt-1">Configure your application preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
            saved
              ? 'bg-success/20 text-success'
              : 'bg-accent hover:bg-accent-hover text-white'
          )}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-6">
        {/* Tab Navigation */}
        <div className="w-48 space-y-1 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-bg-secondary rounded-xl border border-border p-6">
          {/* License Tab */}
          {activeTab === 'license' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">License Activation</h3>
                <p className="text-sm text-text-secondary">Enter your license key to activate the application</p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-bg-primary">
                <div className="flex items-center gap-3 mb-4">
                  {settings.licenseStatus === 'active' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">License Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <span className="text-sm font-medium text-warning">No Active License</span>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={settings.licenseKey}
                    onChange={(e) => updateSetting('licenseKey', e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="flex-1 px-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent font-mono"
                  />
                  <button
                    onClick={activateLicense}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Activate
                  </button>
                </div>
              </div>

              {settings.licenseStatus === 'active' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-bg-primary">
                    <p className="text-xs text-text-muted mb-1">License Type</p>
                    <p className="text-sm font-medium text-text-primary">Professional</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-bg-primary">
                    <p className="text-xs text-text-muted mb-1">Expires</p>
                    <p className="text-sm font-medium text-text-primary">Never (Lifetime)</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">API Configuration</h3>
                <p className="text-sm text-text-secondary">Configure external API keys for enhanced functionality</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Serper.dev API Key
                  <span className="text-xs text-text-muted ml-2">(Google Dorking backup)</span>
                </label>
                <input
                  type="password"
                  value={settings.serperApiKey}
                  onChange={(e) => updateSetting('serperApiKey', e.target.value)}
                  placeholder="Enter Serper.dev API key..."
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                />
                <p className="text-xs text-text-muted mt-1">Optional: Used as fallback when direct Google dorking hits rate limits</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Firecrawl API Key
                  <span className="text-xs text-text-muted ml-2">(Website enrichment)</span>
                </label>
                <input
                  type="password"
                  value={settings.firecrawlApiKey}
                  onChange={(e) => updateSetting('firecrawlApiKey', e.target.value)}
                  placeholder="Enter Firecrawl API key..."
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                />
                <p className="text-xs text-text-muted mt-1">Used for enriching leads with company website data</p>
              </div>
            </div>
          )}

          {/* Extraction Tab */}
          {activeTab === 'extraction' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Extraction Defaults</h3>
                <p className="text-sm text-text-secondary">Default settings for new extraction sessions</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Max Concurrent Requests</label>
                  <input
                    type="number"
                    value={settings.maxConcurrentRequests}
                    onChange={(e) => updateSetting('maxConcurrentRequests', Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Default Delay (seconds)</label>
                  <input
                    type="number"
                    value={settings.defaultDelay}
                    onChange={(e) => updateSetting('defaultDelay', Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Default Export Format</label>
                <select
                  value={settings.defaultExportFormat}
                  onChange={(e) => updateSetting('defaultExportFormat', e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="html">HTML (.html)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Auto-Verify Emails</p>
                  <p className="text-xs text-text-muted mt-0.5">Automatically verify email domains via MX records</p>
                </div>
                <button
                  onClick={() => updateSetting('autoVerifyEmails', !settings.autoVerifyEmails)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative',
                    settings.autoVerifyEmails ? 'bg-accent' : 'bg-border'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                      settings.autoVerifyEmails ? 'translate-x-5.5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Notifications</h3>
                <p className="text-sm text-text-secondary">Configure notification preferences</p>
              </div>

              {[
                {
                  key: 'notificationsEnabled' as const,
                  label: 'Desktop Notifications',
                  desc: 'Show notifications when extraction completes',
                },
                {
                  key: 'soundEnabled' as const,
                  label: 'Sound Alerts',
                  desc: 'Play sound when extraction completes',
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !settings[item.key])}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative',
                      settings[item.key] ? 'bg-accent' : 'bg-border'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                        settings[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Database Management</h3>
                <p className="text-sm text-text-secondary">Manage your local SQLite database</p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-bg-primary">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Database Location</p>
                    <p className="text-xs text-text-muted font-mono mt-0.5">{settings.databasePath}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">2.4 MB</p>
                    <p className="text-xs text-text-muted">12,847 records</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Auto Backup</p>
                  <p className="text-xs text-text-muted mt-0.5">Automatically backup database every {settings.backupInterval} hours</p>
                </div>
                <button
                  onClick={() => updateSetting('autoBackup', !settings.autoBackup)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative',
                    settings.autoBackup ? 'bg-accent' : 'bg-border'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                      settings.autoBackup ? 'translate-x-5.5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-light transition-colors">
                  <Download className="w-4 h-4" />
                  Export Database
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-light transition-colors">
                  <Upload className="w-4 h-4" />
                  Import Database
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-light transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Optimize
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-error/10 border border-error/30 rounded-lg text-sm font-medium text-error hover:bg-error/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
