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
  Clock,
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
    { date: 'Feb 27', emails: 120, phones: 45 },
    { date: 'Feb 28', emails: 185, phones: 62 },
    { date: 'Mar 01', emails: 210, phones: 78 },
    { date: 'Mar 02', emails: 165, phones: 55 },
    { date: 'Mar 03', emails: 298, phones: 95 },
    { date: 'Mar 04', emails: 245, phones: 88 },
    { date: 'Mar 05', emails: 342, phones: 112 },
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

const PIE_COLORS = ['#3B82F6', '#10B981'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
  gradient?: string;
}

function StatCard({ title, value, change, icon: Icon, color, gradient }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-5 hover:border-border-light transition-all duration-200 group relative overflow-hidden">
      {gradient && (
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: gradient }} />
      )}
      <div className="flex items-start justify-between relative">
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{typeof value === 'number' ? formatNumber(value) : value}</p>
          {change && (
            <div className="flex items-center gap-1 pt-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              <span className="text-xs text-success font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15', color }}>
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

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h2>
          <p className="text-sm text-text-muted mt-1">Overview of your lead extraction activity</p>
        </div>
        <button
          onClick={() => onNavigate('extraction')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
        >
          <Zap className="w-4 h-4" />
          New Extraction
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.total_leads} change="+12.5% this week" icon={Users} color="#3B82F6" gradient="linear-gradient(135deg, #3B82F6, #06B6D4)" />
        <StatCard title="Leads Today" value={stats.leads_today} change="+8.3% vs yesterday" icon={TrendingUp} color="#10B981" gradient="linear-gradient(135deg, #10B981, #34D399)" />
        <StatCard title="Emails Found" value={stats.total_emails} icon={Mail} color="#8B5CF6" gradient="linear-gradient(135deg, #8B5CF6, #A78BFA)" />
        <StatCard title="Phones Found" value={stats.total_phones} icon={Phone} color="#F59E0B" gradient="linear-gradient(135deg, #F59E0B, #FBBF24)" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Verified Emails" value={stats.verified_emails} change="84.7% rate" icon={CheckCircle} color="#10B981" />
        <StatCard title="Sessions Done" value={stats.sessions_completed} icon={Activity} color="#EC4899" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Platform Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-bg-secondary rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Leads by Platform</h3>
            <span className="text-xs text-text-muted px-2.5 py-1 rounded-lg bg-bg-tertiary">All Time</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.platform_breakdown} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="platform" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px', padding: '10px 14px' }}
                labelStyle={{ color: '#94A3B8', fontWeight: 600 }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.platform_breakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Email vs Phone Pie Chart */}
        <div className="bg-bg-secondary rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Emails vs Phones</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={emailPhoneData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {emailPhoneData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary font-medium">Emails ({formatNumber(stats.total_emails)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-xs text-text-secondary font-medium">Phones ({formatNumber(stats.total_phones)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">7-Day Extraction Trend</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-text-muted">Emails</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-text-muted">Phones</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={stats.daily_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px', padding: '10px 14px' }}
            />
            <Line type="monotone" dataKey="emails" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#1E293B' }} />
            <Line type="monotone" dataKey="phones" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#1E293B' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sessions */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">Recent Extractions</h3>
          <button onClick={() => onNavigate('history')} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-2.5">
          {stats.recent_sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-border hover:border-border-light transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{session.name}</h4>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-semibold',
                      session.status === 'completed' && 'bg-success/10 text-success',
                      session.status === 'running' && 'bg-accent/10 text-accent',
                      session.status === 'failed' && 'bg-error/10 text-error',
                      session.status === 'paused' && 'bg-warning/10 text-warning'
                    )}
                  >
                    {session.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted capitalize">{session.platforms.join(', ')}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(session.started_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8 ml-4">
                <div className="text-right">
                  <p className="text-base font-bold text-text-primary">{session.total_leads}</p>
                  <p className="text-xs text-text-muted">leads</p>
                </div>
                {session.status === 'running' && (
                  <div className="w-28">
                    <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${session.progress}%` }} />
                    </div>
                    <p className="text-xs text-accent text-right mt-1 font-medium">{session.progress}%</p>
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
