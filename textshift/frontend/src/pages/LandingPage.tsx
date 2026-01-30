import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    { q: "What makes TextShift different?", a: "TextShift combines AI detection, humanization, and plagiarism checking in one platform with 99.18% accuracy. Credits never expire, and we're 40-70% cheaper than competitors." },
    { q: "How accurate is the AI detection?", a: "Our RoBERTa-based model achieves 99.18% accuracy with 0% false positives, tested against all major AI writing tools including GPT-4, Claude, and Gemini." },
    { q: "Can I cancel my subscription anytime?", a: "Yes! You can cancel, pause, or change your plan at any time. Your unused credits roll over and never expire." },
    { q: "How does the humanizer work?", a: "Our T5-based humanizer rewrites AI-generated text to sound natural while preserving meaning. It achieves 0% AI detection on all major detectors." },
    { q: "Is my content secure?", a: "Absolutely. We don't store your content after processing. All data is encrypted in transit and at rest." }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-t from-rose-500/20 via-rose-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <nav className="fixed w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
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
            <Link to="/register">
              <Button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-full px-6">Get Started</Button>
            </Link>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10 p-6">
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
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8">
            Transform your content<br />with <span className="text-emerald-400">AI.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            The most accurate AI detection, humanization, and plagiarism checking platform. 99.18% accuracy. Credits never expire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-full px-8 py-6 text-lg w-full sm:w-auto">Start Free</Button>
            </Link>
            <a href="#demo">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 py-6 text-lg w-full sm:w-auto">Try Demo <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light leading-tight">
            <span className="text-white">We're a </span><span className="text-gray-500">full-service</span><br />
            <span className="text-gray-500">AI Content</span><br />
            <span className="text-emerald-400">Platform</span><span className="text-2xl ml-4">&#128075;</span>
            <span className="text-white"> We turn</span><br />
            <span className="text-white">AI-generated text</span><br />
            <span className="text-gray-500">into </span><span className="text-emerald-400">human-quality content.</span>
          </h2>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Our <span className="text-emerald-400">Tools</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Three powerful tools, one platform. Everything you need to ensure your content is original, human-like, and plagiarism-free.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">AI Detection</h3>
                <p className="text-gray-400 mb-6">Detect AI-generated content with 99.18% accuracy using our RoBERTa-based model.</p>
                <ul className="space-y-3">
                  {['10-level confidence analysis', 'Sentence-by-sentence breakdown', 'All major AI models supported', 'Real-time detection'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-sm"><CheckCircle className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">Text Humanizer</h3>
                <p className="text-gray-400 mb-6">Transform AI text to bypass all detectors while maintaining meaning and quality.</p>
                <ul className="space-y-3">
                  {['0% AI detection after humanization', 'Preserves original meaning', 'Natural writing style', 'Multiple tone options'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-sm"><CheckCircle className="w-4 h-4 text-purple-400 mr-3 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="group relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">Plagiarism Checker</h3>
                <p className="text-gray-400 mb-6">Check for plagiarism against billions of sources with web search integration.</p>
                <ul className="space-y-3">
                  {['99.95% accuracy', 'Web source detection', 'Paraphrase detection', 'Detailed source reports'].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-sm"><CheckCircle className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '99.18%', label: 'Detection Accuracy' },
              { value: '0%', label: 'False Positives' },
              { value: '50K+', label: 'Users Trust Us' },
              { value: '10M+', label: 'Texts Analyzed' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-2">{stat.value}</div>
                <div className="text-gray-500 text-xs md:text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Try it <span className="text-emerald-400">now</span></h2>
            <p className="text-gray-400 text-lg">Paste any text to see our AI detection in action. No sign-up required.</p>
          </div>
          
          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8">
            <Textarea
              placeholder="Paste your text here to check if it's AI-generated..."
              className="min-h-[200px] bg-black/30 border-white/10 text-white placeholder:text-gray-600 rounded-2xl resize-none focus:border-emerald-500/50 focus:ring-emerald-500/20 mb-6"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-gray-500 text-sm">{demoText.length} characters</span>
              <Button onClick={handleDemoCheck} disabled={demoText.length < 20} className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full px-8 w-full sm:w-auto">
                <Zap className="w-4 h-4 mr-2" />Analyze Text
              </Button>
            </div>
            
            {demoResult && (
              <div className="mt-8 p-6 bg-black/30 rounded-2xl border border-white/10">
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
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">Plans to suit <span className="text-emerald-400">your needs</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Credits never expire. No hidden fees. Cancel anytime.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: '$0', credits: '20,000', features: ['All 3 tools', 'Basic support', 'Credits never expire'], cta: 'Get Started', highlight: false },
              { name: 'Starter', price: '$7', credits: '100,000', features: ['All 3 tools', 'Priority processing', 'Email support', 'Credits rollover'], cta: 'Subscribe', highlight: false },
              { name: 'Pro', price: '$15', credits: '500,000', features: ['All 3 tools', 'API access', 'Batch processing', 'Priority support', 'Credits rollover'], cta: 'Subscribe', highlight: true },
              { name: 'Enterprise', price: '$40', credits: 'Unlimited', features: ['All 3 tools', 'White-label option', 'Dedicated support', 'Custom integrations', 'SLA guarantee'], cta: 'Contact Sales', highlight: false }
            ].map((plan, i) => (
              <div key={i} className={`relative bg-gradient-to-b from-white/5 to-transparent border rounded-3xl p-6 md:p-8 ${plan.highlight ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-white/10'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-black text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl md:text-4xl font-light text-white">{plan.price}</span>
                    {plan.price !== '$0' && <span className="text-gray-500">/month</span>}
                  </div>
                  <div className="text-gray-500 text-sm">{plan.credits} credits</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-gray-300 text-sm"><CheckCircle className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />{feature}</li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button className={`w-full rounded-full ${plan.highlight ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>{plan.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">What our <span className="text-emerald-400">clients say</span></h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "TextShift's AI detection is incredibly accurate. It's become an essential tool for our content team.", author: "Sarah M.", role: "Content Manager", company: "TechCorp" },
              { quote: "The humanizer feature is a game-changer. Our AI-assisted content now passes all detection tools.", author: "James K.", role: "Marketing Director", company: "GrowthLabs" },
              { quote: "Finally, a plagiarism checker that actually finds paraphrased content. Worth every penny.", author: "Dr. Emily R.", role: "University Professor", company: "Stanford" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (<Star key={j} className="w-4 h-4 text-emerald-400 fill-emerald-400" />))}
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
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4"><span className="text-emerald-400">FAQ</span></h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 md:p-6 text-left">
                  <span className="text-white font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (<div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-400">{faq.a}</div>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-32 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-light text-white mb-8">Let's <span className="text-emerald-400">talk.</span></h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">Ready to transform your content workflow? Start with 20,000 free credits today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full px-8 md:px-12 py-6 text-lg w-full sm:w-auto">Get Started Free<ArrowRight className="ml-2 w-5 h-5" /></Button>
            </Link>
            <a href="mailto:support@textshift.org">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 rounded-full px-8 md:px-12 py-6 text-lg w-full sm:w-auto">Contact Us</Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
            </div>
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
