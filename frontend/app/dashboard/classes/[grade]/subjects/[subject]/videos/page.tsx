'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Play } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function SubjectVideosPage() {
  const params  = useParams();
  const grade   = params.grade as string;
  const subName = decodeURIComponent(params.subject as string);
  const { theme } = useTheme();
  const isDark  = theme === 'dark';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const classRes = await api.get('/classes');
        const cls = classRes.data.data.find((c: any) => c.grade === parseInt(grade));
        if (!cls) return;
        const subRes = await api.get(`/subjects?classId=${cls._id}`);
        const sub = subRes.data.data.find((s: any) => s.name.toLowerCase() === subName.toLowerCase());
        if (!sub) return;
        const vRes = await api.get(`/videos?subjectId=${sub._id}&limit=50`);
        setVideos(vRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [grade, subName]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-6xl mx-auto">
      <Link href={`/dashboard/classes/${grade}/subjects/${encodeURIComponent(subName)}`}
        className={`inline-flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>
        <ArrowLeft size={16}/> Back to {subName}
      </Link>
      <h1 className="text-2xl font-black mb-2">{subName} – Videos</h1>
      <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Class {grade} | {videos.length} videos</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="h-44 skeleton rounded-2xl"/>)}</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20"><Video size={48} className="text-slate-600 mx-auto mb-3"/><p className="text-slate-500">No videos yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((vid, i) => (
            <Link key={vid._id} href={`/dashboard/videos/${vid._id}`}>
              <motion.div key={vid._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                className={`rounded-2xl border ${card} card-hover cursor-pointer group overflow-hidden`}>
                <div className="relative aspect-video bg-slate-700">
                  {vid.thumbnailUrl
                    ? <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full flex items-center justify-center"><Play size={30} className="text-slate-500"/></div>
                  }
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={20} className="text-violet-600 ml-1"/>
                    </div>
                  </div>
                  {vid.duration && <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">{vid.duration}</span>}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm line-clamp-2 group-hover:text-violet-400 transition-colors">{vid.title}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
