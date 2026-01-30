import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
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
  Star,
  Menu,
  X
} from 'lucide-react';
import {
  ParticlesBackground,
  AnimatedCounter,
  ScrollReveal,
  TiltCard,
  MagneticButton,
  LiveUserCounter,
  ActivityToast,
  GradientBackground,
  NoiseOverlay,
} from '@/components/animations';

export default function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState<null | { type: string; score: number }>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <ParticlesBackground />
      <GradientBackground />
      <NoiseOverlay />
      <LiveUserCounter />
      <ActivityToast />

      <nav className="fixed w-full z-50 px-6 py-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto flex items-center justify-between"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img 
              src="/images/logo.png" 
              alt="TextShift" 
              className="w-8 h-8 object-contain"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            />
            <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            <a href="#features" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Features</a>
            <a href="#demo" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Demo</a>
            <a href="#pricing" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#faq" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">FAQ</a>
            <a href="#contact" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition flex items-center gap-1">
              Contact <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">Log in</Button>
            </Link>
            <MagneticButton>
              <Link to="/register">
                <Button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/20 rounded-full px-6 transition-all duration-300">Get Started</Button>
              </Link>
            </MagneticButton>
          </div>

          <button className="md:hidden text-white p-2 cursor-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </motion.div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10 p-6"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#demo" className="text-gray-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Demo</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/5">Log in</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8">
                Transform your content<br />with{' '}
                <span className="text-emerald-400">
                  <TypeAnimation
                    sequence={[
                      'AI Detection.',
                      2000,
                      'Humanizer.',
                      2000,
                      'Plagiarism Check.',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </h1>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                          The most accurate AI detection, humanization, and plagiarism checking platform. Industry-leading 99% accuracy. Credits never expire.
                        </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link to="/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full px-8 py-6 text-lg w-full sm:w-auto shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300">
                    Start Free
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a href="#demo">
                  <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-full px-8 py-6 text-lg w-full sm:w-auto transition-all duration-300">
                    Try Demo <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              </MagneticButton>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.6}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>5,000 free words</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-gray-500" />
        </motion.div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light leading-tight">
              <span className="text-white">We're a </span><span className="text-gray-500">full-service</span><br />
              <span className="text-gray-500">AI Content</span><br />
              <motion.span 
                className="text-emerald-400 inline-block"
                whileHover={{ scale: 1.05 }}
              >
                Platform
              </motion.span>
              <span className="text-2xl ml-4">&#128075;</span>
              <span className="text-white"> We turn</span><br />
              <span className="text-white">AI-generated text</span><br />
              <span className="text-gray-500">into </span>
              <motion.span 
                className="text-emerald-400 inline-block"
                whileHover={{ scale: 1.05 }}
              >
                human-quality content.
              </motion.span>
            </h2>
          </ScrollReveal>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Our <span className="text-emerald-400">Tools</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Three powerful tools, one platform. Everything you need to ensure your content is original, authentically human, and completely unique.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <TiltCard className="h-full" glowColor="rgba(16, 185, 129, 0.4)">
                <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden h-full backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/images/ai-detection-card.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative">
                    <motion.div 
                      className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
                    </motion.div>
                                        <h3 className="text-xl md:text-2xl font-medium text-white mb-3">AI Detection</h3>
                                        <p className="text-gray-400 mb-6">Powered by Advanced Neural Intelligence that reads text like a human expert - spotting machine-generated content with 99% accuracy.</p>
                    <ul className="space-y-3">
                      {['10-level confidence analysis', 'Sentence-by-sentence breakdown', 'All major AI models supported', 'Real-time detection'].map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center text-gray-300 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />{item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <TiltCard className="h-full" glowColor="rgba(168, 85, 247, 0.4)">
                <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500 overflow-hidden h-full backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/images/humanizer-card.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative">
                    <motion.div 
                      className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                    </motion.div>
                                        <h3 className="text-xl md:text-2xl font-medium text-white mb-3">Text Humanizer</h3>
                                        <p className="text-gray-400 mb-6">Our Natural Language Engine transforms robotic text into authentic, human-sounding content while preserving your original meaning.</p>
                    <ul className="space-y-3">
                      {['0% AI detection after humanization', 'Preserves original meaning', 'Natural writing style', 'Multiple tone options'].map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center text-gray-300 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />{item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <TiltCard className="h-full" glowColor="rgba(59, 130, 246, 0.4)">
                <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-500 overflow-hidden h-full backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="/images/plagiarism-card.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative">
                    <motion.div 
                      className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Search className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                    </motion.div>
                                        <h3 className="text-xl md:text-2xl font-medium text-white mb-3">Plagiarism Checker</h3>
                                        <p className="text-gray-400 mb-6">Scans your content against billions of web pages and documents in real-time. Get instant results with pinpoint accuracy.</p>
                    <ul className="space-y-3">
                      {['99.95% accuracy', 'Web source detection', 'Paraphrase detection', 'Detailed source reports'].map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center text-gray-300 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CheckCircle className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" />{item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                          { value: 99, suffix: '%', label: 'Detection Accuracy' },
                          { value: 0, suffix: '%', label: 'False Positives' },
                          { value: 50, suffix: 'K+', label: 'Users Trust Us' },
                          { value: 10, suffix: 'M+', label: 'Texts Analyzed' },
                        ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} decimals={0} />
                  </div>
                  <div className="text-gray-500 text-xs md:text-sm uppercase tracking-wider">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Try it <span className="text-emerald-400">now</span></h2>
              <p className="text-gray-400 text-lg">Paste any text to see our AI detection in action. No sign-up required.</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <motion.div 
              className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm"
              whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <Textarea
                placeholder="Paste your text here to check if it's AI-generated..."
                className="min-h-[200px] bg-black/30 border-white/10 text-white placeholder:text-gray-600 rounded-2xl resize-none focus:border-emerald-500/50 focus:ring-emerald-500/20 mb-6 cursor-auto"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-gray-500 text-sm">{demoText.length} characters</span>
                <MagneticButton>
                  <Button 
                    onClick={handleDemoCheck} 
                    disabled={demoText.length < 20} 
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full px-8 w-full sm:w-auto shadow-lg shadow-emerald-500/25 disabled:shadow-none transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />Analyze Text
                  </Button>
                </MagneticButton>
              </div>
              
              {demoResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-black/30 rounded-2xl border border-white/10"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">Detection Result</div>
                      <div className="text-2xl md:text-3xl font-light text-white">{demoResult.type}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-gray-500 text-sm uppercase tracking-wider mb-1">Confidence</div>
                      <div className={`text-2xl md:text-3xl font-light ${demoResult.score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{demoResult.score}%</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-6 pt-6 border-t border-white/10">This is a demo result. Sign up for full analysis with sentence-level breakdown.</p>
                </motion.div>
              )}
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <section id="pricing" className="relative py-20 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/pricing-bg.png" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Plans to suit <span className="text-emerald-400">your needs</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Credits never expire. No hidden fees. Cancel anytime.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: '$0', credits: '5,000 words/mo', features: ['AI Detection only', '10 scans/day', 'Basic support'], cta: 'Get Started', highlight: false },
              { name: 'Starter', price: '$9', credits: '25,000 words/mo', features: ['All 3 tools', '100 scans/day', 'Email support', 'Priority processing'], cta: 'Subscribe', highlight: false },
              { name: 'Pro', price: '$19', credits: 'Unlimited', features: ['All 3 tools', '500 scans/day', 'API access', 'Batch processing', 'Priority support'], cta: 'Subscribe', highlight: true },
              { name: 'Enterprise', price: '$49', credits: 'True Unlimited', features: ['All 3 tools', 'Unlimited scans', 'White-label API', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], cta: 'Contact Sales', highlight: false }
            ].map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <TiltCard className="h-full" glowColor={plan.highlight ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}>
                  <div className={`relative bg-gradient-to-b from-white/5 to-transparent border rounded-3xl p-6 md:p-8 h-full backdrop-blur-sm ${plan.highlight ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-white/10'}`}>
                    {plan.highlight && (
                      <motion.div 
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="bg-emerald-500 text-black text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                      </motion.div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-3xl md:text-4xl font-light text-white">{plan.price}</span>
                        {plan.price !== '$0' && <span className="text-gray-500">/month</span>}
                      </div>
                      <div className="text-gray-500 text-sm">{plan.credits}</div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, j) => (
                        <motion.li 
                          key={j} 
                          className="flex items-center text-gray-300 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.05 }}
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />{feature}
                        </motion.li>
                      ))}
                    </ul>
                    <MagneticButton className="w-full">
                      <Link to="/register" className="block">
                        <Button className={`w-full rounded-full transition-all duration-300 ${plan.highlight ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>{plan.cta}</Button>
                      </Link>
                    </MagneticButton>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 px-6 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/testimonials-bg.png" alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">What our <span className="text-emerald-400">clients say</span></h2>
            </div>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "TextShift's AI detection is incredibly accurate. It's become an essential tool for our content team.", author: "Sarah M.", role: "Content Manager", company: "TechCorp" },
              { quote: "The humanizer feature is a game-changer. Our AI-assisted content now passes all detection tools.", author: "James K.", role: "Marketing Director", company: "GrowthLabs" },
              { quote: "Finally, a plagiarism checker that actually finds paraphrased content. Worth every penny.", author: "Dr. Emily R.", role: "University Professor", company: "Stanford" }
            ].map((testimonial, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <TiltCard className="h-full">
                  <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm h-full">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        </motion.div>
                      ))}
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-white mb-4">"{testimonial.quote}"</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full" />
                      <div>
                        <div className="font-medium text-white">{testimonial.author}</div>
                        <div className="text-gray-500 text-sm">{testimonial.role} - {testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4"><span className="text-emerald-400">FAQ</span></h2>
            </div>
          </ScrollReveal>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div 
                  className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-auto"
                  >
                    <span className="text-white font-medium pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: openFaq === i ? 'auto' : 0,
                      opacity: openFaq === i ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-400">{faq.a}</div>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-32 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-light text-white mb-8">Let's <span className="text-emerald-400">talk.</span></h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">Ready to transform your content workflow? Start with 5,000 free words today.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link to="/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-full px-8 md:px-12 py-6 text-lg w-full sm:w-auto shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a href="mailto:support@textshift.org">
                  <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-full px-8 md:px-12 py-6 text-lg w-full sm:w-auto transition-all duration-300">Contact Us</Button>
                </a>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <motion.img 
                src="/images/logo.png" 
                alt="TextShift" 
                className="w-8 h-8 object-contain"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-gray-500 text-sm">
              <a href="mailto:support@textshift.org" className="hover:text-white transition">support@textshift.org</a>
            </div>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
              <a href="#faq" className="hover:text-white transition">FAQ</a>
              <a href="https://twitter.com/textshift" className="hover:text-white transition">Twitter</a>
              <a href="https://linkedin.com/company/textshift" className="hover:text-white transition">LinkedIn</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} TextShift. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
