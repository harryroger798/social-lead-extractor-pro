import { useState } from 'react';
import { MailCheck, Loader2, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { checkSMTPDeliverability } from '@/lib/api';

export default function SMTPChecker() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    rating: string;
    summary: string;
    issues: string[];
    recommendations: string[];
    spf?: { found: boolean; record: string };
    dkim?: { found: boolean };
    dmarc?: { found: boolean; record: string };
  } | null>(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const isEmail = input.includes('@');
      const data = await checkSMTPDeliverability(
        isEmail ? { email: input.trim() } : { domain: input.trim() }
      );
      setResult(data);
    } catch (err) {
      console.error('SMTP check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const ratingColor = (rating: string) => {
    if (rating === 'excellent') return 'text-emerald-400';
    if (rating === 'good') return 'text-blue-400';
    if (rating === 'fair') return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <MailCheck className="w-5 h-5 text-indigo-400" />
            </div>
            SMTP Deliverability Checker
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Check SPF, DKIM, and DMARC records for any domain</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary pb-3">Domain or Email</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-input border border-[#3f3f46] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="e.g., gmail.com or user@company.com"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading || !input.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
            ) : (
              <><Shield className="w-4 h-4" /> Check Deliverability</>
            )}
          </button>

          <div className="bg-accent/5 border border-accent/10 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-text-primary mb-2">What We Check</h4>
            <div className="space-y-2 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <span className="w-10 text-center font-bold text-blue-400">SPF</span>
                <span>Sender Policy Framework — authorizes mail servers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-center font-bold text-purple-400">DKIM</span>
                <span>DomainKeys — email authentication via digital signatures</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-center font-bold text-amber-400">DMARC</span>
                <span>Domain-based Message Authentication & Reporting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-bg-card rounded-xl border border-border p-7 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Deliverability Report</h3>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-bg-input border border-border">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
                  <p className="text-xs text-text-muted">Score</p>
                </div>
                <div>
                  <p className={`text-sm font-bold ${ratingColor(result.rating)}`}>
                    {result.rating.toUpperCase()}
                  </p>
                  <p className="text-xs text-text-muted">{result.summary}</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'SPF', data: result.spf },
                  { name: 'DKIM', data: result.dkim },
                  { name: 'DMARC', data: result.dmarc },
                ].map((check) => (
                  <div key={check.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-input border border-border">
                    {check.data?.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary">{check.name}</p>
                      {check.data && 'record' in check.data && (check.data as { record?: string }).record && (
                        <p className="text-[10px] text-text-muted truncate">{String((check.data as { record?: string }).record)}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${check.data?.found ? 'text-emerald-400' : 'text-red-400'}`}>
                      {check.data?.found ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>

              {result.issues.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Issues Found
                  </p>
                  <ul className="text-xs text-text-muted space-y-1">
                    {result.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs font-medium text-accent mb-1.5">Recommendations</p>
                  <ul className="text-xs text-text-muted space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <MailCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter a domain or email to check</p>
              <p className="text-xs mt-1 opacity-60">SPF, DKIM, and DMARC verification</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
