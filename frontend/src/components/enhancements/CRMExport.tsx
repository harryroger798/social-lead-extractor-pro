import { useState } from 'react';
import { Database, Upload, Loader2, CheckCircle, AlertCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { exportToCRM, testCRMConnection, fetchResults } from '@/lib/api';

export default function CRMExport() {
  const [crmType, setCrmType] = useState('hubspot');
  const [apiKey, setApiKey] = useState('');
  const [sfUsername, setSfUsername] = useState('');
  const [sfPassword, setSfPassword] = useState('');
  const [sfToken, setSfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [exportResult, setExportResult] = useState<{ exported: number; failed: number; errors: string[] } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testCRMConnection(crmType, apiKey);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: String(e) });
    } finally { setTesting(false); }
  };

  const handleExport = async () => {
    setLoading(true);
    setExportResult(null);
    try {
      const results = await fetchResults({ page: 1, page_size: 5000 });
      const leadIds = results.leads.map(l => l.id);
      if (leadIds.length === 0) {
        setExportResult({ exported: 0, failed: 0, errors: ['No leads found to export'] });
        setLoading(false);
        return;
      }
      const res = await exportToCRM({
        lead_ids: leadIds,
        crm_type: crmType,
        api_key: apiKey,
        username: sfUsername,
        password: sfPassword,
        security_token: sfToken,
      });
      setExportResult(res);
    } catch (e) {
      setExportResult({ exported: 0, failed: 0, errors: [String(e)] });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-400" />
            </div>
            CRM Export
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Export leads to HubSpot (free tier) or Salesforce</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="max-w-[840px] space-y-8">

        {/* How to Use */}
        <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
          <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">How to Use CRM Export</span>
            </div>
            {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </button>
          {showGuide && (
            <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What You Need</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />A free HubSpot account (supports up to 1M contacts) OR Salesforce Developer Edition</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />Your API key or Private App Token from HubSpot, or Salesforce credentials</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />Leads in your database (extract some leads first if empty)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">How to Get HubSpot API Key (Free)</h4>
                <ol className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">1.</span> Sign up at hubspot.com (free CRM tier)</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">2.</span> Go to Settings &gt; Integrations &gt; Private Apps</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">3.</span> Create a Private App, give it "Contacts" read/write scope</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-accent font-bold">4.</span> Copy the token (starts with pat-na1-... or pat-na2-...)</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-4">What Each Option Does</h4>
                <ul className="text-[13px] leading-relaxed text-text-secondary">
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Test Connection:</strong> Verifies your API key works before exporting</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Export All Leads:</strong> Sends all leads from your database to HubSpot/Salesforce as contacts</li>
                  <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">HubSpot vs Salesforce:</strong> HubSpot is simpler (just an API key). Salesforce needs username + password + security token</li>
                </ul>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Always click "Test Connection" first to verify your credentials before exporting leads.</p>
              </div>
            </div>
          )}
        </div>

        {/* CRM Type */}
        <div className="rounded-xl bg-bg-card border border-border p-8">
          <h3 className="text-sm font-semibold text-text-primary mb-7">Select CRM</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setCrmType('hubspot')} className={`p-4 rounded-xl border text-left transition-all ${crmType === 'hubspot' ? 'border-orange-500/50 bg-orange-500/5' : 'border-border bg-bg-primary hover:border-border/80'}`}>
              <p className="text-sm font-semibold text-text-primary">HubSpot</p>
              <p className="text-xs text-text-muted mt-1">Free CRM — 1M contacts</p>
            </button>
            <button onClick={() => setCrmType('salesforce')} className={`p-4 rounded-xl border text-left transition-all ${crmType === 'salesforce' ? 'border-blue-500/50 bg-blue-500/5' : 'border-border bg-bg-primary hover:border-border/80'}`}>
              <p className="text-sm font-semibold text-text-primary">Salesforce</p>
              <p className="text-xs text-text-muted mt-1">Developer Edition (free)</p>
            </button>
          </div>
        </div>

        {/* Credentials */}
        <div className="rounded-xl bg-bg-card border border-border p-8">
          <h3 className="text-sm font-semibold text-text-primary mb-7">API Credentials</h3>
          <div className="space-y-7">
          {crmType === 'hubspot' ? (
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-4">HubSpot API Key (or Private App Token)</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="pat-na1-..." className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <p className="text-xs text-text-muted mt-2">Get it from HubSpot &gt; Settings &gt; Integrations &gt; Private Apps</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-4">Username</label>
                <input type="text" value={sfUsername} onChange={e => setSfUsername(e.target.value)} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-4">Password</label>
                <input type="password" value={sfPassword} onChange={e => setSfPassword(e.target.value)} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-4">Security Token</label>
                <input type="text" value={sfToken} onChange={e => setSfToken(e.target.value)} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleTest} disabled={testing} className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors flex items-center gap-2 disabled:opacity-50">
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Test Connection
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2 text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult.message}
            </div>
          )}
          </div>
        </div>

        {/* Export Button */}
        <button onClick={handleExport} disabled={loading} className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Exporting...' : `Export All Leads to ${crmType === 'hubspot' ? 'HubSpot' : 'Salesforce'}`}
        </button>

        {exportResult && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-2">
            <p className="text-sm text-text-primary font-semibold">Export Results</p>
            <p className="text-xs text-green-400">{exportResult.exported} leads exported</p>
            {exportResult.failed > 0 && <p className="text-xs text-red-400">{exportResult.failed} failed</p>}
            {exportResult.errors.length > 0 && (
              <div className="text-xs text-red-400 space-y-1">
                {exportResult.errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
