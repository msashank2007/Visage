'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FaceCard from '@/components/scan/FaceCard';
import { fetchScanById, removeScanRecord } from '@/lib/scanStorage';
import { ScanRecord, FaceResult } from '@/types';
import { 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Users, 
  Layers, 
  Camera, 
  Upload, 
  Download 
} from 'lucide-react';

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

export default function ScanDetailPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setId(params.get('id'));
  }, []);

  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!user || !id) return;
    fetchScanById(user.uid, id as string)
      .then((record) => {
        setScan(record);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user, id]);

  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scan && imgRef.current && canvasRef.current) {
      drawBoundingBoxes(imgRef.current, scan.faces, selectedFaceIndex);
    }
  }, [selectedFaceIndex, scan]);

  // Render bounding box overlays once scan & image load
  const handleImageLoaded = () => {
    if (!scan || !imgRef.current) return;
    drawBoundingBoxes(imgRef.current, scan.faces, selectedFaceIndex);
  };

  const drawBoundingBoxes = (img: HTMLImageElement, faces: FaceResult[], focusIndex: number | null = null) => {
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

  const handleDelete = async () => {
    if (!user || !scan) return;
    if (!confirm('Are you sure you want to delete this scan entry?')) return;
    setDeleting(true);
    try {
      await removeScanRecord(user.uid, scan.id);
      router.push('/history');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white relative">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !scan ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto border border-cyan-500/30 my-12">
              <h3 className="text-xl font-bold text-white">Scan Not Found</h3>
              <p className="text-xs text-slate-400">
                This scan record may have been deleted or does not exist.
              </p>
              <Link
                href="/history"
                className="btn-futuristic-secondary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-cyan-400"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" /> Return to History
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Navigation Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <Link
                    href="/history"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline mb-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to History Overview
                  </Link>
                  <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                    Scan Report <span className="gradient-text">#{scan.id.slice(0, 6)}</span>
                  </h1>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {new Date(scan.createdAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      {scan.source === 'camera' ? (
                        <Camera className="w-3.5 h-3.5 text-fuchsia-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span className="capitalize">{scan.source} Mode</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={scan.imageUrl}
                    download={`facelens-scan-${scan.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-futuristic-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Image</span>
                  </a>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-futuristic-danger px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{deleting ? 'Deleting...' : 'Delete Scan'}</span>
                  </button>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Image with Bounding Box Canvas Overlay */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Multi-Person Interactive Square Button Bar */}
                  {scan.faces.length > 0 && (
                    <div className="glass-card p-3 rounded-2xl border border-cyan-500/30 flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs font-extrabold text-cyan-400 font-mono shrink-0">
                        Person Focus:
                      </span>
                      <button
                        onClick={() => setSelectedFaceIndex(null)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                          selectedFaceIndex === null
                            ? 'btn-futuristic-tab btn-futuristic-tab-active'
                            : 'btn-futuristic-tab'
                        }`}
                      >
                        [ ALL ({scan.faces.length}) ]
                      </button>
                      {scan.faces.map((f, idx) => (
                        <button
                          key={f.id || idx}
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
                    <img
                      ref={imgRef}
                      src={scan.imageUrl}
                      alt="Scan detail preview"
                      onLoad={handleImageLoaded}
                      className="w-full h-auto object-contain max-h-[550px]"
                    />

                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none object-contain"
                    />
                  </div>
                </div>

                {/* Right Column: Per-Face Detailed Cards */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <span className="font-bold text-sm text-white">
                        {scan.faceCount} Face{scan.faceCount === 1 ? '' : 's'} Detected
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {scan.faces
                      .filter((_, index) => selectedFaceIndex === null || selectedFaceIndex === index)
                      .map((face, index) => {
                        const originalIndex = selectedFaceIndex === null ? index : selectedFaceIndex;
                        return (
                          <FaceCard
                            key={face.id || index}
                            face={face}
                            index={originalIndex}
                            colorHex={FACE_COLORS[originalIndex % FACE_COLORS.length]}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
