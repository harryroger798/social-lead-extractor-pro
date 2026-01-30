import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Sparkles, 
  Search, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const [demoResult, setDemoResult] = useState<null | { type: string; score: number }>(null);

  const handleDemoCheck = () => {
    if (demoText.length > 20) {
      // Simulate a demo result
      const score = Math.random() * 100;
      setDemoResult({
        type: score > 50 ? 'AI Generated' : 'Human Written',
        score: Math.round(score)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm fixed w-full z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TextShift</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
              <a href="#demo" className="text-slate-300 hover:text-white transition">Demo</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20">
            3-in-1 AI Content Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Detect. Humanize.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Verify Originality.
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            The most accurate AI detection, humanization, and plagiarism checking platform. 
            99.18% accuracy. Credits never expire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8">
                Start Free - 20,000 Credits
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8">
                Try Live Demo
              </Button>
            </a>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '99.18%', label: 'Detection Accuracy' },
              { value: '0%', label: 'False Positives' },
              { value: '50K+', label: 'Users Trust Us' },
              { value: '10M+', label: 'Texts Analyzed' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Three Powerful Tools, One Platform</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to ensure your content is original, human-like, and plagiarism-free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">AI Detection</CardTitle>
                <CardDescription className="text-slate-400">
                  Detect AI-generated content with 99.18% accuracy using our RoBERTa-based model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {['10-level confidence analysis', 'Sentence-by-sentence breakdown', 'Supports all major AI models', 'Real-time detection'].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Text Humanizer</CardTitle>
                <CardDescription className="text-slate-400">
                  Transform AI text to bypass all detectors while maintaining meaning and quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {['0% AI detection after humanization', 'Preserves original meaning', 'Natural writing style', 'Multiple tone options'].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Plagiarism Checker</CardTitle>
                <CardDescription className="text-slate-400">
                  Check for plagiarism against billions of sources with web search integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {['99.95% accuracy', 'Web source detection', 'Paraphrase detection', 'Detailed source reports'].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Try It Now</h2>
            <p className="text-slate-400 text-lg">
              Paste any text to see our AI detection in action. No sign-up required.
            </p>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <Textarea
                placeholder="Paste your text here to check if it's AI-generated..."
                className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 mb-4"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  {demoText.length} characters
                </span>
                <Button 
                  onClick={handleDemoCheck}
                  disabled={demoText.length < 20}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Text
                </Button>
              </div>
              
              {demoResult && (
                <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-sm">Detection Result</div>
                      <div className="text-2xl font-bold text-white">{demoResult.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Confidence</div>
                      <div className={`text-2xl font-bold ${demoResult.score > 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {demoResult.score}%
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mt-4">
                    This is a demo result. Sign up for full analysis with sentence-level breakdown.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Credits never expire. No hidden fees. Cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                credits: '20,000',
                features: ['All 3 tools', 'Basic support', 'Credits never expire'],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Starter',
                price: '$7',
                credits: '100,000',
                features: ['All 3 tools', 'Priority processing', 'Email support', 'Credits rollover'],
                cta: 'Subscribe',
                popular: false
              },
              {
                name: 'Pro',
                price: '$15',
                credits: '500,000',
                features: ['All 3 tools', 'API access', 'Batch processing', 'Priority support', 'Credits rollover'],
                cta: 'Subscribe',
                popular: true
              },
              {
                name: 'Enterprise',
                price: '$40',
                credits: 'Unlimited',
                features: ['All 3 tools', 'White-label option', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, i) => (
              <Card 
                key={i} 
                className={`relative bg-slate-800/50 border-slate-700 ${plan.popular ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== '$0' && <span className="text-slate-400">/month</span>}
                  </div>
                  <div className="text-slate-400 mt-2">
                    {plan.credits} credits
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Thousands</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "TextShift's AI detection is incredibly accurate. It's become an essential tool for our content team.",
                author: "Sarah M.",
                role: "Content Manager"
              },
              {
                quote: "The humanizer feature is a game-changer. Our AI-assisted content now passes all detection tools.",
                author: "James K.",
                role: "Marketing Director"
              },
              {
                quote: "Finally, a plagiarism checker that actually finds paraphrased content. Worth every penny.",
                author: "Dr. Emily R.",
                role: "University Professor"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of users who trust TextShift for their content needs.
            Start with 20,000 free credits today.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TextShift</span>
              </div>
              <p className="text-slate-400">
                The most accurate AI content detection, humanization, and plagiarism checking platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} TextShift. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
