import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Search, Download, Zap, Share2, TrendingUp,
  Loader2, AlertCircle, Crown, Shield, Infinity,
} from 'lucide-react';

const API_URL = 'https://snapleads-api.onrender.com';

/** Backend /api/usage/quotas response shape */
interface QuotaResponse {
  plan: string;
  quotas: Record<string, number>;
  today_usage: Record<string, number>;
}

/** Backend /api/usage/stats response shape */
interface StatsResponse {
  plan: string;
  quotas: Record<string, number>;
  period_days: number;
  by_action: Record<string, { count: number; total_leads: number }>;
  total_leads_extracted: number;
  daily: Array<{ day: string; action: string; cnt: number }>;
  today: Record<string, number>;
  by_platform: Array<{ platform: string; cnt: number; total_leads: number }>;
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
  share_lead: Share2,
  extraction: Search,
};

const ACTION_COLORS: Record<string, string> = {
  search: 'text-blue-400',
  export: 'text-emerald-400',
  enrichment: 'text-purple-400',
  share_lead: 'text-amber-400',
  extraction: 'text-blue-400',
};

const ACTION_LABELS: Record<string, string> = {
  search: 'Searches',
  export: 'Exports',
  enrichment: 'Enrichments',
  share_lead: 'Shared Leads',
  extraction: 'Extractions',
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
  const [quotaData, setQuotaData] = useState<QuotaResponse | null>(null);
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [qData, sData] = await Promise.all([
        apiFetch<QuotaResponse>('/api/usage/quotas'),
        apiFetch<StatsResponse>('/api/usage/stats'),
      ]);
      setQuotaData(qData);
      setStatsData(sData);
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

  // Convert backend by_action dict to array for rendering
  const byActionArray = statsData
    ? Object.entries(statsData.by_action).map(([action, data]) => ({
        action,
        count: data.count,
        total_leads: data.total_leads,
      }))
    : [];

  // Aggregate daily data by date for the trend chart
  const dailyAggregated = statsData
    ? Object.values(
        statsData.daily.reduce<Record<string, { date: string; count: number }>>((acc, item) => {
          if (!acc[item.day]) {
            acc[item.day] = { date: item.day, count: 0 };
          }
          acc[item.day].count += item.cnt;
          return acc;
        }, {})
      ).sort((a, b) => a.date.localeCompare(b.date))
    : [];

  // Today's total actions count
  const todayCount = statsData
    ? Object.values(statsData.today).reduce((sum, cnt) => sum + cnt, 0)
    : 0;

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

        {loading && !quotaData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : (
          <>
            {/* Plan Banner */}
            {quotaData && (
              <div className={`card p-6 border-l-4 ${quotaData.plan === 'pro' ? 'border-l-amber-400' : 'border-l-accent'}`}>
                <div className="flex items-center gap-3">
                  {quotaData.plan === 'pro' ? (
                    <Crown className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Shield className="w-6 h-6 text-accent" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary capitalize">{quotaData.plan} Plan</h3>
                    <p className="text-xs text-text-muted">
                      {quotaData.plan === 'pro' ? 'Unlimited access to all features' : 'Quotas reset daily at midnight UTC'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Quotas — maps action names to quota keys */}
            {quotaData && (
              <div className="card p-6 space-y-5">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />Today's Usage
                </h3>
                <div className="space-y-4">
                  <QuotaBar
                    label="Searches"
                    used={quotaData.today_usage.search ?? 0}
                    limit={quotaData.quotas.searches_per_day ?? 10}
                    icon={Search}
                  />
                  <QuotaBar
                    label="Exports"
                    used={quotaData.today_usage.export ?? 0}
                    limit={quotaData.quotas.exports_per_day ?? 5}
                    icon={Download}
                  />
                  <QuotaBar
                    label="Enrichments"
                    used={quotaData.today_usage.enrichment ?? 0}
                    limit={quotaData.quotas.enrichments_per_day ?? 10}
                    icon={Zap}
                  />
                  <QuotaBar
                    label="Shared Leads"
                    used={quotaData.today_usage.share_lead ?? 0}
                    limit={quotaData.quotas.shared_leads_per_day ?? 50}
                    icon={Share2}
                  />
                </div>
              </div>
            )}

            {/* Stats by Action */}
            {byActionArray.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />Activity Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {byActionArray.map((item) => {
                    const Icon = ACTION_ICONS[item.action] ?? Search;
                    const color = ACTION_COLORS[item.action] ?? 'text-text-muted';
                    return (
                      <div key={item.action} className="p-4 bg-zinc-800/40 rounded-xl border border-[#3f3f46]">
                        <Icon className={`w-5 h-5 ${color} mb-2`} />
                        <p className="text-2xl font-bold text-text-primary">{item.count}</p>
                        <p className="text-xs text-text-muted capitalize">{ACTION_LABELS[item.action] ?? item.action}</p>
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
            {statsData && statsData.by_platform.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Platform Usage</h3>
                <div className="space-y-3">
                  {statsData.by_platform.map((item) => {
                    const maxCount = Math.max(...statsData.by_platform.map((p) => p.cnt));
                    const pct = maxCount > 0 ? (item.cnt / maxCount) * 100 : 0;
                    return (
                      <div key={item.platform} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-primary capitalize font-medium">{item.platform || 'Unknown'}</span>
                          <span className="text-text-muted">{item.cnt} uses &middot; {item.total_leads} leads</span>
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
            {dailyAggregated.length > 0 && (
              <div className="card p-6 space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Daily Trend (Last 7 Days)</h3>
                <div className="flex items-end gap-1 h-32">
                  {dailyAggregated.map((day) => {
                    const maxCount = Math.max(...dailyAggregated.map((d) => d.count));
                    const heightPct = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 bg-accent/30 hover:bg-accent/50 rounded-t transition-all cursor-default group relative"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`${day.date}: ${day.count} actions`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-zinc-900 text-xs text-text-primary px-2 py-1 rounded whitespace-nowrap border border-[#3f3f46]">
                          {day.date}: {day.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{dailyAggregated[0]?.date}</span>
                  <span>{dailyAggregated[dailyAggregated.length - 1]?.date}</span>
                </div>
              </div>
            )}

            {/* Summary */}
            {statsData && (
              <div className="card p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Total Leads Processed</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{statsData.total_leads_extracted.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Actions Today</p>
                    <p className="text-3xl font-bold text-text-primary mt-1">{todayCount}</p>
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
