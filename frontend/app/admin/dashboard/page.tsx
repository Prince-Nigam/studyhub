'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, BookOpen, FileText, Video, Brain,
  TrendingUp, UserPlus, Activity, Layers,
  Megaphone, RefreshCw, ArrowRight, CheckCircle, Trophy
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const [stats,       setStats]       = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [seeding,     setSeeding]     = useState(false);
  const [tests,       setTests]       = useState<any[]>([]);
  const [selTest,     setSelTest]     = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loadingRes,  setLoadingRes]  = useState(false);

  const fetchStats = async () => {
    try {
      const [statsRes, testsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/tests'),
      ]);
      setStats(statsRes.data.data);
      setTests(testsRes.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const loadTestResults = async (testId: string) => {
    if (!testId) { setTestResults([]); return; }
    setLoadingRes(true);
    try {
      const r = await api.get(`/tests/${testId}/results`);
      const sorted = (r.data.data || []).sort((a: any, b: any) => b.score - a.score);
      setTestResults(sorted);
    } catch {} finally { setLoadingRes(false); }
  };

  const seedClasses = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/classes/seed');
      toast.success(res.data.message);
      fetchStats();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Already seeded');
    } finally { setSeeding(false); }
  };

  const card = isDark
    ? 'bg-slate-800/60 border-slate-700/50'
    : 'bg-white border-slate-200 shadow-sm';

  const statCards = [
    { icon: Users,    label: 'Total Students',     value: stats?.totalUsers,    color: 'from-violet-500 to-purple-600' },
    { icon: BookOpen, label: 'Classes',             value: stats?.totalClasses,  color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, label: 'Notes',               value: stats?.totalNotes,    color: 'from-pink-500 to-rose-500' },
    { icon: Video,    label: 'Videos',              value: stats?.totalVideos,   color: 'from-amber-500 to-orange-500' },
    { icon: Brain,    label: 'Published Tests',     value: stats?.totalTests,    color: 'from-emerald-500 to-teal-500' },
    { icon: Activity, label: 'Active (7 days)',     value: stats?.activeUsers,   color: 'from-indigo-500 to-blue-600' },
  ];

  // Chart data
  const chartData = (stats?.monthlyData || []).map((d: any) => ({
    name: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d._id.month - 1]}`,
    Students: d.count,
  }));

  // Content distribution bar
  const contentData = [
    { name: 'Notes',  Count: stats?.totalNotes  || 0, fill: '#6366f1' },
    { name: 'Videos', Count: stats?.totalVideos || 0, fill: '#3b82f6' },
    { name: 'Tests',  Count: stats?.totalTests  || 0, fill: '#10b981' },
  ];

  const quickActions = [
    { href: '/admin/classes',       label: '+ Add Class',       color: 'bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white border-violet-500/20' },
    { href: '/admin/subjects',      label: '+ Add Subject',     color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border-blue-500/20' },
    { href: '/admin/chapters',      label: '+ Add Chapter',     color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white border-cyan-500/20' },
    { href: '/admin/notes',         label: '+ Upload Notes',    color: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white border-pink-500/20' },
    { href: '/admin/videos',        label: '+ Add Video',       color: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white border-amber-500/20' },
    { href: '/admin/tests',         label: '+ Create Test',     color: 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white border-green-500/20' },
    { href: '/admin/announcements', label: '+ Announcement',    color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border-orange-500/20' },
    { href: '/admin/users',         label: '👥 Manage Users',   color: 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white border-slate-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Manage your entire study platform from here
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={seedClasses} disabled={seeding}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} disabled:opacity-50`}
          >
            {seeding ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Seed Classes
          </button>
          <button onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-all">
            <Activity size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((sc, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`p-4 rounded-2xl border ${card} card-hover`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sc.color} flex items-center justify-center mb-3`}>
              <sc.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black">
              {loading ? <span className="w-10 h-6 skeleton rounded inline-block" /> : sc.value ?? 0}
            </p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sc.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Student growth area chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className={`lg:col-span-2 p-5 rounded-2xl border ${card}`}
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-400" /> Student Growth
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: 10, fontSize: 12,
                }} />
                <Area type="monotone" dataKey="Students" stroke="#6366f1" fill="url(#growthGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-500 text-sm">No data yet – students will appear here after signup</p>
            </div>
          )}
        </motion.div>

        {/* Content distribution bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <h3 className="font-bold mb-4 text-sm">Content Overview</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={contentData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="name" stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <YAxis stroke={isDark ? '#475569' : '#94a3b8'} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{
                background: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: 10, fontSize: 12,
              }} />
              <Bar dataKey="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Quick numbers */}
          <div className="space-y-2 mt-4">
            {contentData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{d.name}</span>
                </div>
                <span className="font-bold">{d.Count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent students + Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent students */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <UserPlus size={16} className="text-violet-400" /> Recent Students
            </h3>
            <Link href="/admin/users" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-2">
              {stats.recentUsers.map((u: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/40' : 'bg-slate-50'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.fullName}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users size={40} className="text-slate-600 mx-auto mb-2" />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No students yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className={`p-5 rounded-2xl border ${card}`}
        >
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className={`px-3 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all text-center ${action.color}`}>
                  {action.label}
                </div>
              </Link>
            ))}
          </div>

          {/* System status */}
          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <p className="text-sm font-semibold text-green-400">All Systems Operational</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-green-400/70">
              <span>✓ Backend API</span>
              <span>✓ MongoDB</span>
              <span>✓ Auth</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Test Results Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className={`p-5 rounded-2xl border ${card}`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-bold flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" /> Test Results Overview
          </h3>
          <div className="flex items-center gap-2">
            <select value={selTest}
              onChange={e => { setSelTest(e.target.value); loadTestResults(e.target.value); }}
              className={`px-3 py-2 rounded-xl border text-sm focus:outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <option value="">-- Select a Test --</option>
              {tests.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
            </select>
            <Link href="/admin/results">
              <span className="text-xs text-violet-400 hover:text-violet-300 font-semibold whitespace-nowrap">Full Results →</span>
            </Link>
          </div>
        </div>

        {!selTest ? (
          <p className="text-sm text-slate-500 text-center py-6">Select a test to see student results</p>
        ) : loadingRes ? (
          <p className="text-sm text-slate-500 text-center py-6">Loading...</p>
        ) : testResults.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No results yet for this test</p>
        ) : (
          <>
            {/* Top 3 summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label:'🥇 Top Scorer',    student: testResults[0],                          color:'#FFD700' },
                { label:'🥈 2nd Place',     student: testResults[1],                          color:'#C0C0C0' },
                { label:'🔴 Lowest Score',  student: testResults[testResults.length - 1],     color:'#f87171' },
              ].map((item, i) => item.student && (
                <div key={i} style={{ padding:'12px', borderRadius:12, background: isDark?'rgba(255,255,255,0.04)':'#f8faff', border:`1px solid ${item.color}30` }}>
                  <p style={{ fontSize:11, fontWeight:700, color:item.color, marginBottom:6 }}>{item.label}</p>
                  <div className="flex items-center gap-2">
                    <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${item.color}80,${item.color}40)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:'#fff', flexShrink:0 }}>
                      {item.student.userId?.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:700, color: isDark?'#f1f5f9':'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {item.student.userId?.fullName}
                      </p>
                      <p style={{ fontSize:13, fontWeight:900, color:item.color }}>{item.student.percentage}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark?'border-slate-700':'border-slate-200'}`}>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Rank</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Student</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Score</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">%</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((r, i) => (
                    <tr key={i} className={`border-b ${isDark?'border-slate-700/50':'border-slate-100'} ${i===0?isDark?'bg-yellow-500/5':'bg-yellow-50/50':''}`}>
                      <td className="py-2 px-3">
                        <span style={{ fontWeight:800, color: i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#64748b' }}>
                          {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                            {r.userId?.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{r.userId?.fullName}</p>
                            <p className="text-xs text-slate-500">{r.userId?.selectedClass || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{r.score}/{r.totalMarks}</td>
                      <td className="py-2 px-3 text-center font-bold" style={{ color: r.percentage>=75?'#4ade80':r.percentage>=40?'#fbbf24':'#f87171' }}>
                        {r.percentage}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        {r.passed
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-400">Passed</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400">Failed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
