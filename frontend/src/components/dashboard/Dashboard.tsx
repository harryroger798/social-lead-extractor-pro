import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Phone, Users, TrendingUp, Zap,
  ArrowUpRight, Clock, Loader2, AlertCircle, BarChart3, Search,
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
    <div className="bg-bg-card rounded-xl border border-white/[0.08] p-6 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-text-primary tracking-tight tabular-nums">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 pt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              <span className="text-xs text-success font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '12', color }}>
          <Icon className="w-6 h-6" />
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-bg-secondary/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">Dashboard</h1>
            <p className="text-sm text-text-secondary mt-0.5">Overview of your lead extraction activity</p>
          </div>
          <button
            onClick={() => onNavigate('extraction')}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
          >
            <Zap className="w-4 h-4" />
            New Extraction
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-6">
        {/* Stat Cards - 4 per row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Leads" value={stats.total_leads} icon={Users} color="#3B82F6" />
          <StatCard title="Leads Today" value={stats.leads_today} icon={TrendingUp} color="#10B981" />
          <StatCard title="Emails Found" value={stats.total_emails} icon={Mail} color="#8B5CF6" />
          <StatCard title="Phones Found" value={stats.total_phones} icon={Phone} color="#F59E0B" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-bg-card rounded-xl border border-white/[0.08]">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-primary">Leads by Platform</h3>
              <span className="text-[11px] text-text-muted px-2.5 py-1 rounded-md bg-white/[0.04] font-medium">All Time</span>
            </div>
            <div className="p-6">
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
            <div className="flex flex-col items-center pt-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/[0.08] flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-accent/60" />
                </div>
                <p className="text-sm text-text-muted">Add platforms to start collecting leads</p>
                <button onClick={() => onNavigate('extraction')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-accent/20">
                  <Search className="w-3.5 h-3.5" />
                  Start Extraction
                </button>
              </div>
          )}
          </div>
        </div>

          <div className="bg-bg-card rounded-xl border border-white/[0.08]">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-medium text-text-primary">Emails vs Phones</h3>
            </div>
            <div className="p-6">
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
            <div className="flex flex-col items-center pt-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/[0.08] flex items-center justify-center">
                  <Mail className="w-7 h-7 text-accent/60" />
                </div>
                <p className="text-sm text-text-muted">No contact data yet</p>
              </div>
          )}
            </div>
        </div>
      </div>

        <div className="bg-bg-card rounded-xl border border-white/[0.08]">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">7-Day Extraction Trend</h3>
          <div className="flex items-center gap-5 mr-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-accent" /><span className="text-xs text-text-muted font-medium">Emails</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-success" /><span className="text-xs text-text-muted font-medium">Phones</span></div>
          </div>
        </div>
        <div className="p-6">
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
      </div>

        {/* Recent Extractions - Full Width Table */}
        <div className="bg-bg-card rounded-xl border border-white/[0.08] overflow-hidden min-h-[280px]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-text-primary">Recent Extractions</h3>
            <button onClick={() => onNavigate('history')} className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">View All</button>
          </div>
          {stats.recent_sessions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-tertiary/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Session</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Platforms</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Leads</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_sessions.map((s: SessionItem) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-bg-tertiary/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-text-primary">{s.name}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-text-secondary capitalize">{s.platforms.join(', ')}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={cn(
                        'px-2.5 py-1 rounded-[6px] text-[11px] font-semibold capitalize',
                        s.status === 'completed' && 'bg-success/10 text-success',
                        s.status === 'running' && 'bg-accent/10 text-accent',
                        s.status === 'failed' && 'bg-error/10 text-error',
                        s.status === 'paused' && 'bg-warning/10 text-warning'
                      )}>{s.status}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-semibold text-text-primary tabular-nums">{s.total_leads}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(s.started_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/[0.08] flex items-center justify-center mb-5">
                <Search className="w-8 h-8 text-accent/60" />
              </div>
              <p className="text-base font-semibold text-text-primary mb-1.5">No recent extractions</p>
              <p className="text-sm text-text-muted mb-5 max-w-[280px]">Start your first lead extraction to see results here</p>
              <button onClick={() => onNavigate('extraction')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-accent/25"
              >
                <Zap className="w-3.5 h-3.5" />
                Start Extraction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
