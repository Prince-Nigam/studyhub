'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Eye, Search, Video as VideoIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function VideosPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (search) params.append('search', search);
      if (filterType) params.append('type', filterType);
      const res = await api.get(`/videos?${params}`);
      setVideos(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, [filterType]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Video Lectures</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Watch YouTube lectures and recorded videos</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); fetchVideos(); }} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className={`w-full pl-9 pr-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
          />
        </form>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-violet-500 transition-all`}
        >
          <option value="">All Types</option>
          <option value="youtube">YouTube</option>
          <option value="recorded">Recorded</option>
          <option value="playlist">Playlist</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-56 skeleton rounded-2xl" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <VideoIcon size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No videos yet</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Videos will appear here once added by admin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/videos/${video._id}`}>
                <div className={`rounded-2xl border ${card} card-hover cursor-pointer group overflow-hidden`}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-700 overflow-hidden">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                        <VideoIcon size={40} className="text-slate-500" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={22} className="text-violet-600 ml-1" />
                      </div>
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${video.type === 'youtube' ? 'bg-red-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
                        {video.type === 'youtube' ? '▶ YouTube' : '🎬 Recorded'}
                      </span>
                    </div>
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors">
                      {video.title}
                    </h3>
                    {video.subjectId && (
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-2`}>
                        {video.subjectId.name}
                      </p>
                    )}
                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1"><Eye size={12} /> {video.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
