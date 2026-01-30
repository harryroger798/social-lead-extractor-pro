import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { ParticlesBackground, GradientBackground, NoiseOverlay } from '@/components/animations';
import { useAuthStore } from '@/store/authStore';

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  // Get email from location state (after registration) or from auth store (if user is logged in)
  const email = location.state?.email || user?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  // If user is already verified, redirect to dashboard
  useEffect(() => {
    if (user?.is_verified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleRegisterAgain = () => {
    logout();
    navigate('/register');
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setAlreadyVerified(false);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (data.already_verified) {
        setAlreadyVerified(true);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else if (data.sent) {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } catch (e) {
      console.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-12">
      <ParticlesBackground />
      <GradientBackground />
      <NoiseOverlay />

      <div className="w-full max-w-md relative text-center">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-white font-medium tracking-wide">TEXTSHIFT</span>
          </Link>
        </div>

        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-2xl md:text-3xl font-light text-white mb-4">Check Your Email</h1>
          
          <p className="text-gray-400 mb-2">We've sent a verification link to:</p>
          <p className="text-emerald-400 font-medium mb-6">{email || 'your email address'}</p>

          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to verify your account and start using TextShift. 
            The link will expire in 24 hours.
          </p>

          {alreadyVerified ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Email Already Verified!</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Your account is already verified. Redirecting to login...
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full h-12"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handleResend}
                disabled={resending || resent || !email}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full h-12"
              >
                {resent ? (
                  <><CheckCircle className="w-4 h-4 mr-2" />Email Sent!</>
                ) : resending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" />Resend Verification Email</>
                )}
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button onClick={handleResend} className="text-emerald-400 hover:text-emerald-300">
                click here to resend
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          Wrong email?{' '}
          <button onClick={handleRegisterAgain} className="text-emerald-400 hover:text-emerald-300">Register again</button>
        </div>
      </div>
    </div>
  );
}
