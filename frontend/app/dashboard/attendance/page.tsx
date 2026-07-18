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
      <div className={`rounded-2xl border mb-4 ${card}`} style={{ maxWidth:400, padding:'14px 16px' }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <p style={{ fontWeight:800, fontSize:13, color: isDark?'#f1f5f9':'#1e293b' }}>Today's Attendance</p>
            <p style={{ fontSize:11, color:'#64748b' }}>
              {now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}
            </p>
          </div>
          {todayStatus && (
            <span style={{
              fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99,
              background: todayStatus==='present' ? 'rgba(59,130,246,0.15)' : todayStatus==='late' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)',
              color: todayStatus==='present' ? '#60a5fa' : todayStatus==='late' ? '#fbbf24' : '#f87171',
              border: `1px solid ${todayStatus==='present' ? 'rgba(59,130,246,0.35)' : todayStatus==='late' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {todayStatus==='present' ? '🔵 Present' : todayStatus==='late' ? '🟡 Late' : '🔴 Absent'}
            </span>
          )}
        </div>

        {/* 3 compact buttons in a row */}
        <div style={{ display:'flex', gap:8 }}>
          {[
            { status:'present' as const, label:'Present', color:'#3b82f6', bg:'rgba(59,130,246,0.12)', activeBg:'rgba(59,130,246,0.28)' },
            { status:'absent'  as const, label:'Absent',  color:'#ef4444', bg:'rgba(239,68,68,0.1)',   activeBg:'rgba(239,68,68,0.25)'  },
            { status:'late'    as const, label:'Late',    color:'#f59e0b', bg:'rgba(245,158,11,0.1)', activeBg:'rgba(245,158,11,0.25)' },
          ].map(btn => {
            const isActive = todayStatus === btn.status;
            const busy     = marking === btn.status;
            return (
              <button key={btn.status} onClick={() => mark(btn.status)}
                disabled={!!marking}
                style={{
                  flex:1, padding:'10px 8px', borderRadius:12, cursor:'pointer',
                  border: `1.5px solid ${isActive ? btn.color+'60' : 'transparent'}`,
                  background: isActive ? btn.activeBg : btn.bg,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  transition:'all 0.15s', outline:'none',
                  opacity: marking && !busy ? 0.5 : 1,
                }}>
                {busy
                  ? <Loader2 size={16} color={btn.color} style={{ animation:'spin 1s linear infinite' }} />
                  : <span style={{ fontSize:16 }}>
                      {btn.status==='present' ? '✅' : btn.status==='absent' ? '❌' : '🕐'}
                    </span>
                }
                <span style={{ fontSize:11, fontWeight:700, color:btn.color }}>{btn.label}</span>
                {isActive && <span style={{ fontSize:9, color:btn.color, opacity:0.7 }}>● marked</span>}
              </button>
            );
          })}
        </div>
      </div>

        {/* Per-subject if subjects exist */}
        {subjects.length > 0 && (
          <div className={`rounded-2xl border mb-4 ${card}`} style={{ maxWidth:400, padding:'14px 16px' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Subject-wise</p>
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

