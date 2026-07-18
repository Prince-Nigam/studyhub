'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Calendar } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function AnnouncementsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(r => setAnnouncements(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Megaphone size={24} className="text-amber-400" />
          <h1 className="text-3xl font-black">Announcements</h1>
        </div>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Latest updates and notices from admin
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No announcements yet</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Check back later for updates
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann._id}
              initial={{ opacity:0, y:16 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-5 rounded-2xl border ${card}`}
            >
              <div className="flex items-start gap-4">
                <div style={{
                  width:44, height:44, borderRadius:12, flexShrink:0,
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Megaphone size={20} color="#fbbf24" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-1">{ann.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {ann.content || ann.message || ann.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Calendar size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-500">
                      {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                        weekday:'short', day:'numeric', month:'short', year:'numeric'
                      })}
                    </span>
                    {ann.priority === 'high' && (
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, background:'rgba(239,68,68,0.15)', color:'#f87171' }}>
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
