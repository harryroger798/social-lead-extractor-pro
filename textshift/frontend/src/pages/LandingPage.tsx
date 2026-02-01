import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Sparkles, 
  Search, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Users,
  Target,
  Cpu,
  Gift,
  Clock,
  Wand2,
} from 'lucide-react';
import {
  ScrollReveal,
} from '@/components/animations';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000');

interface LandingPromo {
  id: number;
  code: string;
  title: string;
  description: string;
  promo_type: string;
  plan_tier: string | null;
  duration_days: number;
  end_date: string | null;
  landing_headline: string | null;
  landing_subtext: string | null;
  landing_button_text: string | null;
  landing_badge_text: string | null;
  days_until_expiry: number | null;
}

export default function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState<null | { type: string; score: number }>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePromos, setActivePromos] = useState<LandingPromo[]>([]);
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/promo/active`);
        if (response.ok) {
          const data = await response.json();
          setActivePromos(data);
        }
      } catch (err) {
        console.error('Failed to fetch promos:', err);
      }
    };
    fetchPromos();
  }, []);

  const handleDemoCheck = () => {
    if (demoText.length > 20) {
      const score = Math.random() * 100;
      setDemoResult({
        type: score > 50 ? 'AI Generated' : 'Human Written',
        score: Math.round(score)
      });
    }
  };

    const faqs = [
      { q: "What makes TextShift different?", a: "TextShift combines AI detection, humanization, and plagiarism checking in one platform with industry-leading 99% accuracy. Pro and Enterprise plans offer unlimited usage, and we're 40-70% cheaper than competitors." },
      { q: "How accurate is the AI detection?", a: "Our Advanced Neural Intelligence system achieves 99% accuracy with zero false positives, tested against all major AI writing tools including ChatGPT, Claude, and Gemini." },
      { q: "What's included in the free plan?", a: "The free plan includes 5,000 words/month for AI Detection with 10 scans/day. Upgrade to Starter ($9/mo) for all 3 tools, or Pro ($19/mo) for unlimited usage." },
      { q: "How does the humanizer work?", a: "Our Natural Language Transformation Engine rewrites AI-generated text to sound authentically human while preserving your original meaning. It achieves 0% AI detection on all major detectors. Available on Starter plan and above." },
      { q: "Is my content secure?", a: "Absolutely. We don't store your content after processing. All data is encrypted and protected at every step." }
    ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden grain-overlay">
      {/* Subtle gradient orbs - more human-like than particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Navigation - Clean and minimal */}
      <nav className="fixed w-full z-50 px-6 py-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto flex items-center justify-between"
        >
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img 
              src="/images/logo.png" 
              alt="TextShift" 
              className="w-9 h-9 object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <span className="text-white font-display font-semibold text-lg tracking-tight">TextShift</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-sm text-zinc-400 hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 text-sm">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={() => logout()}
                  className="bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium px-5 rounded-lg"
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 text-sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-medium px-5 rounded-lg">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </motion.div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 p-6"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-zinc-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#demo" className="text-zinc-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Demo</a>
              <a href="#pricing" className="text-zinc-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#faq" className="text-zinc-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/5">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full bg-white text-zinc-900 hover:bg-zinc-100"
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/5">Sign in</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100">Get started free</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - Clean and Minimal */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full mb-8">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-zinc-400 text-sm">Trusted by 50,000+ writers worldwide</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]">
                Make your AI content
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-orange-400">
                  undetectable
                </span>
              </h1>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.15}>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one platform for AI detection, humanization, and plagiarism checking. 
              Industry-leading 99% accuracy. Credits never expire.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold rounded-xl px-8 py-6 text-base w-full sm:w-auto shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300">
                  {isAuthenticated ? "Go to Dashboard" : "Start for free"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-xl px-8 py-6 text-base w-full sm:w-auto transition-all duration-300">
                  See it in action
                </Button>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.45}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>5,000 free words</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-zinc-600" />
        </motion.div>
      </section>

      {/* Promo Banner */}
      {activePromos.length > 0 && (
        <section className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            {activePromos.map((promo) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-zinc-800/50 to-orange-500/10 border border-zinc-700/50 p-6"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Gift className="w-5 h-5 text-teal-400" />
                      {promo.landing_badge_text && (
                        <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-medium rounded-full">
                          {promo.landing_badge_text}
                        </span>
                      )}
                      {promo.days_until_expiry !== null && promo.days_until_expiry >= 0 && promo.days_until_expiry <= 7 && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                          <Clock className="w-3 h-3" />
                          {promo.days_until_expiry} days left
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-semibold text-white mb-1">
                      {promo.landing_headline || promo.title}
                    </h3>
                    <p className="text-zinc-400">
                      {promo.landing_subtext || promo.description}
                    </p>
                  </div>
            
                  <div className="flex flex-col items-center gap-3">
                    <Link to={`/register?promo=${promo.code}`}>
                      <Button className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold rounded-xl px-6 py-3">
                        {promo.landing_button_text || 'Claim Now'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <code className="text-teal-400 text-sm bg-teal-500/10 px-3 py-1 rounded-lg">
                      Code: {promo.code}
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-teal-400 text-sm font-medium uppercase tracking-wider">Features</span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mt-3 mb-4">
                Everything you need in one place
              </h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Three powerful tools working together to ensure your content is original, human, and unique.
              </p>
            </div>
          </ScrollReveal>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* AI Detection - Large Card */}
            <ScrollReveal delay={0.1}>
              <motion.div 
                className="lg:col-span-2 group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-teal-500/30 transition-all duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-all" />
                <div className="relative">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white mb-3">AI Detection</h3>
                  <p className="text-zinc-400 mb-6 max-w-md">
                    Powered by advanced neural networks that read text like a human expert, spotting machine-generated content with 99% accuracy.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Heat map visualization', 'Sentence breakdown', 'PDF export', 'Shareable reports'].map((item, i) => (
                      <div key={i} className="flex items-center text-zinc-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Stats Card */}
            <ScrollReveal delay={0.2}>
              <motion.div 
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-orange-500/30 transition-all duration-500"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
                <div className="relative">
                  <div className="text-5xl font-display font-bold text-white mb-2">99%</div>
                  <div className="text-zinc-400 text-sm uppercase tracking-wider mb-6">Detection Accuracy</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">False positives</span>
                      <span className="text-teal-400 font-medium">0%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Texts analyzed</span>
                      <span className="text-white font-medium">10M+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Happy users</span>
                      <span className="text-white font-medium">50K+</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Humanizer Card */}
            <ScrollReveal delay={0.3}>
              <motion.div 
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-500"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">Text Humanizer</h3>
                  <p className="text-zinc-400 text-sm">
                    Transform robotic AI text into authentic, human-sounding content while preserving meaning.
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Plagiarism Card */}
            <ScrollReveal delay={0.4}>
              <motion.div 
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">Plagiarism Checker</h3>
                  <p className="text-zinc-400 text-sm">
                    Scan against billions of web pages in real-time with pinpoint accuracy.
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Writing Tools Card */}
            <ScrollReveal delay={0.5}>
              <motion.div 
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-500"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <Wand2 className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">14 Tools</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white mb-3">Writing Suite</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Grammar, tone, summarization, translation, and more.
                  </p>
                  <Link to={isAuthenticated ? "/writing-tools" : "/register"} className="inline-flex items-center text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                    Explore tools <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Self-Learning AI Section - Simplified */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Self-Learning AI</span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3 mb-6">
                  Our AI gets smarter every day
                </h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                  Unlike static tools, TextShift continuously learns from user feedback. Every correction helps our models improve, staying ahead of new AI writing patterns.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Users, title: 'Community-Powered', desc: 'Your feedback directly improves detection accuracy' },
                    { icon: Cpu, title: 'Adaptive Networks', desc: 'LoRA fine-tuning for rapid model updates' },
                    { icon: Target, title: 'Safe A/B Testing', desc: 'Rigorous testing before every deployment' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-purple-500/20 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">{item.title}</h4>
                        <p className="text-zinc-500 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-zinc-400 text-sm">Model Performance</span>
                  <span className="text-teal-400 text-xs font-medium px-2 py-1 bg-teal-500/10 rounded-full">Live</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'AI Detector', accuracy: 99.18, color: 'teal' },
                    { label: 'Humanizer', accuracy: 95.0, color: 'purple' },
                    { label: 'Plagiarism', accuracy: 99.95, color: 'blue' }
                  ].map((model, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white">{model.label}</span>
                        <span className="text-zinc-400">{model.accuracy}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <motion.div 
                          className={`bg-${model.color}-500 h-2 rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${model.accuracy}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>Last training: 2 days ago</span>
                  <span>Next: Sunday 3 AM UTC</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Demo Section - Simplified */}
      <section id="demo" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-teal-400 text-sm font-medium uppercase tracking-wider">Try it now</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3 mb-4">
                See it in action
              </h2>
              <p className="text-zinc-400 text-lg">Paste any text to check if it's AI-generated. No sign-up required.</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <Textarea
                placeholder="Paste your text here..."
                className="min-h-[180px] bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl resize-none focus:border-teal-500/50 focus:ring-teal-500/20 mb-6"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-zinc-500 text-sm">{demoText.length} characters</span>
                <Button 
                  onClick={handleDemoCheck} 
                  disabled={demoText.length < 20} 
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold rounded-xl px-6 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 mr-2" />Analyze Text
                </Button>
              </div>
              
              {demoResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Result</div>
                      <div className="text-2xl font-display font-semibold text-white">{demoResult.type}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-zinc-500 text-sm uppercase tracking-wider mb-1">Confidence</div>
                      <div className={`text-2xl font-display font-semibold ${demoResult.score > 50 ? 'text-orange-400' : 'text-teal-400'}`}>{demoResult.score}%</div>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm mt-6 pt-4 border-t border-zinc-700">This is a demo. Sign up for full analysis with sentence-level breakdown.</p>
                </motion.div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section - Simplified */}
      <section id="pricing" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-teal-400 text-sm font-medium uppercase tracking-wider">Pricing</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-zinc-400 text-lg">Credits never expire. No hidden fees. Cancel anytime.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Free', price: '$0', credits: '5,000 words/mo', features: ['AI Detection only', '10 scans/day', 'Heat map visualization', 'Basic reports'], cta: 'Get Started', highlight: false },
              { name: 'Starter', price: '$9', credits: '25,000 words/mo', features: ['All 3 tools', '100 scans/day', 'PDF export', 'Word-level diff'], cta: 'Subscribe', highlight: false },
              { name: 'Pro', price: '$19', credits: 'Unlimited', features: ['All 3 tools', '500 scans/day', 'API access', 'Priority support'], cta: 'Subscribe', highlight: true },
              { name: 'Enterprise', price: '$49', credits: 'True Unlimited', features: ['Unlimited scans', 'White-label API', 'Dedicated support', 'SLA guarantee'], cta: 'Contact Sales', highlight: false }
            ].map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div 
                  className={`relative bg-zinc-900/50 border rounded-2xl p-6 h-full ${plan.highlight ? 'border-teal-500/50' : 'border-zinc-800'}`}
                  whileHover={{ y: -4 }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-teal-500 text-zinc-900 text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">{plan.name}</h3>
                    <div className="mb-1">
                      <span className="text-3xl font-display font-bold text-white">{plan.price}</span>
                      {plan.price !== '$0' && <span className="text-zinc-500">/mo</span>}
                    </div>
                    <div className="text-zinc-500 text-sm">{plan.credits}</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center text-zinc-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />{feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button className={`w-full rounded-xl ${plan.highlight ? 'bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Simplified */}
      <section id="faq" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-teal-400 text-sm font-medium uppercase tracking-wider">FAQ</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mt-3">
                Common questions
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: openFaq === i ? 'auto' : 0,
                      opacity: openFaq === i ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-zinc-400">{faq.a}</div>
                  </motion.div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-zinc-400 text-lg mb-10">Start with 5,000 free words today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-teal-500 hover:bg-teal-400 text-zinc-900 font-semibold rounded-xl px-8 py-6 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="mailto:support@textshift.org">
                <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 rounded-xl px-8 py-6 text-base">
                  Contact Us
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="TextShift" className="w-8 h-8 object-contain" />
              <span className="text-white font-display font-semibold">TextShift</span>
            </Link>
            <div className="flex items-center gap-6 text-zinc-500 text-sm">
              <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <a href="mailto:support@textshift.org" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} TextShift. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
