import { useState, useEffect } from 'react';
import { Smartphone, Users, Loader2, AlertTriangle, Shield, BookOpen, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { extractWhatsApp, fetchWhatsAppSafetyGuide } from '@/lib/api';

export default function WhatsAppScraper() {
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(100);
  const [delay, setDelay] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [guide, setGuide] = useState<{ ban_risk: string; prevention: string[]; what_you_get: string[]; how_to_get_more: string[]; tos_warning: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    fetchWhatsAppSafetyGuide().then(setGuide).catch(() => {});
  }, []);

  const handleExtract = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await extractWhatsApp({ group_name: groupName, max_members: maxMembers, delay });
      setResult(`Extraction started! Session: ${res.session_id}. WhatsApp Web will open — scan QR code to proceed.`);
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            WhatsApp Group Scraper
          </h2>
          <p className="text-sm text-text-muted mt-2">Extract phone numbers and names from WhatsApp groups via WhatsApp Web</p>
        </div>

        {/* CRITICAL Ban Warning */}
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-300">Ban Risk: MEDIUM-HIGH</p>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                WhatsApp actively monitors automated activity. Bans can result in <strong className="text-red-300">permanent account deletion</strong>.
                Use a secondary number, not your primary WhatsApp. Always use slow delays (8-15 seconds).
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowHowTo(!showHowTo)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use WhatsApp Scraper</span>
            </div>
            {showHowTo ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showHowTo && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What You Need</h4>
                <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />A WhatsApp account (use a secondary number, not your main)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />WhatsApp Web access (you'll scan a QR code on first use)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />Be a member of the group you want to extract from</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How It Works</h4>
                <ol className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Enter the exact group name as it appears in your WhatsApp chats</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">2.</span> Set max members and delay (8+ seconds recommended)</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">3.</span> Click "Extract Members" — WhatsApp Web opens in a browser</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Scan the QR code with your phone (first time only)</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">5.</span> Extraction runs automatically. Results saved to Results tab</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
                <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Group Name:</strong> Must exactly match the group name in your chat list</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Max Members:</strong> How many members to extract (10-500). Start with 50 for safety</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delay:</strong> Seconds between each extraction. 8-15s recommended. Higher = safer</li>
                </ul>
              </div>
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                <p className="text-xs text-red-400 font-medium">Warning: Always use a secondary WhatsApp number. Bans can be permanent. Keep delay at 8+ seconds and extract max 100 members per session.</p>
              </div>
            </div>
          )}
        </div>

        {/* Safety Guide */}
        <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors">
          <BookOpen className="w-4 h-4" /> {showGuide ? 'Hide' : 'Show'} Safety Guide & Ban Bypass
        </button>

        {showGuide && guide && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-text-primary">Ban Prevention Techniques</h3>
            </div>
            <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
              {guide.prevention.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">What You Get</h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-text-muted">
                {guide.what_you_get.map((w, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {w}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">How to Get More Numbers Safely</h4>
              <ul className="space-y-1.5 text-xs text-text-muted">
                {guide.how_to_get_more.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
              <p className="text-xs text-red-300 font-medium">{guide.tos_warning}</p>
            </div>
          </div>
        )}

        {/* Extract Form */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" /> Group Details
          </h3>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-3">Group Name (exact match in your chats)</label>
            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="My Business Group" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">Max Members</label>
              <input type="number" value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} min={10} max={500} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">Delay (seconds)</label>
              <input type="number" value={delay} onChange={e => setDelay(Number(e.target.value))} min={5} max={20} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            WhatsApp Web will open in a browser window. You must scan the QR code with your phone the first time.
          </p>
          <button onClick={handleExtract} disabled={loading || !groupName.trim()} className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            {loading ? 'Starting...' : 'Extract Members'}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl p-4 border ${result.startsWith('Error') ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-green-500/5 border-green-500/20 text-green-400'}`}>
            <p className="text-sm">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
