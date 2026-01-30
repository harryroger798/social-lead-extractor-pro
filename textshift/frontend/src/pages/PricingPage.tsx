import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CheckCircle, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { paymentApi } from '@/lib/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      credits: '20,000',
      features: ['All 3 tools', 'Basic support', 'Credits never expire'],
      cta: 'Get Started',
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '$7',
      credits: '100,000',
      features: ['All 3 tools', 'Priority processing', 'Email support', 'Credits rollover'],
      cta: 'Subscribe',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$15',
      credits: '500,000',
      features: ['All 3 tools', 'API access', 'Batch processing', 'Priority support', 'Credits rollover'],
      cta: 'Subscribe',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$40',
      credits: 'Unlimited',
      features: ['All 3 tools', 'White-label option', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:support@textshift.org?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    setLoading(planId);
    try {
      const order = await paymentApi.createOrder(planId);
      
      // Redirect to PayPal
      if (order.approval_url) {
        window.location.href = order.approval_url;
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(null);
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
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Credits never expire. No hidden fees. Cancel anytime.
            Pay with PayPal for secure transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
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
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Do credits expire?',
                a: 'No! Unlike our competitors, your credits never expire. Use them whenever you need.'
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes, you can change your plan at any time. Your unused credits will carry over.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept PayPal for secure payments. You can pay with your PayPal balance, bank account, or credit/debit card through PayPal.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Every new account gets 20,000 free credits to try all our tools.'
              },
              {
                q: 'How accurate is the AI detection?',
                a: 'Our AI detection has 99.18% accuracy with 0% false positives, tested against major AI models.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel your subscription anytime with no questions asked. Your credits remain valid.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-slate-400 mb-6">
            Contact our support team and we'll help you find the right plan.
          </p>
          <a href="mailto:support@textshift.org">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
