import { useState, useEffect, useCallback } from 'react';
import {
  Clock, Trash2, Search, Filter, Loader2, AlertCircle,
  FolderOpen, Mail, Phone, CheckCircle, XCircle, Pause, Play,
} from 'lucide-react';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { fetchHistory, deleteSession } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { SessionItem } from '@/lib/api';

const STATUS_FILTERS = ['all', 'completed', 'running', 'failed', 'paused'];

export default function History() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHistory(statusFilter);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      toast('success', 'Session deleted');
    } catch {
      toast('error', 'Failed to delete session');
    }
  };

  const filtered = sessions.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.keywords.some(k => k.toLowerCase().includes(q));
    }
    return true;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'running': return <Play className="w-4 h-4 text-accent" />;
      case 'failed': return <XCircle className="w-4 h-4 text-error" />;
      case 'paused': return <Pause className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load history</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadHistory} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none border-b border-border bg-bg-secondary/50 backdrop-blur-sm">
        <div className="px-8 py-5">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Extraction History</h1>
          <p className="text-sm text-text-secondary mt-1">Browse and manage past extraction sessions</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text" placeholder="Search sessions..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-bg-secondary rounded-lg border border-border p-1.5">
          <Filter className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f} onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3.5 py-2 rounded-md text-xs font-medium transition-all capitalize whitespace-nowrap',
                statusFilter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-bg-secondary rounded-xl border border-border p-5 hover:border-border-light transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {statusIcon(s.status)}
                    <h3 className="text-sm font-semibold text-text-primary truncate">{s.name}</h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-semibold',
                      s.status === 'completed' && 'bg-success/10 text-success',
                      s.status === 'running' && 'bg-accent/10 text-accent',
                      s.status === 'failed' && 'bg-error/10 text-error',
                      s.status === 'paused' && 'bg-warning/10 text-warning'
                    )}>{s.status}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(s.started_at)}</span>
                    {s.duration > 0 && <span>Duration: {formatDuration(s.duration)}</span>}
                    <span className="capitalize">Platforms: {s.platforms.join(', ')}</span>
                    <span>Keywords: {s.keywords.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                      <span className="text-sm font-semibold text-text-primary tabular-nums">{s.emails_found}</span>
                      <span className="text-xs text-text-muted">emails</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-success" />
                      <span className="text-sm font-semibold text-text-primary tabular-nums">{s.phones_found}</span>
                      <span className="text-xs text-text-muted">phones</span>
                    </div>
                    <div className="text-xs text-text-muted">
                      Total: <span className="font-semibold text-text-primary tabular-nums">{s.total_leads}</span> leads
                    </div>
                  </div>

                  {s.status === 'running' && (
                    <div className="mt-3 w-full max-w-xs">
                      <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                      </div>
                      <p className="text-xs text-accent mt-1 font-medium tabular-nums">{s.progress}% complete</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-base font-semibold text-text-secondary">No sessions found</p>
          <p className="text-sm text-text-muted">Start a new extraction to see history here</p>
        </div>
      )}
      </div>
    </div>
  );
}
