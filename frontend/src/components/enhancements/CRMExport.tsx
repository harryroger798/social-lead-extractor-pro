import { useState } from 'react';
import { Database, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-400" />
            </div>
            CRM Export
          </h2>
          <p className="text-sm text-text-muted mt-2">Export leads to HubSpot (free tier) or Salesforce</p>
        </div>

        {/* CRM Type */}
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Select CRM</h3>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">API Credentials</h3>
          {crmType === 'hubspot' ? (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">HubSpot API Key (or Private App Token)</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="pat-na1-..." className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <p className="text-xs text-text-muted mt-2">Get it from HubSpot &gt; Settings &gt; Integrations &gt; Private Apps</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Username</label>
                <input type="text" value={sfUsername} onChange={e => setSfUsername(e.target.value)} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Password</label>
                <input type="password" value={sfPassword} onChange={e => setSfPassword(e.target.value)} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Security Token</label>
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
  );
}
