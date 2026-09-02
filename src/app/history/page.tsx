'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchUserScans, removeScanRecord } from '@/lib/scanStorage';
import { ScanRecord } from '@/types';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Filter,
  Camera,
  Upload
} from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');

  const loadScans = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const records = await fetchUserScans(user.uid);
      setScans(records);
    } catch (err) {
      console.error('Failed to load user scans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [user]);

  const handleDelete = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;
    if (!confirm('Are you sure you want to delete this scan entry?')) return;

    try {
      await removeScanRecord(user.uid, scanId);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      searchQuery === '' ||
      scan.faces.some(
        (f) =>
          f.dominantEmotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.ageRange.includes(searchQuery) ||
          f.age.toString() === searchQuery.trim() ||
          (f.ageDetails?.ageGroupCategory && f.ageDetails.ageGroupCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      ) ||
      scan.createdAt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmotion =
      selectedEmotionFilter === 'all' ||
      scan.faces.some((f) => f.dominantEmotion === selectedEmotionFilter);

    return matchesSearch && matchesEmotion;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col app-bg-gradient bg-cyber-grid text-white relative">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                Scan <span className="gradient-text">History</span>
              </h1>
              <p className="text-xs text-slate-400">
                Review, filter, and inspect past AI vision scan records
              </p>
            </div>

            {/* Top Search bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search age, gender..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Emotion Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
            </span>
            {['all', 'normal', 'happy', 'excited', 'sad', 'depressed', 'cry', 'angry', 'shock', 'fearful', 'disgusted'].map(
              (emotion) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotionFilter(emotion)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize shrink-0 transition-all ${
                    selectedEmotionFilter === emotion
                      ? 'btn-futuristic-tab btn-futuristic-tab-active'
                      : 'btn-futuristic-tab'
                  }`}
                >
                  {emotion}
                </button>
              )
            )}
          </div>

          {/* Scan Cards Grid */}
          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredScans.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto border border-cyan-500/30 my-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
                <HistoryIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Previous Scans Found</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery || selectedEmotionFilter !== 'all'
                    ? 'No scans match your active search filters.'
                    : 'You haven’t saved any facial analysis scans yet.'}
                </p>
              </div>
              <Link
                href="/scan"
                className="btn-futuristic-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Start Your First Scan</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => {
                const primaryFace = scan.faces[0];
                const dateStr = new Date(scan.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Link
                    key={scan.id}
                    href={`/history/view?id=${scan.id}`}
                    className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between"
                  >
                    {/* Thumbnail Header */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={scan.imageUrl}
                        alt="Scan thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Face Count Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-bold text-cyan-300 flex items-center gap-1 shadow-md">
                        <Users className="w-3 h-3 text-cyan-400" />
                        <span>{scan.faceCount} Face{scan.faceCount === 1 ? '' : 's'}</span>
                      </div>

                      {/* Source Tag */}
                      <div className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300">
                        {scan.source === 'camera' ? (
                          <Camera className="w-3.5 h-3.5 text-fuchsia-400" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {dateStr}
                          </span>
                        </div>

                        {primaryFace && (
                          <div className="space-y-1 pt-1">
                            <div className="text-sm font-bold text-white flex items-center justify-between">
                              <span>Primary: {primaryFace.ageRange}</span>
                              <span className="text-xs text-cyan-400 capitalize font-medium">
                                {primaryFace.gender} ({primaryFace.genderConfidence}%)
                              </span>
                            </div>
                            <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-semibold text-purple-300 capitalize">
                              Emotion: {primaryFace.dominantEmotion}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Inspect Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>

                        <button
                          onClick={(e) => handleDelete(scan.id, e)}
                          className="btn-futuristic-danger p-2 rounded-lg text-xs"
                          title="Delete scan"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
