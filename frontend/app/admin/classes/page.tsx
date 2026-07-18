'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, X, RefreshCw, BookOpen, ChevronDown } from 'lucide-react';
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

export default function AdminClassesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [classes,      setClasses]      = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [seeding,      setSeeding]      = useState(false);
  const [form,         setForm]         = useState({ name:'', description:'', grade:1 });
  const [subForm,      setSubForm]      = useState({ name:'', classId:'', description:'', color:'#6366f1', icon:'' });
  const [subjects,     setSubjects]     = useState<any[]>([]);
  const [selClass,     setSelClass]     = useState<any>(null);
  const [saving,       setSaving]       = useState(false);
  const [showSubDrop,  setShowSubDrop]  = useState(false);
  const [showIconGrid, setShowIconGrid] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const openSubjects = async (cls: any) => {
    setSelClass(cls);
    setSubForm(f => ({ ...f, classId: cls._id }));
    try {
      const res = await api.get(`/subjects?classId=${cls._id}`);
      setSubjects(res.data.data || []);
    } catch {}
    setShowSubModal(true);
  };

  const seedClasses = async () => {
    setSeeding(true);
    try {
      await api.post('/classes/seed');
      toast.success('Classes 1-12 created!');
      fetchClasses();
    } catch (e: any) {
      toast(e.response?.data?.message || 'Classes already seeded');
    } finally { setSeeding(false); }
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    if (selClass) return; // already created
    setSaving(true);
    try {
      const res = await api.post('/classes', form);
      toast.success('Class created! Now add subjects below.');
      setSelClass(res.data.data);
      setSubForm(f => ({ ...f, classId: res.data.data._id }));
      fetchClasses();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleAddSubject = async () => {
    if (!subForm.name || !subForm.classId) { toast.error('Subject name required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/subjects', subForm);
      setSubjects(prev => [...prev, res.data.data]);
      setSubForm(f => ({ ...f, name: '', description: '', icon: '' }));
      toast.success('Subject added!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s._id !== id));
      toast.success('Subject deleted');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      setClasses(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const card  = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Manage Classes</h1>
        <div className="flex gap-3">
          <button onClick={seedClasses} disabled={seeding} className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-xl font-semibold transition-colors`}>
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Seed 1-12
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
            <Plus size={18} /> Add Class
          </button>
        </div>
      </div>

      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        💡 Click any class card to add/manage subjects for that class
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? [...Array(12)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)
        : classes.map((cls, i) => (
          <motion.div key={cls._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            onClick={() => openSubjects(cls)}
            className={`p-4 rounded-2xl border ${card} text-center group relative cursor-pointer transition-all hover:border-indigo-500/50 hover:scale-105`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-2 text-white font-black text-lg">
              {cls.grade}
            </div>
            <p className="font-bold text-sm">{cls.name}</p>
            <p className="text-xs text-indigo-400 mt-1 opacity-0 group-hover:opacity-100 transition-all">+ Subjects</p>
            <button onClick={e => { e.stopPropagation(); handleDelete(cls._id); }}
              className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Class Modal - with inline subject management */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6 mb-10`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">Add New Class</h2>
              <button onClick={() => { setShowModal(false); setForm({ name:'', description:'', grade:1 }); setSubjects([]); setSelClass(null); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-6">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Class name (e.g. Class 10)" className={input} />
              <input type="number" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: parseInt(e.target.value) }))} placeholder="Grade number (1-12)" min={1} max={12} className={input} />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={input} />
              <button onClick={handleSave} disabled={saving || !!selClass}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {selClass ? `✅ Class "${selClass.name}" Created` : 'Create Class'}
              </button>
            </div>

            {/* Subject section — shows after class is created */}
            {selClass && (
              <div style={{ borderTop:`1px solid ${isDark?'rgba(255,255,255,0.08)':'#e2e8f0'}`, paddingTop:20 }}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <BookOpen size={15} className="text-indigo-400" />
                  Subjects for {selClass.name}
                  <span className="text-xs text-slate-500 font-normal">({subjects.length} added)</span>
                </h3>

                {/* Existing subjects */}
                {subjects.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {subjects.map(sub => (
                      <div key={sub._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:10, background: isDark?'rgba(255,255,255,0.04)':'#f8faff', border:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}` }}>
                        <span style={{ fontSize:16 }}>{sub.icon || '📚'}</span>
                        <div style={{ width:8, height:8, borderRadius:'50%', background: sub.color||'#6366f1', flexShrink:0 }} />
                        <span style={{ flex:1, fontSize:13, fontWeight:600, color: isDark?'#f1f5f9':'#1e293b' }}>{sub.name}</span>
                        <button onClick={() => handleDeleteSubject(sub._id)}
                          style={{ padding:'4px', borderRadius:6, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#f87171' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add subject form */}
                <div style={{ padding:'12px', borderRadius:12, background: isDark?'rgba(99,102,241,0.08)':'#f0f0ff', border:`1px solid ${isDark?'rgba(99,102,241,0.2)':'#c7d2fe'}` }}>
                  <p className="text-xs font-bold mb-2 text-indigo-400">+ Add Subject</p>
                  <div className="space-y-2">

                    {/* Subject name dropdown */}
                    <div style={{ position:'relative' }}>
                      <button type="button" onClick={() => { setShowSubDrop(v=>!v); setShowIconGrid(false); }}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background: isDark?'rgba(255,255,255,0.06)':'#fff', color: subForm.name ? (isDark?'#f1f5f9':'#1e293b') : '#64748b', fontSize:13, cursor:'pointer', fontWeight: subForm.name?600:400 }}>
                        {subForm.name || 'Select Subject Name'}
                        <ChevronDown size={14} style={{ transform: showSubDrop?'rotate(180deg)':'none', transition:'.15s' }} />
                      </button>
                      <AnimatePresence>
                        {showSubDrop && (
                          <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                            style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:100, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background: isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', maxHeight:200, overflowY:'auto' }}>
                            {/* Custom input */}
                            <div style={{ padding:'8px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#f1f5f9'}` }}>
                              <input placeholder="Or type custom name..." value={subForm.name}
                                onChange={e => setSubForm(f=>({...f, name:e.target.value}))}
                                style={{ width:'100%', padding:'6px 10px', borderRadius:8, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background: isDark?'rgba(255,255,255,0.06)':'#f8faff', color: isDark?'#f1f5f9':'#1e293b', fontSize:12, outline:'none' }} />
                            </div>
                            {SUBJECT_PRESETS.filter(s => !subForm.name || s.toLowerCase().includes(subForm.name.toLowerCase())).map(s => (
                              <div key={s} onClick={() => { setSubForm(f=>({...f, name:s})); setShowSubDrop(false); }}
                                style={{ padding:'9px 14px', cursor:'pointer', fontSize:13, color: isDark?'#cbd5e1':'#334155', fontWeight:500 }}
                                onMouseEnter={e=>(e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'#f1f5f9')}
                                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                                {s}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Description */}
                    <input value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description (e.g. Numbers, Algebra)" className={input} />

                    {/* Icon picker */}
                    <div style={{ position:'relative' }}>
                      <button type="button" onClick={() => { setShowIconGrid(v=>!v); setShowSubDrop(false); }}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background: isDark?'rgba(255,255,255,0.06)':'#fff', color: isDark?'#f1f5f9':'#1e293b', fontSize:13, cursor:'pointer' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:20 }}>{subForm.icon || '📚'}</span>
                          <span style={{ color:'#64748b', fontSize:12 }}>{subForm.icon ? 'Icon selected' : 'Select Icon'}</span>
                        </span>
                        <ChevronDown size={14} style={{ transform: showIconGrid?'rotate(180deg)':'none', transition:'.15s' }} />
                      </button>
                      <AnimatePresence>
                        {showIconGrid && (
                          <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                            style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:100, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background: isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', padding:12 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:6 }}>
                              {ICONS.map(ic => (
                                <button key={ic} type="button" onClick={() => { setSubForm(f=>({...f, icon:ic})); setShowIconGrid(false); }}
                                  style={{ padding:'8px 4px', borderRadius:8, border: subForm.icon===ic?'2px solid #6366f1':'1px solid transparent', background: subForm.icon===ic?'rgba(99,102,241,0.15)':'transparent', cursor:'pointer', fontSize:ic.length<=2&&ic!==ic.toUpperCase()?18:12, fontWeight:700, color: isDark?'#94a3b8':'#475569', display:'flex', alignItems:'center', justifyContent:'center' }}
                                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.1)')}
                                  onMouseLeave={e=>(e.currentTarget.style.background=subForm.icon===ic?'rgba(99,102,241,0.15)':'transparent')}>
                                  {ic}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Color picker */}
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setSubForm(f => ({ ...f, color: c }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${subForm.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ background: c }} />
                      ))}
                    </div>

                    <button onClick={handleAddSubject} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70 transition-colors text-sm">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Subject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Subjects Modal */}
      {showSubModal && selClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6 max-h-[85vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-lg">{selClass.name} — Subjects</h2>
                <p className="text-sm text-slate-400">{subjects.length} subjects</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            {/* Existing subjects */}
            {subjects.length > 0 && (
              <div className="space-y-2 mb-5">
                {subjects.map(sub => (
                  <div key={sub._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background: isDark?'rgba(255,255,255,0.04)':'#f8faff', border:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}` }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background: sub.color||'#6366f1', flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:14, fontWeight:600, color: isDark?'#f1f5f9':'#1e293b' }}>{sub.name}</span>
                    <button onClick={() => handleDeleteSubject(sub._id)}
                      style={{ padding:'4px', borderRadius:6, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#f87171' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subject form - subjects modal */}
            <div style={{ padding:'14px', borderRadius:14, background: isDark?'rgba(99,102,241,0.08)':'#f0f0ff', border:`1px solid ${isDark?'rgba(99,102,241,0.2)':'#c7d2fe'}` }}>
              <p className="text-sm font-bold mb-3 text-indigo-400">Add New Subject</p>
              <div className="space-y-3">

                {/* Subject dropdown */}
                <div style={{ position:'relative' }}>
                  <button type="button" onClick={() => { setShowSubDrop(v=>!v); setShowIconGrid(false); }}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#fff', color:subForm.name?(isDark?'#f1f5f9':'#1e293b'):'#64748b', fontSize:13, cursor:'pointer', fontWeight:subForm.name?600:400 }}>
                    {subForm.name || 'Select Subject Name'}
                    <ChevronDown size={14} style={{ transform:showSubDrop?'rotate(180deg)':'none', transition:'.15s' }} />
                  </button>
                  <AnimatePresence>
                    {showSubDrop && (
                      <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                        style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:200, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', maxHeight:180, overflowY:'auto' }}>
                        <div style={{ padding:'8px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#f1f5f9'}` }}>
                          <input placeholder="Or type custom..." value={subForm.name} onChange={e=>setSubForm(f=>({...f,name:e.target.value}))}
                            style={{ width:'100%', padding:'6px 10px', borderRadius:8, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#f8faff', color:isDark?'#f1f5f9':'#1e293b', fontSize:12, outline:'none' }} />
                        </div>
                        {SUBJECT_PRESETS.filter(s=>!subForm.name||s.toLowerCase().includes(subForm.name.toLowerCase())).map(s=>(
                          <div key={s} onClick={()=>{setSubForm(f=>({...f,name:s}));setShowSubDrop(false);}}
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

                <input value={subForm.description} onChange={e=>setSubForm(f=>({...f,description:e.target.value}))}
                  placeholder="Description (e.g. Numbers, Algebra)" className={input} />

                {/* Icon picker */}
                <div style={{ position:'relative' }}>
                  <button type="button" onClick={()=>{setShowIconGrid(v=>!v);setShowSubDrop(false);}}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.12)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.06)':'#fff', color:isDark?'#f1f5f9':'#1e293b', fontSize:13, cursor:'pointer' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:20 }}>{subForm.icon||'📚'}</span>
                      <span style={{ color:'#64748b', fontSize:12 }}>{subForm.icon?'Icon selected':'Select Icon'}</span>
                    </span>
                    <ChevronDown size={14} style={{ transform:showIconGrid?'rotate(180deg)':'none', transition:'.15s' }} />
                  </button>
                  <AnimatePresence>
                    {showIconGrid && (
                      <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
                        style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:200, borderRadius:12, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'#1e293b':'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', padding:12 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:6 }}>
                          {ICONS.map(ic=>(
                            <button key={ic} type="button" onClick={()=>{setSubForm(f=>({...f,icon:ic}));setShowIconGrid(false);}}
                              style={{ padding:'8px 4px', borderRadius:8, border:subForm.icon===ic?'2px solid #6366f1':'1px solid transparent', background:subForm.icon===ic?'rgba(99,102,241,0.15)':'transparent', cursor:'pointer', fontSize:ic.length<=2?18:12, fontWeight:700, color:isDark?'#94a3b8':'#475569', display:'flex', alignItems:'center', justifyContent:'center' }}
                              onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.1)')}
                              onMouseLeave={e=>(e.currentTarget.style.background=subForm.icon===ic?'rgba(99,102,241,0.15)':'transparent')}>
                              {ic}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setSubForm(f=>({...f,color:c}))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${subForm.color===c?'border-white scale-110':'border-transparent'}`}
                      style={{ background:c }} />
                  ))}
                </div>
                <button onClick={handleAddSubject} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70 transition-colors">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add Subject
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
