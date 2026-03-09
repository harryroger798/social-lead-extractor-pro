import { useState } from 'react';
import { Globe, Search, Loader2, Mail, Phone, AlertCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { crawlWebsiteEmails } from '@/lib/api';

export default function EmailFinder() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ emails: string[]; phones: string[] } | null>(null);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleCrawl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await crawlWebsiteEmails(url, maxPages);
      setResult({ emails: res.emails, phones: res.phones });
    } catch (e) {
      setError(String(e));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-teal-400" />
            </div>
            Website Email Finder
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Crawl any website to extract email addresses and phone numbers. Checks /contact, /about, /team pages automatically.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

        {/* Info */}
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-teal-300">Zero Ban Risk</p>
              <p className="text-xs text-text-muted mt-1">
                Uses httpx + BeautifulSoup to crawl public web pages. No browser automation needed. Completely safe.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use Email Finder</span>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showGuide && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What You Get</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />Email addresses found on the website and its subpages</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />Phone numbers found on contact pages, about pages, etc.</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />One-click copy for each result, all saved to your leads database</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How It Works</h4>
                <ol className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">1.</span> Enter any website URL (e.g. https://example.com)</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">2.</span> Set how many pages to crawl (more pages = more results but slower)</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">3.</span> Click "Find Emails &amp; Phones" — the crawler checks /contact, /about, /team pages automatically</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">4.</span> Results appear instantly with copy buttons for each email/phone</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Website URL:</strong> The domain to crawl. Include https:// for best results</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Max Pages:</strong> How many internal pages to scan (1-50). Contact/about pages are prioritized</li>
                </ul>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: This is completely safe with zero ban risk. It only reads public web pages — no login or automation required.</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="rounded-xl bg-bg-card border border-border p-7">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 pb-6">
            <Search className="w-4 h-4 text-accent" /> Crawl Website
          </h3>
          <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-bg-input border border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Max Pages to Crawl</label>
            <input type="number" value={maxPages} onChange={e => setMaxPages(Number(e.target.value))} min={1} max={50} className="w-full bg-bg-input border border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
          </div>
          <button onClick={handleCrawl} disabled={loading || !url.trim()} className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Crawling...' : 'Find Emails & Phones'}
          </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Emails */}
            <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" /> Emails Found
                </h3>
                <span className="text-xs text-accent font-semibold">{result.emails.length}</span>
              </div>
              {result.emails.length > 0 ? (
                <div className="space-y-1.5">
                  {result.emails.map((email, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg-primary text-xs">
                      <span className="text-text-secondary">{email}</span>
                      <button onClick={() => navigator.clipboard.writeText(email)} className="text-accent hover:text-accent/80 text-xs">Copy</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No emails found on this website</p>
              )}
            </div>

            {/* Phones */}
            <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" /> Phones Found
                </h3>
                <span className="text-xs text-green-400 font-semibold">{result.phones.length}</span>
              </div>
              {result.phones.length > 0 ? (
                <div className="space-y-1.5">
                  {result.phones.map((phone, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-bg-primary text-xs">
                      <span className="text-text-secondary">{phone}</span>
                      <button onClick={() => navigator.clipboard.writeText(phone)} className="text-accent hover:text-accent/80 text-xs">Copy</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No phone numbers found on this website</p>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
