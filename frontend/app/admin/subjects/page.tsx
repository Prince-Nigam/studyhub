'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Loader2, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

const colors = ['#6366f1','#3b82f6','#ec4899','#f59e0b','#10b981','#8b5cf6','#06b6d4','#ef4444'];

export default function AdminSubjectsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', classId: '', description: '', color: '#6366f1', icon: '' });

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
      setForm({ name: '', classId: '', description: '', color: '#6366f1', icon: '' });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete subject?')) return;
    try { await api.delete(`/subjects/${id}`); setSubjects(prev => prev.filter(s => s._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
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
          <motion.div key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className={`p-4 rounded-2xl border ${card} group relative`}>
            <div className="w-3 h-3 rounded-full mb-2" style={{ background: sub.color || '#6366f1' }} />
            <h3 className="font-bold text-sm mb-1">{sub.name}</h3>
            <p className="text-xs text-slate-500">{sub.classId?.name}</p>
            <button onClick={() => handleDelete(sub._id)}
              className="absolute top-3 right-3 p-1 text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">Add Subject</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Subject name *" className={input} />
              <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className={input}>
                <option value="">Select class *</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className={input} />
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Emoji icon (e.g. ➕ 🔬)" className={input} />
              <div>
                <p className="text-xs font-bold mb-2 text-slate-400">Color</p>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 ${form.color === c ? 'border-white scale-110' : 'border-transparent'} transition-all`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'}`}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
