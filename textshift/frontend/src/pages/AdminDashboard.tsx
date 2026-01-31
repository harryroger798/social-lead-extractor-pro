import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
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
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// In production, use empty string for same-origin requests (nginx proxies /api/ to backend)
// In development, use localhost:8000
const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000');

interface ModelStatus {
  deployed_version: string | null;
  accuracy: number | null;
  samples_ready: number;
  ready_for_training: boolean;
}

interface ABTest {
  model_type: string;
  test_version: string;
  control_version: string;
  days_remaining: number;
  test_users: number;
  control_users: number;
  total_requests: number;
}

interface TrainingRun {
  id: number;
  model_type: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  training_samples: number | null;
  final_accuracy: number | null;
  improvement: number | null;
  triggered_by: string | null;
  error_message: string | null;
}

interface MetricsOverview {
  models: {
    detector: ModelStatus;
    humanizer: ModelStatus;
    plagiarism: ModelStatus;
  };
  active_ab_tests: number;
  ab_tests: ABTest[];
  feedback: {
    total_last_30_days: number;
    by_type: Record<string, number>;
    by_scan_type: Record<string, number>;
    ready_for_training: number;
  };
  system_health: {
    status: string;
    last_updated: string;
  };
}

export default function AdminDashboard() {
  const { token, user } = useAuthStore();
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringTraining, setTriggeringTraining] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/metrics/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    }
  };

  const fetchTrainingHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/training/history?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrainingHistory(data.training_runs || []);
      }
    } catch (err) {
      console.error('Failed to fetch training history:', err);
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
      
      // Refresh data
      await Promise.all([fetchMetrics(), fetchTrainingHistory()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger training');
    } finally {
      setTriggeringTraining(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchTrainingHistory()]);
      setLoading(false);
    };
    
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [token]);

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

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              ML Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Monitor and manage self-learning AI models</p>
          </div>
          <button
            onClick={() => { fetchMetrics(); fetchTrainingHistory(); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="text-red-300 text-sm underline mt-2">
              Dismiss
            </button>
          </div>
        )}

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">System Status</span>
              <div className={`w-3 h-3 rounded-full ${metrics?.system_health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2 capitalize">
              {metrics?.system_health.status || 'Unknown'}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Active A/B Tests</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {metrics?.active_ab_tests || 0}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Feedback (30 days)</span>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {metrics?.feedback.total_last_30_days || 0}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Ready for Training</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {metrics?.feedback.ready_for_training || 0}
            </p>
          </div>
        </div>

        {/* Model Cards */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          Model Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(['detector', 'humanizer', 'plagiarism'] as const).map((modelType) => {
            const model = metrics?.models[modelType];
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

        {/* A/B Tests */}
        {metrics?.ab_tests && metrics.ab_tests.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Active A/B Tests
            </h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Control</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Test</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Users</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Requests</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {metrics.ab_tests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-white capitalize">{test.model_type}</td>
                      <td className="px-4 py-3 text-gray-300">{test.control_version}</td>
                      <td className="px-4 py-3 text-purple-400">{test.test_version}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {test.control_users} / {test.test_users}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{test.total_requests}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {test.days_remaining} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Training History */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Improvement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {trainingHistory.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-400">#{run.id}</td>
                    <td className="px-4 py-3 text-white capitalize">{run.model_type}</td>
                    <td className="px-4 py-3">
                      {run.status === 'completed' && (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                      )}
                      {run.status === 'failed' && (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      )}
                      {run.status === 'running' && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Running
                        </span>
                      )}
                      {run.status === 'queued' && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Clock className="w-4 h-4" /> Queued
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{run.training_samples || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {run.final_accuracy ? `${run.final_accuracy.toFixed(2)}%` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {run.improvement !== null ? (
                        <span className={`flex items-center gap-1 ${run.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {run.improvement >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {run.improvement >= 0 ? '+' : ''}{run.improvement.toFixed(2)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {run.duration_minutes ? `${run.duration_minutes}m` : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{run.triggered_by || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feedback Distribution */}
        {metrics?.feedback && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Feedback by Type</h3>
              <div className="space-y-3">
                {Object.entries(metrics.feedback.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(metrics.feedback.by_type).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No feedback data yet</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Feedback by Scan Type</h3>
              <div className="space-y-3">
                {Object.entries(metrics.feedback.by_scan_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
                {Object.keys(metrics.feedback.by_scan_type).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No feedback data yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
