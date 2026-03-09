import { useState, useEffect } from 'react';
import { Sparkles, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { generateAIEmail, fetchEmailTones, fetchEmailIndustries } from '@/lib/api';

export default function AIEmailWriter() {
  const [tone, setTone] = useState('professional');
  const [industry, setIndustry] = useState('default');
  const [service, setService] = useState('');
  const [fromName, setFromName] = useState('');
  const [tones, setTones] = useState<{ id: string; name: string; description: string }[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEmailTones().then(setTones).catch(() => {});
    fetchEmailIndustries().then(setIndustries).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateAIEmail({ tone, industry, service, from_name: fromName });
      setResult({ subject: data.subject, body: data.body });
    } catch (err) {
      console.error('AI email generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">AI Email Writer</h2>
          <p className="text-sm text-text-muted">Generate personalized cold emails — 100% free, no API needed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Your Name</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Email Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {(tones.length > 0 ? tones : [
                { id: 'professional', name: 'Professional', description: '' },
                { id: 'casual', name: 'Casual', description: '' },
                { id: 'direct', name: 'Direct', description: '' },
                { id: 'value_first', name: 'Value First', description: '' },
                { id: 'referral', name: 'Referral', description: '' },
                { id: 'follow_up', name: 'Follow Up', description: '' },
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    tone === t.id
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-bg-input border-border text-text-muted hover:text-text-primary'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="default">Auto-detect</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind.charAt(0).toUpperCase() + ind.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Service to Pitch (optional)</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-input border border-border text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="e.g., SEO, Web Design, Social Media..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Email</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="bg-bg-card rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Generated Email</h3>
            {result && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs text-text-muted hover:text-accent flex items-center gap-1">
                  <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleGenerate} className="text-xs text-text-muted hover:text-accent flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
            )}
          </div>

          {result ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-bg-input border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Subject</p>
                <p className="text-sm text-text-primary font-medium">{result.subject}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-input border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Body</p>
                <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans">{result.body}</pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Generate a personalized cold email</p>
              <p className="text-xs mt-1 opacity-60">Select a tone and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
