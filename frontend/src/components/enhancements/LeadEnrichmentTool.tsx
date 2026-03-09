import { useState } from 'react';
import { Wand2, Loader2, CheckCircle2, Users, Phone, Mail, Building2, Globe } from 'lucide-react';
import { enrichLeads } from '@/lib/api';

export default function LeadEnrichmentTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total_leads: number;
    enriched: number;
    names_filled: number;
    phones_filled: number;
    emails_filled: number;
    companies_detected: number;
    websites_detected: number;
  } | null>(null);

  const handleEnrich = async () => {
    setLoading(true);
    try {
      const data = await enrichLeads();
      setResult(data);
    } catch (err) {
      console.error('Enrichment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = result
    ? [
        { label: 'Total Leads', value: result.total_leads, icon: Users, color: 'text-accent' },
        { label: 'Enriched', value: result.enriched, icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Names Filled', value: result.names_filled, icon: Users, color: 'text-blue-400' },
        { label: 'Phones Filled', value: result.phones_filled, icon: Phone, color: 'text-purple-400' },
        { label: 'Emails Filled', value: result.emails_filled, icon: Mail, color: 'text-amber-400' },
        { label: 'Companies Detected', value: result.companies_detected, icon: Building2, color: 'text-cyan-400' },
        { label: 'Websites Detected', value: result.websites_detected, icon: Globe, color: 'text-pink-400' },
      ]
    : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="shrink-0 page-header">
        <div className="px-10 py-6">
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-cyan-400" />
            </div>
            Lead Enrichment
          </h1>
          <p className="text-sm text-text-secondary pt-1 ml-[52px]">Auto-fill missing data by cross-referencing your existing leads</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-10 py-8">
      <div className="flex flex-col gap-6">

      <div className="bg-bg-card rounded-xl border border-border p-7 space-y-6">
        <div className="bg-accent/5 border border-accent/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">How it works</h3>
          <ul className="text-xs text-text-muted space-y-1.5">
            <li>• Scans all your leads and finds matching contacts across sessions</li>
            <li>• Fills missing names, phones, and emails from other matching leads</li>
            <li>• Detects company names from business email domains</li>
            <li>• Detects website URLs from email domains</li>
            <li>• 100% free — no external APIs used, just your existing data</li>
          </ul>
        </div>

        <button
          onClick={handleEnrich}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enriching Leads...</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Enrich All Leads</>
          )}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
