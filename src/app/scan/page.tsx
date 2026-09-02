'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImageUploader from '@/components/scan/ImageUploader';
import CameraFeed from '@/components/scan/CameraFeed';
import FaceCard from '@/components/scan/FaceCard';
import ScanLoader from '@/components/scan/ScanLoader';
import { loadFaceApiModels, detectFacesInImage } from '@/lib/faceApi';
import { saveScanRecord } from '@/lib/scanStorage';
import { FaceResult } from '@/types';
import dynamic from 'next/dynamic';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle, 
  Save, 
  ArrowRight, 
  AlertCircle, 
  Layers,
  Cpu,
  Dna,
  Activity
} from 'lucide-react';

const HologramFace = dynamic(() => import('@/components/3d/HologramFace'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl border border-pink-500/20">
      <div className="w-10 h-10 rounded-full border-2 border-pink-400 border-t-transparent animate-spin mb-2" />
      <span className="text-xs text-pink-300 font-mono">Initializing 3D Vision Mesh...</span>
    </div>
  ),
});

const FACE_COLORS = [
  '#ff3366', // Electric Rose
  '#00e676', // Bright Mint Emerald
  '#aa00ff', // Electric Violet
  '#ffab00', // Sunny Gold Amber
  '#00e5ff', // Neon Cyan
  '#ff007f', // Vivid Fuchsia
  '#76ff03', // Lime Sparkle
  '#ff6d00', // Warm Coral Orange
  '#1de9b6', // Turquoise Teal
  '#7c4dff', // Deep Indigo Blue
];

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  
  // Model state
  const [modelLoading, setModelLoading] = useState<boolean>(true);
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelStatus, setModelStatus] = useState<string>('Initializing Models...');
  const [modelError, setModelError] = useState<string | null>(null);

  // Upload image scan state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedFaces, setDetectedFaces] = useState<FaceResult[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preload face-api models on component mount
  useEffect(() => {
    let isSubscribed = true;
    loadFaceApiModels((progress, message) => {
      if (isSubscribed) {
        setModelProgress(progress);
        setModelStatus(message);
      }
    })
      .then(() => {
        if (isSubscribed) setModelLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (isSubscribed) {
          setModelError('Failed to load face detection neural nets. Please refresh.');
          setModelLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);

  // Run face analysis when an image is uploaded/selected
  const handleImageSelected = async (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setDetectedFaces([]);
    setSelectedFaceIndex(null);
    setSavedScanId(null);
    setIsAnalyzing(true);

    try {
      const tempImg = new window.Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = async () => {
        const results = await detectFacesInImage(tempImg);
        setDetectedFaces(results);
        setIsAnalyzing(false);

        // Draw bounding boxes & square corner brackets [ ] on canvas
        drawBoundingBoxes(tempImg, results, null);

        if (results.length > 0) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }
      };
      tempImg.src = dataUrl;
    } catch (err) {
      console.error('Image analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (selectedImage && detectedFaces.length > 0) {
      const tempImg = new window.Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        drawBoundingBoxes(tempImg, detectedFaces, selectedFaceIndex);
      };
      tempImg.src = selectedImage;
    }
  }, [selectedFaceIndex, selectedImage, detectedFaces]);

  const drawBoundingBoxes = (
    img: HTMLImageElement,
    faces: FaceResult[],
    focusIndex: number | null = null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach((face, i) => {
      const isFocused = focusIndex === null || focusIndex === i;
      ctx.globalAlpha = isFocused ? 1.0 : 0.3;

      const color = FACE_COLORS[i % FACE_COLORS.length];
      const box = face.boundingBox;

      // Outer bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(3, Math.round(canvas.width / 220));
      ctx.shadowColor = color;
      ctx.shadowBlur = isFocused && focusIndex === i ? 22 : 10;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // High-Tech Corner Brackets [ ]
      const cornerSize = Math.min(Math.max(16, box.width / 4), 36);
      ctx.lineWidth = Math.max(5, Math.round(canvas.width / 160));

      // Top-Left [
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + cornerSize);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + cornerSize, box.y);
      ctx.stroke();

      // Top-Right ]
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - cornerSize, box.y);
      ctx.lineTo(box.x + box.width, box.y);
      ctx.lineTo(box.x + box.width, box.y + cornerSize);
      ctx.stroke();

      // Bottom-Left [
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + box.height - cornerSize);
      ctx.lineTo(box.x, box.y + box.height);
      ctx.lineTo(box.x + cornerSize, box.y + box.height);
      ctx.stroke();

      // Bottom-Right ]
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - cornerSize, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height - cornerSize);
      ctx.stroke();

      // Label Header Tag [ #1 ]
      const labelText = `[ #${i + 1} ] | Age ${face.age} (${face.ageRange}) | ${face.gender} | ${face.dominantEmotion}`;
      ctx.font = `bold ${Math.max(14, Math.round(canvas.width / 55))}px system-ui, sans-serif`;
      const textWidth = ctx.measureText(labelText).width;
      const tagHeight = Math.max(28, Math.round(canvas.width / 40));

      ctx.fillStyle = color;
      ctx.fillRect(box.x, Math.max(0, box.y - tagHeight), textWidth + 20, tagHeight);

      ctx.fillStyle = '#07090e';
      ctx.fillText(labelText, box.x + 10, Math.max(tagHeight - 8, box.y - 8));
    });

    ctx.globalAlpha = 1.0;
  };

  const handleSaveScan = async () => {
    if (!user || !selectedImage || detectedFaces.length === 0) return;
    setSaving(true);
    try {
      const record = await saveScanRecord({
        userId: user.uid,
        imageDataUrl: selectedImage,
        faces: detectedFaces,
        source: activeTab,
      });
      setSavedScanId(record.id);
    } catch (err) {
      console.error('Failed to save scan:', err);
      alert('Could not save scan record.');
    } finally {
      setSaving(false);
    }
  };

  const handleCameraCapture = async (imageDataUrl: string, faces: FaceResult[]) => {
    if (!user) return;
    setSaving(true);
    try {
      const record = await saveScanRecord({
        userId: user.uid,
        imageDataUrl,
        faces,
        source: 'camera',
      });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      router.push(`/history/view?id=${record.id}`);
    } catch (err) {
      console.error('Failed to save camera scan:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setDetectedFaces([]);
    setSelectedFaceIndex(null);
    setSavedScanId(null);
    setIsAnalyzing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white relative">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                AI Scan <span className="gradient-text">Studio</span>
              </h1>
              <p className="text-xs text-slate-400">
                Multi-Face Detection • Real-Time Webcam Stream • Client-Side Intelligence
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-md self-start md:self-auto shadow-lg gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'upload'
                    ? 'btn-futuristic-tab btn-futuristic-tab-active'
                    : 'btn-futuristic-tab'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'camera'
                    ? 'btn-futuristic-tab btn-futuristic-tab-active'
                    : 'btn-futuristic-tab'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Webcam Stream</span>
              </button>
            </div>
          </div>

          {/* Top AI Telemetry Dashboard Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-3 rounded-2xl border border-pink-500/30 flex items-center gap-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent shadow-md">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0 border border-pink-500/30">
                <Dna className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">68-Point Biometrics</div>
                <div className="text-[10px] text-pink-300 font-mono">Landmark Tracking</div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Expression-Invariant</div>
                <div className="text-[10px] text-emerald-300 font-mono">Calibrated Age Engine</div>
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent shadow-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">10-Color Dimorphism</div>
                <div className="text-[10px] text-amber-300 font-mono">Morphological Classifier</div>
              </div>
            </div>
          </div>

          {/* Model Loading State Banner */}
          {modelLoading ? (
            <ScanLoader progress={modelProgress} statusMessage={modelStatus} />
          ) : modelError ? (
            <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span>{modelError}</span>
            </div>
          ) : (
            /* Main Content Area */
            <div className="space-y-8">
              {activeTab === 'camera' ? (
                /* LIVE WEBCAM FEED MODE */
                <CameraFeed
                  onScanCaptured={handleCameraCapture}
                  onSwitchToUpload={() => setActiveTab('upload')}
                  colorPalette={FACE_COLORS}
                />
              ) : (
                /* FILE UPLOAD MODE */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Image Dropzone & Bounding Box Canvas Overlay */}
                  <div className="lg:col-span-7 space-y-4">
                    <ImageUploader
                      onImageSelected={handleImageSelected}
                      selectedImage={selectedImage}
                      onReset={resetUpload}
                      isAnalyzing={isAnalyzing}
                    />

                    {/* Image Preview Container with Overlaid Canvas */}
                    {selectedImage && (
                      <div className="space-y-3">
                        {/* Multi-Person Interactive Square Button Identification Bar */}
                        {detectedFaces.length > 0 && (
                          <div className="glass-card p-3 rounded-2xl border border-cyan-500/30 flex items-center gap-2 overflow-x-auto">
                            <span className="text-xs font-extrabold text-cyan-400 font-mono flex items-center gap-1 shrink-0">
                              <Sparkles className="w-3.5 h-3.5" /> Person Focus:
                            </span>
                            <button
                              onClick={() => setSelectedFaceIndex(null)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                                selectedFaceIndex === null
                                  ? 'btn-futuristic-tab btn-futuristic-tab-active'
                                  : 'btn-futuristic-tab'
                              }`}
                            >
                              [ ALL ({detectedFaces.length}) ]
                            </button>
                            {detectedFaces.map((f, idx) => (
                              <button
                                key={f.id}
                                onClick={() => setSelectedFaceIndex(selectedFaceIndex === idx ? null : idx)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                  selectedFaceIndex === idx
                                    ? 'btn-futuristic-tab btn-futuristic-tab-active'
                                    : 'btn-futuristic-tab'
                                }`}
                              >
                                <span>[ #{idx + 1} {f.gender.toUpperCase()} ({f.age}y) ]</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="relative w-full rounded-3xl overflow-hidden glass-card border border-cyan-500/30 shadow-2xl bg-slate-950 flex items-center justify-center min-h-[300px]">
                          {/* Base Image */}
                          <img
                            ref={imgRef}
                            src={selectedImage}
                            alt="Uploaded face target"
                            className="w-full h-auto object-contain max-h-[500px]"
                          />

                          {/* Overlaid Canvas */}
                          <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full pointer-events-none object-contain"
                          />

                          {/* Scanner Laser Animation effect when analyzing */}
                          {isAnalyzing && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="w-full h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 shadow-lg shadow-cyan-500/50 absolute animate-scan-laser" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Analysis Results Cards */}
                  <div className="lg:col-span-5 space-y-4">
                    {isAnalyzing ? (
                      <ScanLoader statusMessage="Running Neural Face Pipeline..." />
                    ) : selectedImage && detectedFaces.length === 0 ? (
                      <div className="glass-card p-8 rounded-3xl text-center space-y-3 border border-amber-500/30">
                        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                        <h3 className="text-lg font-bold text-white">No Faces Detected</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Try uploading a clearer, well-lit photo where faces are clearly visible.
                        </p>
                      </div>
                    ) : detectedFaces.length > 0 ? (
                      <div className="space-y-4">
                        
                        {/* Results Summary Bar */}
                        <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <span className="font-bold text-sm text-white">
                              {detectedFaces.length} Face{detectedFaces.length === 1 ? '' : 's'} Analyzed
                            </span>
                          </div>

                          {savedScanId ? (
                            <button
                              onClick={() => router.push(`/history/view?id=${savedScanId}`)}
                              className="btn-futuristic-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span>View Saved Scan</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={handleSaveScan}
                              disabled={saving}
                              className="btn-futuristic-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 text-cyan-400" />
                              <span>{saving ? 'Saving...' : 'Save Scan to Account'}</span>
                            </button>
                          )}
                        </div>

                        {/* List of Face Cards */}
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                          {detectedFaces
                            .filter((_, index) => selectedFaceIndex === null || selectedFaceIndex === index)
                            .map((face) => {
                              const originalIndex = detectedFaces.findIndex(f => f.id === face.id);
                              return (
                                <FaceCard
                                  key={face.id}
                                  face={face}
                                  index={originalIndex}
                                  colorHex={FACE_COLORS[originalIndex % FACE_COLORS.length]}
                                />
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      /* Interactive Live 3D Holographic Face Scanner Animation Viewport */
                      <div className="glass-card p-6 rounded-3xl text-center space-y-4 border border-pink-500/30 relative overflow-hidden shadow-2xl bg-slate-900/80">
                        {/* Header Telemetry Pill */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                            <span className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                              3D Vision Neural Matrix
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30">
                            60 FPS GPU Mesh
                          </span>
                        </div>

                        {/* Interactive 3D Hologram Face Video Viewport */}
                        <div className="relative w-full h-[320px] rounded-2xl overflow-hidden glass-panel border border-pink-500/40 bg-slate-950 flex items-center justify-center shadow-inner group">
                          {/* Scanning Laser Beam Sweep Line */}
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_20px_#ff3366] animate-scan-beam z-10 pointer-events-none" />

                          {/* 3D Hologram Particle Mesh Component */}
                          <div className="w-full h-full">
                            <HologramFace />
                          </div>

                          {/* Live Telemetry Overlay Banner */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-200 bg-slate-950/85 p-2.5 rounded-xl border border-white/10 backdrop-blur-md pointer-events-none shadow-lg">
                            <span className="text-pink-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                              SYSTEM: IDLE 3D MESH ACTIVE
                            </span>
                            <span className="text-emerald-400 font-bold">68-POINT MESH READY</span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <h3 className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Ready for Facial Intelligence
                          </h3>
                          <p className="text-xs text-slate-300 max-w-xs mx-auto">
                            Drag & drop a photo on the left or click a sample image to launch instant multi-face biometrics analysis.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
