import { useState } from 'react';
import {
  ShieldBan,
  Plus,
  Trash2,
  Search,
  Mail,
  Globe,
  Phone,
  Tag,
  X,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { BlacklistEntry } from '@/types';

const MOCK_BLACKLIST: BlacklistEntry[] = [
  { id: '1', type: 'domain', value: 'example.com', reason: 'Test domain', added_at: '2026-03-01T10:00:00Z' },
  { id: '2', type: 'email', value: 'spam@fakeemail.com', reason: 'Known spam', added_at: '2026-03-02T11:00:00Z' },
  { id: '3', type: 'domain', value: 'noreply.com', reason: 'No-reply domain', added_at: '2026-03-02T12:00:00Z' },
  { id: '4', type: 'phone', value: '+15555555555', reason: 'Fake number', added_at: '2026-03-03T09:00:00Z' },
  { id: '5', type: 'keyword', value: 'test account', reason: 'Test accounts', added_at: '2026-03-03T14:00:00Z' },
  { id: '6', type: 'domain', value: 'tempmail.com', reason: 'Temporary email service', added_at: '2026-03-04T08:00:00Z' },
  { id: '7', type: 'email', value: 'bounce@invalid.org', reason: 'Bounced email', added_at: '2026-03-04T16:00:00Z' },
  { id: '8', type: 'domain', value: 'mailinator.com', reason: 'Disposable email', added_at: '2026-03-05T10:00:00Z' },
];

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  domain: Globe,
  phone: Phone,
  keyword: Tag,
};

const typeColors: Record<string, string> = {
  email: 'text-accent bg-accent/10',
  domain: 'text-warning bg-warning/10',
  phone: 'text-success bg-success/10',
  keyword: 'text-error bg-error/10',
};

export default function BlacklistManager() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(MOCK_BLACKLIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<BlacklistEntry['type']>('email');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const addEntry = () => {
    if (!newValue.trim()) return;
    const entry: BlacklistEntry = {
      id: Date.now().toString(),
      type: newType,
      value: newValue.trim(),
      reason: newReason.trim() || 'No reason provided',
      added_at: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setNewValue('');
    setNewReason('');
    setShowAddForm(false);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const stats = {
    total: entries.length,
    emails: entries.filter((e) => e.type === 'email').length,
    domains: entries.filter((e) => e.type === 'domain').length,
    phones: entries.filter((e) => e.type === 'phone').length,
    keywords: entries.filter((e) => e.type === 'keyword').length,
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Blacklist Manager</h2>
          <p className="text-sm text-text-muted mt-1">
            {stats.total} entries blocking unwanted results
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Entry'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: ShieldBan, color: 'text-text-primary' },
          { label: 'Emails', value: stats.emails, icon: Mail, color: 'text-accent' },
          { label: 'Domains', value: stats.domains, icon: Globe, color: 'text-warning' },
          { label: 'Phones', value: stats.phones, icon: Phone, color: 'text-success' },
          { label: 'Keywords', value: stats.keywords, icon: Tag, color: 'text-error' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-bg-secondary rounded-xl border border-border p-4 hover:border-border-light transition-all duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-text-primary tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-bg-secondary rounded-xl border border-accent/20 p-6 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Add Blacklist Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as BlacklistEntry['type'])}
              className="px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="email">Email</option>
              <option value="domain">Domain</option>
              <option value="phone">Phone</option>
              <option value="keyword">Keyword</option>
            </select>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={
                newType === 'email' ? 'spam@example.com' :
                newType === 'domain' ? 'example.com' :
                newType === 'phone' ? '+15555555555' :
                'unwanted keyword'
              }
              className="px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Reason (optional)"
              className="px-4 py-2.5 bg-bg-primary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={addEntry}
              disabled={!newValue.trim()}
              className="px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blacklist..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="email">Emails</option>
          <option value="domain">Domains</option>
          <option value="phone">Phones</option>
          <option value="keyword">Keywords</option>
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => {
          const Icon = typeIcons[entry.type];
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-bg-secondary rounded-xl border border-border p-4 hover:border-border-light transition-all duration-200"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[entry.type])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{entry.value}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-text-muted capitalize">{entry.type}</span>
                    <span className="text-xs text-text-muted">{entry.reason}</span>
                    <span className="text-xs text-text-muted">{formatDate(entry.added_at)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-16">
          <ShieldBan className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-sm font-medium text-text-secondary">No blacklist entries found</p>
          <p className="text-xs text-text-muted mt-1.5">Add entries to filter out unwanted results</p>
        </div>
      )}
    </div>
  );
}
