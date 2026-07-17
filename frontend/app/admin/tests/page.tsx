'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Plus, Trash2, Edit3, Eye, Loader2, X, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

const defaultQuestion = { questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '', marks: 1 };

export default function AdminTestsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tests, setTests] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', description: '', classId: '', subjectId: '', chapterId: '', timeLimit: 30, isPublished: false });
  const [questions, setQuestions] = useState([{ ...defaultQuestion, options: defaultQuestion.options.map(o => ({ ...o })) }]);

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([api.get('/tests'), api.get('/classes')]);
      setTests(tRes.data.data);
      setClasses(cRes.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClassChange = async (classId: string) => {
    setForm(f => ({ ...f, classId, subjectId: '', chapterId: '' }));
    if (classId) { const res = await api.get(`/subjects?classId=${classId}`); setSubjects(res.data.data); }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setForm(f => ({ ...f, subjectId, chapterId: '' }));
    if (subjectId) { const res = await api.get(`/chapters?subjectId=${subjectId}`); setChapters(res.data.data); }
  };

  const addQuestion = () => setQuestions(prev => [...prev, { ...defaultQuestion, options: defaultQuestion.options.map(o => ({ ...o })) }]);
  const removeQuestion = (idx: number) => setQuestions(prev => prev.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: string, val: any) => setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  const updateOption = (qIdx: number, oIdx: number, field: string, val: any) => setQuestions(prev => prev.map((q, i) => i === qIdx ? {
    ...q,
    options: q.options.map((o: any, j: number) => j === oIdx
      ? { ...o, [field]: val }
      : field === 'isCorrect' && val === true ? { ...o, isCorrect: false }
      : o)
  } : q));

  const handleSave = async () => {
    if (!form.title || !form.classId || !form.subjectId) { toast.error('Fill required fields'); return; }
    if (questions.some(q => !q.questionText || q.options.every(o => !o.isCorrect))) {
      toast.error('Each question must have at least one correct answer'); return;
    }
    setSaving(true);
    try {
      await api.post('/tests', { ...form, questions });
      toast.success('Test created!');
      setShowModal(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create test');
    } finally { setSaving(false); }
  };

  const handlePublish = async (testId: string, current: boolean) => {
    try {
      await api.put(`/tests/${testId}`, { isPublished: !current });
      setTests(prev => prev.map(t => t._id === testId ? { ...t, isPublished: !current } : t));
      toast.success(current ? 'Test unpublished' : 'Test published!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?')) return;
    try { await api.delete(`/tests/${id}`); setTests(prev => prev.filter(t => t._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Manage Tests</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{tests.length} tests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          <Plus size={18} /> Create Test
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="h-44 skeleton rounded-2xl" />)
        : tests.map((test, i) => (
          <motion.div key={test._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`p-5 rounded-2xl border ${card}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${test.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                {test.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            <h3 className="font-bold mb-1">{test.title}</h3>
            <p className="text-xs text-slate-500 mb-3">{test.subjectId?.name} • {test.totalQuestions} Q • {test.timeLimit}min</p>
            <div className="flex gap-2">
              <button onClick={() => handlePublish(test._id, test.isPublished)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${test.isPublished ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'} transition-all`}>
                {test.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => handleDelete(test._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} shadow-2xl p-6 mb-10`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Create MCQ Test</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Test title *" className={input} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className={input}>
                  <option value="">Class *</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={form.subjectId} onChange={e => handleSubjectChange(e.target.value)} className={input}>
                  <option value="">Subject *</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.chapterId} onChange={e => setForm(f => ({ ...f, chapterId: e.target.value }))} className={input}>
                  <option value="">Chapter</option>
                  {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <input type="number" value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) }))} placeholder="Time limit (minutes)" className={input} min={5} />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="accent-indigo-500" />
                Publish immediately
              </label>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{questions.length} Question{questions.length !== 1 ? 's' : ''}</h3>
                <button onClick={addQuestion} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                  <Plus size={14} /> Add Question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div key={qIdx} className={`p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 mt-2">Q{qIdx + 1}</span>
                    <input
                      value={q.questionText}
                      onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                      placeholder="Question text..."
                      className={`${input} flex-1`}
                    />
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qIdx)} className="text-red-400 hover:bg-red-500/10 p-1 rounded mt-1"><X size={14} /></button>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    {q.options.map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={opt.isCorrect}
                          onChange={() => updateOption(qIdx, oIdx, 'isCorrect', true)}
                          className="accent-green-500 flex-shrink-0"
                          title="Mark as correct"
                        />
                        <span className="text-xs text-slate-500 font-bold">{String.fromCharCode(65 + oIdx)}</span>
                        <input
                          value={opt.text}
                          onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className={`${input} flex-1`}
                        />
                        {opt.isCorrect && <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">💡 Select the radio button to mark correct answer</p>
                  <input
                    value={q.explanation}
                    onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                    placeholder="Explanation (optional)..."
                    className={`${input} text-xs`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'}`}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : '✅'} Create Test
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
