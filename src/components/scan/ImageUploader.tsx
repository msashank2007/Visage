'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string) => void;
  selectedImage: string | null;
  onReset: () => void;
  isAnalyzing: boolean;
}

// Curated high-res public sample face images for instant demo testing
const SAMPLE_IMAGES = [
  {
    name: 'Multi-Face Group',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    color: 'from-pink-500 to-rose-500 text-pink-300 border-pink-500/30',
  },
  {
    name: 'Happy Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    color: 'from-emerald-400 to-teal-500 text-emerald-300 border-emerald-500/30',
  },
  {
    name: 'Expressive Face',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    color: 'from-purple-500 to-indigo-500 text-purple-300 border-purple-500/30',
  },
];

export default function ImageUploader({
  onImageSelected,
  selectedImage,
  onReset,
  isAnalyzing,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG/PNG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImageSelected(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSampleClick = async (sampleUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          onImageSelected(dataUrl);
        }
      };
      img.src = sampleUrl;
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full min-h-[340px] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 overflow-hidden border-2 border-dashed ${
            isDragging
              ? 'border-pink-400 bg-pink-500/15 scale-[1.01] shadow-2xl shadow-pink-500/30'
              : 'border-pink-500/40 hover:border-pink-400 bg-slate-900/60 hover:bg-slate-900/80 shadow-xl'
          }`}
        >
          {/* Friendly Background Color Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-400/20 to-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {/* Friendly Colorful Upload Icon Badge */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 mb-4 shadow-xl shadow-pink-500/25 group-hover:scale-110 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-pink-400 animate-bounce" />
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1.5 flex items-center gap-2">
            Drag & Drop your photo here
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mb-5 leading-relaxed">
            Supports JPEG, PNG, or WebP. Multi-face photo scans with instant biometrics analysis supported out of the box!
          </p>

          <span className="btn-futuristic-primary px-7 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Browse Photo File</span>
          </span>

          {/* Futuristic Sample Photo Picker */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full max-w-lg">
            <p className="text-xs text-cyan-300 mb-3 flex items-center justify-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Or click a sample multi-face photo to test instantly:</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSampleClick(sample.url);
                  }}
                  className="btn-futuristic-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Controls Bar */
        <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Photo Selected & Ready</span>
          </div>

          <button
            onClick={onReset}
            disabled={isAnalyzing}
            className="btn-futuristic-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Change Photo</span>
          </button>
        </div>
      )}
    </div>
  );
}
