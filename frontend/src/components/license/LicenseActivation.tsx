import { useState } from 'react';
import { Key, Loader2, AlertCircle, CheckCircle, Shield, Zap, Crown } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';

export default function LicenseActivation() {
  const { activate } = useLicense();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter your license key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await activate(licenseKey.trim().toUpperCase());
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Activation failed. Please check your key and try again.');
      }
    } catch {
      setError('Connection failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen w-full bg-bg-primary flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">License Activated!</h1>
            <p className="text-sm text-text-secondary mt-2">Your copy of SnapLeads is now activated. The app will reload momentarily...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-lg shadow-accent/10">
            <img src="./favicon.png" alt="SnapLeads" className="w-12 h-12 rounded-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Activate SnapLeads</h1>
            <p className="text-sm text-text-secondary mt-2">Enter your license key to activate the application</p>
          </div>
        </div>

        {/* License Input Card */}
        <div className="card p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-text-primary block mb-3">License Key</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                placeholder="SNPL-PRO-Y-XXXX-XXXX-XXXX"
                className="w-full pl-12 pr-4 py-4 bg-bg-input border border-[#3f3f46] rounded-xl text-base text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-mono tracking-wider"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/20">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error leading-relaxed">{error}</p>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading || !licenseKey.trim()}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Activate License
              </>
            )}
          </button>
        </div>

        {/* Plans Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary">Starter</span>
            </div>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              <li>5 social platforms</li>
              <li>Google Dorking extraction</li>
              <li>CSV/Excel export</li>
              <li>Email verification</li>
            </ul>
          </div>
          <div className="card p-5 space-y-3 border-accent/30">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-text-primary">Pro</span>
            </div>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              <li>12 platforms + Google Maps</li>
              <li>Scheduled extractions</li>
              <li>Email outreach + CRM</li>
              <li>Telegram + WhatsApp</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          Don't have a license?{' '}
          <button
            onClick={() => {
              const api = (window as unknown as Record<string, unknown>).electronAPI as { openExternal?: (url: string) => void } | undefined;
              if (api?.openExternal) {
                api.openExternal('https://getsnapleads.store');
              } else {
                window.open('https://getsnapleads.store', '_blank');
              }
            }}
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Purchase at getsnapleads.store
          </button>
        </p>
      </div>
    </div>
  );
}
