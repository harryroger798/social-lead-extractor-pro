import { useState, useEffect, useCallback } from 'react';
import {
  Clock, Trash2, Search, Filter, Loader2, AlertCircle,
  FolderOpen, Mail, Phone, CheckCircle, XCircle, Pause, Play, Zap,
  Info, ChevronDown, ChevronRight,
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
  const [showGuide, setShowGuide] = useState(false);
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
        <button onClick={loadHistory} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Extraction History</h1>
          <p className="text-sm text-text-secondary pt-1">Browse and manage past extraction sessions</p>
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
            <span className="text-sm font-semibold text-text-primary">How to Use History</span>
          </div>
          {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </button>
        {showGuide && (
          <div className="px-6 pb-5 space-y-4 border-t border-border pt-4">
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-2">What This Page Shows</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />All past extraction sessions with their status, duration, and lead counts</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Progress bars for currently running extractions</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Keywords and platforms used in each session</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-2">Available Actions</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Search:</strong> Find sessions by name or keyword</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Filter by Status:</strong> Show only completed, running, failed, or paused sessions</li>
                <li className="flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delete:</strong> Remove a session and its data with the trash icon</li>
              </ul>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
              <p className="text-xs text-green-400 font-medium">Tip: Completed sessions keep all their leads in the Results tab. Deleting a session here also removes its leads.</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text" placeholder="Search sessions..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-bg-card rounded-xl border border-[#3f3f46] p-1.5">
          <Filter className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f} onClick={() => setStatusFilter(f)}
              className={cn(
                                'px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap',
                                statusFilter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              )}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Sessions List - fills remaining height */}
      <div className="flex-1 card overflow-hidden flex flex-col min-h-[400px]">
      {filtered.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {filtered.map(s => (
            <div key={s.id} className="card-elevated p-6 hover:border-[#71717a] transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 pb-2">
                    {statusIcon(s.status)}
                    <h3 className="text-sm font-semibold text-text-primary truncate">{s.name}</h3>
                    <span className={cn(
                      'px-3.5 py-1.5 rounded-lg text-[11px] font-bold',
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

                  <div className="flex items-center gap-6 pt-3">
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
                    <div className="pt-3 w-full max-w-xs">
                      <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                      </div>
                      <p className="text-xs text-accent pt-1 font-medium tabular-nums">{s.progress}% complete</p>
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
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-accent/8 flex items-center justify-center">
            <FolderOpen className="h-9 w-9 text-accent/50" />
          </div>
          <div>
            <p className="text-base font-bold text-text-primary pb-1.5">No sessions found</p>
            <p className="text-sm text-text-muted max-w-[300px]">Start a new extraction to see history here</p>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'extraction' }))}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
          >
            <Zap className="w-4 h-4" />
            New Extraction
          </button>
        </div>
      )}
      </div>
      </div>
      </div>
    </div>
  );
}
