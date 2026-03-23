import { useState } from 'react';
import { CheckSquare, Loader2, Search, ExternalLink } from 'lucide-react';
import { checkCitations } from '@/lib/api';

export default function CitationChecker() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: { name: string; domain: string; importance: string; url: string; error?: string }[];
    not_found: { name: string; domain: string; importance: string; url: string; error?: string }[];
    score: number;
    grade: string;
    recommendations: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!businessName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await checkCitations({
        business_name: businessName.trim(),
        location: location.trim(),
        phone: phone.trim(),
      });
      // Defensive: ensure arrays exist even if backend returns unexpected shape
      setResult({
        found: Array.isArray(data.found) ? data.found : [],
        not_found: Array.isArray(data.not_found) ? data.not_found : [],
        score: data.score ?? 0,
        grade: data.grade ?? 'N/A',
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      });
    } catch (err) {
      console.error('Citation check failed:', err);
      setError(err instanceof Error ? err.message : 'Citation check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-emerald-400';
    if (grade === 'B' || grade === 'B+') return 'text-blue-400';
    if (grade === 'C' || grade === 'C+') return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            Citation Checker
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Check business listings across 30+ directories</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., Joe's Pizza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Phone (optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., (555) 123-4567"
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading || !businessName.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Checking Citations...</>
            ) : (
              <><Search className="w-4 h-4" /> Check Citations</>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Citation Report</h3>
          {error ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-sm text-red-400 font-medium">Citation check failed</p>
              <p className="text-xs text-text-muted mt-1">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-bg-input border border-border">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</p>
                  <p className="text-xs text-text-muted">Grade</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{result.score}%</p>
                  <p className="text-xs text-text-muted">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400">{result.found.length}</p>
                  <p className="text-xs text-text-muted">Found</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{result.not_found.length}</p>
                  <p className="text-xs text-text-muted">Missing</p>
                </div>
              </div>

              {result.found.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2">Found On ({result.found.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.found.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/5 text-xs">
                        <span className="text-text-primary">{f.name}</span>
                        {f.url && (
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.not_found.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-2">Missing From ({result.not_found.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.not_found.map((nf, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-red-500/5 text-xs text-red-400 border border-red-500/10">
                        {nf.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs font-medium text-accent mb-1.5">Recommendations</p>
                  <ul className="text-xs text-text-muted space-y-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter a business name to check citations</p>
              <p className="text-xs mt-1 opacity-60">We check 30+ directories</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
