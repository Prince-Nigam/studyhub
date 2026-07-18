'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Users, Save } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

type AttStatus = 'present' | 'absent' | 'late' | '';

export default function AdminAttendancePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [users,           setUsers]           = useState<any[]>([]);
  const [subjects,        setSubjects]        = useState<any[]>([]);
  const [classes,         setClasses]         = useState<any[]>([]);
  const [selectedClass,   setSelectedClass]   = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate,    setSelectedDate]    = useState(new Date().toISOString().split('T')[0]);
  const [attendance,      setAttendance]      = useState<Record<string, AttStatus>>({});
  const [saving,          setSaving]          = useState(false);

  /* ── fetch classes + users + today report ─────── */
  useEffect(() => {
    Promise.all([api.get('/users?limit=200'), api.get('/classes')])
      .then(([u, c]) => { setUsers(u.data.data || []); setClasses(c.data.data || []); })
      .catch(() => {});
  }, []);

  // Refresh today report when subject/date changes
  useEffect(() => {
    if (!selectedSubject || !selectedDate) return;
    api.get(`/attendance/report?subjectId=${selectedSubject}&startDate=${selectedDate}&endDate=${selectedDate}`)
      .then(r => {
        const map: Record<string, string> = {};
        (r.data.data || []).forEach((a: any) => {
          map[a.userId?._id || a.userId] = a.status;
        });
        setAttendance(map as any);
      })
      .catch(() => {});
  }, [selectedSubject, selectedDate]);

  /* ── class change → fetch subjects ────────────── */
  const handleClassChange = async (id: string) => {
    setSelectedClass(id);
    setSelectedSubject('');
    if (id) {
      const r = await api.get(`/subjects?classId=${id}`).catch(() => null);
      setSubjects(r?.data?.data || []);
    }
  };

  /* ── toggle status on click ────────────────────── */
  const toggle = (userId: string) => {
    setAttendance(prev => {
      const cur = prev[userId] || 'absent';
      // cycle: absent → present → late → absent
      const next: AttStatus =
        cur === 'absent'  ? 'present' :
        cur === 'present' ? 'late'    : 'absent';
      return { ...prev, [userId]: next };
    });
  };

  /* ── mark all ──────────────────────────────────── */
  const markAll = (status: AttStatus) => {
    const obj: Record<string, AttStatus> = {};
    users.forEach(u => { obj[u._id] = status; });
    setAttendance(obj);
  };

  /* ── save ──────────────────────────────────────── */
  const handleSave = async () => {
    if (!selectedSubject || !selectedDate) { toast.error('Select subject and date'); return; }
    const records = Object.entries(attendance)
      .filter(([, s]) => s !== '')
      .map(([userId, status]) => ({ userId, status }));
    if (!records.length) { toast.error('Mark attendance for at least one student'); return; }
    setSaving(true);
    try {
      await api.post('/attendance/bulk', {
        subjectId: selectedSubject, classId: selectedClass,
        date: selectedDate, records,
      });
      toast.success(`Attendance saved for ${records.length} students!`);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  /* ── counts ────────────────────────────────────── */
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount  = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount    = Object.values(attendance).filter(s => s === 'late').length;

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Mark Attendance</h1>

      {/* ── Filters ── */}
      <div className={`p-5 rounded-2xl border ${card} mb-6`}>
        <div className="flex flex-wrap gap-3 mb-5">
          <select value={selectedClass} onChange={e => handleClassChange(e.target.value)} className={input}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={input}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={input} />
        </div>

        {/* Quick mark all */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => markAll('present')}
            className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            style={{ background:'rgba(59,130,246,0.15)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(59,130,246,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background='rgba(59,130,246,0.15)')}>
            ✓ Mark All Present
          </button>
          <button onClick={() => markAll('absent')}
            className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(239,68,68,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background='rgba(239,68,68,0.15)')}>
            ✗ Mark All Absent
          </button>
          <button onClick={() => markAll('late')}
            className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
            style={{ background:'rgba(245,158,11,0.15)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(245,158,11,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background='rgba(245,158,11,0.15)')}>
            ◷ Mark All Late
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      {users.length > 0 && (
        <div className="flex gap-4 mb-5 flex-wrap">
          {[
            { label:'Present', count:presentCount, color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
            { label:'Absent',  count:absentCount,  color:'#ef4444', bg:'rgba(239,68,68,0.1)'  },
            { label:'Late',    count:lateCount,    color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
            { label:'Unmarked',count: users.length - presentCount - absentCount - lateCount, color:'#64748b', bg:'rgba(100,116,139,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ padding:'10px 20px', borderRadius:12, background:s.bg, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.count}</span>
              <span style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Student cards grid ── */}
      {users.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12, marginBottom:24 }}>
          {users.map(user => {
            const status = attendance[user._id] || 'absent';

            const colors = {
              present: { bg:'rgba(59,130,246,0.15)',  border:'rgba(59,130,246,0.5)',  text:'#60a5fa',  label:'Present', icon:'✓' },
              absent:  { bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.4)',   text:'#f87171',  label:'Absent',  icon:'✗' },
              late:    { bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.35)', text:'#fbbf24',  label:'Late',    icon:'◷' },
            };
            const c = colors[status as keyof typeof colors];

            return (
              <button
                key={user._id}
                onClick={() => toggle(user._id)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  gap:10, padding:'18px 12px', borderRadius:16, cursor:'pointer',
                  background: c.bg, border:`2px solid ${c.border}`,
                  transition:'all 0.2s', outline:'none',
                  boxShadow: status === 'present' ? '0 4px 20px rgba(59,130,246,0.2)' :
                             status === 'absent'  ? '0 4px 20px rgba(239,68,68,0.15)' : '0 4px 20px rgba(245,158,11,0.15)',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>

                {/* Avatar */}
                <div style={{
                  width:52, height:52, borderRadius:'50%',
                  background: status === 'present' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' :
                              status === 'absent'  ? 'linear-gradient(135deg,#ef4444,#b91c1c)' :
                                                     'linear-gradient(135deg,#f59e0b,#d97706)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:900, color:'#fff', fontSize:20,
                  border:`2px solid ${c.border}`,
                  overflow:'hidden', flexShrink:0,
                }}>
                  {user.profilePicture
                    ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : user.fullName?.[0]?.toUpperCase()
                  }
                </div>

                {/* Name */}
                <p style={{ fontSize:13, fontWeight:700, color: isDark?'#f1f5f9':'#1e293b', textAlign:'center', lineHeight:1.3 }}>
                  {user.fullName}
                </p>
                {user.selectedClass && (
                  <p style={{ fontSize:11, color:'#64748b' }}>Class {user.selectedClass}</p>
                )}

                {/* Status badge */}
                <div style={{
                  padding:'4px 14px', borderRadius:99,
                  background: c.bg, border:`1px solid ${c.border}`,
                  fontSize:12, fontWeight:700, color:c.text,
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  <span>{c.icon}</span> {c.label}
                </div>

                <p style={{ fontSize:10, color:'#475569' }}>click to change</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Save button ── */}
      {users.length > 0 && (
        <button onClick={handleSave} disabled={saving}
          style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'13px 28px', borderRadius:14, border:'none',
            background:'linear-gradient(135deg,#6366f1,#4f46e5)',
            color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer',
            boxShadow:'0 6px 20px rgba(99,102,241,0.35)',
            opacity: saving ? 0.7 : 1, transition:'all 0.2s',
          }}>
          {saving ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={18} />}
          Save Attendance
        </button>
      )}

      {users.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 24px', color:'#475569' }}>
          <Users size={40} color="#334155" style={{ margin:'0 auto 12px' }} />
          <p style={{ fontWeight:700, color:'#94a3b8' }}>No students found</p>
        </div>
      )}
    </div>
  );
}
