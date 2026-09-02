'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Scan, 
  Sparkles, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Users, 
  Activity, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Camera 
} from 'lucide-react';

// Dynamic import for R3F canvas to avoid SSR window issues
const HologramFace = dynamic(() => import('@/components/3d/HologramFace'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-slate-900/40 rounded-3xl border border-white/10">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
      <span className="text-xs text-slate-400 font-mono">Initializing 3D Particle Mesh...</span>
    </div>
  ),
});

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white selection:bg-cyan-500 selection:text-slate-950 relative">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-24 pt-8 pb-16">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[75vh]">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-semibold text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Next-Gen Client-Side AI Vision</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Decode Faces in Real-Time with{' '}
              <span className="gradient-text">Sub-Second AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              FaceLens brings powerful, privacy-first computer vision straight to your browser. Instantly detect multiple faces, age ranges, gender confidence, and granular 7-emotion breakdowns using local GPU acceleration.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/scan"
                className="btn-futuristic-primary px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 group"
              >
                <Scan className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                <span>Launch AI Scan Studio</span>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="btn-futuristic-secondary px-8 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
              >
                <span>Sign In / Demo Mode</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Client Privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>200ms Live Feed</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Multi-Face Engine</span>
              </div>
            </div>
          </div>

          {/* Right 3D Holographic Visual Hero Box */}
          <div className="lg:col-span-5 relative">
            <div className="w-full aspect-square max-w-md mx-auto glass-card rounded-3xl border border-cyan-500/30 p-2 shadow-2xl shadow-cyan-500/20 relative">
              <HologramFace />
              
              {/* Floating Stat Badge 1 */}
              <div className="absolute top-6 left-6 glass-panel px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white flex items-center gap-2 shadow-lg">
                <Activity className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Accuracy</div>
                  <div className="font-mono text-cyan-300">98.4% Confidence</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div className="absolute bottom-6 right-6 glass-panel px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white flex items-center gap-2 shadow-lg">
                <BarChart3 className="w-4 h-4 text-fuchsia-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Emotions</div>
                  <div className="font-mono text-fuchsia-300">7 Core Categories</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE HIGHLIGHTS GRID */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built with Next-Gen Neural Intelligence
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Experience zero latency analytics powered by TensorFlow.js and custom computer vision pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Simultaneous Multi-Face Detection</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan group photos or crowded camera feeds effortlessly. Each detected face receives its own color-coded bounding box and isolated analytical card.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Live Webcam Overlay</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stream live video with smooth real-time bounding box overlays updating at 200ms intervals without UI stutter or server dependencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">7-Category Emotion Radar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Analyze micro-expressions: Happy, Sad, Angry, Surprised, Neutral, Fearful, and Disgusted with precise probability distribution charts.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON / WHY FACELENS */}
        <section className="glass-card p-8 sm:p-12 rounded-3xl border border-cyan-500/30 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Why Gen Z & Tech Innovators Choose FaceLens
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional facial analysis apps require uploading your private photos to remote cloud servers with expensive per-request API costs. FaceLens runs 100% locally in your browser.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No server API costs or rate limits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant guest demo mode out of the box</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Seamless sync with Firebase Cloud Firestore</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-900/60 p-8 rounded-2xl border border-white/10 space-y-4 text-center">
              <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />
              <div className="text-3xl font-extrabold text-white">100% On-Device AI</div>
              <p className="text-xs text-slate-400 max-w-xs">
                Your camera stream never leaves your graphics card. Fast, private, and secure.
              </p>
              <Link
                href="/scan"
                className="btn-futuristic-primary mt-2 px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                Try Scanning Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
