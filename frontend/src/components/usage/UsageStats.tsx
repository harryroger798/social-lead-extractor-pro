import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Search, Download, Zap, Share2, TrendingUp,
  Loader2, AlertCircle, Crown, Shield, Infinity,
} from 'lucide-react';

const API_URL = 'https://snapleads-api.onrender.com';

interface QuotaInfo {
  plan: string;
  quotas: Record<string, number>;
  today: Record<string, number>;
}

interface UsageByAction {
  action: string;
  count: number;
  total_leads: number;
}

interface UsageByPlatform {
  platform: string;
  count: number;
  total_leads: number;
}

interface DailyUsage {
  date: string;
  count: number;
  total_leads: number;
}

interface UsageStatsData {
  by_action: UsageByAction[];
  by_platform: UsageByPlatform[];
  daily: DailyUsage[];
  total_leads: number;
  today_count: number;
}

function getToken(): string | null {
  const saved = localStorage.getItem('snapleads_account');
  if (!saved) return null;
  try {
    return JSON.parse(saved).token;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data as T;
}

const ACTION_ICONS: Record<string, typeof Search> = {
  search: Search,
  export: Download,
  enrichment: Zap,
  share: Share2,
};

const ACTION_COLORS: Record<string, string> = {
  search: 'text-blue-400',
  export: 'text-emerald-400',
  enrichment: 'text-purple-400',
  share: 'text-amber-400',
};

function formatQuotaValue(value: number): string {
  if (value === -1) return 'Unlimited';
  return value.toLocaleString();
}

function QuotaBar({ label, used, limit, icon: Icon }: { label: string; used: number; limit: number; icon: typeof Search }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = !isUnlimited && pct >= 80;
  const isAtLimit = !isUnlimited && pct >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${isAtLimit ? 'text-error' : isNearLimit ? 'text-amber-400' : 'text-text-secondary'}`}>
          {used} / {isUnlimited ? <Infinity className="w-4 h-4 inline" /> : formatQuotaValue(limit)}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-error' : isNearLimit ? 'bg-amber-400' : 'bg-accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-success/40 w-full" />
        </div>
      )}
    </div>
  );
}

export default function UsageStats() {
  const [quotas, setQuotas] = useState<QuotaInfo | null>(null);
  const [stats, setStats] = useState<UsageStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [quotaData, statsData] = await Promise.all([
        apiFetch<QuotaInfo>('/api/usage/quotas'),
        apiFetch<UsageStatsData>('/api/usage/stats'),
      ]);
      setQuotas(quotaData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!token) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <BarChart3 className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Usage & Quotas</h2>
          <p className="text-sm text-text-secondary mb-6">
            Sign in from the Account page to view your usage statistics and quota limits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Usage & Quotas</h1>
          <p className="text-sm text-text-secondary mt-1">Track your daily usage and plan limits</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading && !quotas ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : (
          <>
            {/* Plan Banner */}
            {quotas && (
              <div className={`card p-6 border-l-4 ${quotas.plan === 'pro' ? 'border-l-amber-400' : 'border-l-accent'}`}>
                <div className="flex items-center gap-3">
                  {quotas.plan === 'pro' ? (
                    <Crown className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Shield className="w-6 h-6 text-accent" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary capitalize">{quotas.plan} Plan</h3>
                    <p className="text-xs text-text-muted">
                      {quotas.plan === 'pro' ? 'Unlimited access to all features' : 'Quotas reset daily at midnight UTC'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Quotas */}
            {quotas && (
              <div className="card p-6 space-y-5">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />Today's Usage
                </h3>
                <div className="space-y-4">
                  <QuotaBar
                    label="Searches"
                    used={quotas.today.searches_per_day ?? 0}
                    limit={quotas.quotas.searches_per_day ?? 10}
                    icon={Search}
                  />
                  <QuotaBar
                    label="Exports"
                    used={quotas.today.exports_per_day ?? 0}
                    limit={quotas.quotas.exports_per_day ?? 5}
                    icon={Download}
                  />
                  <QuotaBar
                    label="Enrichments"
                    used={quotas.today.enrichments_per_day ?? 0}
                    limit={quotas.quotas.enrichments_per_day ?? 10}
                    icon={Zap}
                  />
                  <QuotaBar
                    label="Shared Leads"
                    used={quotas.today.shared_leads_per_day ?? 0}
                    limit={quotas.quotas.shared_leads_per_day ?? 50}
                    icon={Share2}
                  />
                </div>
              </div>
            )}

            {/* Stats by Action */}
            {stats && stats.by_action.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />Activity Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.by_action.map((item) => {
                    const Icon = ACTION_ICONS[item.action] ?? Search;
                    const color = ACTION_COLORS[item.action] ?? 'text-text-muted';
                    return (
                      <div key={item.action} className="p-4 bg-zinc-800/40 rounded-xl border border-[#3f3f46]">
                        <Icon className={`w-5 h-5 ${color} mb-2`} />
                        <p className="text-2xl font-bold text-text-primary">{item.count}</p>
                        <p className="text-xs text-text-muted capitalize">{item.action}es</p>
                        {item.total_leads > 0 && (
                          <p className="text-xs text-text-secondary mt-1">{item.total_leads} leads</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats by Platform */}
            {stats && stats.by_platform.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Platform Usage</h3>
                <div className="space-y-3">
                  {stats.by_platform.map((item) => {
                    const maxCount = Math.max(...stats.by_platform.map((p) => p.count));
                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={item.platform} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-primary capitalize font-medium">{item.platform || 'Unknown'}</span>
                          <span className="text-text-muted">{item.count} uses &middot; {item.total_leads} leads</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-accent/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Trend */}
            {stats && stats.daily.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Daily Trend (Last 30 Days)</h3>
                <div className="flex items-end gap-1 h-32">
                  {stats.daily.map((day) => {
                    const maxCount = Math.max(...stats.daily.map((d) => d.count));
                    const heightPct = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 bg-accent/30 hover:bg-accent/50 rounded-t transition-all cursor-default group relative"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`${day.date}: ${day.count} actions, ${day.total_leads} leads`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 text-xs text-text-primary px-2 py-1 rounded whitespace-nowrap border border-[#3f3f46]">
                          {day.date}: {day.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{stats.daily[0]?.date}</span>
                  <span>{stats.daily[stats.daily.length - 1]?.date}</span>
                </div>
              </div>
            )}

            {/* Summary */}
            {stats && (
              <div className="card p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Leads Processed</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{stats.total_leads.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Actions Today</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{stats.today_count}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
