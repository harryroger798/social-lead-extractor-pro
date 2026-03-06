import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Loader2, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { fetchSafetyGuide, fetchLinkedInGuide } from '@/lib/api';

interface PlatformGuide {
  ban_risk: string;
  detection_methods: string[];
  prevention: string[];
  what_happens: string[];
  recommended_limits: Record<string, string>;
}

export default function SafetyGuide() {
  const [guide, setGuide] = useState<{ platforms: Record<string, PlatformGuide>; general_tips: string[] } | null>(null);
  const [linkedinGuide, setLinkedinGuide] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchSafetyGuide().then(setGuide).catch(() => {}),
      fetchLinkedInGuide().then(setLinkedinGuide).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const riskColor = (risk: string) => {
    if (risk.includes('HIGH')) return 'text-red-400 bg-red-500/10';
    if (risk.includes('MEDIUM')) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            Platform Safety Guide
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Comprehensive ban prevention techniques and risk assessment for all platforms
          </p>
        </div>

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use the Safety Guide</span>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showGuide && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What This Page Shows</h4>
                <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Ban risk level for each platform (LOW, MEDIUM, HIGH)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />How platforms detect automated scraping</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Prevention techniques to avoid getting banned</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Recommended limits for safe scraping (requests/day, delay times)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How to Use It</h4>
                <ol className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Read the General Safety Tips that apply to all platforms</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">2.</span> Click on any platform card to expand its detailed guide</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">3.</span> Follow the recommended limits when setting up extractions</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Use the prevention techniques before running large extractions</li>
                </ol>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Always start with small extraction sizes and increase gradually. The app has built-in protections, but following the recommended limits ensures maximum safety.</p>
              </div>
            </div>
          )}
        </div>

        {/* General Tips */}
        {guide?.general_tips && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> General Safety Tips
            </h3>
            <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
              {guide.general_tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Platform Cards */}
        {guide?.platforms && Object.entries(guide.platforms).map(([platform, info]) => {
          const p = info as PlatformGuide;
          const isExpanded = expanded === platform;
          return (
            <div key={platform} className="rounded-xl bg-bg-card border border-border overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : platform)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary capitalize">{platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor(p.ban_risk)}`}>
                    {p.ban_risk}
                  </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
              </button>
              {isExpanded && (
                <div className="px-5 pb-7 space-y-8 border-t border-border pt-6">
                  {p.detection_methods && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-4">Detection Methods</h4>
                      <ul className="space-y-1 text-xs text-text-muted">
                        {p.detection_methods.map((d, i) => (
                          <li key={i} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.prevention && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-4">Prevention Techniques</h4>
                      <ul className="space-y-1 text-xs text-text-muted">
                        {p.prevention.map((prev, i) => (
                          <li key={i} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{prev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.what_happens && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-4">What Happens If Caught</h4>
                      <ul className="space-y-1 text-xs text-text-muted">
                        {p.what_happens.map((w, i) => (
                          <li key={i} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.recommended_limits && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-4">Recommended Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(p.recommended_limits).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1.5 px-3 rounded-lg bg-bg-primary">
                            <span className="text-text-muted capitalize">{k.replace(/_/g, ' ')}</span>
                            <span className="text-text-secondary font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* LinkedIn Guide */}
        {linkedinGuide && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">LinkedIn Specific Guide</h3>
            <p className="text-xs text-text-muted">
              Primary method: Google Dorking (zero ban risk). Direct scraping is HIGH risk.
              We use the dorking approach exclusively to keep your LinkedIn account safe.
            </p>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-[13px] leading-relaxed text-green-400 font-medium">
                Google Dorking extracts LinkedIn profile data through Google search results — LinkedIn never sees automated requests from your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
