'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostLoginTransition from '@/components/auth/PostLoginTransition';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  LogIn, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Key
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
];

export default function LoginPage() {
  const router = useRouter();
  const { 
    user,
    signInWithEmail, 
    signInWithPhone,
    signInWithGoogleProfile,
    demoSignIn, 
    resetPassword 
  } = useAuth();

  // Authentication Mode: 'phone' (WhatsApp/SMS OTP) vs 'email' (Instagram style)
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');

  // Email / Password Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone / WhatsApp OTP State
  const [selectedCountry, setSelectedCountry] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);

  // Global UX State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Post-login scanning transition overlay state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedName, setAuthenticatedName] = useState('Explorer');

  // Sync authenticated name from user context (e.g. after Google sign-in populates user)
  useEffect(() => {
    if (user?.displayName && isAuthenticating && !authenticatedName) {
      setAuthenticatedName(user.displayName);
    }
  }, [user, isAuthenticating, authenticatedName]);
  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === 'verify' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, otpTimer]);

  // Handle Email / Password Login (Instagram style)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      setAuthenticatedName(email.split('@')[0] || 'Explorer');
      setIsAuthenticating(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  // Handle Phone OTP Request (WhatsApp style Step 1)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phoneNumber || phoneNumber.length < 6) {
      setError('Please enter a valid mobile phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpStep('verify');
      setOtpTimer(30);
      setSuccessMsg(`Verification code sent via WhatsApp / SMS to ${selectedCountry} ${phoneNumber}`);
    }, 800);
  };

  // Handle OTP Code Change
  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next digit box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP Verification Submit (WhatsApp style Step 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    try {
      setLoading(true);
      const fullPhone = `${selectedCountry} ${phoneNumber}`;
      await signInWithPhone(fullPhone, fullCode);
      setAuthenticatedName(`User ${phoneNumber.slice(-4)}`);
      setIsAuthenticating(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    setOtpTimer(30);
    setOtpCode(['', '', '', '', '', '']);
    setSuccessMsg(`New 6-digit verification code dispatched to ${selectedCountry} ${phoneNumber}`);
  };

  // Handle real Google OAuth success — called by GoogleSignInButton after popup
  const handleGoogleSuccess = (info: { name: string; email: string; picture: string; sub: string }) => {
    signInWithGoogleProfile(info);
    setAuthenticatedName(info.name || 'Google User');
    setIsAuthenticating(true);
  };

  const handleGoogleError = (msg: string) => {
    setError(msg);
    setLoading(false);
  };

  const handleDemoSignIn = () => {
    demoSignIn('Explorer');
    setAuthenticatedName('Demo Explorer');
    setIsAuthenticating(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await resetPassword(resetEmail);
      setShowResetModal(false);
      setSuccessMsg(`Password reset instructions sent to ${resetEmail}`);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl space-y-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 mx-auto shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">FaceLens Account</h1>
            <p className="text-xs text-slate-400">Official Secure Login & Multi-Device Sync</p>
          </div>

          {/* Official Auth Method Switcher Tabs (WhatsApp OTP vs Instagram Email) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('phone');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'phone'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp / Phone</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'email'
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* METHOD 1: WhatsApp / SMS OTP Phone Login */}
          {authMode === 'phone' && (
            <div className="space-y-4">
              {otpStep === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Mobile Phone Number</span>
                      <span className="text-[10px] text-emerald-400 font-mono">WhatsApp OTP</span>
                    </label>

                    <div className="flex gap-2">
                      {/* Country Code Dropdown */}
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 cursor-pointer shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-slate-950 text-white">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>

                      {/* Phone Number Input */}
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="888 555 0199"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-all font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{loading ? 'Sending Code...' : 'Get WhatsApp / SMS Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit OTP Code Verification */
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <Key className="w-3.5 h-3.5" />
                      <span>OTP Sent to {selectedCountry} {phoneNumber}</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Enter the 6-digit security code sent to your phone:
                    </p>
                  </div>

                  {/* 6 Individual Digit Boxes */}
                  <div className="flex justify-center gap-2 py-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && idx > 0) {
                            document.getElementById(`otp-input-${idx - 1}`)?.focus();
                          }
                        }}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.join('').length < 6}
                    className="btn-futuristic-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      ← Change Phone Number
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0}
                      className={`flex items-center gap-1 font-semibold ${
                        otpTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-cyan-400 hover:underline'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${otpTimer > 0 ? 'animate-spin' : ''}`} />
                      <span>{otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend Code'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: Instagram Style Email / Username & Password Login */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-xs text-cyan-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    required
                  />
                  {/* Eye Toggle Show/Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-white/20 text-cyan-500 focus:ring-cyan-500/40 accent-cyan-500"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-futuristic-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
              </button>
            </form>
          )}

          {/* Social Sign-In Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative px-3 bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400">Or continue with</span>
          </div>

          <div className="space-y-2">
            {/* Google SSO Button — real account picker */}
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              loading={loading}
            />

            {/* Instant Demo Sign-In */}
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="btn-futuristic-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Instant Guest Mode (No Auth Needed)</span>
            </button>
          </div>

          {/* End-to-End Encryption Security Footer Badge */}
          <div className="pt-3 border-t border-white/10 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>End-to-End Encrypted Session</span>
            </div>

            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-cyan-400 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full glass-card p-6 rounded-3xl space-y-4 border border-white/10">
            <h3 className="text-lg font-bold text-white">Reset Password</h3>
            <p className="text-xs text-slate-400">Enter your email address to receive password reset instructions.</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn-futuristic-secondary w-1/2 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-futuristic-primary w-1/2 py-2 rounded-xl text-xs font-semibold"
                >
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realistic Neural AI Scanner Post-Login Transition Overlay */}
      {isAuthenticating && (
        <PostLoginTransition
          userName={authenticatedName}
          onComplete={() => router.push('/scan')}
        />
      )}

      <Footer />
    </div>
  );
}
