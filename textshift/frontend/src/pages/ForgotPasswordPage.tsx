import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
            </Link>
          </div>

          <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-light text-white mb-4">Check your email</h1>
            <p className="text-gray-400 mb-6">
              If an account exists for <span className="text-emerald-400">{email}</span>, we've sent a password reset link.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-full h-12"
              >
                Try another email
              </Button>
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
          </Link>
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-2">Forgot password?</h1>
          <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 rounded-xl h-12 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full h-12"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-gray-400 hover:text-white transition inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
