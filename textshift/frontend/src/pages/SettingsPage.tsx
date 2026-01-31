import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
      name: user?.full_name || '',
      email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    marketingEmails: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'enterprise': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pro': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'starter': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-semibold">TEXTSHIFT</span>
          </Link>
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Manage your account settings and preferences</p>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Profile</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Subscription</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white font-medium">Current Plan</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${getTierBadgeColor(user?.subscription_tier || 'free')}`}>
                    {user?.subscription_tier?.toUpperCase() || 'FREE'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {user?.subscription_tier === 'enterprise' || user?.subscription_tier === 'pro' 
                    ? 'Unlimited words' 
                    : `${user?.credits_balance?.toLocaleString() || 0} words remaining`}
                </p>
              </div>
              <Link to="/pricing">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black">
                  {user?.subscription_tier === 'free' ? 'Upgrade' : 'Manage Plan'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Security</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-white">Email Notifications</span>
                  <p className="text-gray-500 text-sm">Receive updates about your scans and account</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded bg-black/50 border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-white">Marketing Emails</span>
                  <p className="text-gray-500 text-sm">Receive news about new features and promotions</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.marketingEmails}
                  onChange={(e) => setFormData({ ...formData, marketingEmails: e.target.checked })}
                  className="w-5 h-5 rounded bg-black/50 border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Privacy & Data</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                <h3 className="text-white font-medium mb-1">Data Retention</h3>
                <p className="text-gray-500 text-sm mb-3">Your scan history is retained for 90 days. You can delete it anytime.</p>
                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Scan History
                </Button>
              </div>
              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <h3 className="text-rose-400 font-medium mb-1">Delete Account</h3>
                <p className="text-gray-500 text-sm mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <Button variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 text-black px-8"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
