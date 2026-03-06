import { useState } from 'react';
import { MapPin, Search, Loader2, Building2, Phone, Globe, Star, AlertTriangle } from 'lucide-react';
import { searchGoogleMaps, getExtractionStatus } from '@/lib/api';

export default function GoogleMapsExtractor() {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [delay, setDelay] = useState(3);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{ total_leads: number; emails_found: number; phones_found: number } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStatus('running');
    setResult(null);
    try {
      const res = await searchGoogleMaps({ query, max_results: maxResults, delay });
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const s = await getExtractionStatus(res.session_id);
          if (s.status === 'completed' || s.status === 'failed') {
            clearInterval(poll);
            setStatus(s.status);
            setResult({ total_leads: s.total_leads, emails_found: s.emails_found, phones_found: s.phones_found });
            setLoading(false);
          }
        } catch {
          clearInterval(poll);
          setLoading(false);
          setStatus('failed');
        }
      }, 3000);
    } catch {
      setLoading(false);
      setStatus('failed');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            Google Maps Extractor
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Extract business listings from Google Maps — phones, websites, addresses, ratings
          </p>
        </div>

        {/* Safety Note */}
        <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-300">Ban Risk: LOW-MEDIUM</p>
              <p className="text-xs text-text-muted mt-1">
                Uses Selenium headless with random delays and User-Agent rotation. Proxy rotation recommended for high-volume scraping.
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            Search Query
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Search Term</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., restaurants in New York, dentists near Miami FL"
                className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Max Results</label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  min={5}
                  max={200}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Delay (seconds)</label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  min={1}
                  max={15}
                  step={0.5}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Extracting...' : 'Search Google Maps'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Extraction Results</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-bg-primary p-4 text-center">
                <Building2 className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{result.total_leads}</p>
                <p className="text-xs text-text-muted">Businesses</p>
              </div>
              <div className="rounded-lg bg-bg-primary p-4 text-center">
                <Phone className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{result.phones_found}</p>
                <p className="text-xs text-text-muted">Phones</p>
              </div>
              <div className="rounded-lg bg-bg-primary p-4 text-center">
                <Globe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-primary">{result.emails_found}</p>
                <p className="text-xs text-text-muted">Emails</p>
              </div>
            </div>
            <p className="text-xs text-text-muted">
              Results saved to your leads database. View them in the Results tab.
            </p>
          </div>
        )}

        {status === 'failed' && !loading && (
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">Extraction failed. Make sure ChromeDriver is installed and try again.</p>
          </div>
        )}

        {/* What you get */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            What You Get
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Business Name</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Phone Number</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Website URL</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Address</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Rating & Reviews</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Business Category</div>
          </div>
        </div>
      </div>
    </div>
  );
}
