'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Fallback general subject ID (used when no subjects exist)
const GENERAL_ID = '000000000000000000000001';

export default function AttendancePage() {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const isDark     = theme === 'dark';

  const [subjects,   setSubjects]   = useState<any[]>([]);
  const [todayRec,   setTodayRec]   = useState<any[]>([]);
  const [marking,    setMarking]    = useState<string | null>(null);
  const [attData,    setAttData]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [classes,    setClasses]    = useState<any[]>([]);

  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [attRes, todayRes, subRes, classRes] = await Promise.all([
        api.get(`/attendance/my?month=${month}&year=${year}`),
        api.get('/attendance/today'),
        api.get('/subjects'),
        api.get('/classes'),
      ]);
      setAttData(attRes.data);
      setTodayRec(todayRes.data.data || []);
      setSubjects(subRes.data.data || []);
      setClasses(classRes.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [month, year]);

  /* mark attendance — works with or without subjects */
  const mark = async (status: 'present' | 'absent' | 'late', subjectId?: string, classId?: string) => {
    const sid = subjectId || subjects[0]?._id || GENERAL_ID;
    const cid = classId   || subjects[0]?.classId?._id || subjects[0]?.classId || classes[0]?._id || GENERAL_ID;
    setMarking(status);
    try {
      await api.post('/attendance/self-mark', { subjectId: sid, classId: cid, status });
      toast.success(`Marked as ${status}!`);
      const r = await api.get('/attendance/today');
      setTodayRec(r.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setMarking(null); }
  };

  /* today overall status */
  const todayStatus = todayRec.length > 0
    ? (todayRec.find((r:any) => r.status === 'present') ? 'present'
      : todayRec.find((r:any) => r.status === 'late') ? 'late' : 'absent')
    : null;

  /* today subject map */
  const todayMap: Record<string, string> = {};
  todayRec.forEach((r: any) => { todayMap[r.subjectId?._id || r.subjectId] = r.status; });

  /* calendar map */
  const calMap: Record<string, string> = {};
  (attData?.data || []).forEach((a: any) => {
    const d = new Date(a.date);
    calMap[`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`] = a.status;
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();
  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1">My Attendance</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mark your attendance for today</p>
      </motion.div>

      {/* ══ TODAY MARK SECTION ══ */}
      <div className={`p-6 rounded-2xl border mb-6 ${card}`}>
        <div className="mb-5">
          <h3 className="font-bold text-base mb-1">Today</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>

        {/* Current status display */}
        {todayStatus && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'8px 18px', borderRadius:12, marginBottom:20,
            background: todayStatus==='present' ? 'rgba(59,130,246,0.15)' : todayStatus==='late' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)',
            border: `1.5px solid ${todayStatus==='present' ? 'rgba(59,130,246,0.4)' : todayStatus==='late' ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)'}`,
          }}>
            <span style={{ fontSize:16 }}>{todayStatus==='present' ? '🔵' : todayStatus==='late' ? '🟡' : '🔴'}</span>
            <span style={{ fontWeight:700, fontSize:14, color: todayStatus==='present' ? '#60a5fa' : todayStatus==='late' ? '#fbbf24' : '#f87171' }}>
              Today: {todayStatus.charAt(0).toUpperCase() + todayStatus.slice(1)}
            </span>
            <span style={{ fontSize:12, color:'#475569' }}>(click to change)</span>
          </div>
        )}

        {/* Big click buttons */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { status:'present' as const, label:'Present', emoji:'✅', color:'#3b82f6', bg:'rgba(59,130,246,0.12)', activeBg:'rgba(59,130,246,0.3)', border:'rgba(59,130,246,0.4)' },
            { status:'absent'  as const, label:'Absent',  emoji:'❌', color:'#ef4444', bg:'rgba(239,68,68,0.1)',   activeBg:'rgba(239,68,68,0.28)', border:'rgba(239,68,68,0.35)' },
            { status:'late'    as const, label:'Late',    emoji:'🕐', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', activeBg:'rgba(245,158,11,0.28)', border:'rgba(245,158,11,0.3)' },
          ].map(btn => {
            const isActive = todayStatus === btn.status;
            const busy     = marking === btn.status;
            return (
              <button key={btn.status} onClick={() => mark(btn.status)}
                disabled={!!marking}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                  padding:'20px 32px', borderRadius:16, cursor:'pointer', border:'none',
                  background: isActive ? btn.activeBg : btn.bg,
                  outline: `2px solid ${isActive ? btn.border : 'transparent'}`,
                  transition:'all 0.2s', minWidth:120,
                  boxShadow: isActive ? `0 4px 20px ${btn.color}30` : 'none',
                  opacity: marking && !busy ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = btn.activeBg; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = btn.bg; }}>
                {busy
                  ? <Loader2 size={28} color={btn.color} style={{ animation:'spin 1s linear infinite' }} />
                  : <span style={{ fontSize:28 }}>{btn.emoji}</span>
                }
                <span style={{ fontSize:15, fontWeight:800, color:btn.color }}>{btn.label}</span>
                {isActive && <span style={{ fontSize:10, color:btn.color, opacity:0.8 }}>● Marked</span>}
              </button>
            );
          })}
        </div>

        {/* Per-subject if subjects exist */}
        {subjects.length > 0 && (
          <div className="mt-5">
            <p style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Subject-wise</p>
            <div className="flex flex-col gap-2">
              {subjects.map((sub: any) => {
                const status  = todayMap[sub._id];
                const classId = sub.classId?._id || sub.classId || '';
                const busy    = marking === sub._id;
                return (
                  <div key={sub._id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'10px 14px', borderRadius:12,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8faff',
                    border: status==='present' ? '1.5px solid rgba(59,130,246,0.4)'
                          : status==='absent'  ? '1.5px solid rgba(239,68,68,0.3)'
                          : status==='late'    ? '1.5px solid rgba(245,158,11,0.3)'
                          : `1.5px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}`,
                  }}>
                    <span style={{ fontWeight:700, fontSize:13, color: isDark?'#f1f5f9':'#1e293b' }}>{sub.name}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      {busy ? <Loader2 size={16} color="#60a5fa" style={{ animation:'spin 1s linear infinite' }} /> : (
                        <>
                          {(['present','absent','late'] as const).map(s => (
                            <button key={s} onClick={() => mark(s, sub._id, classId)}
                              style={{
                                padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer',
                                fontSize:11, fontWeight:700,
                                background: status===s
                                  ? s==='present' ? 'rgba(59,130,246,0.3)' : s==='absent' ? 'rgba(239,68,68,0.28)' : 'rgba(245,158,11,0.28)'
                                  : s==='present' ? 'rgba(59,130,246,0.1)' : s==='absent' ? 'rgba(239,68,68,0.1)'  : 'rgba(245,158,11,0.1)',
                                color: s==='present' ? '#60a5fa' : s==='absent' ? '#f87171' : '#fbbf24',
                              }}>
                              {s.charAt(0).toUpperCase()+s.slice(1)}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stats — compact */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label:'Present',    value: attData?.stats?.presentCount || 0, color:'#3b82f6', bg:'rgba(59,130,246,0.1)'  },
          { label:'Absent',     value: attData?.stats?.absentCount  || 0, color:'#ef4444', bg:'rgba(239,68,68,0.1)'   },
          { label:'Late',       value: attData?.stats?.lateCount    || 0, color:'#f59e0b', bg:'rgba(245,158,11,0.1)'  },
          { label:'%',          value: `${attData?.stats?.percentage || 0}%`, color:'#a78bfa', bg:'rgba(124,58,237,0.1)' },
        ].map((s, i) => (
          <div key={i} style={{
            padding:'10px 12px', borderRadius:12,
            background:s.bg, border:`1px solid ${s.color}25`,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <span style={{ fontSize:16, fontWeight:900, color:s.color }}>{loading ? '—' : s.value}</span>
            <span style={{ fontSize:11, color:s.color, opacity:0.8, fontWeight:600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar — compact */}
      <div className={`p-4 rounded-2xl border ${card}`} style={{ maxWidth:360 }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { if (month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1); }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:8, color:'#64748b', fontSize:14 }}>◀</button>
          <h3 style={{ fontWeight:700, fontSize:13 }}>{MONTHS[month-1]} {year}</h3>
          <button onClick={() => { if (month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1); }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:8, color:'#64748b', fontSize:14 }}>▶</button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'#475569', padding:'2px 0' }}>{d.slice(0,1)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {[...Array(firstDay)].map((_,i) => <div key={`e${i}`}/>)}
          {[...Array(daysInMonth)].map((_,i) => {
            const day    = i+1;
            const key    = `${year}-${month}-${day}`;
            const status = calMap[key];
            const isToday = day===now.getDate() && month===now.getMonth()+1 && year===now.getFullYear();
            return (
              <div key={day} style={{
                aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                borderRadius:6, fontSize:11, fontWeight:500,
                outline: isToday ? '2px solid #7c3aed' : 'none',
                background: status==='present' ? 'rgba(59,130,246,0.2)' :
                            status==='absent'  ? 'rgba(239,68,68,0.18)' :
                            status==='late'    ? 'rgba(245,158,11,0.18)': 'transparent',
                color:      status==='present' ? '#60a5fa' :
                            status==='absent'  ? '#f87171' :
                            status==='late'    ? '#fbbf24' :
                            isDark ? '#475569' : '#94a3b8',
              }}>
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {[['rgba(59,130,246,0.3)','Present'],['rgba(239,68,68,0.25)','Absent'],['rgba(245,158,11,0.25)','Late']].map(([c,l])=>(
            <div key={l} className="flex items-center gap-1.5" style={{ fontSize:10, color:'#64748b' }}>
              <div style={{ width:8, height:8, borderRadius:3, background:c }}/>{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

