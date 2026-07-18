'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, RefreshCw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function AdminAttendancePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [classes,   setClasses]   = useState<any[]>([]);
  const [subjects,  setSubjects]  = useState<any[]>([]);
  const [report,    setReport]    = useState<any[]>([]);
  const [allUsers,  setAllUsers]  = useState<any[]>([]);
  const [selClass,  setSelClass]  = useState('');
  const [selSub,    setSelSub]    = useState('');
  const [selDate,   setSelDate]   = useState(new Date().toISOString().split('T')[0]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/users?limit=200')])
      .then(([c, u]) => { setClasses(c.data.data || []); setAllUsers(u.data.data || []); })
      .catch(() => {});
  }, []);

  const handleClassChange = async (id: string) => {
    setSelClass(id); setSelSub(''); setReport([]);
    if (id) {
      const r = await api.get(`/subjects?classId=${id}`).catch(() => null);
      setSubjects(r?.data?.data || []);
    }
  };

  const fetchReport = async () => {
    if (!selDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate: selDate, endDate: selDate });
      if (selSub)   params.append('subjectId', selSub);
      if (selClass) params.append('classId',   selClass);
      const r = await api.get(`/attendance/report?${params}`);
      setReport(r.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [selDate, selSub, selClass]);

  /* Build status map: userId → status */
  const statusMap: Record<string, string> = {};
  report.forEach((a: any) => {
    const uid = a.userId?._id || a.userId;
    // if multiple subjects, show 'present' if any present
    if (!statusMap[uid] || a.status === 'present') statusMap[uid] = a.status;
  });

  const presentList = allUsers.filter(u => statusMap[u._id] === 'present');
  const lateList    = allUsers.filter(u => statusMap[u._id] === 'late');
  const absentList  = allUsers.filter(u => statusMap[u._id] === 'absent' || !statusMap[u._id]);

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`;

  const StudentCard = ({ user, status }: { user: any; status: string }) => {
    const colors = {
      present: { bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.4)',  text:'#60a5fa',  label:'🔵 Present' },
      absent:  { bg:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.35)', text:'#f87171',  label:'🔴 Absent'  },
      late:    { bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.3)', text:'#fbbf24',  label:'🟡 Late'    },
    };
    const c = colors[status as keyof typeof colors] || colors.absent;
    return (
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
        borderRadius:14, background:c.bg, border:`1.5px solid ${c.border}`,
      }}>
        <div style={{
          width:40, height:40, borderRadius:'50%', flexShrink:0, overflow:'hidden',
          background: status==='present' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)'
                    : status==='late'    ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                    : 'linear-gradient(135deg,#ef4444,#b91c1c)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:800, color:'#fff', fontSize:16,
        }}>
          {user.profilePicture
            ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : user.fullName?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:700, fontSize:13, color: isDark ? '#f1f5f9' : '#1e293b', marginBottom:2 }}>{user.fullName}</p>
          {user.selectedClass && <p style={{ fontSize:11, color:'#64748b' }}>Class {user.selectedClass}</p>}
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:c.text, whiteSpace:'nowrap' }}>{c.label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:12 }}>
        ← Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Attendance Report</h1>
        <button onClick={fetchReport} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#818cf8', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className={`p-5 rounded-2xl border ${card} mb-6`}>
        <div className="flex flex-wrap gap-3">
          <select value={selClass} onChange={e => handleClassChange(e.target.value)} className={input}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={selSub} onChange={e => { setSelSub(e.target.value); }} className={input}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} className={input} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Present', count:presentList.length, color:'#3b82f6', bg:'rgba(59,130,246,0.1)'  },
          { label:'Absent',  count:absentList.length,  color:'#ef4444', bg:'rgba(239,68,68,0.1)'   },
          { label:'Late',    count:lateList.length,    color:'#f59e0b', bg:'rgba(245,158,11,0.1)'  },
        ].map(s => (
          <div key={s.label} style={{ padding:'16px 20px', borderRadius:16, background:s.bg, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:28, fontWeight:900, color:s.color }}>{s.count}</span>
            <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Present students */}
      {presentList.length > 0 && (
        <div className={`p-5 rounded-2xl border mb-4 ${card}`}>
          <h3 style={{ fontWeight:800, fontSize:15, color:'#60a5fa', marginBottom:12 }}>🔵 Present ({presentList.length})</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:10 }}>
            {presentList.map(u => <StudentCard key={u._id} user={u} status="present" />)}
          </div>
        </div>
      )}

      {/* Late students */}
      {lateList.length > 0 && (
        <div className={`p-5 rounded-2xl border mb-4 ${card}`}>
          <h3 style={{ fontWeight:800, fontSize:15, color:'#fbbf24', marginBottom:12 }}>🟡 Late ({lateList.length})</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:10 }}>
            {lateList.map(u => <StudentCard key={u._id} user={u} status="late" />)}
          </div>
        </div>
      )}

      {/* Absent students */}
      {absentList.length > 0 && (
        <div className={`p-5 rounded-2xl border mb-4 ${card}`}>
          <h3 style={{ fontWeight:800, fontSize:15, color:'#f87171', marginBottom:12 }}>🔴 Absent ({absentList.length})</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:10 }}>
            {absentList.map(u => <StudentCard key={u._id} user={u} status="absent" />)}
          </div>
        </div>
      )}

      {allUsers.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px', color:'#475569' }}>
          <Users size={40} color="#334155" style={{ margin:'0 auto 12px' }} />
          <p>No students found</p>
        </div>
      )}
    </div>
  );
}
