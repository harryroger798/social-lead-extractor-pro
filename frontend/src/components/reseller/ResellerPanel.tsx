import { useState } from 'react';
import {
  Crown,
  Key,
  Plus,
  Copy,
  Trash2,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { LicenseKey } from '@/types';

const MOCK_LICENSES: LicenseKey[] = [
  {
    id: '1',
    key: 'SLEP-A1B2-C3D4-E5F6',
    status: 'active',
    buyer_name: 'John Smith',
    buyer_email: 'john@example.com',
    activated_at: '2026-02-15T10:00:00Z',
    expires_at: '2027-02-15T10:00:00Z',
    max_activations: 1,
    current_activations: 1,
    created_at: '2026-02-14T08:00:00Z',
  },
  {
    id: '2',
    key: 'SLEP-G7H8-I9J0-K1L2',
    status: 'active',
    buyer_name: 'Sarah Connor',
    buyer_email: 'sarah@techco.io',
    activated_at: '2026-02-20T14:00:00Z',
    expires_at: '2027-02-20T14:00:00Z',
    max_activations: 3,
    current_activations: 2,
    created_at: '2026-02-19T09:00:00Z',
  },
  {
    id: '3',
    key: 'SLEP-M3N4-O5P6-Q7R8',
    status: 'expired',
    buyer_name: 'Mike Johnson',
    buyer_email: 'mike@agency.com',
    activated_at: '2025-01-01T10:00:00Z',
    expires_at: '2026-01-01T10:00:00Z',
    max_activations: 1,
    current_activations: 1,
    created_at: '2024-12-30T10:00:00Z',
  },
  {
    id: '4',
    key: 'SLEP-S9T0-U1V2-W3X4',
    status: 'active',
    buyer_name: 'Lisa Chen',
    buyer_email: 'lisa@startup.co',
    activated_at: null,
    expires_at: '2027-03-01T00:00:00Z',
    max_activations: 1,
    current_activations: 0,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: '5',
    key: 'SLEP-Y5Z6-A7B8-C9D0',
    status: 'revoked',
    buyer_name: 'Bad Actor',
    buyer_email: 'refund@fake.com',
    activated_at: '2026-02-25T10:00:00Z',
    expires_at: '2027-02-25T10:00:00Z',
    max_activations: 1,
    current_activations: 0,
    created_at: '2026-02-24T10:00:00Z',
  },
];

export default function ResellerPanel() {
  const [licenses, setLicenses] = useState<LicenseKey[]>(MOCK_LICENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);

  // Generator form state
  const [genBuyerName, setGenBuyerName] = useState('');
  const [genBuyerEmail, setGenBuyerEmail] = useState('');
  const [genMaxActivations, setGenMaxActivations] = useState(1);
  const [genDuration, setGenDuration] = useState(12);
  const [genQuantity, setGenQuantity] = useState(1);

  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      searchQuery === '' ||
      lic.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.buyer_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.status === 'active').length,
    expired: licenses.filter((l) => l.status === 'expired').length,
    revoked: licenses.filter((l) => l.status === 'revoked').length,
    revenue: licenses.filter((l) => l.status === 'active').length * 29,
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `SLEP-${segment()}-${segment()}-${segment()}`;
  };

  const handleGenerate = () => {
    const newLicenses: LicenseKey[] = Array.from({ length: genQuantity }, () => ({
      id: Date.now().toString() + Math.random().toString(36),
      key: generateKey(),
      status: 'active' as const,
      buyer_name: genBuyerName || 'Unassigned',
      buyer_email: genBuyerEmail || '',
      activated_at: null,
      expires_at: new Date(Date.now() + genDuration * 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_activations: genMaxActivations,
      current_activations: 0,
      created_at: new Date().toISOString(),
    }));
    setLicenses([...newLicenses, ...licenses]);
    setShowGenerator(false);
    setGenBuyerName('');
    setGenBuyerEmail('');
    setGenMaxActivations(1);
    setGenQuantity(1);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const revokeLicense = (id: string) => {
    setLicenses(licenses.map((l) => (l.id === id ? { ...l, status: 'revoked' as const, current_activations: 0 } : l)));
  };

  const deleteLicense = (id: string) => {
    setLicenses(licenses.filter((l) => l.id !== id));
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Reseller Panel</h2>
            <p className="text-sm text-text-secondary mt-0.5">Manage license keys and track sales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? 'Hide Keys' : 'Show Keys'}
          </button>
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Keys
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Keys', value: stats.total, icon: Key, color: 'text-text-primary' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-success' },
          { label: 'Expired', value: stats.expired, icon: Clock, color: 'text-warning' },
          { label: 'Revoked', value: stats.revoked, icon: XCircle, color: 'text-error' },
          { label: 'Est. Revenue', value: `$${stats.revenue}`, icon: DollarSign, color: 'text-success' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-bg-secondary rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Key Generator */}
      {showGenerator && (
        <div className="bg-bg-secondary rounded-xl border border-accent/30 p-6 mb-6">
          <h3 className="text-base font-semibold text-text-primary mb-4">Generate New License Keys</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Buyer Name</label>
              <input
                type="text"
                value={genBuyerName}
                onChange={(e) => setGenBuyerName(e.target.value)}
                placeholder="Customer name (optional)"
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Buyer Email</label>
              <input
                type="email"
                value={genBuyerEmail}
                onChange={(e) => setGenBuyerEmail(e.target.value)}
                placeholder="customer@email.com (optional)"
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Max Activations</label>
              <input
                type="number"
                value={genMaxActivations}
                onChange={(e) => setGenMaxActivations(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Duration (months)</label>
              <select
                value={genDuration}
                onChange={(e) => setGenDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
              >
                <option value={1}>1 Month</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={999}>Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Quantity</label>
              <input
                type="number"
                value={genQuantity}
                onChange={(e) => setGenQuantity(Number(e.target.value))}
                min={1}
                max={250}
                className="w-full px-4 py-2.5 bg-bg-primary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Key className="w-4 h-4" />
              Generate {genQuantity} Key{genQuantity > 1 ? 's' : ''}
            </button>
            <button
              onClick={() => setShowGenerator(false)}
              className="px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys, names, emails..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* License Keys Table */}
      <div className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">License Key</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Buyer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Activations</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLicenses.map((license) => (
              <tr key={license.id} className="border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <span className="font-mono text-text-primary text-xs">
                      {showKeys ? license.key : license.key.replace(/[A-Z0-9]/g, '*').substring(0, 19)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(license.key, license.id)}
                      className="p-1 rounded hover:bg-bg-primary text-text-muted hover:text-text-primary transition-colors"
                    >
                      <Copy className={cn('w-3 h-3', copiedId === license.id && 'text-success')} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-text-primary text-xs">{license.buyer_name}</p>
                  <p className="text-text-muted text-xs">{license.buyer_email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      license.status === 'active' && 'bg-success/20 text-success',
                      license.status === 'expired' && 'bg-warning/20 text-warning',
                      license.status === 'revoked' && 'bg-error/20 text-error'
                    )}
                  >
                    {license.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-secondary text-xs">
                    {license.current_activations} / {license.max_activations}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">{formatDate(license.expires_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {license.status === 'active' && (
                      <button
                        onClick={() => revokeLicense(license.id)}
                        className="p-1.5 rounded hover:bg-warning/10 text-text-muted hover:text-warning transition-colors"
                        title="Revoke"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteLicense(license.id)}
                      className="p-1.5 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No license keys found</p>
          <p className="text-sm text-text-muted mt-1">Generate keys to start selling</p>
        </div>
      )}

      {/* Reseller Info */}
      <div className="mt-6 bg-bg-secondary rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Reseller Program</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Generate unlimited license keys and sell Social Lead Extractor Pro under your own brand.
              You keep 100% of the revenue. Keys are validated locally using cryptographic signatures -
              no external server required. Set your own pricing, create your own sales page, and build
              your business.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-text-secondary">Up to 250 free keys</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-text-secondary">100% revenue share</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs text-text-secondary">White-label ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
