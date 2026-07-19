'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Clock, CheckSquare, Trophy, ArrowRight, Zap } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
};

export default function TestsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/tests?isPublished=true');
        setTests(res.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetchTests();
  }, []);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => router.back()}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:16 }}>
        ← Back
      </button>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">MCQ Tests</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Chapter-wise tests with timer, auto-evaluation and leaderboard</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20">
          <Brain size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No tests available yet</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tests will be published by your instructor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test, i) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/tests/${test._id}`}>
                <div className={`p-5 rounded-2xl border ${card} card-hover cursor-pointer group h-full flex flex-col`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain size={22} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full font-semibold">
                      <Zap size={12} />
                      {test.totalMarks} pts
                    </div>
                  </div>

                  <h3 className="font-bold text-base mb-1 group-hover:text-violet-400 transition-colors line-clamp-2 flex-1">
                    {test.title}
                  </h3>

                  {test.subjectId && (
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
                      {test.subjectId.name} • {test.classId?.name}
                    </p>
                  )}

                  {test.description && (
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-3 line-clamp-2`}>
                      {test.description}
                    </p>
                  )}

                  <div className={`grid grid-cols-3 gap-2 mb-4 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="text-center">
                      <p className="text-lg font-black">{test.totalQuestions || '?'}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black flex items-center justify-center gap-1">
                        <Clock size={14} className="text-slate-500" />{test.timeLimit}m
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black">{test.attempts || 0}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Attempts</p>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                    Start Test <ArrowRight size={16} />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
