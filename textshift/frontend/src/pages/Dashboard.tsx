import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanApi, creditsApi } from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('detect');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const getCreditCost = () => {
    switch (activeTab) {
      case 'detect': return 100;
      case 'humanize': return 200;
      case 'plagiarism': return 150;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TextShift</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">
                  {credits?.balance?.toLocaleString() || user?.credits_balance?.toLocaleString() || 0}
                </span>
                <span className="text-slate-400">credits</span>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  Upgrade
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!
          </h1>
          <p className="text-slate-400">
            Choose a tool below to analyze your text.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tool Selection and Input */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setResult(null); }}>
                  <TabsList className="grid grid-cols-3 bg-slate-900/50 mb-6">
                    <TabsTrigger 
                      value="detect" 
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      AI Detect
                    </TabsTrigger>
                    <TabsTrigger 
                      value="humanize"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Humanize
                    </TabsTrigger>
                    <TabsTrigger 
                      value="plagiarism"
                      className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Plagiarism
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="detect" className="mt-0">
                    <div className="text-slate-400 text-sm mb-4">
                      Detect if text is AI-generated with 99.18% accuracy. Get sentence-level analysis.
                    </div>
                  </TabsContent>
                  <TabsContent value="humanize" className="mt-0">
                    <div className="text-slate-400 text-sm mb-4">
                      Transform AI-generated text to bypass all detectors while preserving meaning.
                    </div>
                  </TabsContent>
                  <TabsContent value="plagiarism" className="mt-0">
                    <div className="text-slate-400 text-sm mb-4">
                      Check for plagiarism against billions of sources including web pages.
                    </div>
                  </TabsContent>
                </Tabs>

                <Textarea
                  placeholder="Paste your text here..."
                  className="min-h-[250px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 mb-4"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <div className="flex justify-between items-center">
                  <div className="text-slate-400 text-sm">
                    {inputText.length} characters | Cost: {getCreditCost()} credits
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={inputText.length < 50 || isLoading}
                    className={`${
                      activeTab === 'detect' ? 'bg-blue-500 hover:bg-blue-600' :
                      activeTab === 'humanize' ? 'bg-purple-500 hover:bg-purple-600' :
                      'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {activeTab === 'detect' ? 'Detect AI' : 
                         activeTab === 'humanize' ? 'Humanize' : 'Check Plagiarism'}
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {(error as any)?.response?.data?.detail || 'An error occurred. Please try again.'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="mt-6 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeTab === 'detect' && result.result && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                        <div>
                          <div className="text-slate-400 text-sm">Detection Result</div>
                          <div className="text-2xl font-bold text-white">
                            {result.result.ai_probability > 50 ? 'AI Generated' : 'Human Written'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-sm">AI Probability</div>
                          <div className={`text-3xl font-bold ${
                            result.result.ai_probability > 50 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {result.result.ai_probability}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={result.result.ai_probability} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {activeTab === 'humanize' && result.result && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-slate-400 text-sm">Humanized Text</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.result.humanized_text)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-white whitespace-pre-wrap">
                          {result.result.humanized_text}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'plagiarism' && result.result && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                        <div>
                          <div className="text-slate-400 text-sm">Originality Score</div>
                          <div className="text-2xl font-bold text-white">
                            {result.result.originality_score}% Original
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-400 text-sm">Plagiarism Detected</div>
                          <div className={`text-3xl font-bold ${
                            result.result.plagiarism_score > 20 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {result.result.plagiarism_score}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={result.result.originality_score} 
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="mt-4 text-slate-400 text-sm">
                    Credits used: {result.credits_used} | Remaining: {result.credits_remaining?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Plan</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                    {user?.subscription_tier || 'Free'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Credits Balance</span>
                  <span className="text-white font-medium">
                    {credits?.balance?.toLocaleString() || user?.credits_balance?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Used</span>
                  <span className="text-white font-medium">
                    {user?.credits_used_total?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Credit Costs */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Credit Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-slate-300">AI Detection</span>
                  </div>
                  <span className="text-white">100 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-slate-300">Humanize</span>
                  </div>
                  <span className="text-white">200 credits</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-slate-300">Plagiarism</span>
                  </div>
                  <span className="text-white">150 credits</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 space-y-2">
                <Link to="/history" className="flex items-center text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition">
                  <History className="w-4 h-4 mr-3" />
                  Scan History
                </Link>
                <Link to="/pricing" className="flex items-center text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition">
                  <CreditCard className="w-4 h-4 mr-3" />
                  Buy Credits
                </Link>
                <Link to="/settings" className="flex items-center text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
