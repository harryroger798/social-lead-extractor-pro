import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Loader2, AlertCircle,
  Search, Globe, Settings, CheckCircle,
  Mail, Phone, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { startExtraction, getExtractionStatus } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { ExtractionStatusResponse } from '@/lib/api';

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'reddit', name: 'Reddit', color: '#FF4500' },
  { id: 'tiktok', name: 'TikTok', color: '#6366F1' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023' },
  { id: 'tumblr', name: 'Tumblr', color: '#36465D' },
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
  const [headless, setHeadless] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');
  const [starting, setStarting] = useState(false);
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
        use_firecrawl_enrichment: false,
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

  const startPolling = useCallback((sessionId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
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

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const renderToggle = (enabled: boolean, onChange: () => void, label: string, description?: string) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button onClick={onChange} className={cn('relative w-11 h-6 rounded-full transition-colors', enabled ? 'bg-accent' : 'bg-bg-tertiary')}>
        <span className={cn('absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform', enabled && 'translate-x-5')} />
      </button>
    </div>
  );

  if (step === 'running' || step === 'complete') {
    return (
      <div className="p-8 space-y-6 overflow-y-auto h-full">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            {step === 'running' ? 'Extraction in Progress' : 'Extraction Complete'}
          </h1>
          <p className="text-sm text-text-muted mt-1">{name}</p>
        </div>

        {status && (
          <>
            {/* Progress */}
            <div className="bg-bg-secondary rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-secondary rounded-xl border border-border p-5 text-center">
                <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.total_leads}</p>
                <p className="text-xs text-text-muted mt-1">Total Leads</p>
              </div>
              <div className="bg-bg-secondary rounded-xl border border-border p-5 text-center">
                <Mail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.emails_found}</p>
                <p className="text-xs text-text-muted mt-1">Emails Found</p>
              </div>
              <div className="bg-bg-secondary rounded-xl border border-border p-5 text-center">
                <Phone className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary tabular-nums">{status.phones_found}</p>
                <p className="text-xs text-text-muted mt-1">Phones Found</p>
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <div className="flex justify-center gap-3">
            <button onClick={() => { setStep('config'); setStatus(null); setName(''); setKeywords(''); }}
              className="px-5 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-all">
              New Extraction
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">New Extraction</h1>
        <p className="text-sm text-text-muted mt-1">Configure and start a new lead extraction session</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Session Name */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent" />
          Basic Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Session Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., LinkedIn CEO Emails Q1 2026"
              className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Keywords (one per line)</label>
            <textarea value={keywords} onChange={e => setKeywords(e.target.value)}
              placeholder={"CEO email marketing\nCTO contact SaaS\nfounder email fintech"}
              rows={4}
              className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          Platforms
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                selectedPlatforms.includes(p.id)
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-bg-primary hover:border-border-light'
              )}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '15', color: p.color }}>
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
              {selectedPlatforms.includes(p.id) && <CheckCircle className="w-4 h-4 text-accent ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Extraction Settings */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-accent" />
          Extraction Settings
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Pages per Keyword</label>
            <input type="number" value={pagesPerKeyword} onChange={e => setPagesPerKeyword(parseInt(e.target.value) || 3)}
              min={1} max={20}
              className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Delay Between Requests (sec)</label>
            <input type="number" value={delay} onChange={e => setDelay(parseInt(e.target.value) || 2)}
              min={1} max={30}
              className="w-full px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent transition-all" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Export Format</label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}
            className="w-full max-w-xs px-3 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent transition-all">
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <div className="mt-4 divide-y divide-border">
          {renderToggle(useDorking, () => setUseDorking(!useDorking), 'Google Dorking', 'Primary extraction method - search Google for indexed emails/phones')}
          {renderToggle(useDirectScraping, () => setUseDirectScraping(!useDirectScraping), 'Direct Scraping', 'Secondary method - scrape platform pages directly with Patchright')}
          {renderToggle(autoVerify, () => setAutoVerify(!autoVerify), 'Auto-verify Emails', 'Check MX records to verify email deliverability')}
          {renderToggle(useProxies, () => setUseProxies(!useProxies), 'Use Proxies', 'Route requests through proxy servers for anti-detection')}
          {renderToggle(headless, () => setHeadless(!headless), 'Headless Mode', 'Run browser in background (disable to see browser window)')}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-end">
        <button onClick={handleStart} disabled={starting}
          className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/30 disabled:opacity-50"
        >
          {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {starting ? 'Starting Extraction...' : 'Start Extraction'}
        </button>
      </div>
    </div>
  );
}
