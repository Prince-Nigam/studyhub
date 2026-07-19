'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Edit3, Upload, Loader2, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface NoteForm {
  title: string;
  content: string;
  type: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  tags: string;
  isDownloadable: boolean;
}

const defaultForm: NoteForm = {
  title: '', content: '', type: 'rich-text',
  classId: '', subjectId: '', chapterId: '',
  tags: '', isDownloadable: true
};

export default function AdminNotesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [notes, setNotes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NoteForm>(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes?limit=50');
      setNotes(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data);
    } catch { }
  };

  useEffect(() => { fetchNotes(); fetchClasses(); }, []);

  const handleClassChange = async (classId: string) => {
    setForm(f => ({ ...f, classId, subjectId: '', chapterId: '' }));
    if (classId) {
      try {
        const res = await api.get(`/subjects?classId=${classId}`);
        setSubjects(res.data.data);
      } catch { }
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setForm(f => ({ ...f, subjectId, chapterId: '' }));
    if (subjectId) {
      try {
        const res = await api.get(`/chapters?subjectId=${subjectId}`);
        setChapters(res.data.data);
      } catch { }
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.classId || !form.subjectId) {
      toast.error('Please fill required fields');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      if (file) formData.append('file', file);

      await api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note created successfully!');
      setShowModal(false);
      setForm(defaultForm);
      setFile(null);
      fetchNotes();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create note');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 transition-all text-sm`;

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:12 }}>
        ← Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Manage Notes</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{notes.length} notes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} /> Upload Note
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)
        ) : notes.map((note, i) => (
          <motion.div
            key={note._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-4 rounded-2xl border ${card}`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{note.type === 'pdf' ? '📄' : note.type === 'docx' ? '📝' : '✍️'}</span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(note._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-sm mb-1 line-clamp-2">{note.title}</h3>
            <p className="text-xs text-slate-500 mb-2">{note.subjectId?.name} • {note.classId?.name}</p>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400`}>{note.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${note.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {note.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-xl ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Upload Note / Study Material</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title..." className={input} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Class *</label>
                  <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className={input}>
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject *</label>
                  <select value={form.subjectId} onChange={e => handleSubjectChange(e.target.value)} className={input}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Chapter</label>
                  <select value={form.chapterId} onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))} className={input}>
                    <option value="">Select chapter</option>
                    {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>
                    <option value="rich-text">Rich Text</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="ppt">PPT</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Content (Rich Text)</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={4}
                  placeholder="Write note content here..."
                  className={`${input} resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Upload File (PDF/DOCX/PPT/Image)</label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${isDark ? 'border-slate-600 hover:border-indigo-500' : 'border-slate-300 hover:border-indigo-400'} transition-colors`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload size={24} className="mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-500">
                    {file ? file.name : 'Click to upload or drag & drop'}
                  </p>
                  <input id="file-upload" type="file" className="hidden"
                    accept=".pdf,.docx,.doc,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="algebra, equations, chapter1" className={input} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDownloadable} onChange={e => setForm(f => ({ ...f, isDownloadable: e.target.checked }))} className="accent-indigo-500" />
                <span className="text-sm font-medium">Allow download</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition-all`}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all disabled:opacity-70">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Note
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
