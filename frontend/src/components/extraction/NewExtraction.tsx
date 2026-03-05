import { useState } from 'react';
import {
  Search,
  Globe,
  Filter,
  Shield,
  Monitor,
  Download,
  Sliders,
  Play,
  Pause,
  Square,
  Upload,
  Plus,
  X,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  MapPin,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types';

type Tab = 'search' | 'platforms' | 'filters' | 'proxy' | 'browser' | 'export' | 'advanced';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'platforms', label: 'Platforms', icon: Globe },
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'proxy', label: 'Proxy', icon: Shield },
  { id: 'browser', label: 'Browser', icon: Monitor },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'advanced', label: 'Advanced', icon: Sliders },
];

interface PlatformOption {
  id: Platform;
  name: string;
  icon: React.ElementType;
  color: string;
  status: string;
}

const platformOptions: PlatformOption[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', status: 'Good' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', status: 'Partial' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', status: 'Partial' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#1DA1F2', status: 'Good' },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: '#FF0050', status: 'Login Required' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', status: 'Good' },
  { id: 'pinterest', name: 'Pinterest', icon: MapPin, color: '#E60023', status: 'Good' },
  { id: 'tumblr', name: 'Tumblr', icon: BookOpen, color: '#36465D', status: 'Good' },
  { id: 'reddit', name: 'Reddit', icon: MessageCircle, color: '#FF4500', status: 'API-based' },
];

export default function NewExtraction() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['linkedin', 'facebook', 'twitter']);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pagesPerKeyword, setPagesPerKeyword] = useState(5);
  const [delayBetweenRequests, setDelayBetweenRequests] = useState(3);
  const [emailDomains, setEmailDomains] = useState<string[]>(['gmail.com', 'yahoo.com', 'outlook.com']);
  const [countryCodes, setCountryCodes] = useState<string[]>(['+1', '+44']);
  const [useGoogleDorking, setUseGoogleDorking] = useState(true);
  const [useDirectScraping, setUseDirectScraping] = useState(true);
  const [useFirecrawl, setUseFirecrawl] = useState(false);
  const [autoVerify, setAutoVerify] = useState(true);
  const [exportFormat, setExportFormat] = useState('excel');
  const [headlessMode, setHeadlessMode] = useState(false);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyRotation, setProxyRotation] = useState('round-robin');
  const [progress, setProgress] = useState(0);
  const [leadsFound, setLeadsFound] = useState(0);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleStart = () => {
    if (keywords.length === 0) return;
    setIsRunning(true);
    setIsPaused(false);
    setProgress(0);
    setLeadsFound(0);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return p + 1;
      });
      setLeadsFound((l) => l + Math.floor(Math.random() * 3));
    }, 200);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">New Extraction</h2>
          <p className="text-sm text-text-muted mt-1">Configure and start a new lead extraction session</p>
        </div>
        <div className="flex items-center gap-3">
          {isRunning ? (
            <>
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2.5 bg-warning/10 text-warning rounded-xl text-sm font-semibold hover:bg-warning/20 transition-all"
              >
                <Pause className="w-4 h-4" />
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2.5 bg-error/10 text-error rounded-xl text-sm font-semibold hover:bg-error/20 transition-all"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={handleStart}
              disabled={keywords.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              <Play className="w-4 h-4" />
              Start Extraction
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (when running) */}
      {isRunning && (
        <div className="mb-6 bg-bg-secondary rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">
              {isPaused ? 'Paused' : 'Extracting...'} - {leadsFound} leads found
            </span>
            <span className="text-sm font-medium text-text-primary">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', isPaused ? 'bg-warning' : 'bg-accent')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-secondary rounded-xl p-1.5 border border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6 space-y-0">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Enter keyword and press Enter..."
                  className="flex-1 px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                />
                <button
                  onClick={addKeyword}
                  className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((kw) => (
                    <span key={kw} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-text-muted mt-2">
                Add keywords like &quot;marketing agency&quot;, &quot;real estate agent&quot;, &quot;SaaS founder&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Bulk Import</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Drop a .txt or .csv file here, or click to browse</p>
                <p className="text-xs text-text-muted mt-1">One keyword per line</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Pages per Keyword</label>
                <input
                  type="number"
                  value={pagesPerKeyword}
                  onChange={(e) => setPagesPerKeyword(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Delay (seconds)</label>
                <input
                  type="number"
                  value={delayBetweenRequests}
                  onChange={(e) => setDelayBetweenRequests(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">Select platforms to extract from</p>
              <button
                onClick={() =>
                  setSelectedPlatforms(
                    selectedPlatforms.length === platformOptions.length ? [] : platformOptions.map((p) => p.id)
                  )
                }
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                {selectedPlatforms.length === platformOptions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {platformOptions.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                      isSelected ? 'border-accent bg-accent/5' : 'border-border hover:border-border-light bg-bg-primary'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: platform.color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: platform.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{platform.name}</p>
                      <p className={cn(
                        'text-xs',
                        platform.status === 'Good' ? 'text-success' :
                        platform.status === 'API-based' ? 'text-accent' :
                        'text-warning'
                      )}>{platform.status}</p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        isSelected ? 'border-accent bg-accent' : 'border-border'
                      )}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Domain Filters</label>
              <div className="flex flex-wrap gap-2">
                {['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'].map((domain) => (
                  <button
                    key={domain}
                    onClick={() =>
                      setEmailDomains((prev) =>
                        prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
                      )
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      emailDomains.includes(domain)
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'border-border text-text-secondary hover:border-border-light'
                    )}
                  >
                    {domain}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-2">Leave empty to extract all email domains</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Country Code Filters</label>
              <div className="flex flex-wrap gap-2">
                {['+1 (US)', '+44 (UK)', '+91 (IN)', '+61 (AU)', '+49 (DE)', '+33 (FR)'].map((code) => {
                  const codeVal = code.split(' ')[0];
                  return (
                    <button
                      key={code}
                      onClick={() =>
                        setCountryCodes((prev) =>
                          prev.includes(codeVal) ? prev.filter((c) => c !== codeVal) : [...prev, codeVal]
                        )
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border transition-all',
                        countryCodes.includes(codeVal)
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'border-border text-text-secondary hover:border-border-light'
                      )}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Email Type</label>
              <div className="flex gap-3">
                {['All', 'Personal Only', 'Business Only'].map((type) => (
                  <button
                    key={type}
                    className="px-4 py-2 rounded-lg text-sm border border-border text-text-secondary hover:border-accent hover:text-accent transition-all"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Auto-Verify Emails</p>
                <p className="text-xs text-text-muted mt-0.5">Check MX records to verify email domains</p>
              </div>
              <button
                onClick={() => setAutoVerify(!autoVerify)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative',
                  autoVerify ? 'bg-accent' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                    autoVerify ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* Proxy Tab */}
        {activeTab === 'proxy' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Enable Proxy Rotation</p>
                <p className="text-xs text-text-muted mt-0.5">Route requests through proxy servers</p>
              </div>
              <button
                onClick={() => setProxyEnabled(!proxyEnabled)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative',
                  proxyEnabled ? 'bg-accent' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                    proxyEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {proxyEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Rotation Strategy</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'round-robin', label: 'Round Robin' },
                      { id: 'random', label: 'Random' },
                      { id: 'fastest', label: 'Fastest' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setProxyRotation(opt.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm border transition-all',
                          proxyRotation === opt.id
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'border-border text-text-secondary hover:border-border-light'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Add Proxy</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Host (e.g. proxy.example.com)"
                      className="px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    />
                    <input
                      placeholder="Port (e.g. 8080)"
                      className="px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    />
                    <input
                      placeholder="Username"
                      className="px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    />
                    <input
                      placeholder="Password"
                      type="password"
                      className="px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button className="mt-3 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
                    Add Proxy
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Bulk Import Proxies</label>
                  <textarea
                    placeholder="host:port:username:password (one per line)"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Browser Tab */}
        {activeTab === 'browser' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Headless Mode</p>
                <p className="text-xs text-text-muted mt-0.5">Run browser in background (no visible window)</p>
              </div>
              <button
                onClick={() => setHeadlessMode(!headlessMode)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative',
                  headlessMode ? 'bg-accent' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                    headlessMode ? 'translate-x-5.5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            <div className="p-4 bg-bg-primary rounded-lg border border-border">
              <p className="text-sm font-medium text-text-primary mb-2">Browser Engine</p>
              <p className="text-xs text-text-muted mb-3">Using Patchright (undetected Chromium)</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Anti-detection active: navigator.webdriver = false</span>
              </div>
            </div>

            <div className="p-4 bg-bg-primary rounded-lg border border-border">
              <p className="text-sm font-medium text-text-primary mb-2">CAPTCHA Handling</p>
              <p className="text-xs text-text-muted mb-3">Whisper audio CAPTCHA auto-solver (local, free)</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success">Whisper model ready (~1s per solve, ~95% accuracy)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">User Agent</label>
              <input
                defaultValue="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Browser Timeout (seconds)</label>
              <input
                type="number"
                defaultValue={30}
                min={5}
                max={120}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Export Format</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'excel', label: 'Excel (.xlsx)', desc: 'Formatted spreadsheet' },
                  { id: 'csv', label: 'CSV (.csv)', desc: 'Universal format' },
                  { id: 'json', label: 'JSON (.json)', desc: 'Developer friendly' },
                  { id: 'html', label: 'HTML (.html)', desc: 'Browser viewable' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all',
                      exportFormat === fmt.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-border-light bg-bg-primary'
                    )}
                  >
                    <p className="text-sm font-medium text-text-primary">{fmt.label}</p>
                    <p className="text-xs text-text-muted mt-1">{fmt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Export Fields</label>
              <div className="flex flex-wrap gap-2">
                {['Email', 'Phone', 'Name', 'Platform', 'Source URL', 'Keyword', 'Country', 'Verified', 'Quality Score'].map(
                  (field) => (
                    <span key={field} className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm border border-accent/30">
                      {field}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Auto-Export on Complete</p>
                <p className="text-xs text-text-muted mt-0.5">Automatically export when extraction finishes</p>
              </div>
              <button className="w-11 h-6 rounded-full bg-accent transition-colors relative">
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 translate-x-5.5" />
              </button>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Extraction Methods</h3>
              {[
                {
                  id: 'dorking',
                  label: 'Google Dorking (Primary)',
                  desc: 'Search Google for indexed social media data. Most reliable method.',
                  enabled: useGoogleDorking,
                  toggle: () => setUseGoogleDorking(!useGoogleDorking),
                },
                {
                  id: 'direct',
                  label: 'Direct Scraping (Secondary)',
                  desc: 'Scrape social media platforms directly using Patchright browser.',
                  enabled: useDirectScraping,
                  toggle: () => setUseDirectScraping(!useDirectScraping),
                },
                {
                  id: 'firecrawl',
                  label: 'Firecrawl Enrichment',
                  desc: 'Enrich leads by scraping company websites. Uses your Firecrawl credits.',
                  enabled: useFirecrawl,
                  toggle: () => setUseFirecrawl(!useFirecrawl),
                },
              ].map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{method.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{method.desc}</p>
                  </div>
                  <button
                    onClick={method.toggle}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative',
                      method.enabled ? 'bg-accent' : 'bg-border'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform',
                        method.enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Deduplication</h3>
              <div className="flex gap-3">
                {['Email-based', 'Phone-based', 'URL-based'].map((opt) => (
                  <span key={opt} className="px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm border border-accent/30">
                    {opt}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Max Concurrent Requests</label>
              <input
                type="number"
                defaultValue={3}
                min={1}
                max={10}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
