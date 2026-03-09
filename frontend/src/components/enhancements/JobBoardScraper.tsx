import { useState } from 'react';
import { Briefcase, Search, Loader2, MapPin } from 'lucide-react';
import { searchJobBoards, getExtractionStatus } from '@/lib/api';

const JOB_SOURCES = [
  { id: 'indeed', name: 'Indeed', color: 'text-blue-400' },
  { id: 'glassdoor', name: 'Glassdoor', color: 'text-emerald-400' },
  { id: 'craigslist', name: 'Craigslist', color: 'text-purple-400' },
  { id: 'olx', name: 'OLX', color: 'text-amber-400' },
];

export default function JobBoardScraper() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['indeed', 'glassdoor']);
  const [maxResults, setMaxResults] = useState(50);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<{ total: number; emails: number; phones: number } | null>(null);

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSearch = async () => {
    if (!query.trim() || selectedSources.length === 0) return;
    setLoading(true);
    setStatus('Starting job board search...');
    setResult(null);

    try {
      const res = await searchJobBoards({
        query: query.trim(),
        location: location.trim(),
        sources: selectedSources.join(','),
        max_results: maxResults,
      });

      const sessionId = res.session_id;
      let complete = false;
      while (!complete) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await getExtractionStatus(sessionId);
        setStatus(statusRes.status_message || `Progress: ${statusRes.progress}%`);
        if (statusRes.status === 'completed' || statusRes.status === 'failed') {
          complete = true;
          setResult({
            total: statusRes.total_leads,
            emails: statusRes.emails_found,
            phones: statusRes.phones_found,
          });
        }
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-400" />
            </div>
            Job Board Scraper
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Find hiring companies from Indeed, Glassdoor, Craigslist & OLX</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-card rounded-xl border border-border p-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Search Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., Marketing Manager, Software Developer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Job Boards</label>
            <div className="flex flex-wrap gap-2">
              {JOB_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSources.includes(source.id)
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-bg-input border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {source.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Max Results</label>
            <input
              type="number"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              min={10}
              max={200}
              className="w-32 px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="w-4 h-4" /> Search Job Boards</>
            )}
          </button>

          {status && <p className="text-xs text-text-muted text-center">{status}</p>}
        </div>

        {/* Results Summary */}
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Results</h3>
          {result ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-2xl font-bold text-accent">{result.total}</p>
                <p className="text-xs text-text-muted">Hiring Companies Found</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xl font-bold text-emerald-400">{result.emails}</p>
                <p className="text-xs text-text-muted">Emails Found</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-xl font-bold text-blue-400">{result.phones}</p>
                <p className="text-xs text-text-muted">Phones Found</p>
              </div>
              <p className="text-xs text-text-muted">
                View your leads in the Results page
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Search job boards for hiring companies</p>
              <p className="text-xs mt-1 opacity-60">Great for B2B lead generation</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
