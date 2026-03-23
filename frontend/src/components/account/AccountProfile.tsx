import { useState, useEffect } from 'react';
import { User, Mail, Shield, Crown, Calendar, LogOut, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useLicense } from '@/contexts/LicenseContext';
import { APP_VERSION } from '@/lib/version';

const API_URL = 'https://snapleads-api.onrender.com';

interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AccountProfile() {
  const { license, isPro, deactivate } = useLicense();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Load saved account on mount
  useEffect(() => {
    const saved = localStorage.getItem('snapleads_account');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUser(data.user);
        setToken(data.token);
      } catch {
        // ignore
      }
    }
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register'
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Authentication failed');
        return;
      }

      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('snapleads_account', JSON.stringify({
        user: data.user,
        token: data.access_token,
      }));
    } catch {
      setError('Connection failed. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('snapleads_account');
  };

  // Not logged in — show login/register form
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Account</h1>
            <p className="text-sm text-text-secondary mt-1">
              Sign in or create an account to unlock team features, usage tracking, and shared leads.
            </p>
          </div>

          <div className="card p-8 space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-zinc-800/60 rounded-xl">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <LogIn className="w-4 h-4 inline mr-1.5" />Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-accent text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <UserPlus className="w-4 h-4 inline mr-1.5" />Register
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-text-primary block mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
                {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/25"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <p className="text-center text-xs text-text-muted">
            Account is optional. License key activation is still the primary way to use SnapLeads.
          </p>
        </div>
      </div>
    );
  }

  // Logged in — show profile
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Account</h1>
          <p className="text-sm text-text-secondary mt-1">Your profile and license information</p>
        </div>

        {/* Profile Card */}
        <div className="card p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-error border border-[#3f3f46] hover:border-error/30 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4 inline mr-1.5" />Sign Out
            </button>
          </div>
        </div>

        {/* License Info */}
        {license && (
          <div className="card p-8 space-y-4">
            <h3 className="text-lg font-bold text-text-primary">License</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Plan</p>
                <div className="flex items-center gap-2">
                  {isPro ? <Crown className="w-5 h-5 text-amber-400" /> : <Shield className="w-5 h-5 text-accent" />}
                  <p className="text-sm font-semibold text-text-primary capitalize">{license.tier} — {license.cycle}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Key</p>
                <p className="text-sm font-mono text-text-secondary">{license.key.substring(0, 20)}...</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Activated</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <p className="text-sm text-text-secondary">{new Date(license.activated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Expires</p>
                <p className="text-sm text-text-secondary">
                  {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#3f3f46]">
              <button
                onClick={deactivate}
                className="px-4 py-2 text-sm font-medium text-error/70 hover:text-error border border-error/20 hover:border-error/40 rounded-xl transition-all"
              >
                Deactivate License
              </button>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">SnapLeads Desktop</p>
              <p className="text-xs text-text-muted">Version {APP_VERSION}</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-full">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
