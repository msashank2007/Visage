'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Database, 
  Key, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOutUser, isFirebaseActive } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const sampleEnvTemplate = `NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef"`;

  const copyEnvTemplate = () => {
    navigator.clipboard.writeText(sampleEnvTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearLocalCache = () => {
    if (confirm('Clear all local in-browser scan cache? This will reset local demo scan history.')) {
      localStorage.removeItem('facelens_scans_v1');
      alert('Local scan cache cleared!');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white relative">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-white/10 pb-6 space-y-1">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Account & <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-xs text-slate-400">
              Manage your profile, theme preferences, and Firebase connection keys
            </p>
          </div>

          <div className="space-y-6">
            
            {/* PROFILE SECTION */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-cyan-400" /> Account Profile
              </h3>

              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-extrabold text-lg shadow-md">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">{user?.displayName || 'Explorer'}</h4>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    {user?.isDemo && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                        Guest / Demo User
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={signOutUser}
                  className="btn-futuristic-danger px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* THEME PREFERENCES */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />} Appearance & Theme
              </h3>

              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-white">Active Theme Mode</div>
                  <div className="text-xs text-slate-400">
                    Currently set to <span className="capitalize text-cyan-400 font-semibold">{theme} Mode</span>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="btn-futuristic-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </button>
              </div>
            </div>

            {/* FIREBASE CONFIG & INTEGRATION GUIDE */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" /> Firebase Connection
                </h3>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  isFirebaseActive 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}>
                  {isFirebaseActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{isFirebaseActive ? 'Live Firebase Active' : 'Local Demo Mode'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                FaceLens is built to automatically connect to your Firebase project (Authentication, Firestore, Storage) when environment variables are configured. If keys are omitted, it seamlessly runs in local browser storage mode.
              </p>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-cyan-400" />
                    Environment Template (.env.local)
                  </span>
                  <button
                    onClick={copyEnvTemplate}
                    className="btn-futuristic-secondary px-3 py-1 rounded-lg text-[11px] flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copied ? 'Copied!' : 'Copy Template'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-cyan-300 overflow-x-auto border border-white/5">
                  {sampleEnvTemplate}
                </pre>
              </div>
            </div>

            {/* DATA & STORAGE CONTROLS */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" /> Data Maintenance
              </h3>

              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-white">Clear In-Browser Cache</div>
                  <div className="text-xs text-slate-400">Reset local offline demo scan records</div>
                </div>

                <button
                  onClick={handleClearLocalCache}
                  className="btn-futuristic-danger px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Clear Cache
                </button>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
