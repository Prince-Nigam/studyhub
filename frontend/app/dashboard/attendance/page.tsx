'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AttendancePage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const isDark    = theme === 'dark';

  const [data,     setData]     = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [todayRec, setTodayRec] = useState<any[]>([]);
  const [marking,  setMarking]  = useState<string | null>(null); // subjectId being marked

  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  /* ── fetch attendance + today status + subjects ── */
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/attendance/my?month=${month}&year=${year}`),
      api.get('/attendance/today'),
      user?.selectedClass
        ? api.get(`/subjects?classId=${user.selectedClass}`).catch(() => ({ data: { data: [] } }))
        : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([att, today, subs]) => {
        setData(att.data);
        setTodayRec(today.data.data || []);
        setSubjects(subs.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year, user?.selectedClass]);

  /* ── self mark present ── */
  const markPresent = async (subjectId: string, classId: string) => {
    setMarking(subjectId);
    try {
      await api.post('/attendance/self-mark', { subjectId, classId });
      toast.success('✅ Attendance marked as Present!');
      // refresh today status
      const r = await api.get('/attendance/today');
      setTodayRec(r.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(null);
    }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  // Build calendar
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();

  const attendanceMap: Record<string, string> = {};
  if (data?.data) {
    data.data.forEach((a: any) => {
      const d   = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      attendanceMap[key] = a.status;
    });
  }

  // Today's marked subject IDs
  const markedSubjectIds = new Set(todayRec.map((r: any) => r.subjectId?._id || r.subjectId));

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Attendance</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Track your attendance across all subjects</p>
      </motion.div>

      {/* ══ SELF MARK SECTION ══ */}
      <div className={`p-5 rounded-2xl border mb-6 ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="font-bold text-base mb-1">Today's Attendance</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>

        {subjects.length === 0 ? (
          <p className="text-sm text-slate-500">No subjects found. Please select your class in profile settings.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
            {subjects.map((sub: any) => {
              const isMarked = markedSubjectIds.has(sub._id);
              return (
                <button
                  key={sub._id}
                  onClick={() => !isMarked && markPresent(sub._id, sub.classId || user?.selectedClass || '')}
                  disabled={isMarked || marking === sub._id}
                  style={{
                    padding:'14px 12px', borderRadius:14, cursor: isMarked ? 'default' : 'pointer',
                    border: isMarked ? '2px solid rgba(59,130,246,0.5)' : '2px solid rgba(255,255,255,0.08)',
                    background: isMarked
                      ? 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(37,99,235,0.15))'
                      : isDark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    transition:'all 0.2s', outline:'none',
                    boxShadow: isMarked ? '0 4px 16px rgba(59,130,246,0.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isMarked) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.4)'; }}
                  onMouseLeave={e => { if (!isMarked) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {marking === sub._id ? (
                    <Loader2 size={22} color="#60a5fa" style={{ animation:'spin 1s linear infinite' }} />
                  ) : isMarked ? (
                    <CheckCircle size={22} color="#60a5fa" />
                  ) : (
                    <div style={{ width:22, height:22, borderRadius:'50%', border:'2px solid #475569' }} />
                  )}
                  <span style={{ fontSize:13, fontWeight:700, color: isMarked ? '#60a5fa' : isDark ? '#94a3b8' : '#475569' }}>
                    {sub.name}
                  </span>
                  <span style={{
                    fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99,
                    background: isMarked ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.12)',
                    color: isMarked ? '#93c5fd' : '#f87171',
                  }}>
                    {isMarked ? '🔵 Present' : '🔴 Absent'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label:'Present',    value: data?.stats.presentCount || 0, color:'text-blue-400',   bg:'bg-blue-500/10'   },
          { icon: XCircle,     label:'Absent',     value: data?.stats.absentCount  || 0, color:'text-red-400',    bg:'bg-red-500/10'    },
          { icon: Clock,       label:'Late',       value: data?.stats.lateCount    || 0, color:'text-amber-400',  bg:'bg-amber-500/10'  },
          { icon: TrendingUp,  label:'Percentage', value: `${data?.stats.percentage || 0}%`, color:'text-violet-400', bg:'bg-violet-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
            className={`p-5 rounded-2xl border ${card} flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black">{loading ? '—' : stat.value}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      {data?.stats && (
        <div className={`p-5 rounded-2xl border ${card} mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Attendance Progress</h3>
            <span className={`text-sm font-bold ${data.stats.percentage >= 75 ? 'text-blue-400' : 'text-red-400'}`}>
              {data.stats.percentage}%
            </span>
          </div>
          <div className={`h-4 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${data.stats.percentage}%` }}
              transition={{ duration:1, ease:'easeOut' }}
              className={`h-full rounded-full ${data.stats.percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
            />
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {data.stats.percentage >= 75 ? '✅ Good attendance! Keep it up.' : '⚠️ Attendance below 75%. Please improve.'}
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className={`p-6 rounded-2xl border ${card}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); }}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}>◀</button>
          <h3 className="font-bold text-lg">{MONTHS[month-1]} {year}</h3>
          <button onClick={() => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); }}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}>▶</button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className={`text-center text-xs font-bold py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} />)}
          {[...Array(daysInMonth)].map((_, i) => {
            const day    = i + 1;
            const key    = `${year}-${month}-${day}`;
            const status = attendanceMap[key];
            const isToday = day === now.getDate() && month === now.getMonth()+1 && year === now.getFullYear();
            return (
              <div key={day} className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${isToday ? 'ring-2 ring-violet-500' : ''} ${
                status === 'present' ? 'bg-blue-500/20 text-blue-400' :
                status === 'absent'  ? 'bg-red-500/20 text-red-400'   :
                status === 'late'    ? 'bg-amber-500/20 text-amber-400' :
                isDark ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50'
              }`}>{day}</div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
          {[
            { color:'bg-blue-500/30',   label:'Present' },
            { color:'bg-red-500/30',    label:'Absent'  },
            { color:'bg-amber-500/30',  label:'Late'    },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AttendancePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/attendance/my?month=${month}&year=${year}`);
        setData(res.data);
      } catch { } finally { setLoading(false); }
    };
    fetchAttendance();
  }, [month, year]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  // Build calendar days for the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const attendanceMap: Record<string, string> = {};
  if (data?.data) {
    data.data.forEach((a: any) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      attendanceMap[key] = a.status;
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Attendance</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Track your attendance across all subjects</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label: 'Present', value: data?.stats.presentCount || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: XCircle, label: 'Absent', value: data?.stats.absentCount || 0, color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: Clock, label: 'Late', value: data?.stats.lateCount || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: TrendingUp, label: 'Percentage', value: `${data?.stats.percentage || 0}%`, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl border ${card} flex items-center gap-4`}
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-black">{loading ? <span className="w-8 h-6 skeleton rounded inline-block" /> : stat.value}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      {data?.stats && (
        <div className={`p-5 rounded-2xl border ${card} mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Attendance Progress</h3>
            <span className={`text-sm font-bold ${data.stats.percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
              {data.stats.percentage}%
            </span>
          </div>
          <div className={`h-4 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.stats.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${data.stats.percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
            />
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {data.stats.percentage >= 75 ? '✅ Good attendance! Keep it up.' : '⚠️ Attendance below 75%. Please improve.'}
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className={`p-6 rounded-2xl border ${card}`}>
        {/* Month selector */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
          >◀</button>
          <h3 className="font-bold text-lg">{MONTHS[month - 1]} {year}</h3>
          <button
            onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
          >▶</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className={`text-center text-xs font-bold py-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first day */}
          {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const key = `${year}-${month}-${day}`;
            const status = attendanceMap[key];
            const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  isToday ? 'ring-2 ring-violet-500' : ''
                } ${
                  status === 'present' ? 'bg-green-500/20 text-green-400' :
                  status === 'absent' ? 'bg-red-500/20 text-red-400' :
                  status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                  isDark ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
          {[
            { color: 'bg-green-500/30', label: 'Present' },
            { color: 'bg-red-500/30', label: 'Absent' },
            { color: 'bg-amber-500/30', label: 'Late' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-slate-400">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Subject-wise attendance */}
      {data?.data && data.data.length > 0 && (
        <div className={`mt-6 p-5 rounded-2xl border ${card}`}>
          <h3 className="font-bold text-lg mb-4">Recent Attendance Records</h3>
          <div className="space-y-2">
            {data.data.slice(0, 10).map((record: any, i: number) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.status === 'present' ? 'bg-green-500/20' : record.status === 'absent' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                  {record.status === 'present' ? <CheckCircle size={16} className="text-green-400" /> :
                   record.status === 'absent' ? <XCircle size={16} className="text-red-400" /> :
                   <Clock size={16} className="text-amber-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{record.subjectId?.name || 'Subject'}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                  record.status === 'present' ? 'bg-green-500/20 text-green-400' :
                  record.status === 'absent' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>{record.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
