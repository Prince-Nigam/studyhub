'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
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

  const [data,       setData]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [todayStatus,setTodayStatus]= useState<string>('');
  const [marking,    setMarking]    = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, todayRes] = await Promise.all([
        api.get(`/attendance/my?month=${month}&year=${year}`),
        api.get('/attendance/today'),
      ]);
      setData(attRes.data);
      // today's overall status — take first record
      const rec = todayRes.data.data?.[0];
      setTodayStatus(rec?.status || '');
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  /* mark attendance without subject */
  const mark = async (status: 'present' | 'absent' | 'late') => {
    setMarking(true);
    try {
      // use a dummy subjectId fallback — backend upserts by userId+date
      await api.post('/attendance/self-mark', {
        subjectId: '000000000000000000000000',
        classId:   '000000000000000000000000',
        status,
      });
      setTodayStatus(status);
      toast.success(`Marked as ${status}!`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setMarking(false); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();

  const attendanceMap: Record<string, string> = {};
  (data?.data || []).forEach((a: any) => {
    const d = new Date(a.date);
    attendanceMap[`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`] = a.status;
  });

  const BTN = [
    { status:'present', label:'✓ Present', activeColor:'#3b82f6', activeBg:'rgba(59,130,246,0.25)', inactiveBg:'rgba(59,130,246,0.08)', textColor:'#60a5fa' },
    { status:'absent',  label:'✗ Absent',  activeColor:'#ef4444', activeBg:'rgba(239,68,68,0.25)',  inactiveBg:'rgba(239,68,68,0.08)',  textColor:'#f87171' },
    { status:'late',    label:'◷ Late',    activeColor:'#f59e0b', activeBg:'rgba(245,158,11,0.25)', inactiveBg:'rgba(245,158,11,0.08)', textColor:'#fbbf24' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1">Attendance</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mark and track your attendance</p>
      </motion.div>

      {/* ── Today Mark Section ── */}
      <div className={`p-6 rounded-2xl border mb-6 ${card}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base">Today</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          {todayStatus && (
            <span style={{
              padding:'6px 16px', borderRadius:99, fontSize:13, fontWeight:700,
              background: todayStatus==='present' ? 'rgba(59,130,246,0.2)' : todayStatus==='absent' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              color: todayStatus==='present' ? '#60a5fa' : todayStatus==='absent' ? '#f87171' : '#fbbf24',
              border: `1px solid ${todayStatus==='present' ? 'rgba(59,130,246,0.4)' : todayStatus==='absent' ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
            }}>
              {todayStatus==='present' ? '🔵 Present' : todayStatus==='absent' ? '🔴 Absent' : '🟡 Late'}
            </span>
          )}
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {BTN.map(b => (
            <button key={b.status} onClick={() => !marking && mark(b.status)}
              disabled={marking}
              style={{
                flex:1, minWidth:100, padding:'14px 20px', borderRadius:14,
                border: `2px solid ${todayStatus===b.status ? b.activeColor+'80' : 'transparent'}`,
                background: todayStatus===b.status ? b.activeBg : b.inactiveBg,
                color: b.textColor, fontWeight:800, fontSize:15,
                cursor: marking ? 'not-allowed' : 'pointer',
                transition:'all 0.2s', outline:'none',
                boxShadow: todayStatus===b.status ? `0 4px 16px ${b.activeColor}30` : 'none',
              }}>
              {marking ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite', margin:'0 auto' }} /> : b.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize:11, color:'#475569', marginTop:10 }}>You can change your status anytime during the day.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label:'Present',    value: data?.stats?.presentCount || 0, color:'text-blue-400',   bg:'bg-blue-500/10'   },
          { icon: XCircle,     label:'Absent',     value: data?.stats?.absentCount  || 0, color:'text-red-400',    bg:'bg-red-500/10'    },
          { icon: Clock,       label:'Late',       value: data?.stats?.lateCount    || 0, color:'text-amber-400',  bg:'bg-amber-500/10'  },
          { icon: TrendingUp,  label:'Percentage', value: `${data?.stats?.percentage || 0}%`, color:'text-violet-400', bg:'bg-violet-500/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className={`p-5 rounded-2xl border ${card} flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-black">{loading ? '—' : s.value}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
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
            <motion.div initial={{ width:0 }} animate={{ width:`${data.stats.percentage}%` }}
              transition={{ duration:1, ease:'easeOut' }}
              className={`h-full rounded-full ${data.stats.percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`} />
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {data.stats.percentage >= 75 ? '✅ Good attendance! Keep it up.' : '⚠️ Attendance below 75%. Please improve.'}
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className={`p-6 rounded-2xl border ${card}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { if (month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1); }}
            className={`p-2 rounded-xl ${isDark?'hover:bg-slate-700':'hover:bg-slate-100'} transition-colors`}>◀</button>
          <h3 className="font-bold text-lg">{MONTHS[month-1]} {year}</h3>
          <button onClick={() => { if (month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1); }}
            className={`p-2 rounded-xl ${isDark?'hover:bg-slate-700':'hover:bg-slate-100'} transition-colors`}>▶</button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => <div key={d} className={`text-center text-xs font-bold py-2 ${isDark?'text-slate-500':'text-slate-400'}`}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_,i) => <div key={`e${i}`}/>)}
          {[...Array(daysInMonth)].map((_,i) => {
            const day    = i+1;
            const key    = `${year}-${month}-${day}`;
            const status = attendanceMap[key];
            const isToday = day===now.getDate() && month===now.getMonth()+1 && year===now.getFullYear();
            return (
              <div key={day} className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                ${isToday?'ring-2 ring-violet-500':''}
                ${status==='present'?'bg-blue-500/20 text-blue-400':status==='absent'?'bg-red-500/20 text-red-400':status==='late'?'bg-amber-500/20 text-amber-400':isDark?'text-slate-500':'text-slate-400'}`}>
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-4 pt-4 border-t border-slate-700/40">
          {[['bg-blue-500/30','Present'],['bg-red-500/30','Absent'],['bg-amber-500/30','Late']].map(([c,l])=>(
            <div key={l} className="flex items-center gap-2 text-xs text-slate-400">
              <div className={`w-3 h-3 rounded ${c}`}/>{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
