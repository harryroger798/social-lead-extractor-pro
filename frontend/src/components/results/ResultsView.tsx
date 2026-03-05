import { useState, useEffect, useCallback } from 'react';
import {
  Search, Trash2, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Database, Mail, Phone, ExternalLink,
  CheckCircle, XCircle, Filter,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { fetchResults, deleteLead, exportResults } from '@/lib/api';
import { useToast } from '@/components/ui/useToast';
import type { LeadItem } from '@/lib/api';

const PLATFORMS = ['all','linkedin','facebook','instagram','twitter','tiktok','youtube','pinterest','tumblr','reddit'];

export default function ResultsView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchResults({ page, page_size: 50, search: search || undefined, platform: platform !== 'all' ? platform : undefined });
      setLeads(data.leads);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [page, search, platform]);

  useEffect(() => { loadResults(); }, [loadResults]);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handlePlatformChange = (val: string) => { setPlatform(val); setPage(1); };

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      setTotal(prev => prev - 1);
      selected.delete(id);
      setSelected(new Set(selected));
      toast('success', 'Lead deleted');
    } catch { toast('error', 'Failed to delete lead'); }
  };

  const handleExport = async (format: string) => {
    try {
      const selectedIds = selected.size > 0 ? Array.from(selected) : undefined;
      const blob = await exportResults({ format, leads_ids: selectedIds });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast('success', `Exported ${selectedIds ? selectedIds.length : total} leads as ${format.toUpperCase()}`);
    } catch { toast('error', 'Export failed'); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading results...</p>
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load results</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadResults} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-[8px] text-sm font-medium transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-bg-secondary/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">Results</h1>
            <p className="text-sm text-text-secondary mt-0.5">{total.toLocaleString()} leads extracted</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg border border-white/[0.08] p-1.5">
            <Download className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
            <span className="text-[11px] text-text-muted font-medium mr-1">Export:</span>
            {['csv', 'xlsx', 'json'].map(fmt => (
              <button key={fmt} onClick={() => handleExport(fmt)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-text-secondary hover:text-text-primary hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
      <div className="min-h-full flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text" placeholder="Search leads..." value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/[0.08] p-1 overflow-x-auto">
          <Filter className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => handlePlatformChange(p)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize whitespace-nowrap',
                platform === p ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.06]'
              )}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Table Container - fills remaining height */}
      <div className="flex-1 bg-bg-card rounded-xl border border-white/[0.08] overflow-hidden flex flex-col min-h-[400px]">
      {leads.length > 0 ? (
        <>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-tertiary/30">
                    <th className="px-5 py-3.5 text-left">
                      <input type="checkbox" checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-border bg-bg-primary text-accent focus:ring-accent/20"
                      />
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Contact</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Platform</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Keyword</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Quality</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Verified</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Date</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-bg-tertiary/20 transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selected.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-border bg-bg-primary text-accent focus:ring-accent/20"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="text-sm text-text-primary truncate max-w-48">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              <span className="text-sm text-text-primary">{lead.phone}</span>
                            </div>
                          )}
                          {lead.name && <p className="text-xs text-text-muted">{lead.name}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-bg-tertiary text-text-secondary capitalize">{lead.platform}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-secondary">{lead.keyword}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-14 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', lead.quality_score >= 70 ? 'bg-success' : lead.quality_score >= 40 ? 'bg-warning' : 'bg-error')} style={{ width: `${lead.quality_score}%` }} />
                          </div>
                          <span className="text-xs text-text-muted tabular-nums">{lead.quality_score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {lead.verified ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-text-muted" />}
                      </td>
                      <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">{formatDate(lead.extracted_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {lead.source_url && (
                            <a href={lead.source_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-accent transition-all">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => handleDelete(lead.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-text-muted">
              Showing {((page - 1) * 50) + 1}-{Math.min(page * 50, total)} of {total.toLocaleString()} results
              {selected.size > 0 && <span className="ml-2 text-accent font-medium">({selected.size} selected)</span>}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2.5 rounded-lg bg-bg-secondary border border-border hover:border-border-light text-text-secondary disabled:opacity-30 transition-all"
              ><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-text-muted tabular-nums px-2">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2.5 rounded-lg bg-bg-secondary border border-border hover:border-border-light text-text-secondary disabled:opacity-30 transition-all"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/[0.08] flex items-center justify-center">
            <Database className="h-7 w-7 text-accent/60" />
          </div>
          <p className="text-base font-semibold text-text-primary">No leads found</p>
          <p className="text-sm text-text-muted max-w-[280px]">Run an extraction to start collecting leads</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'extraction' }))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 text-white rounded-lg text-sm font-medium transition-all mt-2"
          >
            <Search className="w-4 h-4" />
            Start New Extraction
          </button>
        </div>
      )}
      </div>
      </div>
      </div>
    </div>
  );
}
