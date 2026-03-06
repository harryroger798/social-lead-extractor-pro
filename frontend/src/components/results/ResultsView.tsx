import { useState, useEffect, useCallback } from 'react';
import {
  Search, Trash2, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Database, Mail, Phone, ExternalLink,
  CheckCircle, XCircle, Filter, Info, ChevronDown,
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
  const [showGuide, setShowGuide] = useState(false);
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
      <div className="shrink-0 page-header">
        <div className="flex items-center justify-between px-10 py-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Results</h1>
            <p className="text-sm text-text-secondary pt-1">{total.toLocaleString()} leads extracted</p>
          </div>
          <div className="flex items-center gap-1.5 bg-bg-card rounded-xl border border-[#3f3f46] p-1.5">
            <Download className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
            <span className="text-[11px] text-text-muted font-medium mr-1">Export:</span>
            {['csv', 'xlsx', 'json'].map(fmt => (
              <button key={fmt} onClick={() => handleExport(fmt)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/[0.04] border border-[#3f3f46] text-text-secondary hover:text-text-primary hover:border-[#52525b] transition-all"
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
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
            <span className="text-sm font-semibold text-text-primary">How to Use Results</span>
          </div>
          {showGuide ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </button>
        {showGuide && (
          <div className="px-6 pb-7 space-y-8 border-t border-border pt-6">
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">What This Page Shows</h4>
              <ul className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />All extracted leads with email, phone, name, platform, and quality score</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Verification status showing which emails have been confirmed deliverable</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />Source links to view the original page where the lead was found</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-4">Available Actions</h4>
              <ul className="text-[13px] leading-relaxed text-text-secondary">
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Search:</strong> Filter leads by email, name, or any text</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Platform Filter:</strong> View leads from a specific platform only</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Export:</strong> Download as CSV, XLSX, or JSON. Select specific leads or export all</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Select &amp; Bulk:</strong> Use checkboxes to select specific leads for targeted export</li>
                <li className="flex gap-3 py-2 border-b border-white/5 last:border-0"><span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" /><strong className="text-text-primary">Delete:</strong> Remove individual leads with the trash icon</li>
              </ul>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
              <p className="text-[13px] leading-relaxed text-green-400 font-medium">Tip: Use the quality score to prioritize high-value leads. Scores above 70 indicate verified, complete contact info.</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text" placeholder="Search leads..." value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-bg-card rounded-xl border border-[#3f3f46] p-1.5 overflow-x-auto">
          <Filter className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" />
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => handlePlatformChange(p)}
              className={cn(
                                'px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap',
                                platform === p ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              )}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Table Container - fills remaining height */}
      <div className="flex-1 card overflow-hidden flex flex-col min-h-[400px]">
      {leads.length > 0 ? (
        <>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3f3f46]">
                    <th className="px-5 py-4 text-left">
                      <input type="checkbox" checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-[#3f3f46] bg-bg-primary text-accent focus:ring-accent/20"
                      />
                    </th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Contact</th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Platform</th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Keyword</th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Quality</th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Verified</th>
                    <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-b border-[#3f3f46]/40 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selected.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 rounded border-[#3f3f46] bg-bg-primary text-accent focus:ring-accent/20"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
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
                        <span className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/[0.04] text-text-secondary capitalize">{lead.platform}</span>
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
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-[#3f3f46]">
            <p className="text-xs text-text-muted">
              Showing {((page - 1) * 50) + 1}-{Math.min(page * 50, total)} of {total.toLocaleString()} results
              {selected.size > 0 && <span className="ml-2 text-accent font-medium">({selected.size} selected)</span>}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2.5 rounded-lg bg-bg-secondary border border-[#3f3f46] hover:border-[#52525b] text-text-secondary disabled:opacity-30 transition-all"
              ><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-text-muted tabular-nums px-2">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2.5 rounded-lg bg-bg-secondary border border-[#3f3f46] hover:border-[#52525b] text-text-secondary disabled:opacity-30 transition-all"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-accent/8 flex items-center justify-center">
            <Database className="h-9 w-9 text-accent/50" />
          </div>
          <div>
            <p className="text-base font-bold text-text-primary pb-1.5">No leads found</p>
            <p className="text-sm text-text-muted max-w-[300px]">Run an extraction to start collecting leads</p>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'extraction' }))}
                      className="inline-flex items-center gap-2.5 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
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
