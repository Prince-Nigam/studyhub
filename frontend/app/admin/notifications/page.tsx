'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Loader2, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ title: '', message: '', type: 'info', isGlobal: true });
  const [saving, setSaving] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      await api.post('/notifications', form);
      toast.success('Notification sent to all students!');
      setForm({ title: '', message: '', type: 'info', isGlobal: true });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const input = `w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Send Notifications</h1>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" className={input} />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Message *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Notification message..." className={`${input} resize-none`} />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={input}>
              {['info', 'success', 'warning', 'test', 'video', 'note', 'alert'].map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isGlobal} onChange={e => setForm(f => ({ ...f, isGlobal: e.target.checked }))} className="accent-indigo-500 w-4 h-4" />
            <span>Send to all students (global)</span>
          </label>
          <button onClick={handleSend} disabled={saving} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-70 transition-all">
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}
