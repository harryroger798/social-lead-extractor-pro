import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Sparkles, 
  Search, 
  Zap, 
  LogOut,
  CreditCard,
  History,
  Settings,
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Mail
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanApi, creditsApi } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('detect');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Handle pre-filled text from navigation state (e.g., from History page re-analyze)
  useEffect(() => {
    const state = location.state as { text?: string; tool?: string } | null;
    if (state?.text) {
      setInputText(state.text);
    }
    if (state?.tool) {
      const toolMap: Record<string, string> = { 'humanize': 'humanize', 'plagiarism': 'plagiarism', 'detect': 'detect', 'ai_detection': 'detect' };
      setActiveTab(toolMap[state.tool] || 'detect');
    }
    // Clear the state after reading it
    if (state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: credits, refetch: refetchCredits } = useQuery({
    queryKey: ['credits'],
    queryFn: creditsApi.getBalance,
  });

  const detectMutation = useMutation({
    mutationFn: scanApi.detectAI,
    onSuccess: (data) => {
      setResult(data);
      refetchCredits();
    },
  });

  const humanizeMutation = useMutation({
    mutationFn: scanApi.humanize,
    onSuccess: (data) => {
      setResult(data);
      refetchCredits();
    },
  });

  const plagiarismMutation = useMutation({
    mutationFn: scanApi.checkPlagiarism,
    onSuccess: (data) => {
      setResult(data);
      refetchCredits();
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnalyze = () => {
    setResult(null);
    if (activeTab === 'detect') {
      detectMutation.mutate(inputText);
    } else if (activeTab === 'humanize') {
      humanizeMutation.mutate(inputText);
    } else if (activeTab === 'plagiarism') {
      plagiarismMutation.mutate(inputText);
    }
  };

  const isLoading = detectMutation.isPending || humanizeMutation.isPending || plagiarismMutation.isPending;
  const error = detectMutation.error || humanizeMutation.error || plagiarismMutation.error;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWordCount = () => {
    return inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const getCreditCost = () => {
    const wordCount = getWordCount();
    let multiplier = 1;
    switch (activeTab) {
      case 'detect': multiplier = 1; break;
      case 'humanize': multiplier = 2; break;
      case 'plagiarism': multiplier = 1.5; break;
      default: multiplier = 1;
    }
    // Formula: max(50, wordCount * multiplier)
    return Math.max(50, Math.floor(wordCount * multiplier));
  };

    const tabs = [
      { id: 'detect', label: 'AI Detection', icon: Shield, color: 'emerald', description: 'Powered by Advanced Neural Intelligence - spot machine-generated content with 99% accuracy.' },
      { id: 'humanize', label: 'Humanizer', icon: Sparkles, color: 'purple', description: 'Transform robotic text into authentic, human-sounding content while preserving your meaning.' },
      { id: 'plagiarism', label: 'Plagiarism', icon: Search, color: 'blue', description: 'Scan your content against billions of web pages and documents in real-time.' }
    ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-medium">
                  {(credits?.balance === -1 || user?.credits_balance === -1) ? 'Unlimited' : (credits?.balance?.toLocaleString() || user?.credits_balance?.toLocaleString() || 0)}
                </span>
                <span className="text-gray-500">words</span>
              </div>
              <Link to="/pricing">
                <Button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-full px-4">Upgrade</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </h1>
          <p className="text-gray-500">Choose a tool below to analyze your text.</p>
        </div>

        {!user?.is_verified && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full">
                <Mail className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-amber-400 mb-2">Verify Your Email</h3>
                <p className="text-gray-300 mb-4">
                  Please verify your email address to access all features. Check your inbox for a verification link.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate('/verify-email')}
                    className="bg-amber-500 hover:bg-amber-600 text-black rounded-full px-6"
                  >
                    Enter Verification Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: user?.email })
                        });
                        if (response.ok) {
                          alert('Verification email sent! Please check your inbox.');
                        }
                      } catch (e) {
                        alert('Failed to resend verification email. Please try again.');
                      }
                    }}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full px-6"
                  >
                    Resend Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? tab.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : tab.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6">
              <p className="text-gray-400 text-sm mb-4">{activeTabData?.description}</p>
              
              <Textarea
                placeholder="Paste your text here..."
                className="min-h-[250px] bg-black/30 border-white/10 text-white placeholder:text-gray-600 rounded-2xl resize-none focus:border-emerald-500/50 focus:ring-emerald-500/20 mb-4"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-500 text-sm">
                  {getWordCount()} words | Cost: <span className="text-white">{getCreditCost()}</span> words
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={inputText.length < 50 || isLoading}
                  className={`rounded-full px-8 ${
                    activeTab === 'detect' ? 'bg-emerald-500 hover:bg-emerald-600 text-black' :
                    activeTab === 'humanize' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                    'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" />{activeTab === 'detect' ? 'Detect AI' : activeTab === 'humanize' ? 'Humanize' : 'Check Plagiarism'}</>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <div className="flex items-center text-rose-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {(error as any)?.response?.data?.detail || 'An error occurred. Please try again.'}
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white">Analysis Complete</h3>
                </div>

                {activeTab === 'detect' && result.ai_probability !== undefined && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/10 gap-4">
                      <div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">Detection Result</div>
                        <div className="text-2xl font-light text-white">
                          {result.ai_probability > 50 ? 'AI Generated' : 'Human Written'}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">AI Probability</div>
                        <div className={`text-3xl font-light ${result.ai_probability > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {result.ai_probability}%
                        </div>
                      </div>
                    </div>
                    <Progress value={result.ai_probability} className="h-2 bg-white/10" />
                  </div>
                )}

                {activeTab === 'humanize' && result.output_text && (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/30 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-gray-500 text-sm uppercase tracking-wider">Humanized Text</div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.output_text)} className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                          {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">{result.output_text}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'plagiarism' && result.plagiarism_score !== undefined && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/10 gap-4">
                      <div>
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">Originality Score</div>
                        <div className="text-2xl font-light text-white">{100 - result.plagiarism_score}% Original</div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">Plagiarism Detected</div>
                        <div className={`text-3xl font-light ${result.plagiarism_score > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {result.plagiarism_score}%
                        </div>
                      </div>
                    </div>
                    <Progress value={100 - result.plagiarism_score} className="h-2 bg-white/10" />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 text-gray-500 text-sm">
                  Words used: <span className="text-white">{result.credits_used}</span> | Remaining: <span className="text-white">{credits?.balance === -1 ? 'Unlimited' : credits?.balance?.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Plan</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-sm">
                    {user?.subscription_tier || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Words Remaining</span>
                  <span className="text-white font-medium">
                    {(credits?.balance === -1 || user?.credits_balance === -1) ? 'Unlimited' : (credits?.balance?.toLocaleString() || user?.credits_balance?.toLocaleString() || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Used</span>
                  <span className="text-white font-medium">{user?.credits_used_total?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">How Words Are Counted</h3>
              <p className="text-gray-400 text-sm mb-4">Usage is measured in words. Each scan costs words based on the tool used. Minimum 50 words per scan.</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">AI Detection</span>
                  </div>
                  <span className="text-white text-sm">1 word = 1 credit</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Humanize</span>
                  </div>
                  <span className="text-white text-sm">1 word = 2 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Plagiarism</span>
                  </div>
                  <span className="text-white text-sm">1 word = 1.5 credits</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4">Pro and Enterprise plans have unlimited words!</p>
            </div>

            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl overflow-hidden">
              <Link to="/history" className="flex items-center justify-between p-4 text-gray-300 hover:text-white hover:bg-white/5 transition border-b border-white/10">
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4" />
                  <span>Scan History</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link to="/pricing" className="flex items-center justify-between p-4 text-gray-300 hover:text-white hover:bg-white/5 transition border-b border-white/10">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  <span>Buy Credits</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
              <Link to="/settings" className="flex items-center justify-between p-4 text-gray-300 hover:text-white hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
