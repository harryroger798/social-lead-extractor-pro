import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';

export default function LicenseExpired() {
  const { license, deactivate } = useLicense();

  const handleRenew = () => {
    const api = (window as unknown as Record<string, unknown>).electronAPI as { openExternal?: (url: string) => void } | undefined;
    if (api?.openExternal) {
      api.openExternal('https://getsnapleads.store');
    } else {
      window.open('https://getsnapleads.store', '_blank');
    }
  };

  return (
    <div className="h-screen w-full bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="w-20 h-20 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-warning" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">License Expired</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your SnapLeads license has expired. Please renew to continue using the application.
          </p>
        </div>

        {license && (
          <div className="card p-5 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">License Key</span>
              <span className="text-xs font-mono text-text-secondary">{license.key}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Plan</span>
              <span className="text-xs text-text-secondary capitalize">{license.tier} ({license.cycle})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Expired</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-error" />
                <span className="text-xs text-error font-medium">
                  {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRenew}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
          >
            <RefreshCw className="w-5 h-5" />
            Renew License
          </button>

          <button
            onClick={deactivate}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-6 bg-bg-card hover:bg-bg-tertiary border border-[#3f3f46] text-text-secondary rounded-xl text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Use Different Key
          </button>
        </div>

        <p className="text-xs text-text-muted">
          After renewing, click "Use Different Key" and enter your new license key to reactivate.
        </p>
      </div>
    </div>
  );
}
