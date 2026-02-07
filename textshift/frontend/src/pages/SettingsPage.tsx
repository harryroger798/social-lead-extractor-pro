import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { usePageSEO } from '@/hooks/usePageSEO';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  usePageSEO({
    title: 'Account Settings',
    description: 'Manage your TextShift account settings, subscription, security, and preferences.',
    noIndex: true,
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: (user as any)?.email_notifications ?? true,
    marketingEmails: (user as any)?.marketing_emails ?? false,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
        emailNotifications: (user as any).email_notifications ?? true,
        marketingEmails: (user as any).marketing_emails ?? false,
      }));
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await api.put('/api/v1/user/settings', {
        full_name: formData.name,
        email_notifications: formData.emailNotifications,
        marketing_emails: formData.marketingEmails,
      });
      updateUser(response.data);
      showMessage('success', 'Settings saved successfully!');
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    
    setChangingPassword(true);
    try {
      await api.put('/api/v1/user/password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      showMessage('success', 'Password changed successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);
    try {
      const response = await api.delete('/api/v1/user/history');
      showMessage('success', `Scan history cleared! ${response.data.deleted_scans} scans deleted.`);
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to clear history');
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete('/api/v1/user/account');
      logout();
      navigate('/');
    } catch (error: any) {
      showMessage('error', error.response?.data?.detail || 'Failed to delete account');
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
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
            <span className="text-white font-semibold">TextShift</span>
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

        {/* Message Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {message.text}
          </div>
        )}

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
                    {user?.subscription_tier ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1).toLowerCase() : 'Free'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {user?.subscription_tier === 'enterprise' || user?.subscription_tier === 'pro' || user?.credits_balance === -1
                    ? 'Unlimited words' 
                    : `${(user?.credits_balance ?? 0).toLocaleString()} words remaining`}
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
              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword}
                  disabled={changingPassword || !formData.currentPassword || !formData.newPassword}
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                  onClick={handleClearHistory}
                  disabled={clearingHistory}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {clearingHistory ? 'Clearing...' : 'Clear Scan History'}
                </Button>
              </div>
              <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <h3 className="text-rose-400 font-medium mb-1">Delete Account</h3>
                <p className="text-gray-500 text-sm mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                {!showDeleteConfirm ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span className="text-rose-400 text-sm">Are you sure? This cannot be undone.</span>
                    <Button 
                      size="sm" 
                      className="bg-rose-500 hover:bg-rose-600 text-white"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-white/20 text-gray-300"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
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
