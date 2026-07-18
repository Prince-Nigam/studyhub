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

export default function AttendancePage() {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const isDark     = theme === 'dark';

  const [subjects,   setSubjects]   = useState<any[]>([]);
  const [todayRec,   setTodayRec]   = useState<any[]>([]);
  const [marking,    setMarking]    = useState<string | null>(null);
  const [attData,    setAttData]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  const now   = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [attRes, todayRes, subRes] = await Promise.all([
        api.get(`/attendance/my?month=${month}&year=${year}`),
        api.get('/attendance/today'),
        api.get('/subjects'),
      ]);
      setAttData(attRes.data);
      setTodayRec(todayRes.data.data || []);
      setSubjects(subRes.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [month, year]);

  /* mark attendance */
  const mark = async (subjectId: string, classId: string, status: 'present' | 'absent' | 'late') => {
    setMarking(subjectId);
    try {
      await api.post('/attendance/self-mark', { subjectId, classId, status });
      toast.success(`Marked as ${status}!`);
      const r = await api.get('/attendance/today');
      setTodayRec(r.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setMarking(null); }
  };

  /* today status map */
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
      <div className={`p-5 rounded-2xl border mb-6 ${card}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base">Today</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <p className="text-slate-500 text-sm">No subjects available.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {subjects.map((sub: any) => {
              const status  = todayMap[sub._id];
              const classId = sub.classId?._id || sub.classId || '';
              const busy    = marking === sub._id;

              return (
                <div key={sub._id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 18px', borderRadius:14,
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8faff',
                  border: status === 'present' ? '1.5px solid rgba(59,130,246,0.5)'
                        : status === 'absent'  ? '1.5px solid rgba(239,68,68,0.4)'
                        : status === 'late'    ? '1.5px solid rgba(245,158,11,0.4)'
                        : `1.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
                }}>
                  {/* Subject name */}
                  <div className="flex items-center gap-3">
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background: sub.color ? `${sub.color}25` : 'rgba(124,58,237,0.15)',
                      border: `1px solid ${sub.color || '#7c3aed'}40`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:800, fontSize:13,
                      color: sub.color || '#a78bfa',
                    }}>
                      {sub.name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight:700, fontSize:14, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                      {sub.name}
                    </span>
                  </div>

                  {/* Status + buttons */}
                  <div className="flex items-center gap-2">
                    {/* Current status badge */}
                    {status && (
                      <span style={{
                        padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:700,
                        background: status === 'present' ? 'rgba(59,130,246,0.15)'
                                  : status === 'absent'  ? 'rgba(239,68,68,0.12)'
                                  : 'rgba(245,158,11,0.12)',
                        color: status === 'present' ? '#60a5fa'
                             : status === 'absent'  ? '#f87171' : '#fbbf24',
                        border: `1px solid ${status === 'present' ? 'rgba(59,130,246,0.3)' : status === 'absent' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {status === 'present' ? '🔵 Present' : status === 'absent' ? '🔴 Absent' : '🟡 Late'}
                      </span>
                    )}

                    {/* Buttons */}
                    {busy ? (
                      <Loader2 size={18} color="#60a5fa" style={{ animation:'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <button
                          onClick={() => mark(sub._id, classId, 'present')}
                          style={{
                            padding:'6px 14px', borderRadius:10, border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700,
                            background: status === 'present' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.12)',
                            color:'#60a5fa', transition:'all 0.15s',
                          }}>
                          Present
                        </button>
                        <button
                          onClick={() => mark(sub._id, classId, 'absent')}
                          style={{
                            padding:'6px 14px', borderRadius:10, border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700,
                            background: status === 'absent' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)',
                            color:'#f87171', transition:'all 0.15s',
                          }}>
                          Absent
                        </button>
                        <button
                          onClick={() => mark(sub._id, classId, 'late')}
                          style={{
                            padding:'6px 14px', borderRadius:10, border:'none', cursor:'pointer',
                            fontSize:12, fontWeight:700,
                            background: status === 'late' ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.1)',
                            color:'#fbbf24', transition:'all 0.15s',
                          }}>
                          Late
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Present',    value: attData?.stats?.presentCount || 0, color:'#3b82f6', bg:'rgba(59,130,246,0.1)'  },
          { label:'Absent',     value: attData?.stats?.absentCount  || 0, color:'#ef4444', bg:'rgba(239,68,68,0.1)'   },
          { label:'Late',       value: attData?.stats?.lateCount    || 0, color:'#f59e0b', bg:'rgba(245,158,11,0.1)'  },
          { label:'Percentage', value: `${attData?.stats?.percentage || 0}%`, color:'#a78bfa', bg:'rgba(124,58,237,0.1)' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className={`p-5 rounded-2xl border ${card} flex items-center gap-3`}>
            <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:20, fontWeight:900, color:s.color }}>{loading ? '—' : s.value}</span>
            </div>
            <p style={{ fontSize:13, color: isDark ? '#94a3b8' : '#64748b', fontWeight:600 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <div className={`p-6 rounded-2xl border ${card}`}>
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => { if (month===1){setMonth(12);setYear(y=>y-1);}else setMonth(m=>m-1); }}
            className={`p-2 rounded-xl ${isDark?'hover:bg-slate-700':'hover:bg-slate-100'} transition-colors`}>◀</button>
          <h3 className="font-bold">{MONTHS[month-1]} {year}</h3>
          <button onClick={() => { if (month===12){setMonth(1);setYear(y=>y+1);}else setMonth(m=>m+1); }}
            className={`p-2 rounded-xl ${isDark?'hover:bg-slate-700':'hover:bg-slate-100'} transition-colors`}>▶</button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => <div key={d} className="text-center text-xs font-bold py-1 text-slate-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_,i) => <div key={`e${i}`}/>)}
          {[...Array(daysInMonth)].map((_,i) => {
            const day    = i+1;
            const key    = `${year}-${month}-${day}`;
            const status = calMap[key];
            const isToday = day===now.getDate() && month===now.getMonth()+1 && year===now.getFullYear();
            return (
              <div key={day} className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                ${isToday ? 'ring-2 ring-violet-500' : ''}
                ${status==='present' ? 'bg-blue-500/20 text-blue-400' :
                  status==='absent'  ? 'bg-red-500/20 text-red-400'   :
                  status==='late'    ? 'bg-amber-500/20 text-amber-400':
                  isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
