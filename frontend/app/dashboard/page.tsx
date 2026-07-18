'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Video, Brain, Calendar, FileText,
  ArrowRight, Play, Trophy, CheckCircle, Clock,
  Bell, TrendingUp, Zap, Target, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
  studyProgress: {
    totalClassesAttended: number;
    totalNotesRead: number;
    totalVideosWatched: number;
    totalLessonsCompleted: number;
    totalTestsAttempted: number;
  };
  attendancePercentage: number;
  totalAttendance: number;
  testResults: any[];
  avgTestScore: number;
}

/* ─── Quick link config ───────────────────────────── */
const quickLinks = [
  { href: '/dashboard/classes',    icon: BookOpen,  label: 'All Classes',  color: 'from-violet-500 to-purple-600' },
  { href: '/dashboard/notes',      icon: FileText,  label: 'Study Notes',  color: 'from-blue-500 to-cyan-500' },
  { href: '/dashboard/videos',     icon: Play,      label: 'Watch Videos', color: 'from-pink-500 to-rose-500' },
  { href: '/dashboard/tests',      icon: Brain,     label: 'Take Tests',   color: 'from-amber-500 to-orange-500' },
  { href: '/dashboard/attendance', icon: Calendar,  label: 'Attendance',   color: 'from-emerald-500 to-teal-500' },
  { href: '/dashboard/results',    icon: Trophy,    label: 'My Results',   color: 'from-indigo-500 to-blue-600' },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const { user }   = useAuth();
  const { theme }  = useTheme();
  const isDark     = theme === 'dark';

  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const card = isDark
    ? 'bg-[#0D1030] border-[#1E2448]'
    : 'bg-white border-slate-200 shadow-sm';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, annRes, notesRes, vidsRes] = await Promise.all([
          api.get('/users/dashboard-stats'),
          api.get('/announcements'),
          api.get('/notes?limit=4'),
          api.get('/videos?limit=4'),
        ]);
        setStats(statsRes.data.data);
        setAnnouncements(annRes.data.data.slice(0, 4));
        setRecentNotes(notesRes.data.data);
        setRecentVideos(vidsRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  /* greeting */
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good Morning';
    if (h < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  /* pie chart data */
  const pieData = stats
    ? [
        { name: 'Notes Read',       value: stats.studyProgress.totalNotesRead        || 1 },
        { name: 'Videos Watched',   value: stats.studyProgress.totalVideosWatched    || 1 },
        { name: 'Tests Attempted',  value: stats.studyProgress.totalTestsAttempted   || 1 },
        { name: 'Lessons Done',     value: stats.studyProgress.totalLessonsCompleted || 1 },
      ]
    : [];

  /* test score trend */
  const scoreTrend = (stats?.testResults || []).slice(-6).map((r: any, i: number) => ({
    name: `T${i + 1}`,
    score: r.percentage,
  }));

  /* stat overview cards */
  const statCards = [
    {
      icon: FileText, label: 'Notes Read',
      value: stats?.studyProgress.totalNotesRead ?? 0,
      color: 'from-violet-500 to-purple-600', delay: 0,
    },
    {
      icon: Video, label: 'Videos Watched',
      value: stats?.studyProgress.totalVideosWatched ?? 0,
      color: 'from-blue-500 to-cyan-500', delay: 0.05,
    },
    {
      icon: Brain, label: 'Tests Attempted',
      value: stats?.studyProgress.totalTestsAttempted ?? 0,
      color: 'from-pink-500 to-rose-500', delay: 0.1,
    },
    {
      icon: Target, label: 'Avg Score',
      value: `${stats?.avgTestScore ?? 0}%`,
      color: 'from-amber-500 to-orange-500', delay: 0.15,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Welcome banner ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden p-6 rounded-2xl border ${card}`}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{greeting()}</p>
            <h1 className="text-2xl lg:text-3xl font-black">
              Welcome back,{' '}
              <span className="gradient-text">{user?.fullName?.split(' ')[0]}!</span>
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {user?.selectedClass
                ? `You're studying ${user.selectedClass}. Keep it up! 🚀`
                : 'Your learning journey continues. Keep pushing! 🚀'}
            </p>
          </div>

          {/* Attendance + Avg score pills */}
          <div className="flex gap-3 flex-shrink-0">
            <div className={`text-center px-4 py-3 rounded-xl border ${isDark ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
              <p className="text-xs text-violet-400 font-semibold mb-0.5">Attendance</p>
              <p className="text-2xl font-black text-violet-400">
                {loading ? '—' : `${stats?.attendancePercentage ?? 0}%`}
              </p>
            </div>
            <div className={`text-center px-4 py-3 rounded-xl border ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
              <p className="text-xs text-green-400 font-semibold mb-0.5">Avg Score</p>
              <p className="text-2xl font-black text-green-400">
                {loading ? '—' : `${stats?.avgTestScore ?? 0}%`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((sc) => (
          <motion.div
            key={sc.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sc.delay }}
            className={`p-5 rounded-2xl border ${card} card-hover`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sc.color} flex items-center justify-center mb-4 shadow`}>
              <sc.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-black">
              {loading ? <span className="w-10 h-6 skeleton rounded inline-block" /> : sc.value}
            </p>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sc.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick links ──────────────────────────── */}
      <div>
        <h2 className="font-bold text-lg mb-3">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={link.href}>
                <div className={`p-4 rounded-2xl border ${card} flex flex-col items-center gap-2.5 card-hover cursor-pointer group text-center`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow`}>
                    <link.icon size={20} className="text-white" />
                  </div>
                  <span className={`text-xs font-semibold leading-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {link.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Charts + Sidebar row ─────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Score trend chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`lg:col-span-2 p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Test Score Trend</h2>
            <Link href="/dashboard/results" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {scoreTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: 12,
                  }}
                  formatter={(v: any) => [`${v}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-3">
              <TrendingUp size={40} className="text-slate-600" />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Take tests to see your score trend
              </p>
              <Link href="/dashboard/tests">
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 transition-colors">
                  Browse Tests <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Activity pie + classes */}
        <div className="space-y-4">
          {/* Pie chart */}
          {pieData.length > 0 && stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className={`p-5 rounded-2xl border ${card}`}
            >
              <h3 className="font-bold mb-3 text-sm">Activity Breakdown</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '10px', fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{d.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Class jump */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-2xl border ${card}`}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Jump to Class
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {CLASSES.map((n) => (
                <Link key={n} href={`/dashboard/classes/${n}`}>
                  <div className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black cursor-pointer transition-all
                    ${isDark
                      ? 'bg-slate-700/80 text-slate-400 hover:bg-violet-500 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-violet-500 hover:text-white'
                    }`}
                  >
                    {n}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Recent content + Announcements ───────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <FileText size={16} className="text-violet-400" /> Recent Notes
            </h3>
            <Link href="/dashboard/notes" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              All <ChevronRight size={12} />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No notes yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link key={note._id} href={`/dashboard/notes/${note._id}`}>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                    <span className="text-xl flex-shrink-0">{note.type === 'pdf' ? '📄' : note.type === 'docx' ? '📝' : '✍️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate hover:text-violet-400 transition-colors">{note.title}</p>
                      <p className="text-xs text-slate-500 truncate">{note.subjectId?.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Videos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Video size={16} className="text-blue-400" /> Recent Videos
            </h3>
            <Link href="/dashboard/videos" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              All <ChevronRight size={12} />
            </Link>
          </div>
          {recentVideos.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No videos yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentVideos.map((vid) => (
                <Link key={vid._id} href={`/dashboard/videos/${vid._id}`}>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                    <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                      {vid.thumbnailUrl
                        ? <img src={vid.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Play size={14} className="text-slate-500" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate hover:text-violet-400 transition-colors">{vid.title}</p>
                      <p className="text-xs text-slate-500">{vid.duration || 'Watch now'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Bell size={16} className="text-amber-400" /> Announcements
            </h3>
            <Link href="/dashboard/announcements" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No announcements</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <Link href="/dashboard/announcements" key={ann._id}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]
                      ${isDark ? 'bg-slate-700/50 border-slate-700 hover:border-amber-500/40 hover:bg-amber-500/5'
                               : 'bg-slate-50 border-slate-200 hover:border-amber-400/40 hover:bg-amber-50/50'}`}
                  >
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mb-1.5 capitalize
                      ${ann.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        ann.type === 'test'   ? 'bg-amber-500/20 text-amber-400' :
                        ann.type === 'result' ? 'bg-green-500/20 text-green-400' :
                        'bg-violet-500/20 text-violet-400'}`}>
                      {ann.type || 'General'}
                    </div>
                    <p className="font-semibold text-sm">{ann.title}</p>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {ann.content}
                    </p>
                    <p className="text-xs text-amber-500/70 mt-1.5 font-medium">Tap to read more →</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recent test results ───────────────────── */}
      {stats?.testResults && stats.testResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" /> Recent Test Results
            </h3>
            <Link href="/dashboard/results" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.testResults.slice(0, 3).map((r: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${r.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {r.percentage}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.testId?.title || 'Test'}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {r.score}/{r.totalMarks} pts
                  </p>
                </div>
                {r.passed
                  ? <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  : <Clock       size={16} className="text-amber-400 flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}
