import { Crown, Lock } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';

interface ProGateProps {
  children: React.ReactNode;
  featureName: string;
}

/**
 * Wraps Pro-only features. If the user has a Starter license,
 * shows an upgrade prompt instead of the actual content.
 */
export default function ProGate({ children, featureName }: ProGateProps) {
  const { isPro } = useLicense();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">Pro Feature</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">{featureName}</span> is available exclusively in the Pro plan.
            Upgrade to unlock all 12 platforms and advanced features.
          </p>
        </div>

        <div className="card p-5 text-left space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-text-primary">Pro Plan Includes</span>
          </div>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              All 12 social platforms + Google Maps
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Scheduled automated extractions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Email outreach campaigns
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              CRM export (HubSpot, Salesforce)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Telegram + WhatsApp scrapers
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              Website email finder
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            const api = (window as unknown as Record<string, unknown>).electronAPI as { openExternal?: (url: string) => void } | undefined;
            if (api?.openExternal) {
              api.openExternal('https://getsnapleads.store');
            } else {
              window.open('https://getsnapleads.store', '_blank');
            }
          }}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/25"
        >
          <Crown className="w-5 h-5" />
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
