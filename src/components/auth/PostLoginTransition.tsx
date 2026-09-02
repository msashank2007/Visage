'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Cpu, Dna, CheckCircle2, ArrowRight } from 'lucide-react';
import HologramFace from '@/components/3d/HologramFace';

interface PostLoginTransitionProps {
  userName: string;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Authenticating Credentials & Securing Session', icon: ShieldCheck, color: 'text-pink-400' },
  { label: 'Initializing TensorFlow.js & Face-API Models', icon: Cpu, color: 'text-amber-400' },
  { label: 'Calibrating 68-Point Craniofacial Landmark Mesh', icon: Dna, color: 'text-cyan-400' },
  { label: 'Loading Expression-Invariant Age Engine & Demographics', icon: Sparkles, color: 'text-emerald-400' },
];

export default function PostLoginTransition({ userName, onComplete }: PostLoginTransitionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress increment timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Step switching timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    // Completion timeout (2.6 seconds total animation duration)
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl text-white overflow-hidden p-4">
      {/* Vibrant Ambient Glowing Color Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/25 to-purple-600/25 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse pointer-events-none delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/15 to-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Animation Container */}
      <div className="relative max-w-lg w-full glass-card p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-center overflow-hidden">
        
        {/* Colorful Multi-Neon Top Accent Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-amber-400 via-emerald-400 to-cyan-500 animate-gradient" />

        {/* 3D Holographic Face Matrix Viewport */}
        <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden glass-panel border border-cyan-500/40 shadow-xl bg-slate-950/80 flex items-center justify-center group">
          {/* Laser Scanner Ring Overlay */}
          <div className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-pink-500 to-cyan-400 opacity-60 animate-ping pointer-events-none" />
          
          {/* Scanning Beam Sweep Effect */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] animate-scan-beam z-10 pointer-events-none" />

          {/* Three.js Hologram Face Mesh */}
          <div className="w-full h-full">
            <HologramFace />
          </div>

          {/* Corner Tech Decorators */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-pink-400 pointer-events-none" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
        </div>

        {/* Greeting & Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 text-pink-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span>AUTHENTICATION SUCCESSFUL</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Welcome, <span className="bg-gradient-to-r from-pink-400 via-amber-300 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">{userName}</span>!
          </h2>
          <p className="text-xs text-slate-300">
            Activating FaceLens AI Biometrics Vision Studio...
          </p>
        </div>

        {/* System Startup Steps Checklist */}
        <div className="space-y-2 text-left bg-slate-900/60 p-4 rounded-2xl border border-white/10 text-xs">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isDone = index < currentStepIndex || progress >= 100;
            const isCurrent = index === currentStepIndex && progress < 100;

            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-slate-800/80 border border-white/20 text-white translate-x-1 shadow-md' 
                    : isDone 
                    ? 'text-slate-300 opacity-90' 
                    : 'text-slate-500 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${step.color} ${isCurrent ? 'animate-bounce' : ''}`} />
                  <span className="font-semibold text-[11px]">{step.label}</span>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-slate-800 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Multi-Color Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-300">
            <span>Neural Engine Startup</span>
            <span className="font-mono text-cyan-300">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 via-amber-400 via-emerald-400 to-cyan-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Redirecting to Scan Studio</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </div>

      </div>
    </div>
  );
}
