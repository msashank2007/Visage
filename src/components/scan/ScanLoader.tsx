'use client';

import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

interface ScanLoaderProps {
  progress?: number;
  statusMessage?: string;
}

export default function ScanLoader({ progress = 0, statusMessage = 'Analyzing Facial Topology...' }: ScanLoaderProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 glass-card rounded-3xl space-y-6 text-center border border-cyan-500/30 pulse-glow">
      {/* Cyber Grid Scanning Hologram Circle */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Outer Rotating Neon Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin [animation-duration:8s]" />
        <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-ping [animation-duration:3s]" />
        
        {/* Inner Tech Core */}
        <div className="w-20 h-20 rounded-2xl bg-slate-900/90 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-9 h-9 text-cyan-400 animate-pulse" />
        </div>

        {/* Floating Sparkle Icon */}
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-fuchsia-400 animate-bounce" />
      </div>

      {/* Progress & Message */}
      <div className="space-y-2 max-w-xs w-full">
        <h3 className="font-bold text-lg text-white gradient-text">{statusMessage}</h3>
        <p className="text-xs text-slate-400">Client-Side Neural Net Processing</p>

        {/* Progress bar if progress > 0 */}
        {progress > 0 && (
          <div className="w-full space-y-1 pt-2">
            <div className="flex justify-between text-xs font-mono font-semibold text-cyan-400">
              <span>Loading Models</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
