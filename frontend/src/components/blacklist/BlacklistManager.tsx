import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, Trash2, Search, Loader2, AlertCircle,
  Mail, Globe, Phone, Hash, X, ShieldPlus,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { fetchBlacklist, addBlacklistEntry, deleteBlacklistEntry } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { BlacklistItem } from '@/lib/api';

const TYPE_FILTERS = ['all', 'email', 'domain', 'phone', 'keyword'];
const TYPE_ICONS: Record<string, React.ElementType> = { email: Mail, domain: Globe, phone: Phone, keyword: Hash };

export default function BlacklistManager() {
  const [entries, setEntries] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ type: 'email', value: '', reason: '' });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const loadBlacklist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlacklist(typeFilter);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { loadBlacklist(); }, [loadBlacklist]);

  const handleAdd = async () => {
    if (!newEntry.value.trim()) { toast('warning', 'Please enter a value'); return; }
    try {
      setAdding(true);
      const result = await addBlacklistEntry(newEntry);
      setEntries(prev => [{ id: result.id, ...newEntry, added_at: new Date().toISOString() }, ...prev]);
      setNewEntry({ type: 'email', value: '', reason: '' });
      setShowAdd(false);
      toast('success', 'Entry added to blacklist');
    } catch {
      toast('error', 'Failed to add entry');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlacklistEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast('success', 'Entry removed from blacklist');
    } catch {
      toast('error', 'Failed to delete entry');
    }
  };

  const filtered = entries.filter(e => {
    if (search) return e.value.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading blacklist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load blacklist</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadBlacklist} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Blacklist Manager</h1>
            <p className="text-sm text-text-secondary mt-1">Block emails, domains, phones, or keywords from extraction</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-semibold transition-all shadow-lg shadow-accent/25">
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-8 flex flex-col gap-6">

      {/* Add Entry Modal */}
      {showAdd && (
        <div className="bg-bg-secondary rounded-[10px] border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Add Blacklist Entry</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-bg-tertiary text-text-muted"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Type</label>
              <select
                value={newEntry.type} onChange={e => setNewEntry(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="email">Email</option>
                <option value="domain">Domain</option>
                <option value="phone">Phone</option>
                <option value="keyword">Keyword</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Value</label>
              <input
                type="text" value={newEntry.value} onChange={e => setNewEntry(p => ({ ...p, value: e.target.value }))}
                placeholder={newEntry.type === 'email' ? 'spam@example.com' : newEntry.type === 'domain' ? 'example.com' : 'Enter value...'}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">Reason (optional)</label>
              <input
                type="text" value={newEntry.reason} onChange={e => setNewEntry(p => ({ ...p, reason: e.target.value }))}
                placeholder="Why block this?"
                className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleAdd} disabled={adding} className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all disabled:opacity-50">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add to Blacklist
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text" placeholder="Search entries..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-bg-tertiary border border-border rounded-[8px] text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-bg-secondary rounded-[8px] border border-border p-1.5">
          {TYPE_FILTERS.map(f => (
            <button
              key={f} onClick={() => setTypeFilter(f)}
              className={cn(
                'px-3.5 py-2 rounded-[6px] text-xs font-medium transition-all capitalize',
                typeFilter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Entries List - fills remaining height */}
      <div className="flex-1 bg-bg-secondary rounded-[10px] border border-border overflow-hidden flex flex-col min-h-[400px]">
      {filtered.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(entry => {
            const Icon = TYPE_ICONS[entry.type] || Hash;
            return (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-[10px] border border-border hover:border-border-light transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-[8px] bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{entry.value}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-bg-tertiary text-text-muted capitalize">{entry.type}</span>
                      {entry.reason && <span className="text-xs text-text-muted truncate">{entry.reason}</span>}
                      <span className="text-xs text-text-muted">{formatDate(entry.added_at)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-[10px] bg-bg-tertiary/50 flex items-center justify-center">
            <Shield className="w-10 h-10 text-text-muted" />
          </div>
          <p className="text-base font-semibold text-text-secondary">No blacklist entries</p>
          <p className="text-sm text-text-muted mb-2">Add entries to filter out unwanted results</p>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all shadow-lg shadow-accent/20"
          >
            <ShieldPlus className="w-4 h-4" />
            Add First Entry
          </button>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
