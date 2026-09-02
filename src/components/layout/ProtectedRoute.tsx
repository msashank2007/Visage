'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, demoSignIn } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-fuchsia-400 animate-spin [animation-duration:1.5s]" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Initializing Secure AI Environment...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center space-y-6 border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="text-sm text-slate-400">
              Please sign in to access the FaceLens AI Scanning Studio and view your scan history.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => demoSignIn('Explorer')}
              className="w-full py-3 px-6 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition-all text-xs"
            >
              Continue as Guest (Instant Demo Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
