import { useState } from 'react';
import { CheckSquare, Loader2, Search, ExternalLink } from 'lucide-react';
import { checkCitations } from '@/lib/api';

export default function CitationChecker() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: { source: string; url: string }[];
    not_found: string[];
    score: number;
    grade: string;
    recommendations: string[];
  } | null>(null);

  const handleCheck = async () => {
    if (!businessName.trim()) return;
    setLoading(true);
    try {
      const data = await checkCitations({
        business_name: businessName.trim(),
        location: location.trim(),
        phone: phone.trim(),
      });
      setResult(data);
    } catch (err) {
      console.error('Citation check failed:', err);
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
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <CheckSquare className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Citation Checker</h2>
          <p className="text-sm text-text-muted">Check business listings across 30+ directories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g., Joe's Pizza"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g., New York, NY"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Phone (optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
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
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Citation Report</h3>
          {result ? (
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
                        <span className="text-text-primary">{f.source}</span>
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
                        {nf}
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
  );
}
