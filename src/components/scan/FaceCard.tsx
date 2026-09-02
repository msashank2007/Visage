'use client';

import React, { useState } from 'react';
import { FaceResult } from '@/types';
import EmotionChart from './EmotionChart';
import { User, Sparkles, ChevronDown, ChevronUp, Activity, BarChart2, ShieldCheck, Dna, Info } from 'lucide-react';

interface FaceCardProps {
  face: FaceResult;
  index: number;
  colorHex: string;
}

const EMOTION_EMOJIS: Record<string, string> = {
  normal: '😐 Normal',
  happy: '😊 Happy',
  excited: '🤩 Excited',
  sad: '😢 Sad',
  depressed: '😔 Depressed',
  cry: '😭 Crying',
  angry: '😡 Angry',
  shock: '😲 Shocked',
  fearful: '😨 Fearful',
  disgusted: '🤢 Disgusted',
};

export default function FaceCard({ face, index, colorHex }: FaceCardProps) {
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [showGenderMorphology, setShowGenderMorphology] = useState(false);
  const [showAgeTactics, setShowAgeTactics] = useState(false);

  const morphology = face.genderMorphology;
  const ageDetails = face.ageDetails;

  return (
    <div 
      className="glass-card rounded-2xl p-5 space-y-4 border transition-all duration-300 relative overflow-hidden"
      style={{ borderColor: `${colorHex}40` }}
    >
      {/* Accent Color Header Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: colorHex }} 
      />

      {/* Face Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-slate-950 shadow-md"
            style={{ backgroundColor: colorHex }}
          >
            #{index + 1}
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-1.5">
              Face #{index + 1} Result
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Box: {face.boundingBox.width}x{face.boundingBox.height}px
            </p>
          </div>
        </div>

        {/* Dominant Emotion Badge */}
        <div className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs font-semibold text-cyan-300 flex items-center gap-1 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{EMOTION_EMOJIS[face.dominantEmotion] || face.dominantEmotion}</span>
        </div>
      </div>

      {/* Primary Metrics Grid: Age & Gender */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calibrated Age Metric */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calibrated Age</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {face.ageRange}
          </div>
          <p className="text-[10px] text-emerald-400 font-mono font-semibold">
            Target Age: {face.age} yrs
          </p>
          {ageDetails?.ageGroupCategory && (
            <div className="mt-1 pt-1 border-t border-white/5 text-[10px] text-indigo-300 font-medium truncate">
              {ageDetails.ageGroupCategory}
            </div>
          )}
        </div>

        {/* Gender Metric */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gender</span>
            <User className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white capitalize">
            {face.gender}
          </div>
          <p className="text-[10px] text-emerald-400 font-mono font-semibold">
            {face.genderConfidence}% Confidence
          </p>
          {morphology?.jawlineShape && (
            <div className="mt-1 pt-1 border-t border-white/5 text-[10px] text-cyan-300 font-medium truncate">
              {morphology.jawlineShape.split(' ')[0]} Mandible
            </div>
          )}
        </div>
      </div>

      {/* Expression-Invariant Age Normalization Info Badge */}
      {ageDetails && (
        <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Biometric Age Tactics Active
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CNN Raw: {ageDetails.rawAge} yrs</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {ageDetails.activeExpressionFactor}
          </p>

          {/* Age Group Biometrics & Tactics Accordion */}
          <div className="pt-2 border-t border-indigo-500/20">
            <button
              onClick={() => setShowAgeTactics(!showAgeTactics)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-indigo-200 hover:text-white py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                Age Group Statistics & Scientific Tactics
              </span>
              {showAgeTactics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAgeTactics && (
              <div className="mt-2 space-y-2.5 bg-slate-950/80 p-3 rounded-xl border border-white/5 text-xs">
                {/* Biometric Structural Maturity Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-300">
                    <span>Facial Biometric Maturity Score</span>
                    <span className="text-indigo-400">{ageDetails.biometricMaturityScore ?? 50}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${ageDetails.biometricMaturityScore ?? 50}%` }}
                    />
                  </div>
                </div>

                {/* Key Landmark Ratios */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-400">Eye-to-Jaw Index:</div>
                    <div className="font-bold text-slate-200 font-mono">{ageDetails.eyeToJawRatio ?? '0.52'}</div>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-400">Lower Face Height:</div>
                    <div className="font-bold text-slate-200 font-mono">{ageDetails.lowerFaceRatio ?? '0.50'}</div>
                  </div>
                </div>

                {/* Applied Tactics List */}
                {ageDetails.tacticsApplied && ageDetails.tacticsApplied.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Info className="w-3 h-3 text-indigo-400" /> Applied Facial Tactics
                    </p>
                    <ul className="space-y-1">
                      {ageDetails.tacticsApplied.map((tactic, idx) => (
                        <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5 bg-slate-900/50 px-2 py-1 rounded">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{tactic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Male vs Female Morphological Differences Accordion */}
      {morphology && (
        <div className="pt-2 border-t border-white/5 space-y-3">
          <button
            onClick={() => setShowGenderMorphology(!showGenderMorphology)}
            className="w-full flex items-center justify-between text-xs font-semibold text-cyan-300 hover:text-cyan-200 py-1 transition-colors bg-cyan-950/30 px-3 rounded-xl border border-cyan-500/20"
          >
            <span className="flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              Male vs Female Morphological Analysis
            </span>
            {showGenderMorphology ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>

          {showGenderMorphology && (
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs">
              
              {/* Dual Dimorphism Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-cyan-400">Male Traits ({morphology.maleTraitsScore}%)</span>
                  <span className="text-fuchsia-400">Female Traits ({morphology.femaleTraitsScore}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${morphology.maleTraitsScore}%` }}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${morphology.femaleTraitsScore}%` }}
                  />
                </div>
              </div>

              {/* Biological Feature Differences Grid */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3 text-cyan-400" /> Observed Dimorphic Landmarks
                </p>

                <div className="grid grid-cols-1 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Mandible / Jawline:</span>
                    <span className="font-semibold text-slate-200">{morphology.jawlineShape}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Eyebrow Clearance:</span>
                    <span className="font-semibold text-slate-200">{morphology.browArch}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Cheekbone Arch:</span>
                    <span className="font-semibold text-slate-200">{morphology.cheekboneProminence}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Lip Volume Index:</span>
                    <span className="font-semibold text-slate-200">{morphology.lipFullness}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Facial Ratio:</span>
                    <span className="font-semibold text-slate-200 font-mono">{morphology.facialAspectRatio}</span>
                  </div>

                  {morphology.attireDescription && (
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-cyan-500/20 flex items-center justify-between">
                      <span className="text-cyan-400 font-semibold">Attire Style:</span>
                      <span className="font-semibold text-cyan-200">{morphology.attireDescription}</span>
                    </div>
                  )}

                  {morphology.necklineType && (
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Neckline Analysis:</span>
                      <span className="font-semibold text-slate-200">{morphology.necklineType}</span>
                    </div>
                  )}

                  {morphology.dressSilhouette && (
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Dress Silhouette:</span>
                      <span className="font-semibold text-slate-200">{morphology.dressSilhouette}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emotion Breakdown Accordion */}
      <div className="pt-1 border-t border-white/5 space-y-3">
        <button
          onClick={() => setShowFullBreakdown(!showFullBreakdown)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            Full Emotion Spectrum Breakdown
          </span>
          {showFullBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <EmotionChart emotions={face.emotions} compact={!showFullBreakdown} />
      </div>
    </div>
  );
}
