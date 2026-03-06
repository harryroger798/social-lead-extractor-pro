import { useState } from 'react';
import { Globe, Search, Loader2, Mail, Phone, AlertCircle } from 'lucide-react';
import { crawlWebsiteEmails } from '@/lib/api';

export default function EmailFinder() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ emails: string[]; phones: string[] } | null>(null);
  const [error, setError] = useState('');

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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-teal-400" />
            </div>
            Website Email Finder
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Crawl any website to extract email addresses and phone numbers. Checks /contact, /about, /team pages automatically.
          </p>
        </div>

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

        {/* Search */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" /> Crawl Website
          </h3>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Website URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">Max Pages to Crawl</label>
            <input type="number" value={maxPages} onChange={e => setMaxPages(Number(e.target.value))} min={1} max={50} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <button onClick={handleCrawl} disabled={loading || !url.trim()} className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Crawling...' : 'Find Emails & Phones'}
          </button>
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
  );
}
