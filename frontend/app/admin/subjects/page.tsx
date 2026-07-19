'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Loader2, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#3b82f6','#ec4899','#f59e0b','#10b981','#8b5cf6','#06b6d4','#ef4444'];

const SUBJECT_PRESETS = [
  'Mathematics','Science','English','Hindi','Social Science','Computer Science',
  'Physics','Chemistry','Biology','History','Geography','Civics',
  'Economics','Accounts','Business Studies','Sanskrit','Urdu','EVS',
  'Political Science','Sociology','Psychology','Physical Education','Art','Music',
];

const ICONS = [
  '➕','🔬','📖','🌍','💻','🧪','🏛️','🗺️','💰','📊',
  '🧬','⚗️','🔭','📐','📏','✏️','🎨','🎵','⚽','🏃',
  '🧮','📚','🌿','🌊','🦋','🧠','💡','🎭','🗣️','✍️',
  'IN','EN','HI','MA','SC','GK','CS','PE','AR','MU',
];

export default function AdminSubjectsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [subjects,     setSubjects]     = useState<any[]>([]);
  const [classes,      setClasses]      = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [showSubDrop,  setShowSubDrop]  = useState(false);
  const [showIconGrid, setShowIconGrid] = useState(false);
  const [form, setForm] = useState({ name:'', classId:'', description:'', color:'#6366f1', icon:'' });

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([api.get('/subjects'), api.get('/classes')]);
      setSubjects(sRes.data.data);
      setClasses(cRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.classId) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/subjects', form);
      toast.success('Subject created!');
      setShowModal(false);
      setForm({ name:'', classId:'', description:'', color:'#6366f1', icon:'' });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/subjects/${id}`); setSubjects(prev => prev.filter(s => s._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:12 }}>
        ← Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Manage Subjects</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? [...Array(8)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)
        : subjects.map((sub, i) => (
          <motion.div key={sub._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
            className={`p-4 rounded-2xl border ${card} group relative`}>
            <div className="flex items-center gap-2 mb-2">
              {sub.icon && <span style={{ fontSize:20 }}>{sub.icon}</span>}
              <div className="w-3 h-3 rounded-full" style={{ background: sub.color||'#6366f1' }} />
            </div>
            <h3 className="font-bold text-sm mb-1">{sub.name}</h3>
            <p className="text-xs text-slate-500">{sub.classId?.name}</p>
            {sub.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{sub.description}</p>}
            <button onClick={() => handleDelete(sub._id)}
              className="absolute top-3 right-3 p-1 text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className={`w-full max-w-md ${isDark?'bg-slate-800':'bg-white'} rounded-2xl border ${isDark?'border-slate-700':'border-slate-200'} shadow-2xl p-6 mb-10`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">Add Subject</h2>
              <button onClick={() => { setShowModal(false); setShowSubDrop(false); setShowIconGrid(false); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">

              {/* Subject name dropdown */}
              <div style={{ position:'relative' }}>
                <label className="block text-xs font-bold mb-1 text-slate-400">Subject Name *</label>
                <button type="button" onClick={() => { setShowSubDrop(v=>!v); setShowIconGrid(false); }}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#fff', color:form.name?(isDark?'#f1f5f9':'#1e293b'):'#64748b', fontSize:13, cursor:'pointer', fontWeight:form.name?600:400 }}>
                  {form.name || 'Select or type subject name'}
                  <ChevronDown size={14} style={{ transform:showSubDrop?'rotate(180deg)':'none', transition:'.15s' }} />
                </button>
                <AnimatePresence>
                  {showSubDrop && (
                    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                      style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:100, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', maxHeight:200, overflowY:'auto' }}>
                      <div style={{ padding:'8px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#f1f5f9'}` }}>
                        <input placeholder="Type custom name..." value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                          style={{ width:'100%', padding:'6px 10px', borderRadius:8, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#f8faff', color:isDark?'#f1f5f9':'#1e293b', fontSize:12, outline:'none' }} />
                      </div>
                      {SUBJECT_PRESETS.filter(s=>!form.name||s.toLowerCase().includes(form.name.toLowerCase())).map(s=>(
                        <div key={s} onClick={()=>{setForm(f=>({...f,name:s}));setShowSubDrop(false);}}
                          style={{ padding:'9px 14px', cursor:'pointer', fontSize:13, color:isDark?'#cbd5e1':'#334155' }}
                          onMouseEnter={e=>(e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'#f1f5f9')}
                          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                          {s}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Class select */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">Class *</label>
                <select value={form.classId} onChange={e=>setForm(f=>({...f,classId:e.target.value}))} className={input}>
                  <option value="">Select class</option>
                  {classes.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400">Description</label>
                <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Numbers, Algebra, Geometry" className={input} />
              </div>

              {/* Icon picker */}
              <div style={{ position:'relative' }}>
                <label className="block text-xs font-bold mb-1 text-slate-400">Icon</label>
                <button type="button" onClick={()=>{setShowIconGrid(v=>!v);setShowSubDrop(false);}}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#fff', color:isDark?'#f1f5f9':'#1e293b', fontSize:13, cursor:'pointer' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:22 }}>{form.icon||'📚'}</span>
                    <span style={{ color:'#64748b', fontSize:12 }}>{form.icon?'Icon selected — click to change':'Click to select icon'}</span>
                  </span>
                  <ChevronDown size={14} style={{ transform:showIconGrid?'rotate(180deg)':'none', transition:'.15s' }} />
                </button>
                <AnimatePresence>
                  {showIconGrid && (
                    <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                      style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:100, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', padding:12 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:6 }}>
                        {ICONS.map(ic=>(
                          <button key={ic} type="button" onClick={()=>{setForm(f=>({...f,icon:ic}));setShowIconGrid(false);}}
                            style={{ padding:'8px 4px', borderRadius:8, border:form.icon===ic?'2px solid #6366f1':'1px solid transparent', background:form.icon===ic?'rgba(99,102,241,0.15)':'transparent', cursor:'pointer', fontSize:ic.length<=2?18:12, fontWeight:700, color:isDark?'#94a3b8':'#475569', display:'flex', alignItems:'center', justifyContent:'center' }}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.1)')}
                            onMouseLeave={e=>(e.currentTarget.style.background=form.icon===ic?'rgba(99,102,241,0.15)':'transparent')}>
                            {ic}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                      className={`w-8 h-8 rounded-full border-2 ${form.color===c?'border-white scale-110':'border-transparent'} transition-all`}
                      style={{ background:c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={()=>{setShowModal(false);setShowSubDrop(false);setShowIconGrid(false);}} className={`flex-1 py-3 rounded-xl font-semibold ${isDark?'bg-slate-700 text-white':'bg-slate-100 text-slate-900'}`}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70">
                  {saving?<Loader2 size={16} className="animate-spin"/>:<Plus size={16}/>} Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
