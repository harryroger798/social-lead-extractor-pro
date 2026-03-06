import { useState, useEffect } from 'react';
import { MessageCircle, Users, Loader2, AlertTriangle, BookOpen, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { extractTelegram, fetchTelegramSetup } from '@/lib/api';

export default function TelegramScraper() {
  const [form, setForm] = useState({
    api_id: '', api_hash: '', phone_number: '', group_username: '',
    max_members: 500, delay: 5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [setup, setSetup] = useState<{ steps: string[]; ban_prevention: string[]; limitations: string[]; cost: string } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchTelegramSetup().then(setSetup).catch(() => {});
  }, []);

  const handleExtract = async () => {
    if (!form.api_id || !form.api_hash || !form.phone_number || !form.group_username) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await extractTelegram({
        api_id: Number(form.api_id), api_hash: form.api_hash,
        phone_number: form.phone_number, group_username: form.group_username,
        max_members: form.max_members, delay: form.delay,
      });
      setResult(`Extraction started! Session: ${res.session_id}. Check Results tab for extracted members.`);
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-sky-400" />
            </div>
            Telegram Group Scraper
          </h2>
          <p className="text-sm text-text-muted mt-2">Extract members from Telegram groups using Telethon (MTProto API)</p>
        </div>

        {/* Ban Risk */}
        <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-300">Ban Risk: MEDIUM</p>
              <p className="text-xs text-text-muted mt-1">
                Built-in protections: 3-10s delays, max 5 groups/day, FloodWait auto-handling. Use an established account (6+ months old).
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use Telegram Scraper</span>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showGuide && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What You Need</h4>
                <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />A Telegram account (6+ months old recommended)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />API ID and API Hash from my.telegram.org</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />The username or link of a public Telegram group</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How to Get API Credentials</h4>
                <ol className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Go to my.telegram.org and log in with your phone number</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">2.</span> Click "API development tools"</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">3.</span> Fill in app title and short name (anything works)</li>
                  <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Copy your API ID (numbers) and API Hash (letters+numbers)</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
                <ul className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">API ID/Hash:</strong> Your Telegram developer credentials (free, one-time setup)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Phone Number:</strong> Your Telegram account phone for authentication</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Group Username:</strong> The @username or t.me link of the target group</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Max Members:</strong> Limit how many members to extract (lower = safer)</li>
                  <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delay:</strong> Wait time between requests. 5+ seconds recommended</li>
                </ul>
              </div>
              <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3">
                <p className="text-xs text-yellow-400 font-medium">Tip: You get usernames, names, phone numbers (if visible), and user IDs. Max 5 groups per day to stay safe.</p>
              </div>
            </div>
          )}
        </div>

        {/* Setup Guide Toggle */}
        <button onClick={() => setShowSetup(!showSetup)} className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors">
          <BookOpen className="w-4 h-4" /> {showSetup ? 'Hide' : 'Show'} Setup Guide
        </button>

        {showSetup && setup && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Setup Instructions</h3>
            <ol className="space-y-4 text-[13px] leading-relaxed text-text-secondary">
              {setup.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="text-accent font-bold">{i + 1}.</span> {s}</li>)}
            </ol>
            <h4 className="text-xs font-semibold text-text-primary pt-2">Ban Prevention Tips</h4>
            <ul className="space-y-1 text-xs text-text-muted">
              {setup.ban_prevention.map((t, i) => <li key={i} className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />{t}</li>)}
            </ul>
            <p className="text-[13px] leading-relaxed text-green-400 font-medium">Cost: {setup.cost}</p>
          </div>
        )}

        {/* Credentials */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary">Telegram API Credentials</h3>
          <p className="text-xs text-text-muted">Get these from <a href="https://my.telegram.org" target="_blank" rel="noopener" className="text-accent underline">my.telegram.org</a> &gt; API development tools</p>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">API ID</label>
              <input type="text" value={form.api_id} onChange={e => setForm({...form, api_id: e.target.value})} placeholder="12345678" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">API Hash</label>
              <input type="password" value={form.api_hash} onChange={e => setForm({...form, api_hash: e.target.value})} placeholder="abc123..." className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-3">Phone Number (with country code)</label>
            <input type="text" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} placeholder="+1234567890" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
        </div>

        {/* Group */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" /> Target Group
          </h3>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-3">Group Username or Link</label>
            <input type="text" value={form.group_username} onChange={e => setForm({...form, group_username: e.target.value})} placeholder="python_developers or t.me/python_developers" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">Max Members</label>
              <input type="number" value={form.max_members} onChange={e => setForm({...form, max_members: Number(e.target.value)})} min={10} max={5000} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-3">Delay (seconds)</label>
              <input type="number" value={form.delay} onChange={e => setForm({...form, delay: Number(e.target.value)})} min={3} max={15} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <button onClick={handleExtract} disabled={loading} className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            {loading ? 'Extracting...' : 'Extract Members'}
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
