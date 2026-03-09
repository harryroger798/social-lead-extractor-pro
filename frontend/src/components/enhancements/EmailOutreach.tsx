import { useState, useEffect } from 'react';
import { Mail, Send, Loader2, Clock, AlertCircle, FileText, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { sendOutreach, fetchOutreachTemplates, fetchOutreachLogs, fetchResults } from '@/lib/api';
import type { OutreachLogItem } from '@/lib/api';

export default function EmailOutreach() {
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [templates, setTemplates] = useState<{ id: string; name: string; subject: string; body: string }[]>([]);
  const [logs, setLogs] = useState<OutreachLogItem[]>([]);
  const [loading, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [form, setForm] = useState({
    subject_template: '', body_template: '',
    smtp_host: 'smtp.gmail.com', smtp_port: 587,
    smtp_username: '', smtp_password: '', from_name: '',
    delay_seconds: 30,
  });

  useEffect(() => {
    fetchOutreachTemplates().then(setTemplates).catch(() => {});
    fetchOutreachLogs().then(setLogs).catch(() => {});
    fetchResults({ page: 1, page_size: 1000 }).then(res => {
      const withEmail = res.leads.filter(l => l.email);
      setLeadIds(withEmail.map(l => l.id));
      setTotalLeads(withEmail.length);
    }).catch(() => {});
  }, []);

  const applyTemplate = (t: { subject: string; body: string }) => {
    setForm(f => ({ ...f, subject_template: t.subject, body_template: t.body }));
  };

  const handleSend = async () => {
    if (!form.smtp_username || !form.smtp_password || !form.subject_template || leadIds.length === 0) return;
    setSending(true);
    try {
      await sendOutreach({ lead_ids: leadIds, ...form, use_tls: true });
      setSent(true);
      fetchOutreachLogs().then(setLogs).catch(() => { /* ignore */ });
    } catch { /* ignore */ } finally { setSending(false); }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-pink-400" />
            </div>
            Auto Email Outreach
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Send personalized emails to your leads via SMTP (free, built-in Python)</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="space-y-8">

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use Email Outreach</span>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showGuide && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What You Need</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />A Gmail account with 2-Step Verification enabled</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />A Gmail App Password (not your regular password)</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />Leads with email addresses in your database</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How to Get a Gmail App Password</h4>
                <ol className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">1.</span> Go to Google Account &gt; Security &gt; 2-Step Verification (enable if not already)</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">2.</span> At the bottom, click "App passwords"</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">3.</span> Name it (e.g. "SnapLeads") and click Create</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">4.</span> Copy the 16-character password and paste it in "App Password" below</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">SMTP Host/Port:</strong> Pre-filled for Gmail (smtp.gmail.com:587). Change only for other providers like Outlook</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">From Name:</strong> The sender name recipients will see in their inbox</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delay:</strong> Wait time between each email. Higher = safer. Gmail allows 500/day</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Templates:</strong> Pre-built email templates with variables like {'{{name}}'} that auto-fill per lead</li>
                </ul>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Start with 5-10 emails to test delivery before sending to all leads. Check your Sent folder to verify.</p>
              </div>
            </div>
          )}
        </div>

        {/* SMTP Settings */}
        <div className="rounded-xl bg-bg-card border border-border p-8">
          <h3 className="text-sm font-semibold text-text-primary mb-7">SMTP Settings</h3>
          <div className="space-y-7">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">SMTP Host</label>
              <input type="text" value={form.smtp_host} onChange={e => setForm({...form, smtp_host: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">SMTP Port</label>
              <input type="number" value={form.smtp_port} onChange={e => setForm({...form, smtp_port: Number(e.target.value)})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">Email / Username</label>
              <input type="email" value={form.smtp_username} onChange={e => setForm({...form, smtp_username: e.target.value})} placeholder="you@gmail.com" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">App Password</label>
              <input type="password" value={form.smtp_password} onChange={e => setForm({...form, smtp_password: e.target.value})} placeholder="App-specific password" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">From Name</label>
              <input type="text" value={form.from_name} onChange={e => setForm({...form, from_name: e.target.value})} placeholder="Your Name" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">Delay Between Emails (sec)</label>
              <input type="number" value={form.delay_seconds} onChange={e => setForm({...form, delay_seconds: Number(e.target.value)})} min={10} max={120} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
          </div>
          </div>
        </div>

        {/* Templates */}
        <div className="rounded-xl bg-bg-card border border-border p-8">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-7">
            <FileText className="w-4 h-4 text-accent" /> Email Templates
          </h3>
          <div className="space-y-7">
          <div className="flex gap-2 flex-wrap">
            {templates.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)} className="px-3 py-1.5 rounded-lg bg-bg-primary border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors">
                {t.name}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-4">Subject (supports {'{{name}}'}, {'{{company}}'} variables)</label>
            <input type="text" value={form.subject_template} onChange={e => setForm({...form, subject_template: e.target.value})} placeholder="Quick intro from {{from_name}}" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-4">Body (HTML supported)</label>
            <textarea value={form.body_template} onChange={e => setForm({...form, body_template: e.target.value})} rows={6} placeholder="<p>Hi {{name}},</p><p>I wanted to reach out...</p>" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none" />
          </div>
          </div>
        </div>

        {/* Send */}
        <div className="rounded-xl bg-bg-card border border-border p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">{totalLeads} leads with email addresses selected</p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              {form.delay_seconds}s delay between sends
            </div>
          </div>
          <button onClick={handleSend} disabled={loading || leadIds.length === 0} className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Sending...' : `Send to ${totalLeads} Leads`}
          </button>
          {sent && <p className="text-xs text-green-400 text-center">Emails queued for sending in background!</p>}
        </div>

        {/* Rate Limiting Warning */}
        <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-300">Rate Limiting</p>
              <p className="text-xs text-text-muted mt-1">Gmail: 500 emails/day. Outlook: 300/day. Default 30-second delay between sends to avoid spam detection.</p>
            </div>
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Recent Outreach Logs</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(0, 20).map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-primary text-xs">
                  <span className="text-text-secondary truncate max-w-[200px]">{l.to_email}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${l.status === 'sent' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {l.status}
                  </span>
                  <span className="text-text-muted">{new Date(l.sent_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
