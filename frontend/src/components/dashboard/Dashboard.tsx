import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Phone, Users, TrendingUp, Zap, CheckCircle, Activity,
  ArrowUpRight, Clock, Loader2, AlertCircle, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { fetchDashboardStats } from '@/lib/api';
import type { DashboardStatsResponse, SessionItem } from '@/lib/api';
import type { Section } from '@/types';

const PLATFORM_COLORS = ['#0A66C2','#1877F2','#E4405F','#1DA1F2','#FF0000','#FF4500','#6366F1','#E60023','#36465D'];
const PIE_COLORS = ['#3B82F6','#10B981'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-5 hover:border-border-light transition-all duration-200 group relative overflow-hidden">
      <div className="flex items-start justify-between relative">
        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-text-primary tracking-tight tabular-nums">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
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

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-base font-semibold text-text-primary">Failed to load dashboard</p>
        <p className="text-sm text-text-muted">{error}</p>
        <button onClick={loadStats} className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BarChart3 className="w-12 h-12 text-text-muted" />
        <p className="text-sm text-text-muted">No data available yet</p>
      </div>
    );
  }

  const emailPhoneData = [
    { name: 'Emails', value: stats.total_emails },
    { name: 'Phones', value: stats.total_phones },
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Overview of your lead extraction activity</p>
        </div>
        <button
          onClick={() => onNavigate('extraction')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/20"
        >
          <Zap className="w-4 h-4" />
          New Extraction
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.total_leads} icon={Users} color="#3B82F6" />
        <StatCard title="Leads Today" value={stats.leads_today} icon={TrendingUp} color="#10B981" />
        <StatCard title="Emails Found" value={stats.total_emails} icon={Mail} color="#8B5CF6" />
        <StatCard title="Phones Found" value={stats.total_phones} icon={Phone} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Verified Emails" value={stats.verified_emails}
          change={stats.total_emails > 0 ? `${((stats.verified_emails / stats.total_emails) * 100).toFixed(1)}% rate` : '0%'}
          icon={CheckCircle} color="#10B981"
        />
        <StatCard title="Sessions Done" value={stats.sessions_completed} icon={Activity} color="#EC4899" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-bg-secondary rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Leads by Platform</h3>
            <span className="text-xs text-text-muted px-2.5 py-1 rounded-lg bg-bg-tertiary">All Time</span>
          </div>
          {stats.platform_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.platform_breakdown} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="platform" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.platform_breakdown.map((_e, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-muted text-sm">No platform data yet</div>
          )}
        </div>

        <div className="bg-bg-secondary rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-5">Emails vs Phones</h3>
          {stats.total_emails + stats.total_phones > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={emailPhoneData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {emailPhoneData.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px' }} />
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-muted text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">7-Day Extraction Trend</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-xs text-text-muted">Emails</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-text-muted">Phones</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={stats.daily_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#131C31', border: '1px solid #1E293B', borderRadius: '12px', color: '#F1F5F9', fontSize: '12px' }} />
            <Line type="monotone" dataKey="emails" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} />
            <Line type="monotone" dataKey="phones" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">Recent Extractions</h3>
          <button onClick={() => onNavigate('history')} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">View All</button>
        </div>
        {stats.recent_sessions.length > 0 ? (
          <div className="space-y-2.5">
            {stats.recent_sessions.map((s: SessionItem) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-border hover:border-border-light transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h4 className="text-sm font-semibold text-text-primary truncate">{s.name}</h4>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md text-xs font-semibold',
                      s.status === 'completed' && 'bg-success/10 text-success',
                      s.status === 'running' && 'bg-accent/10 text-accent',
                      s.status === 'failed' && 'bg-error/10 text-error',
                      s.status === 'paused' && 'bg-warning/10 text-warning'
                    )}>{s.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="capitalize">{s.platforms.join(', ')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(s.started_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 ml-4">
                  <div className="text-right">
                    <p className="text-base font-bold text-text-primary tabular-nums">{s.total_leads}</p>
                    <p className="text-xs text-text-muted">leads</p>
                  </div>
                  {s.status === 'running' && (
                    <div className="w-28">
                      <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                      </div>
                      <p className="text-xs text-accent text-right mt-1 font-medium tabular-nums">{s.progress}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><p className="text-sm text-text-muted">No recent extractions</p></div>
        )}
      </div>
    </div>
  );
}
