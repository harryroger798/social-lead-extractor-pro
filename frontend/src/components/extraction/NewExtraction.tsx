import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Loader2, AlertCircle,
  Search, Globe, Settings, CheckCircle,
  Mail, Phone, Users, Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startExtraction, getExtractionStatus } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { ExtractionStatusResponse } from '@/lib/api';
import { PLATFORM_ICONS } from '@/components/icons/PlatformIcons';

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', group: 'social', tooltip: 'Search 86.9M+ professional profiles. Returns: name, email, title, company, location, LinkedIn URL.' },
  { id: 'google_maps', name: 'Google Maps', group: 'social', tooltip: 'Search 102K+ local businesses. Returns: business name, phone, address, website, rating, reviews.' },
  { id: 'reddit', name: 'Reddit', group: 'social', tooltip: 'Find community members discussing your niche. Returns: username, profile URL, post history.' },
  { id: 'telegram', name: 'Telegram', group: 'social', tooltip: 'Extract contacts from Telegram groups and channels. Returns: name, username, phone (if public).' },
  { id: 'instagram', name: 'Instagram', group: 'social', tooltip: 'Search 2.45M+ business profiles. Returns: name, email, phone, bio, follower count, website.' },
  { id: 'facebook', name: 'Facebook', group: 'social', tooltip: 'Find business pages and profiles. Returns: name, email, phone, website, location from multiple sources.' },
  { id: 'twitter', name: 'Twitter/X', group: 'social', tooltip: 'Extract profiles via bio links and syndication API. Returns: name, bio, website, location, follower count.' },
  { id: 'whatsapp', name: 'WhatsApp', group: 'social', tooltip: 'Find WhatsApp business contacts. Returns: phone number, business name, status.' },
  { id: 'tiktok', name: 'TikTok', group: 'social', tooltip: 'Discover TikTok creator profiles. Returns: name, bio, website link, follower count.' },
  { id: 'youtube', name: 'YouTube', group: 'social', tooltip: 'Search 1,085+ channels across 53 categories. Returns: channel name, subscriber count, description, website.' },
  { id: 'pinterest', name: 'Pinterest', group: 'social', tooltip: 'Find Pinterest business accounts. Returns: name, bio, website, pin count.' },
  { id: 'email', name: 'Email', group: 'social', tooltip: 'Crawl any website to find emails. Scans /contact, /about, /team pages + mailto: links + Schema.org data.' },
  // B2B Platforms (v3.5.57 — replaced Apollo/RocketReach/Crunchbase with proven alternatives)
  { id: 'indiamart', name: 'IndiaMART', group: 'b2b', tooltip: 'Indian B2B supplier directory. Returns: company name, phone, email, city, product category. 8-40 leads/query.' },
  { id: 'email_finder_b2b', name: 'Email Finder', group: 'b2b', tooltip: 'Generates email patterns (first.last@domain.com) from name + company, then verifies via MX/SMTP. Also scrapes company /contact pages.' },
  { id: 'tradeindia', name: 'TradeIndia', group: 'b2b', tooltip: 'Indian exporter/manufacturer directory. Returns: company name, phone, email, products, city via dorking.' },
  { id: 'exportersindia', name: 'ExportersIndia', group: 'b2b', tooltip: 'Indian exporter directory. Returns: company name, phone, email, export products via dorking + directory crawl.' },
  { id: 'justdial', name: 'JustDial', group: 'b2b', tooltip: 'Indian business directory with 40 leads/query. Returns: business name, phone, address, rating, category.' },
  { id: 'google_maps_b2b', name: 'Google Maps B2B', group: 'b2b', tooltip: 'B2B-focused Google Maps search. Returns: business name, phone, address, website, rating. Best for local services.' },
  { id: 'github_b2b', name: 'GitHub', group: 'b2b', tooltip: 'Developer lead finder. Searches GitHub profiles + commit emails. Returns: name, email, repos, bio, company.' },
  { id: 'business_directories', name: 'Business Dirs', group: 'b2b', tooltip: 'Scrapes YellowPages, Yelp, and other directories. Returns: business name, phone, address, website. Best for US/UK.' },
];

type Step = 'config' | 'running' | 'complete';

export default function NewExtraction() {
  const [step, setStep] = useState<Step>('config');
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'facebook']);
  const [pagesPerKeyword, setPagesPerKeyword] = useState(3);
  const [delay, setDelay] = useState(2);
  const [useProxies, setUseProxies] = useState(false);
  const [autoVerify, setAutoVerify] = useState(true);
  const [useDorking, setUseDorking] = useState(true);
  const [useDirectScraping, setUseDirectScraping] = useState(false);
  const [useFirecrawl, setUseFirecrawl] = useState(false);
  const [headless, setHeadless] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');
  const [starting, setStarting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [status, setStatus] = useState<ExtractionStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    if (!name.trim()) { toast('warning', 'Please enter a session name'); return; }
    if (!keywords.trim()) { toast('warning', 'Please enter at least one keyword'); return; }
    if (selectedPlatforms.length === 0) { toast('warning', 'Please select at least one platform'); return; }

    try {
      setStarting(true);
      setError(null);
      const result = await startExtraction({
        name: name.trim(),
        keywords: keywords.split('\n').map(k => k.trim()).filter(Boolean),
        platforms: selectedPlatforms,
        pages_per_keyword: pagesPerKeyword,
        delay_between_requests: delay,
        use_proxies: useProxies,
        proxy_rotation: 'round-robin',
        email_filters: { domains: [], exclude_domains: [], types: [] },
        phone_filters: { country_codes: [] },
        export_format: exportFormat,
        auto_verify: autoVerify,
        use_google_dorking: useDorking,
        use_direct_scraping: useDirectScraping,
        use_firecrawl_enrichment: useFirecrawl,
        browser_headless: headless,
      });
      setStep('running');
      toast('success', 'Extraction started');
      startPolling(result.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start extraction');
      toast('error', 'Failed to start extraction');
    } finally {
      setStarting(false);
    }
  };

  // v3.5.63 Fix 2: Track last poll timestamp for sleep/resume detection
  const lastPollTimeRef = useRef<number>(Date.now());

  const startPolling = useCallback((sessionId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    activeSessionRef.current = sessionId;  // v3.5.63: track for visibility handler
    lastPollTimeRef.current = Date.now();
    pollRef.current = setInterval(async () => {
      try {
        const now = Date.now();
        const gap = now - lastPollTimeRef.current;
        // v3.5.63: Detect sleep/resume — if gap > 5 min, force full refresh
        if (gap > 5 * 60 * 1000) {
          console.log(`[v3.5.63] Sleep detected (${Math.round(gap / 1000)}s gap) — forcing status refresh`);
        }
        lastPollTimeRef.current = now;
        const data = await getExtractionStatus(sessionId);
        setStatus(data);
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep('complete');
          toast(data.status === 'completed' ? 'success' : 'error',
            data.status === 'completed' ? `Extraction complete! ${data.total_leads} leads found.` : 'Extraction failed');
        }
      } catch {
        // keep polling on transient errors
      }
    }, 2000);
  }, [toast]);

  // v3.5.63 Fix 2: Also refresh on visibility change (tab becomes visible after sleep)
  const activeSessionRef = useRef<string | null>(null);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeSessionRef.current && step === 'running') {
        console.log('[v3.5.63] Tab became visible — immediate status poll');
        getExtractionStatus(activeSessionRef.current).then(data => {
          setStatus(data);
          if (data.status === 'completed' || data.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setStep('complete');
            toast(data.status === 'completed' ? 'success' : 'error',
              data.status === 'completed' ? `Extraction complete! ${data.total_leads} leads found.` : 'Extraction failed');
          }
        }).catch(() => { /* ignore transient errors */ });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, toast]);

  const renderToggle = (enabled: boolean, onChange: () => void, label: string, description?: string) => (
    <div className="flex items-center justify-between py-5 min-h-[56px]">
      <div className="pr-4 flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted pt-1.5 leading-relaxed">{description}</p>}
      </div>
      <button onClick={onChange} className={cn('relative w-11 h-6 rounded-full transition-all flex-shrink-0', enabled ? 'bg-accent shadow-inner shadow-accent/30' : 'bg-bg-tertiary border border-[#52525b]')}>
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200', enabled && 'translate-x-5')} />
      </button>
    </div>
  );

  if (step === 'running' || step === 'complete') {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0 page-header">
          <div className="px-10 py-6">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              {step === 'running' ? 'Extraction in Progress' : 'Extraction Complete'}
            </h1>
            <p className="text-sm text-text-secondary pt-1">{name}</p>
          </div>
        </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
        <div className="flex flex-col gap-6">
          {!status && step === 'running' && (
            <div className="card p-6 flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm text-text-secondary">Starting extraction... connecting to backend</p>
            </div>
          )}

          {status && (
          <>
            {/* Progress */}
            <div className="card p-6">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  {step === 'running' ? (
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  ) : status.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-error" />
                  )}
                  <span className={cn(
                    'text-sm font-semibold capitalize',
                    status.status === 'completed' && 'text-success',
                    status.status === 'running' && 'text-accent',
                    status.status === 'failed' && 'text-error'
                  )}>{status.status}</span>
                </div>
                <span className="text-lg font-bold text-text-primary tabular-nums">{status.progress}%</span>
              </div>
              <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500',
                    status.status === 'completed' ? 'bg-success' : status.status === 'failed' ? 'bg-error' : 'bg-accent'
                  )}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              {/* Live status message */}
              {status.status_message && (
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
                  {status.current_platform && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-accent/15 text-accent uppercase tracking-wide">
                      {status.current_platform}
                    </span>
                  )}
                  <p className="text-sm text-text-secondary flex-1">{status.status_message}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-6 text-center">
                <Users className="w-6 h-6 text-accent mx-auto pb-3" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.total_leads}</p>
                <p className="text-xs text-text-muted pt-1.5">Total Leads</p>
              </div>
              <div className="card p-6 text-center">
                <Mail className="w-6 h-6 text-blue-400 mx-auto pb-3" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.emails_found}</p>
                <p className="text-xs text-text-muted pt-1.5">Emails Found</p>
              </div>
              <div className="card p-6 text-center">
                <Phone className="w-6 h-6 text-success mx-auto pb-3" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.phones_found}</p>
                <p className="text-xs text-text-muted pt-1.5">Phones Found</p>
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <div className="flex justify-center gap-3">
            <button onClick={() => { setStep('config'); setStatus(null); setName(''); setKeywords(''); }}
              className="px-6 py-3 bg-bg-card border border-[#3f3f46] rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all">
              New Extraction
            </button>
          </div>
        )}
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">New Extraction</h1>
          <p className="text-sm text-text-secondary pt-1">Configure and start a new lead extraction session</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      {/* How to Use */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">How to Use New Extraction</span>
          </div>
          {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </button>
        {showGuide && (
          <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">How It Works</h4>
              <ol className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">1.</span> Name your session (e.g. "LinkedIn CEO Emails Q1 2026")</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">2.</span> Enter keywords — one per line (e.g. "CEO email marketing", "CTO SaaS contact")</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">3.</span> Select platforms to search (LinkedIn, Facebook, Reddit, etc.)</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">4.</span> Adjust speed settings and scraping method if needed</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">5.</span> Click "Start Extraction" — progress shown in real-time</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">6.</span> Results saved automatically to the Results tab for export</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
              <ul className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Session Name:</strong> A label to identify this extraction in your history</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Keywords:</strong> Search terms used to find leads. Be specific for better results</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Pages per Keyword:</strong> How many search result pages to scrape (more = more leads, slower)</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delay:</strong> Wait time between requests. Higher = safer but slower</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Google Dorking:</strong> Primary method — searches Google for indexed emails/phones (safest)</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Direct Scraping:</strong> Secondary method — visits platform pages directly (higher risk)</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Auto-verify:</strong> Checks MX records to confirm emails are deliverable</li>
              </ul>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Start with Google Dorking enabled and 3 pages per keyword. This is the safest method with zero ban risk.</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Session Name */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-accent" />
          </div>
          Basic Configuration
        </h3>
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium text-text-primary pb-3 block">Session Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., LinkedIn CEO Emails Q1 2026"
              className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary pb-3 block">Keywords (one per line)</label>
            <textarea value={keywords} onChange={e => setKeywords(e.target.value)}
              placeholder={"CEO email marketing\nCTO contact SaaS\nfounder email fintech"}
              rows={4}
              className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-accent" />
          </div>
          Platforms
          <span className="text-[11px] text-text-muted font-normal ml-auto">{selectedPlatforms.length} selected</span>
        </h3>

        {/* Social Media Platforms */}
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider pb-3">Social Media</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.filter(p => p.group === 'social').map(p => {
            const Icon = PLATFORM_ICONS[p.id];
            const isSelected = selectedPlatforms.includes(p.id);
            return (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              title={p.tooltip}
              className={cn(
                  'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 min-h-[100px] group',
                  isSelected
                    ? 'border-accent/40 bg-accent/[0.06] ring-1 ring-accent/20 shadow-sm shadow-accent/10'
                    : 'border-[#3f3f46] bg-bg-card hover:border-[#52525b] hover:bg-bg-tertiary/30'
              )}
            >
              {isSelected && <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-accent" />}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
                {Icon ? <Icon className="w-9 h-9" /> : <Globe className="w-5 h-5 text-text-muted" />}
              </div>
              <span className={cn('text-[11px] font-semibold uppercase tracking-wide text-center leading-tight', isSelected ? 'text-text-primary' : 'text-text-secondary')}>{p.name}</span>
            </button>
            );
          })}
        </div>

        {/* B2B Platforms */}
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pt-6">B2B Platforms <span className="text-accent font-normal normal-case">(New in v3.5.57)</span></p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {PLATFORMS.filter(p => p.group === 'b2b').map(p => {
            const Icon = PLATFORM_ICONS[p.id];
            const isSelected = selectedPlatforms.includes(p.id);
            return (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              title={p.tooltip}
              className={cn(
                  'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 min-h-[100px] group',
                  isSelected
                    ? 'border-accent/40 bg-accent/[0.06] ring-1 ring-accent/20 shadow-sm shadow-accent/10'
                    : 'border-[#3f3f46] bg-bg-card hover:border-[#52525b] hover:bg-bg-tertiary/30'
              )}
            >
              {isSelected && <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-accent" />}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
                {Icon ? <Icon className="w-9 h-9" /> : <Globe className="w-5 h-5 text-text-muted" />}
              </div>
              <span className={cn('text-[11px] font-semibold uppercase tracking-wide text-center leading-tight', isSelected ? 'text-text-primary' : 'text-text-secondary')}>{p.name}</span>
            </button>
            );
          })}
        </div>
      </div>

      {/* Extraction Speed */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Search className="w-4 h-4 text-accent" />
          </div>
          Extraction Speed
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-text-primary pb-3 block">Pages per Keyword</label>
            <input type="number" value={pagesPerKeyword} onChange={e => setPagesPerKeyword(parseInt(e.target.value) || 3)}
              min={1} max={20}
              className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary pb-3 block">Delay Between Requests (sec)</label>
            <input type="number" value={delay} onChange={e => setDelay(parseInt(e.target.value) || 2)}
              min={1} max={30}
              className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
        </div>
      </div>

      {/* Output Settings */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-accent" />
          </div>
          Output
        </h3>
        <div className="pb-5">
          <label className="text-sm font-medium text-text-primary pb-3 block">Export Format</label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}
            className="w-full max-w-xs px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all">
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <div className="border-t border-[#3f3f46]">
          {renderToggle(autoVerify, () => setAutoVerify(!autoVerify), 'Auto-verify Emails', 'Check MX records to verify email deliverability')}
        </div>
      </div>

      {/* Scraping Method */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-accent" />
          </div>
          Scraping Method
        </h3>
        <div className="divide-y divide-[#3f3f46]">
          {renderToggle(useDorking, () => setUseDorking(!useDorking), 'Google Dorking', 'Primary extraction method - search Google for indexed emails/phones')}
          {renderToggle(useDirectScraping, () => setUseDirectScraping(!useDirectScraping), 'Direct Scraping', 'Secondary method - scrape platform pages directly with Patchright')}
          {renderToggle(useFirecrawl, () => setUseFirecrawl(!useFirecrawl), 'Firecrawl Enrichment', 'Scrape business websites found in results for additional emails/phones (uses Firecrawl API credits)')}
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-7">
        <h3 className="text-sm font-semibold text-text-primary pb-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-accent" />
          </div>
          Security
        </h3>
        <div className="divide-y divide-[#3f3f46]">
          {renderToggle(useProxies, () => setUseProxies(!useProxies), 'Use Proxies', 'Route requests through proxy servers for anti-detection')}
          {renderToggle(headless, () => setHeadless(!headless), 'Headless Mode', 'Run browser in background (disable to see browser window)')}
        </div>
      </div>

      {/* Start Button */}
      <div className="card p-7 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">Ready to extract?</p>
          <p className="text-xs text-text-muted pt-0.5">{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected · {keywords.split('\n').filter(Boolean).length} keyword{keywords.split('\n').filter(Boolean).length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleStart} disabled={starting}
          className="flex items-center gap-2.5 px-7 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
        >
          {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {starting ? 'Starting Extraction...' : 'Start Extraction'}
        </button>
      </div>
      </div>
      </div>
    </div>
  );
}
