'use client';

import React from 'react';
import { EmotionBreakdown } from '@/types';
import { 
  LucideIcon, 
  Smile, 
  Frown, 
  Flame, 
  Zap, 
  Meh, 
  Ghost, 
  AlertCircle, 
  Sparkles, 
  Droplet, 
  CloudRain 
} from 'lucide-react';

interface EmotionChartProps {
  emotions: EmotionBreakdown;
  compact?: boolean;
}

const EMOTION_META: Record<
  keyof EmotionBreakdown,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  normal: { label: 'Normal', icon: Meh, color: 'text-slate-300', bg: 'bg-gradient-to-r from-slate-400 to-slate-500' },
  happy: { label: 'Happy', icon: Smile, color: 'text-amber-400', bg: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
  excited: { label: 'Excited', icon: Sparkles, color: 'text-fuchsia-400', bg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500' },
  sad: { label: 'Sad', icon: Frown, color: 'text-indigo-400', bg: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
  depressed: { label: 'Depressed', icon: CloudRain, color: 'text-blue-400', bg: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
  cry: { label: 'Cry', icon: Droplet, color: 'text-cyan-400', bg: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
  angry: { label: 'Angry', icon: Flame, color: 'text-rose-400', bg: 'bg-gradient-to-r from-rose-500 to-red-600' },
  shock: { label: 'Shock', icon: Zap, color: 'text-cyan-300', bg: 'bg-gradient-to-r from-cyan-400 to-sky-500' },
  fearful: { label: 'Fearful', icon: Ghost, color: 'text-purple-400', bg: 'bg-gradient-to-r from-purple-500 to-fuchsia-600' },
  disgusted: { label: 'Disgusted', icon: AlertCircle, color: 'text-emerald-400', bg: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
};

export default function EmotionChart({ emotions, compact = false }: EmotionChartProps) {
  const sortedEmotions = (Object.keys(emotions) as (keyof EmotionBreakdown)[])
    .map((key) => ({ key, value: emotions[key] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full space-y-2.5">
      {sortedEmotions.map(({ key, value }) => {
        const meta = EMOTION_META[key];
        if (!meta) return null;
        const IconComponent = meta.icon;
        if (compact && value < 3) return null;

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <IconComponent className={`w-3.5 h-3.5 ${meta.color}`} />
                <span className="capitalize text-slate-300">{meta.label}</span>
              </div>
              <span className="font-mono font-semibold text-slate-200">{value}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-900/80 border border-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${meta.bg} transition-all duration-500 ease-out`}
                style={{ width: `${Math.max(value, 3)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
