'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Trash2, Loader2, X, RefreshCw } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminClassesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', grade: 1 });
  const [saving, setSaving] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

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
    setSaving(true);
    try {
      await api.post('/classes', form);
      toast.success('Class created!');
      setShowModal(false);
      fetchClasses();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      setClasses(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? [...Array(12)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)
        : classes.map((cls, i) => (
          <motion.div key={cls._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-2xl border ${card} text-center group relative`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-2 text-white font-black text-lg">
              {cls.grade}
            </div>
            <p className="font-bold text-sm">{cls.name}</p>
            <button onClick={() => handleDelete(cls._id)}
              className="absolute top-2 right-2 p-1 text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
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
              <h2 className="font-black">Add New Class</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Class name (e.g. Class 10)" className={input} />
              <input type="number" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: parseInt(e.target.value) }))} placeholder="Grade number (1-12)" min={1} max={12} className={input} />
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
