'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md pt-12 pb-8 px-4 sm:px-8 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-lg text-white">Face<span className="gradient-text">Lens</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time client-side face analytics platform powered by TensorFlow.js and face-api. Instant age, gender, and multi-face emotion breakdown.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home & 3D Hero</Link></li>
            <li><Link href="/scan" className="hover:text-cyan-400 transition-colors">AI Scan Studio</Link></li>
            <li><Link href="/history" className="hover:text-cyan-400 transition-colors">Scan History</Link></li>
            <li><Link href="/settings" className="hover:text-cyan-400 transition-colors">Settings & Firebase</Link></li>
          </ul>
        </div>

        {/* Technical Highlights */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> Client-side Neural Nets</li>
            <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-purple-400" /> Zero Server Photo Uploads</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Real-time 200ms Camera Overlay</li>
          </ul>
        </div>

        {/* Privacy Note */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Privacy & Tech</h4>
          <p className="text-xs leading-relaxed text-slate-400">
            FaceLens executes all facial recognition models entirely within your web browser using WebGL GPU acceleration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} FaceLens AI. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex items-center gap-1">
          Crafted with Next.js, Three.js & TailwindCSS
        </p>
      </div>
    </footer>
  );
}
