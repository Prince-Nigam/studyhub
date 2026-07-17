'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, Clock, Play, BookmarkPlus, Share2, ThumbsUp } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function VideoDetailPage() {
  const params = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [video, setVideo] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${params.id}`);
        setVideo(res.data.data);
        setRelated(res.data.related || []);
      } catch { } finally { setLoading(false); }
    };
    fetchVideo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="skeleton h-12 w-48 rounded-xl mb-6" />
        <div className="skeleton aspect-video rounded-2xl mb-6" />
        <div className="skeleton h-8 w-64 rounded mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
    );
  }

  if (!video) return (
    <div className="text-center py-20">
      <p className="text-slate-400">Video not found</p>
      <Link href="/dashboard/videos" className="text-violet-400 hover:underline mt-2 block">← Back to Videos</Link>
    </div>
  );

  const embedUrl = video.youtubeId
    ? `https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`
    : video.videoUrl;

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/dashboard/videos" className={`inline-flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} mb-6 transition-colors`}>
        <ArrowLeft size={16} /> Back to Videos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}
          >
            {embedUrl ? (
              <div className="relative aspect-video bg-black">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-slate-800 flex items-center justify-center">
                <p className="text-slate-400">No video available</p>
              </div>
            )}
          </motion.div>

          {/* Video info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <h1 className="text-xl font-black mb-3">{video.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {video.subjectId && (
                <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-50 text-violet-600'} font-semibold`}>
                  {video.subjectId.name}
                </span>
              )}
              {video.classId && (
                <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                  {video.classId.name}
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Eye size={14} /> {video.viewCount} views
              </div>
              {video.duration && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock size={14} /> {video.duration}
                </div>
              )}
            </div>

            {video.description && (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                {video.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}>
                <BookmarkPlus size={16} /> Watch Later
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}>
                <Share2 size={16} /> Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related videos */}
        <div>
          <h2 className="font-bold text-lg mb-4">Related Videos</h2>
          {related.length > 0 ? (
            <div className="space-y-3">
              {related.map((rel, i) => (
                <Link key={rel._id} href={`/dashboard/videos/${rel._id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50 hover:border-violet-500/50' : 'bg-white border-slate-200 hover:border-violet-300 shadow-sm'} card-hover cursor-pointer group`}
                  >
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                      {rel.thumbnailUrl ? (
                        <Image src={rel.thumbnailUrl} alt={rel.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={16} className="text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 group-hover:text-violet-400 transition-colors">{rel.title}</p>
                      {rel.duration && <p className="text-xs text-slate-500 mt-1">{rel.duration}</p>}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`text-center py-10 rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Play size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No related videos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
