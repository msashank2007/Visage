'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostLoginTransition from '@/components/auth/PostLoginTransition';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { Sparkles, Mail, Lock, User as UserIcon, UserPlus, ShieldCheck, Database } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogleProfile, demoSignIn, isFirebaseActive } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Post-login transition state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticatedName, setAuthenticatedName] = useState('Explorer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      setLoading(true);
      await signUpWithEmail(name, email, password);
      setAuthenticatedName(name || 'Explorer');
      setIsAuthenticating(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-12 flex items-center justify-center">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl space-y-6 border border-cyan-500/30 relative shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Create Free Account</h1>
            <p className="text-xs text-slate-400">Unlock persistent multi-face scan history & cloud sync</p>
          </div>

          {!isFirebaseActive && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <Database className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Firebase keys not set. Launching account will create <b>Guest Demo Session</b>.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivers"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-futuristic-primary w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>{loading ? 'Creating...' : 'Create Free Account'}</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative px-3 bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-500">Or continue with</span>
          </div>

          <div className="space-y-2">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              loading={loading}
            />

            <button
              onClick={handleDemoSignIn}
              type="button"
              className="btn-futuristic-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Instant Guest Mode (No Auth Needed)</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>

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
