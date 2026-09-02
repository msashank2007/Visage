'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { detectFacesInVideo, resetAgeHistory } from '@/lib/faceApi';
import { FaceResult } from '@/types';
import FaceCard from './FaceCard';
import { Camera, CameraOff, Sparkles, RefreshCw, Layers, FlipHorizontal2 } from 'lucide-react';

interface CameraFeedProps {
  onScanCaptured: (imageDataUrl: string, faces: FaceResult[]) => void;
  onSwitchToUpload: () => void;
  colorPalette: string[];
}

export default function CameraFeed({
  onScanCaptured,
  onSwitchToUpload,
  colorPalette,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
const [cameraError, setCameraError] = useState<string | null>(null);
const [liveFaces, setLiveFaces] = useState<FaceResult[]>([]);
const [isDetecting, setIsDetecting] = useState<boolean>(false);
  // Array of displayed ages for smooth transition (numeric age approximation)
  const [displayAges, setDisplayAges] = useState<number[]>([]);
  const [fps, setFps] = useState<number>(0);

  const obtainMediaStream = async (facing: 'user' | 'environment' = facingMode): Promise<MediaStream> => {
    // Detect mobile by screen width or user agent
    const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: mobile
          ? {
              facingMode: facing,
              width: { ideal: 720 },
              height: { ideal: 1280 },
            }
          : {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: facing,
            },
        audio: false,
      });
    } catch {
      // Fallback to generic video constraints if specific ideal dimensions fail
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
  };

  const requestCamera = useCallback(async () => {
    try {
      const mediaStream = await obtainMediaStream(facingMode);
      setCameraError(null);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.error('Camera error:', err);
      const errorObj = err as { name?: string };
      let msg = 'Unable to access camera.';
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in browser settings or switch to Upload mode.';
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Flip camera between front and back
  const flipCamera = useCallback(async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    // Stop existing tracks
    if (stream) stream.getTracks().forEach((t) => t.stop());
    try {
      const newStream = await obtainMediaStream(newFacing);
      setCameraError(null);
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error('Flip camera error:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, stream]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isMounted = true;

    async function initCam() {
      try {
        const mediaStream = await obtainMediaStream();
        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        activeStream = mediaStream;
        setStream(mediaStream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorObj = err as { name?: string };
        let msg = 'Unable to access camera.';
        if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
          msg = 'Camera permission denied. Please allow camera access in browser settings or switch to Upload mode.';
        } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
          msg = 'No camera device found on this system.';
        }
        setCameraError(msg);
      }
    }

    initCam();

    return () => {
      isMounted = false;
      resetAgeHistory();
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure stream is bound to video element whenever stream state or video node changes
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  // Real-time detection frame loop (~200ms interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!stream || !videoRef.current || cameraError) return;

    let isSubscribed = true;
    let timerId: NodeJS.Timeout;
    let lastTime = performance.now();

    const runDetectionCycle = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.paused || video.ended || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        if (isSubscribed) timerId = setTimeout(runDetectionCycle, 150);
        return;
      }

      try {
        setIsDetecting(false);

        const displayWidth = video.clientWidth;
        const displayHeight = video.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        const scaleX = displayWidth / video.videoWidth;
        const scaleY = displayHeight / video.videoHeight;

        // Run face detection using the dedicated video pipeline (temporal age smoothing)
        const detectedFaces = await detectFacesInVideo(video);

        if (!isSubscribed) return;

        setLiveFaces(detectedFaces);
        // Initialize or update display ages to match new detections (use first value of range if needed)
        const newAges = detectedFaces.map(face => {
          // Attempt to extract a numeric age; fallback to first number in ageRange string
          if (typeof face.age === 'number') return face.age;
          const match = face.ageRange?.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        setDisplayAges(prev => {
          // Preserve existing ages for faces that remain, otherwise use new age
          if (prev.length === newAges.length) return newAges;
          return newAges;
        });

        // Draw overlays on un-mirrored canvas layer so text renders right-side up
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, displayWidth, displayHeight);

          detectedFaces.forEach((face, i) => {
            const color = colorPalette[i % colorPalette.length];
            const box = face.boundingBox;

            // Mirror X coordinate because video has CSS transform -scale-x-100
            const scaledW = box.width * scaleX;
            const scaledH = box.height * scaleY;
            const rawX = box.x * scaleX;
            const scaledX = displayWidth - (rawX + scaledW);
            const scaledY = box.y * scaleY;

            // Draw Square Bounding Box around face
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

            // Draw Corner Brackets for high-tech HUD look
            const cornerSize = Math.min(20, scaledW / 4);
            ctx.lineWidth = 4;

            // Top-Left corner
            ctx.beginPath();
            ctx.moveTo(scaledX, scaledY + cornerSize);
            ctx.lineTo(scaledX, scaledY);
            ctx.lineTo(scaledX + cornerSize, scaledY);
            ctx.stroke();

            // Top-Right corner
            ctx.beginPath();
            ctx.moveTo(scaledX + scaledW - cornerSize, scaledY);
            ctx.lineTo(scaledX + scaledW, scaledY);
            ctx.lineTo(scaledX + scaledW, scaledY + cornerSize);
            ctx.stroke();

            // Bottom-Left corner
            ctx.beginPath();
            ctx.moveTo(scaledX, scaledY + scaledH - cornerSize);
            ctx.lineTo(scaledX, scaledY + scaledH);
            ctx.lineTo(scaledX + cornerSize, scaledY + scaledH);
            ctx.stroke();

            // Bottom-Right corner
            ctx.beginPath();
            ctx.moveTo(scaledX + scaledW - cornerSize, scaledY + scaledH);
            ctx.lineTo(scaledX + scaledW, scaledY + scaledH);
            ctx.lineTo(scaledX + scaledW, scaledY + scaledH - cornerSize);
            ctx.stroke();

            // Draw Text Label Tag showing Age, Gender, and Dominant Emotion directly over the box
            const displayedAge = displayAges[i] !== undefined ? displayAges[i] : (face.ageRange?.split('–')[0] ?? face.age);
            const labelText = `#${i + 1} | Age ${displayedAge} (${face.ageRange}) | ${face.gender} | ${face.dominantEmotion}`;
            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            const textWidth = ctx.measureText(labelText).width;
            const tagHeight = 26;

            const tagY = Math.max(0, scaledY - tagHeight - 4);

            ctx.fillStyle = color;
            ctx.fillRect(scaledX, tagY, textWidth + 18, tagHeight);

            ctx.fillStyle = '#07090e';
            ctx.fillText(labelText, scaledX + 9, tagY + 17);
          });
        }
        
        // Calculate FPS
        const now = performance.now();
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        if (delta > 0) setFps(Math.round(1 / delta));
      } catch (err) {
        console.error('Frame detection error:', err);
      } finally {
        setIsDetecting(false);
        if (isSubscribed) {
          timerId = setTimeout(runDetectionCycle, 150);
        }
      }
    };

    runDetectionCycle();

    return () => {
      isSubscribed = false;
      clearTimeout(timerId);
    };
  }, [stream, cameraError, colorPalette]);

  // Smoothly animate displayed ages toward target ages every second
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayAges(prev => {
        const targets = liveFaces.map(face => {
          // Use numeric age if available, else parse from ageRange
          if (typeof face.age === 'number') return face.age;
          const match = face.ageRange?.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        return prev.map((display, i) => {
          const target = targets[i] ?? display;
          if (display === target) return display;
          const diff = target - display;
          const step = diff > 0 ? Math.ceil(diff / 3) : Math.floor(diff / 3);
          const next = display + step;
          return Math.abs(next - target) < 1 ? target : next;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [liveFaces]);

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || liveFaces.length === 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 640;
    tempCanvas.height = video.videoHeight || 480;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const dataUrl = tempCanvas.toDataURL('image/jpeg');
      onScanCaptured(dataUrl, liveFaces);
    }
  };

  return (
    <div className="w-full space-y-6">
      {cameraError ? (
        /* Camera Error / Permission Denied Card */
        <div className="glass-card p-8 rounded-3xl text-center space-y-4 border border-rose-500/30">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <CameraOff className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Camera Access Notice</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">{cameraError}</p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={requestCamera}
              className="btn-futuristic-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retry Permission</span>
            </button>
            <button
              onClick={onSwitchToUpload}
              className="btn-futuristic-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Switch to File Upload Mode</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Camera Feed Viewport */}
          <div className="lg:col-span-7 space-y-4">
            {/* Mobile: tall portrait container | Desktop: 16:9 landscape */}
            <div className="relative w-full rounded-3xl overflow-hidden glass-card border border-cyan-500/30 shadow-2xl bg-slate-950
              h-[75svh] max-h-[520px]
              md:h-auto md:max-h-none md:aspect-video">
              {/* Live Video element (Mirrored via CSS) */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Bounding box overlay canvas (UN-MIRRORED via CSS so text is right-side up) */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* HUD Header Status */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE AI CAMERA</span>
                  <span className="text-slate-400 font-mono text-[10px]">({fps} FPS)</span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  {/* Camera Flip Button */}
                  <button
                    onClick={flipCamera}
                    title="Flip Camera"
                    className="p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-lg hover:bg-cyan-500/20 active:scale-95 transition-all"
                  >
                    <FlipHorizontal2 className="w-4 h-4" />
                  </button>

                  <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{liveFaces.length} Face{liveFaces.length === 1 ? '' : 's'} Tracked</span>
                  </div>
                </div>
              </div>

              {/* HUD Bottom Control Bar */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center px-4">
                <button
                  onClick={captureFrame}
                  disabled={liveFaces.length === 0}
                  className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2.5 transition-all ${
                    liveFaces.length > 0
                      ? 'btn-futuristic-primary'
                      : 'btn-futuristic-secondary cursor-not-allowed opacity-50'
                  }`}
                >
                  <Camera className="w-5 h-5 text-cyan-400" />
                  <span>Capture & Save Scan Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Real-time Live Result Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-white">
                  Real-time Face Analytics ({liveFaces.length})
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono font-semibold">Updating Live</span>
            </div>

            {liveFaces.length === 0 ? (
              <div className="glass-card p-8 rounded-3xl text-center space-y-3 border border-white/10">
                <Sparkles className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-white">Position Face in Camera Frame</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Square bounding box, age estimate, gender %, and emotion charts will update instantly in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {liveFaces.map((face, index) => (
                  <FaceCard
                    key={face.id || index}
                    face={face}
                    index={index}
                    colorHex={colorPalette[index % colorPalette.length]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
