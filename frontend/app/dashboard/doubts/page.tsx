'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, X, Send, ThumbsUp, CheckCircle, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function DoubtsPage() {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const isDark    = theme === 'dark';

  const [doubts,    setDoubts]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending,   setSending]   = useState<string | null>(null);
  const [filter,    setFilter]    = useState<'all' | 'mine'>('all');

  const [form, setForm] = useState({ title:'', description:'', subject:'' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoubts = async () => {
    try {
      const r = await api.get(`/doubts${filter==='mine'?'?mine=true':''}`);
      setDoubts(r.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDoubts(); }, [filter]);

  const handleAsk = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description required'); return;
    }
    setSubmitting(true);
    try {
      const r = await api.post('/doubts', form);
      setDoubts(prev => [r.data.data, ...prev]);
      setForm({ title:'', description:'', subject:'' });
      setShowForm(false);
      toast.success('Doubt posted!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleReply = async (doubtId: string) => {
    const text = replyText[doubtId]?.trim();
    if (!text) return;
    setSending(doubtId);
    try {
      const r = await api.post(`/doubts/${doubtId}/reply`, { text });
      setDoubts(prev => prev.map(d => d._id === doubtId ? r.data.data : d));
      setReplyText(prev => ({ ...prev, [doubtId]: '' }));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally { setSending(null); }
  };

  const handleUpvote = async (doubtId: string) => {
    try {
      const r = await api.put(`/doubts/${doubtId}/upvote`);
      setDoubts(prev => prev.map(d => d._id === doubtId ? { ...d, upvotes: Array(r.data.upvotes).fill('') } : d));
    } catch {}
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-violet-500 ${isDark?'bg-slate-800 border-slate-700 text-white placeholder-slate-500':'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`;

  const statusColor = (s: string) =>
    s==='answered' ? 'bg-green-500/15 text-green-400' :
    s==='closed'   ? 'bg-slate-700 text-slate-400' :
                     'bg-amber-500/15 text-amber-400';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">Doubts</h1>
          <p className={isDark?'text-slate-400':'text-slate-500'}>Ask questions, get answers from admin & peers</p>
        </div>
        <button onClick={() => setShowForm(v=>!v)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          <Plus size={16}/> Ask Doubt
        </button>
      </div>

      {/* Ask form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className={`p-5 rounded-2xl border mb-6 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Ask a Doubt</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="Title (e.g. What is photosynthesis?)" className={input} />
              <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                placeholder="Subject (optional, e.g. Science, Chapter 3)" className={input} />
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                placeholder="Describe your doubt in detail..." rows={4}
                className={`${input} resize-none`} />
              <button onClick={handleAsk} disabled={submitting}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:10, border:'none', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', opacity:submitting?0.7:1 }}>
                {submitting ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={15}/>}
                Post Doubt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all','mine'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'6px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              background: filter===f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter===f ? '#a78bfa' : '#64748b' }}>
            {f==='all' ? 'All Doubts' : 'My Doubts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-20 skeleton rounded-2xl"/>)}</div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle size={48} className="text-slate-600 mx-auto mb-3"/>
          <p className="font-bold text-slate-400 mb-1">No doubts yet</p>
          <p className="text-slate-500 text-sm">Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <motion.div key={doubt._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className={`rounded-2xl border ${card} overflow-hidden`}>

              {/* Doubt header */}
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(v => v===doubt._id ? null : doubt._id)}>
                <div className="flex items-start gap-3">
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:14, flexShrink:0 }}>
                    {doubt.userId?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm">{doubt.userId?.fullName}</span>
                      {doubt.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">{doubt.subject}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(doubt.status)}`}>
                        {doubt.status==='answered'?'✅ Answered':doubt.status==='closed'?'🔒 Closed':'⏳ Open'}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{doubt.title}</p>
                    <p className={`text-xs mt-0.5 line-clamp-2 ${isDark?'text-slate-400':'text-slate-500'}`}>{doubt.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button onClick={e=>{e.stopPropagation();handleUpvote(doubt._id);}}
                        style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#64748b', background:'none', border:'none', cursor:'pointer' }}>
                        <ThumbsUp size={13}/> {doubt.upvotes?.length || 0}
                      </button>
                      <span style={{ fontSize:12, color:'#64748b', display:'flex', alignItems:'center', gap:4 }}>
                        <MessageCircle size={13}/> {doubt.replies?.length || 0} replies
                      </span>
                      <span style={{ fontSize:11, color:'#475569' }}>
                        {new Date(doubt.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </span>
                    </div>
                  </div>
                  {expanded===doubt._id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0"/> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0"/>}
                </div>
              </div>

              {/* Expanded replies */}
              <AnimatePresence>
                {expanded===doubt._id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                    style={{ overflow:'hidden', borderTop:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#f1f5f9'}` }}>
                    <div className="p-4 space-y-3">
                      {/* Full description */}
                      <div className={`p-3 rounded-xl text-sm ${isDark?'bg-slate-700/40':'bg-slate-50'}`}>
                        {doubt.description}
                      </div>

                      {/* Replies */}
                      {doubt.replies?.length > 0 && (
                        <div className="space-y-2">
                          {doubt.replies.map((r: any, i: number) => (
                            <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:12,
                              background: r.isAdmin ? (isDark?'rgba(34,197,94,0.08)':'rgba(34,197,94,0.05)') : (isDark?'rgba(255,255,255,0.04)':'#f8faff'),
                              border: r.isAdmin ? '1px solid rgba(34,197,94,0.2)' : `1px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}` }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background: r.isAdmin?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:11, flexShrink:0 }}>
                                {r.repliedByName?.[0]?.toUpperCase()}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                                  <span style={{ fontSize:12, fontWeight:700, color: isDark?'#f1f5f9':'#1e293b' }}>{r.repliedByName}</span>
                                  {r.isAdmin && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'rgba(34,197,94,0.15)', color:'#4ade80', fontWeight:700 }}>ADMIN</span>}
                                </div>
                                <p style={{ fontSize:13, color: isDark?'#cbd5e1':'#334155' }}>{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      <div style={{ display:'flex', gap:8 }}>
                        <input value={replyText[doubt._id]||''} onChange={e=>setReplyText(p=>({...p,[doubt._id]:e.target.value}))}
                          placeholder="Write a reply..." onKeyDown={e=>e.key==='Enter'&&handleReply(doubt._id)}
                          style={{ flex:1, padding:'9px 14px', borderRadius:10, border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`, background:isDark?'rgba(255,255,255,0.05)':'#f8faff', color:isDark?'#f1f5f9':'#1e293b', fontSize:13, outline:'none' }} />
                        <button onClick={() => handleReply(doubt._id)} disabled={sending===doubt._id}
                          style={{ padding:'9px 14px', borderRadius:10, border:'none', background:'#7c3aed', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontWeight:600, fontSize:13 }}>
                          {sending===doubt._id ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={14}/>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
