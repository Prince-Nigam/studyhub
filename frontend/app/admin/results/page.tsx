'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Trophy, Plus, Trash2, Medal, BarChart2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

type Tab = 'upload' | 'leaderboard';

export default function AdminResultsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [tab,         setTab]         = useState<Tab>('upload');
  const [tests,       setTests]       = useState<any[]>([]);
  const [users,       setUsers]       = useState<any[]>([]);
  const [selTest,     setSelTest]     = useState('');
  const [existRes,    setExistRes]    = useState<any[]>([]);
  const [rows,        setRows]        = useState<{ userId:string; score:string; totalMarks:string; passed:boolean }[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [loadingRes,  setLoadingRes]  = useState(false);
  const [globalLb,    setGlobalLb]    = useState<any[]>([]);
  const [loadingLb,   setLoadingLb]   = useState(false);

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`;

  useEffect(() => {
    Promise.all([api.get('/tests'), api.get('/users?limit=200')])
      .then(([t, u]) => { setTests(t.data.data || []); setUsers(u.data.data || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'leaderboard') {
      setLoadingLb(true);
      api.get('/users/leaderboard')
        .then(r => setGlobalLb(r.data.data || []))
        .catch(() => {})
        .finally(() => setLoadingLb(false));
    }
  }, [tab]);

  const loadResults = async (testId: string) => {
    if (!testId) return;
    setLoadingRes(true);
    try {
      const r = await api.get(`/tests/${testId}/results`);
      setExistRes(r.data.data || []);
    } catch {} finally { setLoadingRes(false); }
  };

  const handleTestChange = (id: string) => {
    setSelTest(id);
    setRows([]);
    loadResults(id);
  };

  const addRow = () => {
    setRows(prev => [...prev, { userId:'', score:'', totalMarks:'100', passed:true }]);
  };

  const updateRow = (i: number, field: string, val: any) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const removeRow = (i: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!selTest) { toast.error('Select a test first'); return; }
    const valid = rows.filter(r => r.userId && r.score !== '' && r.totalMarks !== '');
    if (!valid.length) { toast.error('Add at least one result row'); return; }
    setSaving(true);
    try {
      await api.post(`/tests/${selTest}/results/bulk`, {
        results: valid.map(r => ({
          userId: r.userId, score: Number(r.score),
          totalMarks: Number(r.totalMarks), passed: r.passed,
        }))
      });
      toast.success(`${valid.length} results uploaded & students notified!`);
      setRows([]);
      loadResults(selTest);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const selTestObj = tests.find(t => t._id === selTest);

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:16 }}>
        ← Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Results & Leaderboard</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload results and view student rankings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id:'upload',      label:'Upload Results', icon: Upload },
          { id:'leaderboard', label:'Leaderboard',    icon: Trophy },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)}
            style={{
              display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:12,
              border: tab===t.id ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
              background: tab===t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              color: tab===t.id ? '#818cf8' : '#64748b', fontWeight:700, fontSize:13, cursor:'pointer',
            }}>
            <t.icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {tab === 'upload' && (
        <>
          {/* Test selector */}
          <div className={`p-5 rounded-2xl border ${card} mb-6`}>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Test *</label>
            <select value={selTest} onChange={e => handleTestChange(e.target.value)} className={`${input} w-full`}>
              <option value="">-- Choose a test --</option>
              {tests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.totalMarks} marks)</option>)}
            </select>
          </div>

          {/* Existing results */}
          {selTest && (
            <div className={`p-5 rounded-2xl border ${card} mb-6`}>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <BarChart2 size={16} className="text-amber-400" />
                Existing Results {selTestObj && `— ${selTestObj.title}`}
                {loadingRes && <Loader2 size={14} className="animate-spin ml-2" />}
              </h3>
              {existRes.length === 0 ? (
                <p className="text-sm text-slate-500">No results uploaded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Rank</th>
                        <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Student</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Score</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">%</th>
                        <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...existRes].sort((a,b) => b.score - a.score).map((r, i) => (
                        <tr key={i} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                          <td className="py-2 px-3">
                            <span style={{ fontWeight:800, color: i<3 ? RANK_COLORS[i] : '#64748b', fontSize:13 }}>#{i+1}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700 }}>
                                {r.userId?.fullName?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium">{r.userId?.fullName}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center font-bold">{r.score}/{r.totalMarks}</td>
                          <td className="py-2 px-3 text-center font-bold" style={{ color: r.percentage >= 75 ? '#4ade80' : r.percentage >= 40 ? '#fbbf24' : '#f87171' }}>
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
              )}
            </div>
          )}

          {/* Upload rows */}
          {selTest && (
            <div className={`p-5 rounded-2xl border ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Add / Update Results</h3>
                <button onClick={addRow}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors">
                  <Plus size={14} /> Add Student
                </button>
              </div>
              {rows.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Click "Add Student" to start adding results</p>
              ) : (
                <div className="space-y-3">
                  {rows.map((row, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:12, background: isDark ? 'rgba(255,255,255,0.04)' : '#f8faff', border:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}` }}>
                      <select value={row.userId} onChange={e => updateRow(i,'userId',e.target.value)} className={`${input} flex-1`} style={{ minWidth:160 }}>
                        <option value="">Select Student</option>
                        {users.map(u => <option key={u._id} value={u._id}>{u.fullName}{u.selectedClass ? ` (${u.selectedClass})` : ''}</option>)}
                      </select>
                      <input type="number" placeholder="Score" value={row.score} onChange={e => updateRow(i,'score',e.target.value)} className={input} style={{ width:80 }} min={0} />
                      <input type="number" placeholder="Total" value={row.totalMarks} onChange={e => updateRow(i,'totalMarks',e.target.value)} className={input} style={{ width:80 }} min={1} />
                      <button onClick={() => updateRow(i,'passed',!row.passed)}
                        style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, background: row.passed?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)', color: row.passed?'#4ade80':'#f87171' }}>
                        {row.passed ? '✓ Pass' : '✗ Fail'}
                      </button>
                      <button onClick={() => removeRow(i)} style={{ padding:'6px', borderRadius:8, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#f87171' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleSave} disabled={saving}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:8, opacity:saving?0.7:1 }}>
                    {saving ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> : <Upload size={16} />}
                    Upload & Notify Students
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <div className={`p-5 rounded-2xl border ${card}`}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> Global Leaderboard (Top Students)
            {loadingLb && <Loader2 size={14} className="animate-spin" />}
          </h3>
          {globalLb.length === 0 && !loadingLb ? (
            <p className="text-sm text-slate-500 text-center py-8">No results yet. Upload results first.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Rank</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Student</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Class</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Avg %</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Best %</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {globalLb.map((entry, i) => (
                    <tr key={entry.userId} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                      <td className="py-2 px-3">
                        <span style={{ fontWeight:900, fontSize:14, color: i<3 ? RANK_COLORS[i] : '#64748b' }}>
                          {i<3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div style={{ width:30, height:30, borderRadius:'50%', background: i===0?'linear-gradient(135deg,#FFD700,#f59e0b)':i===1?'linear-gradient(135deg,#94a3b8,#64748b)':i===2?'linear-gradient(135deg,#CD7F32,#92400e)':'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:800 }}>
                            {entry.fullName?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold">{entry.fullName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400">{entry.selectedClass || '—'}</td>
                      <td className="py-2 px-3 text-center font-bold" style={{ color: entry.avgPercentage >= 75 ? '#4ade80' : entry.avgPercentage >= 40 ? '#fbbf24' : '#f87171' }}>
                        {entry.avgPercentage}%
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400">{entry.bestScore}%</td>
                      <td className="py-2 px-3 text-center text-slate-400">{entry.totalTests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function AdminResultsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [tests,       setTests]       = useState<any[]>([]);
  const [users,       setUsers]       = useState<any[]>([]);
  const [selTest,     setSelTest]     = useState('');
  const [existRes,    setExistRes]    = useState<any[]>([]);
  const [rows,        setRows]        = useState<{ userId:string; score:string; totalMarks:string; passed:boolean }[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [loadingRes,  setLoadingRes]  = useState(false);

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`;

  useEffect(() => {
    Promise.all([api.get('/tests'), api.get('/users?limit=200')])
      .then(([t, u]) => { setTests(t.data.data || []); setUsers(u.data.data || []); })
      .catch(() => {});
  }, []);

  const loadResults = async (testId: string) => {
    if (!testId) return;
    setLoadingRes(true);
    try {
      const r = await api.get(`/tests/${testId}/results`);
      setExistRes(r.data.data || []);
    } catch {} finally { setLoadingRes(false); }
  };

  const handleTestChange = (id: string) => {
    setSelTest(id);
    setRows([]);
    loadResults(id);
  };

  const addRow = () => {
    setRows(prev => [...prev, { userId:'', score:'', totalMarks:'100', passed:true }]);
  };

  const updateRow = (i: number, field: string, val: any) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const removeRow = (i: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!selTest) { toast.error('Select a test first'); return; }
    const valid = rows.filter(r => r.userId && r.score !== '' && r.totalMarks !== '');
    if (!valid.length) { toast.error('Add at least one result row'); return; }

    setSaving(true);
    try {
      await api.post(`/tests/${selTest}/results/bulk`, {
        results: valid.map(r => ({
          userId: r.userId,
          score: Number(r.score),
          totalMarks: Number(r.totalMarks),
          passed: r.passed,
        }))
      });
      toast.success(`${valid.length} results uploaded & students notified!`);
      setRows([]);
      loadResults(selTest);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const selTestObj = tests.find(t => t._id === selTest);

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:16 }}>
        ← Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Upload Results</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload student results — they'll be notified automatically
          </p>
        </div>
      </div>

      {/* Test selector */}
      <div className={`p-5 rounded-2xl border ${card} mb-6`}>
        <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select Test *</label>
        <select value={selTest} onChange={e => handleTestChange(e.target.value)} className={`${input} w-full`}>
          <option value="">-- Choose a test --</option>
          {tests.map(t => <option key={t._id} value={t._id}>{t.title} ({t.totalMarks} marks)</option>)}
        </select>
      </div>

      {/* Existing results */}
      {selTest && (
        <div className={`p-5 rounded-2xl border ${card} mb-6`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            Existing Results {selTestObj && `— ${selTestObj.title}`}
            {loadingRes && <Loader2 size={14} className="animate-spin ml-2" />}
          </h3>
          {existRes.length === 0 ? (
            <p className="text-sm text-slate-500">No results uploaded yet for this test.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400">Student</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Score</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">%</th>
                    <th className="text-center py-2 px-3 text-xs font-bold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {existRes.map((r, i) => (
                    <tr key={i} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                            {r.userId?.fullName?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{r.userId?.fullName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{r.score}/{r.totalMarks}</td>
                      <td className="py-2 px-3 text-center font-bold" style={{ color: r.percentage >= 75 ? '#4ade80' : r.percentage >= 40 ? '#fbbf24' : '#f87171' }}>
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
          )}
        </div>
      )}

      {/* Upload new results */}
      {selTest && (
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Add / Update Results</h3>
            <button onClick={addRow}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors">
              <Plus size={14} /> Add Student
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Click "Add Student" to start adding results</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:12, background: isDark ? 'rgba(255,255,255,0.04)' : '#f8faff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}` }}>
                  {/* Student select */}
                  <select value={row.userId} onChange={e => updateRow(i, 'userId', e.target.value)}
                    className={`${input} flex-1`} style={{ minWidth:160 }}>
                    <option value="">Select Student</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.fullName} {u.selectedClass ? `(${u.selectedClass})` : ''}</option>)}
                  </select>

                  {/* Score */}
                  <input type="number" placeholder="Score" value={row.score}
                    onChange={e => updateRow(i, 'score', e.target.value)}
                    className={input} style={{ width:80 }} min={0} />

                  {/* Total marks */}
                  <input type="number" placeholder="Total" value={row.totalMarks}
                    onChange={e => updateRow(i, 'totalMarks', e.target.value)}
                    className={input} style={{ width:80 }} min={1} />

                  {/* Pass/Fail toggle */}
                  <button onClick={() => updateRow(i, 'passed', !row.passed)}
                    style={{
                      padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                      background: row.passed ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                      color: row.passed ? '#4ade80' : '#f87171',
                    }}>
                    {row.passed ? '✓ Pass' : '✗ Fail'}
                  </button>

                  {/* Remove */}
                  <button onClick={() => removeRow(i)}
                    style={{ padding:'6px', borderRadius:8, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#f87171' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button onClick={handleSave} disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 24px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:8, opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> : <Upload size={16} />}
                Upload & Notify Students
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
