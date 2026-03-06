import { useState, useEffect, useCallback } from 'react';
import {
  Key, Plus, Trash2, Search, Copy, Eye, EyeOff, RefreshCw,
  Loader2, AlertCircle, Crown, Users, DollarSign, TrendingUp,
  CheckCircle, XCircle, Clock, Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { fetchLicenses, generateLicenses, revokeLicense, deleteLicense } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { LicenseItem } from '@/lib/api';

export default function ResellerPanel() {
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showKeys, setShowKeys] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ buyer_name: '', buyer_email: '', quantity: 1, max_activations: 1, duration_months: 12 });
  const [showGuide, setShowGuide] = useState(false);
  const { toast } = useToast();

  const loadLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLicenses(statusFilter !== 'all' ? statusFilter : undefined);
      setLicenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load licenses');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadLicenses(); }, [loadLicenses]);

  const handleGenerate = async () => {
    if (!genForm.buyer_name.trim() || !genForm.buyer_email.trim()) {
      toast('warning', 'Please fill in buyer name and email');
      return;
    }
    try {
      setGenerating(true);
      const result = await generateLicenses(genForm);
      toast('success', `Generated ${result.count} license key(s)`);
      setShowGenerate(false);
      setGenForm({ buyer_name: '', buyer_email: '', quantity: 1, max_activations: 1, duration_months: 12 });
      loadLicenses();
    } catch {
      toast('error', 'Failed to generate licenses');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeLicense(id);
      setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: 'revoked' } : l));
      toast('success', 'License revoked');
    } catch { toast('error', 'Failed to revoke license'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLicense(id);
      setLicenses(prev => prev.filter(l => l.id !== id));
      toast('success', 'License deleted');
    } catch { toast('error', 'Failed to delete license'); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast('info', 'License key copied');
  };

  const filtered = licenses.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      return l.key.toLowerCase().includes(q) || l.buyer_name.toLowerCase().includes(q) || l.buyer_email.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    revoked: licenses.filter(l => l.status === 'revoked').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading licenses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load licenses</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadLicenses} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 page-header">
        <div className="flex items-center justify-between px-10 py-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Reseller Panel</h1>
            <p className="text-sm text-text-secondary pt-1">Generate and manage license keys</p>
          </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
        >
          <Plus className="w-4 h-4" />
          Generate Keys
        </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="min-h-full flex flex-col gap-5">
      {/* How to Use */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <button onClick={() => setShowGuide(!showGuide)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-text-primary">How to Use Reseller Panel</span>
          </div>
          {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </button>
        {showGuide && (
          <div className="px-6 pb-6 space-y-6 border-t border-border pt-5">
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-3">What This Page Does</h4>
              <ul className="space-y-3 text-xs text-text-secondary">
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Generate and manage license keys for your customers</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Track active, expired, and revoked licenses in one place</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Control activation limits and license duration per buyer</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-3">How to Generate Keys</h4>
              <ol className="space-y-3 text-xs text-text-secondary">
                <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Click "Generate Keys" in the top right</li>
                <li className="flex gap-2"><span className="text-accent font-bold">2.</span> Enter buyer name and email</li>
                <li className="flex gap-2"><span className="text-accent font-bold">3.</span> Set quantity, max activations, and duration</li>
                <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Click Generate — keys are created instantly</li>
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-3">Managing Keys</h4>
              <ul className="space-y-3 text-xs text-text-secondary">
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Copy:</strong> Click the copy icon to copy a license key to clipboard</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Show/Hide:</strong> Toggle key visibility for security</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Revoke:</strong> Disable an active license without deleting it</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delete:</strong> Permanently remove a license key</li>
              </ul>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-xs text-green-400 font-medium">Tip: Use the status filter to quickly find expired licenses that need renewal. Revoke keys instead of deleting to keep a record.</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: 'Total Keys', value: stats.total, icon: Key, color: '#3B82F6' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: '#10B981' },
          { label: 'Expired', value: stats.expired, icon: Clock, color: '#F59E0B' },
          { label: 'Revoked', value: stats.revoked, icon: XCircle, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="card p-6 shadow-md shadow-black/30 hover:border-[#52525b] hover:shadow-lg hover:shadow-black/20 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '18', color: s.color }}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Form */}
      {showGenerate && (
        <div className="card">
          <div className="px-6 py-5 border-b border-[#3f3f46]">
            <h3 className="text-sm font-bold text-text-primary">Generate License Keys</h3>
          </div>
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-sm font-medium text-text-primary pb-2 block">Buyer Name</label>
              <input type="text" value={genForm.buyer_name} onChange={e => setGenForm(p => ({ ...p, buyer_name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary pb-2 block">Buyer Email</label>
              <input type="email" value={genForm.buyer_email} onChange={e => setGenForm(p => ({ ...p, buyer_email: e.target.value }))}
                className="w-full px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary pb-2 block">Quantity</label>
              <input type="number" value={genForm.quantity} onChange={e => setGenForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                min={1} max={100} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary pb-2 block">Max Activations</label>
              <input type="number" value={genForm.max_activations} onChange={e => setGenForm(p => ({ ...p, max_activations: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                min={1} max={10} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary pb-2 block">Duration (months)</label>
              <select value={genForm.duration_months} onChange={e => setGenForm(p => ({ ...p, duration_months: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                {[1, 3, 6, 12, 24, 36].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-5">
            <button onClick={() => setShowGenerate(false)} className="px-5 py-2.5 bg-bg-card border border-[#3f3f46] rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all">Cancel</button>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-accent/25"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search licenses..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all" />
        </div>
        <div className="flex items-center gap-1 bg-bg-card rounded-xl border border-[#3f3f46] p-1.5">
          <Key className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
          {['all', 'active', 'expired', 'revoked'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap', statusFilter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]')}
            >{f}</button>
          ))}
        </div>
        <button onClick={() => setShowKeys(!showKeys)}
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-[#3f3f46] rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all"
        >
          {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showKeys ? 'Hide' : 'Show'} Keys
        </button>
      </div>

      {/* License Table - fills remaining height */}
      <div className="flex-1 card overflow-hidden flex flex-col min-h-[400px]">
      {filtered.length > 0 ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#3f3f46]">
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">License Key</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Buyer</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Activations</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Expires</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(license => (
                <tr key={license.id} className="border-b border-[#3f3f46]/40 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-text-primary bg-white/[0.04] px-3 py-2 rounded-lg">
                        {showKeys ? license.key : license.key.substring(0, 8) + '...' + license.key.slice(-4)}
                      </code>
                      <button onClick={() => copyKey(license.key)} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-accent transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{license.buyer_name}</p>
                    <p className="text-xs text-text-muted pt-0.5">{license.buyer_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      'px-3.5 py-1.5 rounded-lg text-[11px] font-bold',
                      license.status === 'active' && 'bg-success/10 text-success',
                      license.status === 'expired' && 'bg-warning/10 text-warning',
                      license.status === 'revoked' && 'bg-error/10 text-error'
                    )}>{license.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary tabular-nums">{license.current_activations}/{license.max_activations}</td>
                  <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">{formatDate(license.expires_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {license.status === 'active' && (
                        <button onClick={() => handleRevoke(license.id)} className="p-2 rounded-lg hover:bg-warning/10 text-text-muted hover:text-warning transition-all" title="Revoke">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(license.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-accent/8 flex items-center justify-center">
            <Key className="h-9 w-9 text-accent/50" />
          </div>
          <div>
            <p className="text-base font-bold text-text-primary pb-1.5">No license keys found</p>
            <p className="text-sm text-text-muted max-w-[300px]">Generate keys to start selling</p>
          </div>
          <button onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
          >
            <Plus className="w-4 h-4" />
            Generate First Key
          </button>
        </div>
      )}
      </div>

      {/* Reseller Info */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary pb-1">Reseller Program</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Generate unlimited license keys and sell Social Lead Extractor Pro under your own brand.
              Keys are validated locally using cryptographic signatures - no external server required.
            </p>
            <div className="flex items-center gap-4 pt-3">
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /><span className="text-xs text-text-secondary">Unlimited keys</span></div>
              <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-success" /><span className="text-xs text-text-secondary">100% revenue</span></div>
              <div className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-warning" /><span className="text-xs text-text-secondary">White-label ready</span></div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
