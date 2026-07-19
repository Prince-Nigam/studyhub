'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Loader2, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminChaptersPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [chapters, setChapters]   = useState<any[]>([]);
  const [classes, setClasses]     = useState<any[]>([]);
  const [subjects, setSubjects]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [form, setForm] = useState({
    name: '', classId: '', subjectId: '', chapterNumber: 1, description: ''
  });

  const fetchData = async () => {
    try {
      const [cRes, clRes] = await Promise.all([
        api.get(`/chapters?${filterSubject ? `subjectId=${filterSubject}` : filterClass ? `classId=${filterClass}` : ''}`),
        api.get('/classes'),
      ]);
      setChapters(cRes.data.data);
      setClasses(clRes.data.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterClass, filterSubject]);

  const handleClassChange = async (classId: string) => {
    setForm(f => ({ ...f, classId, subjectId: '' }));
    setFilterClass(classId);
    setFilterSubject('');
    if (classId) {
      const res = await api.get(`/subjects?classId=${classId}`);
      setSubjects(res.data.data);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.classId || !form.subjectId) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/chapters', form);
      toast.success('Chapter created!');
      setShowModal(false);
      setForm({ name: '', classId: '', subjectId: '', chapterNumber: 1, description: '' });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/chapters/${id}`);
      setChapters(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
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
        <div>
          <h1 className="text-2xl font-black">Manage Chapters</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{chapters.length} chapters</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          <Plus size={18} /> Add Chapter
        </button>
      </div>

      {/* Filters */}
      <div className={`flex gap-3 p-4 rounded-2xl border ${card} mb-6`}>
        <select value={filterClass} onChange={e => handleClassChange(e.target.value)} className={`${input} flex-1`}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className={`${input} flex-1`}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Chapters table */}
      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No chapters found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                {['#', 'Chapter Name', 'Subject', 'Class', 'Actions'].map(h => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {chapters.map((ch, i) => (
                <motion.tr key={ch._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className={`${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}
                >
                  <td className="px-4 py-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {ch.chapterNumber || i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm">{ch.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{ch.subjectId?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{ch.classId?.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(ch._id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black">Add Chapter</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className={input}>
                <option value="">Select Class *</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} className={input}>
                <option value="">Select Subject *</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Chapter name *" className={input} />
              <input type="number" value={form.chapterNumber} onChange={e => setForm(f => ({ ...f, chapterNumber: parseInt(e.target.value) }))} placeholder="Chapter number" min={1} className={input} />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={input} />
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
