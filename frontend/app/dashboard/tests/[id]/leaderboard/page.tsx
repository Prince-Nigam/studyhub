'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Clock, Percent } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

const medals = ['🥇', '🥈', '🥉'];
const rankBg  = [
  'from-amber-400 to-yellow-500',
  'from-slate-300 to-slate-400',
  'from-amber-600 to-orange-500',
];

export default function LeaderboardPage() {
  const params   = useParams();
  const { theme } = useTheme();
  const isDark   = theme === 'dark';
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [lbRes, testRes] = await Promise.all([
          api.get(`/tests/${params.id}/leaderboard`),
          api.get(`/tests/${params.id}`),
        ]);
        setData(lbRes.data.data);
        setTestName(testRes.data.data.title);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [params.id]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/tests/${params.id}`}
        className={`inline-flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>
        <ArrowLeft size={16} /> Back to Test
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
          <Trophy size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Leaderboard</h1>
          {testName && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{testName}</p>}
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && data.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[data[1], data[0], data[2]].map((entry, i) => {
            const realRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights  = ['h-24', 'h-32', 'h-20'];
            return (
              <motion.div
                key={entry?.user?._id || i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">
                  {entry?.user?.fullName?.[0] || '?'}
                </div>
                <p className="text-sm font-bold text-center truncate w-20">{entry?.user?.fullName?.split(' ')[0]}</p>
                <p className="text-xs text-violet-400 font-bold">{entry?.percentage}%</p>
                <div className={`w-20 ${heights[i]} bg-gradient-to-t ${rankBg[realRank - 1]} rounded-t-xl flex items-start justify-center pt-2 text-2xl`}>
                  {medals[realRank - 1]}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No attempts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {data.map((entry, i) => (
              <motion.div
                key={entry.user?._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 px-5 py-3.5 ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                  entry.rank <= 3
                    ? `bg-gradient-to-br ${rankBg[entry.rank - 1]} text-white`
                    : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {entry.user?.fullName?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.user?.fullName || 'Unknown'}</p>
                  <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {Math.floor((entry.timeTaken || 0) / 60)}m {(entry.timeTaken || 0) % 60}s
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-black ${entry.passed ? 'text-green-400' : 'text-slate-400'}`}>
                    {entry.percentage}%
                  </p>
                  <p className="text-xs text-slate-500">{entry.score} pts</p>
                </div>

                {entry.passed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold flex-shrink-0">
                    Pass
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
