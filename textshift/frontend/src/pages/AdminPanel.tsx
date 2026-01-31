import { useState, useEffect } from 'react';
import { 
  Brain, 
  Users, 
  Activity, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  Zap,
  AlertTriangle,
  Settings,
  Download,
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  TrendingUp,
  CreditCard,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000');

type TabType = 'overview' | 'users' | 'scans' | 'feedback' | 'ml' | 'settings';

interface DashboardSummary {
  users: { total: number; today: number; this_week: number; this_month: number };
  scans: { total: number; today: number; this_week: number; this_month: number };
  credits: { today: number; this_week: number; this_month: number };
  feedback: { today: number; this_week: number };
  top_users: Array<{ id: number; email: string; full_name: string; scan_count: number }>;
  recent_activity: {
    scans: Array<{ id: number; scan_type: string; status: string; created_at: string }>;
    users: Array<{ id: number; email: string; created_at: string }>;
  };
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  subscription_tier: string;
  credits_balance: number;
  credits_used_total: number;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string;
  scan_count: number;
}

interface ScanData {
  id: number;
  user_id: number;
  user_email: string;
  scan_type: string;
  status: string;
  input_length: number;
  credits_used: number;
  ai_probability: number | null;
  plagiarism_score: number | null;
  created_at: string;
  completed_at: string | null;
}

interface FeedbackData {
  id: number;
  scan_id: number;
  user_id: number;
  user_email: string;
  feedback_type: string;
  is_correct: boolean;
  scan_type: string;
  user_comment: string | null;
  used_in_training: boolean;
  created_at: string;
}

export default function AdminPanel() {
  const { token, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Overview data
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  
  // Users data
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Scans data
  const [scans, setScans] = useState<ScanData[]>([]);
  const [scansTotal, setScansTotal] = useState(0);
  const [scansPage, setScansPage] = useState(1);
  const [scanTypeFilter, setScanTypeFilter] = useState('');
  
  // Feedback data
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(1);
  
  // ML data
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [triggeringTraining, setTriggeringTraining] = useState<string | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        per_page: '10',
        ...(userSearch && { search: userSearch }),
        ...(userTierFilter && { tier: userTierFilter })
      });
      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUsersTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchScans = async () => {
    try {
      const params = new URLSearchParams({
        page: scansPage.toString(),
        per_page: '10',
        ...(scanTypeFilter && { scan_type: scanTypeFilter })
      });
      const response = await fetch(`${API_URL}/api/admin/analytics/scans?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans);
        setScansTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch scans:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const params = new URLSearchParams({
        page: feedbackPage.toString(),
        per_page: '10'
      });
      const response = await fetch(`${API_URL}/api/admin/feedback/list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setFeedbackTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    }
  };

  const fetchMlMetrics = async () => {
    try {
      const [metricsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/metrics/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/training/history?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMlMetrics(data);
      }
      if (historyRes.ok) {
        const data = await historyRes.json();
        setTrainingHistory(data.training_runs || []);
      }
    } catch (err) {
      console.error('Failed to fetch ML metrics:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const updateUser = async (userId: number, updates: Partial<UserData>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const addCredits = async (userId: number, amount: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/add-credits?amount=${amount}&reason=Admin adjustment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to add credits');
    }
  };

  const deleteFeedback = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchFeedback();
      }
    } catch (err) {
      setError('Failed to delete feedback');
    }
  };

  const triggerTraining = async (modelType: string) => {
    setTriggeringTraining(modelType);
    try {
      const response = await fetch(`${API_URL}/api/admin/training/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ model_type: modelType })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to trigger training');
      }
      
      fetchMlMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger training');
    } finally {
      setTriggeringTraining(null);
    }
  };

  const exportData = async (type: 'users' | 'scans', format: 'json' | 'csv') => {
    try {
      const response = await fetch(`${API_URL}/api/admin/export/${type}?format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (format === 'csv') {
          const blob = new Blob([data.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename;
          a.click();
        } else {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${type}_export.json`;
          a.click();
        }
      }
    } catch (err) {
      setError('Failed to export data');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    };
    loadData();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'scans') fetchScans();
    if (activeTab === 'feedback') fetchFeedback();
    if (activeTab === 'ml') fetchMlMetrics();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, usersPage, userSearch, userTierFilter, scansPage, scanTypeFilter, feedbackPage]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-gray-400">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'scans' as TabType, label: 'Scans', icon: FileText },
    { id: 'feedback' as TabType, label: 'Feedback', icon: MessageSquare },
    { id: 'ml' as TabType, label: 'ML System', icon: Brain },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400 text-sm">Complete control over TextShift platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetchSummary();
                  if (activeTab === 'users') fetchUsers();
                  if (activeTab === 'scans') fetchScans();
                  if (activeTab === 'feedback') fetchFeedback();
                  if (activeTab === 'ml') fetchMlMetrics();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="text-red-300 text-sm underline mt-2">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Users</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white">{summary.users.total}</p>
                <p className="text-sm text-green-400 mt-1">+{summary.users.this_week} this week</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Scans</span>
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white">{summary.scans.total}</p>
                <p className="text-sm text-green-400 mt-1">+{summary.scans.this_week} this week</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Credits Used (Month)</span>
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-white">{summary.credits.this_month.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">{summary.credits.today} today</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Feedback (Week)</span>
                  <MessageSquare className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-white">{summary.feedback.this_week}</p>
                <p className="text-sm text-gray-400 mt-1">{summary.feedback.today} today</p>
              </div>
            </div>

            {/* Top Users & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Top Users (This Month)
                </h3>
                <div className="space-y-3">
                  {summary.top_users.map((u, idx) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-white text-sm">{u.full_name || u.email}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-medium">{u.scan_count} scans</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {summary.recent_activity.scans.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-white capitalize">{scan.scan_type.replace('_', ' ')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        scan.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={userTierFilter}
                onChange={(e) => { setUserTierFilter(e.target.value); setUsersPage(1); }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <button
                onClick={() => exportData('users', 'csv')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Credits</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Scans</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white">{u.full_name || 'No name'}</p>
                          <p className="text-gray-500 text-sm">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.subscription_tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                          u.subscription_tier === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                          u.subscription_tier === 'starter' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.subscription_tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">
                        {u.credits_balance === -1 ? 'Unlimited' : u.credits_balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-white">{u.scan_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {u.is_active ? (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          {u.is_admin && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1 hover:bg-gray-700 rounded"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => addCredits(u.id, 1000)}
                            className="p-1 hover:bg-gray-700 rounded"
                            title="Add 1000 credits"
                          >
                            <Plus className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {users.length} of {usersTotal} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                  disabled={usersPage === 1}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white px-4">Page {usersPage}</span>
                <button
                  onClick={() => setUsersPage(p => p + 1)}
                  disabled={users.length < 10}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scans Tab */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={scanTypeFilter}
                onChange={(e) => { setScanTypeFilter(e.target.value); setScansPage(1); }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Types</option>
                <option value="ai_detection">AI Detection</option>
                <option value="humanize">Humanize</option>
                <option value="plagiarism">Plagiarism</option>
              </select>
              <button
                onClick={() => exportData('scans', 'csv')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Scans Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Result</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Credits</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-400">#{scan.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{scan.user_email}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-white">{scan.scan_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          scan.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">
                        {scan.ai_probability !== null && `${scan.ai_probability.toFixed(1)}% AI`}
                        {scan.plagiarism_score !== null && `${scan.plagiarism_score.toFixed(1)}% match`}
                        {scan.scan_type === 'humanize' && scan.status === 'completed' && 'Humanized'}
                      </td>
                      <td className="px-4 py-3 text-white">{scan.credits_used}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {scans.length} of {scansTotal} scans
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScansPage(p => Math.max(1, p - 1))}
                  disabled={scansPage === 1}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white px-4">Page {scansPage}</span>
                <button
                  onClick={() => setScansPage(p => p + 1)}
                  disabled={scans.length < 10}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Scan Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Correct?</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Training</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {feedback.map((fb) => (
                    <tr key={fb.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-400">#{fb.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{fb.user_email}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-white">{fb.feedback_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-white">{fb.scan_type.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        {fb.is_correct ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {fb.used_in_training ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Used</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteFeedback(fb.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Showing {feedback.length} of {feedbackTotal} feedback entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                  disabled={feedbackPage === 1}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white px-4">Page {feedbackPage}</span>
                <button
                  onClick={() => setFeedbackPage(p => p + 1)}
                  disabled={feedback.length < 10}
                  className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ML System Tab */}
        {activeTab === 'ml' && mlMetrics && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">System Status</span>
                  <div className={`w-3 h-3 rounded-full ${mlMetrics.system_health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <p className="text-2xl font-bold text-white mt-2 capitalize">
                  {mlMetrics.system_health?.status || 'Unknown'}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active A/B Tests</span>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {mlMetrics.active_ab_tests || 0}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Feedback (30 days)</span>
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {mlMetrics.feedback?.total_last_30_days || 0}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Ready for Training</span>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {mlMetrics.feedback?.ready_for_training || 0}
                </p>
              </div>
            </div>

            {/* Model Cards */}
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Model Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['detector', 'humanizer', 'plagiarism'] as const).map((modelType) => {
                const model = mlMetrics.models?.[modelType];
                const displayName = {
                  detector: 'AI Detector',
                  humanizer: 'Humanizer',
                  plagiarism: 'Plagiarism Checker'
                }[modelType];
                
                return (
                  <div key={modelType} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{displayName}</h3>
                      {model?.ready_for_training && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Ready to Train
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version</span>
                        <span className="text-white font-medium">
                          {model?.deployed_version || 'v1.0'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy</span>
                        <span className="text-white font-medium">
                          {model?.accuracy ? `${model.accuracy.toFixed(2)}%` : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Samples Ready</span>
                        <span className="text-white font-medium">
                          {model?.samples_ready || 0}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((model?.samples_ready || 0) / 100) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {model?.samples_ready || 0} / 100 samples for training
                      </p>
                    </div>
                    
                    <button
                      onClick={() => triggerTraining(modelType)}
                      disabled={!model?.ready_for_training || triggeringTraining === modelType}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
                    >
                      {triggeringTraining === modelType ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Training...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Trigger Training
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Training History */}
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Training History
            </h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              {trainingHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No training runs yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Training will start automatically when 100+ feedback samples are collected
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Model</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Samples</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {trainingHistory.map((run: any) => (
                      <tr key={run.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-gray-400">#{run.id}</td>
                        <td className="px-4 py-3 text-white capitalize">{run.model_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            run.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            run.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{run.training_samples || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">
                          {run.final_accuracy ? `${run.final_accuracy.toFixed(2)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate Limits */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Rate Limits
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Feedback per hour</label>
                    <p className="text-white text-xl font-medium">{settings.rate_limits?.feedback_per_hour || 10}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Scans per minute</label>
                    <p className="text-white text-xl font-medium">{settings.rate_limits?.scans_per_minute || 5}</p>
                  </div>
                </div>
              </div>

              {/* Training Settings */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Training Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Minimum samples</label>
                    <p className="text-white text-xl font-medium">{settings.training?.min_samples || 100}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Auto training</label>
                    <p className="text-white text-xl font-medium">
                      {settings.training?.auto_training_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Training schedule</label>
                    <p className="text-white text-xl font-medium capitalize">
                      {settings.training?.training_day || 'Sunday'} at {settings.training?.training_hour || 3}:00 UTC
                    </p>
                  </div>
                </div>
              </div>

              {/* A/B Testing Settings */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  A/B Testing
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Test percentage</label>
                    <p className="text-white text-xl font-medium">{settings.ab_testing?.test_percentage || 20}%</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Min test duration</label>
                    <p className="text-white text-xl font-medium">{settings.ab_testing?.min_test_duration_days || 7} days</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Auto-rollback threshold</label>
                    <p className="text-white text-xl font-medium">{(settings.ab_testing?.auto_rollback_threshold || 0.05) * 100}%</p>
                  </div>
                </div>
              </div>

              {/* Credits Settings */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  Credits Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Free tier monthly</label>
                    <p className="text-white text-xl font-medium">{settings.credits?.free_tier_monthly?.toLocaleString() || '5,000'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs">AI Detection</label>
                      <p className="text-white font-medium">{settings.credits?.ai_detection_cost || 1}x</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Humanize</label>
                      <p className="text-white font-medium">{settings.credits?.humanize_cost || 2}x</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs">Plagiarism</label>
                      <p className="text-white font-medium">{settings.credits?.plagiarism_cost || 1.5}x</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white">{editingUser.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Subscription Tier</label>
                <select
                  value={editingUser.subscription_tier}
                  onChange={(e) => setEditingUser({ ...editingUser, subscription_tier: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Credits Balance</label>
                <input
                  type="number"
                  value={editingUser.credits_balance}
                  onChange={(e) => setEditingUser({ ...editingUser, credits_balance: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Use -1 for unlimited credits</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingUser.is_verified}
                    onChange={(e) => setEditingUser({ ...editingUser, is_verified: e.target.checked })}
                    className="rounded"
                  />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={editingUser.is_admin}
                    onChange={(e) => setEditingUser({ ...editingUser, is_admin: e.target.checked })}
                    className="rounded"
                  />
                  Admin
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUser(editingUser.id, {
                  full_name: editingUser.full_name,
                  subscription_tier: editingUser.subscription_tier,
                  credits_balance: editingUser.credits_balance,
                  is_active: editingUser.is_active,
                  is_verified: editingUser.is_verified,
                  is_admin: editingUser.is_admin
                })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
