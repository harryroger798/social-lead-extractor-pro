import { useState } from 'react';
import {
  Search,
  Calendar,
  Play,
  Trash2,
  Download,
  Clock,
  Users,
  Mail,
  Phone,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import type { ExtractionSession } from '@/types';

const MOCK_SESSIONS: ExtractionSession[] = [
  {
    id: '1',
    name: 'Marketing Agencies USA',
    status: 'completed',
    platforms: ['linkedin', 'facebook'],
    keywords: ['marketing agency', 'digital marketing'],
    total_leads: 456,
    emails_found: 342,
    phones_found: 114,
    started_at: '2026-03-05T10:30:00Z',
    completed_at: '2026-03-05T11:45:00Z',
    duration: 4500,
    progress: 100,
  },
  {
    id: '2',
    name: 'Real Estate Agents NYC',
    status: 'running',
    platforms: ['linkedin', 'instagram', 'facebook'],
    keywords: ['real estate agent', 'realtor NYC'],
    total_leads: 189,
    emails_found: 145,
    phones_found: 44,
    started_at: '2026-03-05T14:00:00Z',
    completed_at: null,
    duration: 2700,
    progress: 67,
  },
  {
    id: '3',
    name: 'Tech Startups SF',
    status: 'completed',
    platforms: ['linkedin', 'twitter'],
    keywords: ['tech startup', 'SaaS founder'],
    total_leads: 892,
    emails_found: 678,
    phones_found: 214,
    started_at: '2026-03-04T09:00:00Z',
    completed_at: '2026-03-04T12:30:00Z',
    duration: 12600,
    progress: 100,
  },
  {
    id: '4',
    name: 'Fitness Coaches',
    status: 'failed',
    platforms: ['instagram', 'tiktok'],
    keywords: ['fitness coach', 'personal trainer'],
    total_leads: 23,
    emails_found: 18,
    phones_found: 5,
    started_at: '2026-03-03T16:00:00Z',
    completed_at: '2026-03-03T16:15:00Z',
    duration: 900,
    progress: 12,
  },
  {
    id: '5',
    name: 'Photography Studios',
    status: 'completed',
    platforms: ['instagram', 'pinterest', 'facebook'],
    keywords: ['photography studio', 'wedding photographer'],
    total_leads: 567,
    emails_found: 423,
    phones_found: 144,
    started_at: '2026-03-02T11:00:00Z',
    completed_at: '2026-03-02T14:00:00Z',
    duration: 10800,
    progress: 100,
  },
  {
    id: '6',
    name: 'Restaurant Owners LA',
    status: 'completed',
    platforms: ['facebook', 'instagram', 'youtube'],
    keywords: ['restaurant owner', 'chef LA'],
    total_leads: 234,
    emails_found: 178,
    phones_found: 56,
    started_at: '2026-03-01T08:00:00Z',
    completed_at: '2026-03-01T10:30:00Z',
    duration: 9000,
    progress: 100,
  },
];

export default function History() {
  const [sessions] = useState<ExtractionSession[]>(MOCK_SESSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchQuery === '' ||
      session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">History & Sessions</h2>
          <p className="text-sm text-text-muted mt-1">{sessions.length} extraction sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-bg-secondary rounded-xl border border-border p-5 hover:border-border-light transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{session.name}</h3>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0',
                      session.status === 'completed' && 'bg-success/10 text-success',
                      session.status === 'running' && 'bg-accent/10 text-accent',
                      session.status === 'failed' && 'bg-error/10 text-error',
                      session.status === 'paused' && 'bg-warning/10 text-warning'
                    )}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(session.started_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.duration)}
                  </span>
                  <span>Platforms: {session.platforms.join(', ')}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {session.keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-bg-primary rounded-md text-xs text-text-secondary border border-border">
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-medium text-text-primary">{session.total_leads}</span>
                    <span className="text-xs text-text-muted">leads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-medium text-text-primary">{session.emails_found}</span>
                    <span className="text-xs text-text-muted">emails</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-warning" />
                    <span className="text-sm font-medium text-text-primary">{session.phones_found}</span>
                    <span className="text-xs text-text-muted">phones</span>
                  </div>
                </div>

                {/* Progress bar for running sessions */}
                {session.status === 'running' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">Progress</span>
                      <span className="text-xs font-medium text-accent">{session.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${session.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all"
                  title="View results"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all"
                  title="Re-run extraction"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {session.status === 'paused' && (
                  <button
                    className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-all"
                    title="Resume"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
