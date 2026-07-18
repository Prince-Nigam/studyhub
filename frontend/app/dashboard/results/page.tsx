'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, CheckCircle, XCircle, Clock, BarChart2, ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

export default function ResultsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user }   = useAuth();
  const router = useRouter();
  const [results, setResults]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState({ avg: 0, passed: 0, total: 0, best: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch all test results for this student
        const res = await api.get('/users/my-results');
        const tr  = res.data.data || [];
        setResults(tr);

        if (tr.length > 0) {
          const avg    = tr.reduce((s: number, r: any) => s + r.percentage, 0) / tr.length;
          const passed = tr.filter((r: any) => r.passed).length;
          const best   = Math.max(...tr.map((r: any) => r.percentage));
          setStats({ avg: parseFloat(avg.toFixed(1)), passed, total: tr.length, best });
        }
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  const chartData = [
    { name: 'Avg Score', value: stats.avg, fill: '#6366f1' },
    { name: 'Best Score', value: stats.best, fill: '#10b981' },
    { name: 'Pass Rate', value: stats.total > 0 ? (stats.passed / stats.total * 100) : 0, fill: '#f59e0b' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.back()}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:16 }}>
        ← Back
      </button>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1">My Test Results</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Your full test history and performance analytics
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tests Taken',   value: stats.total,                  color: 'text-violet-400',  bg: 'bg-violet-500/10' },
          { label: 'Tests Passed',  value: stats.passed,                 color: 'text-green-400',   bg: 'bg-green-500/10' },
          { label: 'Average Score', value: `${stats.avg}%`,              color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Best Score',    value: `${stats.best}%`,             color: 'text-amber-400',   bg: 'bg-amber-500/10' },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl border ${card}`}
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <BarChart2 size={18} className={item.color} />
            </div>
            <p className={`text-2xl font-black ${item.color}`}>{loading ? '—' : item.value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className={`p-5 rounded-2xl border ${card}`}
          >
            <h3 className="font-bold mb-4">Performance Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={chartData}>
                <RadialBar dataKey="value" cornerRadius={4} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v: any) => `${parseFloat(v).toFixed(1)}%`}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{d.name}</span>
                  </div>
                  <span className="font-bold">{parseFloat(String(d.value)).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results list */}
        <div className={`${results.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="font-bold mb-4">Recent Results</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
            </div>
          ) : results.length === 0 ? (
            <div className={`p-10 rounded-2xl border ${card} text-center`}>
              <Trophy size={48} className="text-slate-600 mx-auto mb-3" />
              <p className="font-bold mb-1">No tests attempted yet</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}>
                Take your first test and see your results here
              </p>
              <Link href="/dashboard/tests">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white rounded-xl font-semibold mx-auto hover:bg-violet-600 transition-colors">
                  Browse Tests <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${card}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    r.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {r.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.testId?.title || 'Test'}</p>
                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      <span>Score: {r.score}/{r.totalMarks}</span>
                      <span>Correct: {r.correctAnswers} | Wrong: {r.wrongAnswers}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.passed
                      ? <CheckCircle size={18} className="text-green-400" />
                      : <XCircle   size={18} className="text-red-400" />}
                    <Link href={`/dashboard/tests/${r.testId?._id}/leaderboard`}>
                      <span className="text-xs text-violet-400 hover:underline cursor-pointer">Leaderboard</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
