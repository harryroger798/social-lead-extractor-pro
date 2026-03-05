import { useState } from 'react';
import {
  Download,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Lead } from '@/types';

const MOCK_LEADS: Lead[] = Array.from({ length: 50 }, (_, i) => ({
  id: `lead-${i + 1}`,
  email: [
    'john.doe@gmail.com', 'sarah.marketing@outlook.com', 'info@techstartup.io',
    'hello@designstudio.co', 'contact@realestate.com', 'mike.founder@yahoo.com',
    'lisa.agency@hotmail.com', 'team@saascompany.com', 'support@ecomstore.com',
    'ceo@innovate.co',
  ][i % 10],
  phone: i % 3 === 0 ? `+1${String(2125550100 + i)}` : '',
  name: [
    'John Doe', 'Sarah Mitchell', 'Tech Startup Inc', 'Design Studio Co',
    'Real Estate Group', 'Mike Johnson', 'Lisa Chen', 'SaaS Company',
    'Ecom Store LLC', 'Innovation Labs',
  ][i % 10],
  platform: (['linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'reddit', 'tiktok', 'pinterest', 'tumblr'] as const)[i % 9],
  source_url: `https://example.com/profile/${i + 1}`,
  keyword: ['marketing agency', 'real estate agent', 'SaaS founder', 'design studio', 'tech startup'][i % 5],
  country: ['US', 'UK', 'CA', 'AU', 'DE'][i % 5],
  email_type: (['personal', 'business', 'unknown'] as const)[i % 3],
  verified: i % 4 !== 3,
  quality_score: 60 + (i % 40),
  extracted_at: new Date(Date.now() - i * 3600000).toISOString(),
  session_id: `session-${Math.floor(i / 10) + 1}`,
}));

type SortKey = 'email' | 'name' | 'platform' | 'quality_score' | 'extracted_at';

export default function ResultsView() {
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('extracted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pageSize = 15;

  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        searchQuery === '' ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);
      const matchesPlatform = platformFilter === 'all' || lead.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === paginatedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeads(next);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronUp className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-accent" />
    ) : (
      <ChevronDown className="w-3 h-3 text-accent" />
    );
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Results</h2>
          <p className="text-sm text-text-secondary mt-1">
            {filteredLeads.length} leads found {selectedLeads.size > 0 && `(${selectedLeads.size} selected)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedLeads.size > 0 && (
            <button className="flex items-center gap-2 px-3 py-2 bg-error/20 text-error rounded-lg text-sm font-medium hover:bg-error/30 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete ({selectedLeads.size})
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search emails, names, phones..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="youtube">YouTube</option>
            <option value="reddit">Reddit</option>
            <option value="tiktok">TikTok</option>
            <option value="pinterest">Pinterest</option>
            <option value="tumblr">Tumblr</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-bg-secondary rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-secondary z-10">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border accent-accent"
                />
              </th>
              {[
                { key: 'email' as SortKey, label: 'Email' },
                { key: 'name' as SortKey, label: 'Name' },
                { key: 'platform' as SortKey, label: 'Platform' },
                { key: 'quality_score' as SortKey, label: 'Score' },
                { key: 'extracted_at' as SortKey, label: 'Date' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer group hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon column={key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Verified</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                className={cn(
                  'border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors',
                  selectedLeads.has(lead.id) && 'bg-accent/5'
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => toggleSelect(lead.id)}
                    className="rounded border-border accent-accent"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    <span className="text-text-primary truncate max-w-48">{lead.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary truncate max-w-32">{lead.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-bg-primary text-text-secondary capitalize">
                    {lead.platform}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-bold',
                      lead.quality_score >= 80 ? 'text-success' : lead.quality_score >= 60 ? 'text-warning' : 'text-error'
                    )}
                  >
                    {lead.quality_score}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">{formatDate(lead.extracted_at)}</td>
                <td className="px-4 py-3">
                  {lead.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-text-muted" />
                      <span className="text-text-secondary text-xs">{lead.phone}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.verified ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-text-muted" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(lead.email, lead.id)}
                      className="p-1.5 rounded hover:bg-bg-primary text-text-muted hover:text-text-primary transition-colors"
                      title="Copy email"
                    >
                      <Copy className={cn('w-3.5 h-3.5', copiedId === lead.id && 'text-success')} />
                    </button>
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-bg-primary text-text-muted hover:text-text-primary transition-colors"
                      title="Open source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-shrink-0">
        <p className="text-sm text-text-muted">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of{' '}
          {filteredLeads.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
            if (page > totalPages || page < 1) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
