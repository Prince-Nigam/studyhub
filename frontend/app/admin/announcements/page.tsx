'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, Edit3, Loader2, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  general: 'bg-blue-500/20 text-blue-400',
  test: 'bg-amber-500/20 text-amber-400',
  holiday: 'bg-green-500/20 text-green-400',
  assignment: 'bg-purple-500/20 text-purple-400',
  result: 'bg-cyan-500/20 text-cyan-400',
  urgent: 'bg-red-500/20 text-red-400',
};

export default function AdminAnnouncementsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', isGlobal: true });

  const fetchData = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement published!');
      setShowModal(false);
      setForm({ title: '', content: '', type: 'general', isGlobal: true });
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Announcements</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          <Plus size={18} /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)
        : announcements.map((ann, i) => (
          <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl border ${card}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${typeColors[ann.type] || 'bg-slate-600 text-slate-400'}`}>{ann.type}</span>
                  <span className="text-xs text-slate-500">{new Date(ann.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <h3 className="font-bold mb-1">{ann.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>{ann.content}</p>
              </div>
              <button onClick={() => handleDelete(ann._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title *" className={input} />
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} placeholder="Content *" className={`${input} resize-none`} />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>
                {['general', 'test', 'holiday', 'assignment', 'result', 'urgent'].map(t => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'}`}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : '📢'} Publish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
