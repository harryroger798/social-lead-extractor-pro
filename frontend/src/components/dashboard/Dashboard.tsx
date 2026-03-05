import { useState } from 'react';
import {
  Mail,
  Phone,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const MOCK_STATS: DashboardStats = {
  total_leads: 12847,
  leads_today: 342,
  total_emails: 9623,
  total_phones: 3224,
  verified_emails: 8156,
  sessions_completed: 67,
  platform_breakdown: [
    { platform: 'LinkedIn', count: 3420 },
    { platform: 'Facebook', count: 2815 },
    { platform: 'Instagram', count: 1923 },
    { platform: 'Twitter', count: 1567 },
    { platform: 'YouTube', count: 1245 },
    { platform: 'Reddit', count: 892 },
    { platform: 'TikTok', count: 534 },
    { platform: 'Pinterest', count: 312 },
    { platform: 'Tumblr', count: 139 },
  ],
  daily_trend: [
    { date: '2026-02-27', emails: 120, phones: 45 },
    { date: '2026-02-28', emails: 185, phones: 62 },
    { date: '2026-03-01', emails: 210, phones: 78 },
    { date: '2026-03-02', emails: 165, phones: 55 },
    { date: '2026-03-03', emails: 298, phones: 95 },
    { date: '2026-03-04', emails: 245, phones: 88 },
    { date: '2026-03-05', emails: 342, phones: 112 },
  ],
  recent_sessions: [
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
  ],
};

const PLATFORM_COLORS = ['#0A66C2', '#1877F2', '#E4405F', '#1DA1F2', '#FF0000', '#FF4500', '#000000', '#E60023', '#36465D'];

const PIE_COLORS = ['#3B82F6', '#22C55E'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-5 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-text-primary">{typeof value === 'number' ? formatNumber(value) : value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center')} style={{ backgroundColor: color + '20', color }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

interface DashboardProps {
  onNavigate: (section: Section) => void;
}

type Section = import('@/types').Section;

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats] = useState<DashboardStats>(MOCK_STATS);

  const emailPhoneData = [
    { name: 'Emails', value: stats.total_emails },
    { name: 'Phones', value: stats.total_phones },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-sm text-text-secondary mt-1">Overview of your lead extraction activity</p>
        </div>
        <button
          onClick={() => onNavigate('extraction')}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          Quick Start
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.total_leads} change="+12.5% this week" icon={Users} color="#3B82F6" />
        <StatCard title="Leads Today" value={stats.leads_today} change="+8.3% vs yesterday" icon={TrendingUp} color="#22C55E" />
        <StatCard title="Emails Found" value={stats.total_emails} icon={Mail} color="#8B5CF6" />
        <StatCard title="Phones Found" value={stats.total_phones} icon={Phone} color="#F59E0B" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Verified Emails" value={stats.verified_emails} change="84.7% verification rate" icon={CheckCircle} color="#22C55E" />
        <StatCard title="Sessions Completed" value={stats.sessions_completed} icon={Activity} color="#EC4899" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Leads by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.platform_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="platform" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.platform_breakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Email vs Phone Pie Chart */}
        <div className="bg-bg-secondary rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Emails vs Phones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emailPhoneData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {emailPhoneData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary">Emails ({formatNumber(stats.total_emails)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-xs text-text-secondary">Phones ({formatNumber(stats.total_phones)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-bg-secondary rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">7-Day Extraction Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.daily_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }}
            />
            <Line type="monotone" dataKey="emails" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
            <Line type="monotone" dataKey="phones" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sessions */}
      <div className="bg-bg-secondary rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Extractions</h3>
        <div className="space-y-3">
          {stats.recent_sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border hover:border-border-light transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-medium text-text-primary truncate">{session.name}</h4>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      session.status === 'completed' && 'bg-success/20 text-success',
                      session.status === 'running' && 'bg-accent/20 text-accent',
                      session.status === 'failed' && 'bg-error/20 text-error',
                      session.status === 'paused' && 'bg-warning/20 text-warning'
                    )}
                  >
                    {session.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-xs text-text-muted">{session.platforms.join(', ')}</span>
                  <span className="text-xs text-text-muted">{formatDate(session.started_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">{session.total_leads}</p>
                  <p className="text-xs text-text-muted">leads</p>
                </div>
                {session.status === 'running' && (
                  <div className="w-24">
                    <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${session.progress}%` }} />
                    </div>
                    <p className="text-xs text-text-muted text-right mt-1">{session.progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
