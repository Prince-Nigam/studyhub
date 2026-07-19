'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Plus, Trash2, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

const defaultForm = {
  title: '', description: '', type: 'youtube',
  youtubeUrl: '', duration: '',
  classId: '', subjectId: '', chapterId: '',
  order: 0
};

export default function AdminVideosPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [videos, setVideos] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [vRes, cRes] = await Promise.all([api.get('/videos?limit=50'), api.get('/classes')]);
      setVideos(vRes.data.data);
      setClasses(cRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClassChange = async (classId: string) => {
    setForm(f => ({ ...f, classId, subjectId: '', chapterId: '' }));
    if (classId) {
      const res = await api.get(`/subjects?classId=${classId}`);
      setSubjects(res.data.data);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setForm(f => ({ ...f, subjectId, chapterId: '' }));
    if (subjectId) {
      const res = await api.get(`/chapters?subjectId=${subjectId}`);
      setChapters(res.data.data);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.classId || !form.subjectId) {
      toast.error('Fill required fields');
      return;
    }
    if (form.type === 'youtube' && !form.youtubeUrl) {
      toast.error('Please provide YouTube URL');
      return;
    }
    setSaving(true);
    try {
      await api.post('/videos', form);
      toast.success('Video added!');
      setShowModal(false);
      setForm(defaultForm);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add video');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/videos/${id}`);
      setVideos(prev => prev.filter(v => v._id !== id));
      toast.success('Video deleted');
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
          <h1 className="text-2xl font-black">Manage Videos</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{videos.length} videos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          <Plus size={18} /> Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => <div key={i} className="h-52 skeleton rounded-2xl" />)
        ) : videos.map((video, i) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-2xl border ${card} overflow-hidden`}
          >
            <div className="relative aspect-video bg-slate-700">
              {video.thumbnailUrl ? (
                <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Video size={30} className="text-slate-500" /></div>
              )}
              <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${video.type === 'youtube' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                {video.type}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{video.subjectId?.name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{video.viewCount} views</span>
                <button onClick={() => handleDelete(video._id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-lg ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Add Video</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title..." className={input} />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>
                  <option value="youtube">YouTube</option>
                  <option value="recorded">Recorded</option>
                  <option value="playlist">Playlist</option>
                </select>
              </div>

              {form.type === 'youtube' && (
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>YouTube URL *</label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className={`${input} pl-8`} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Class *</label>
                  <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className={input}>
                    <option value="">Select</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject *</label>
                  <select value={form.subjectId} onChange={e => handleSubjectChange(e.target.value)} className={input}>
                    <option value="">Select</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Chapter</label>
                  <select value={form.chapterId} onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))} className={input}>
                    <option value="">Select</option>
                    {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Duration</label>
                  <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="45:30" className={input} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${input} resize-none`} placeholder="Optional description..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 disabled:opacity-70">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add Video
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
