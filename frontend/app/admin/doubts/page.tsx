'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, CheckCircle, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminDoubtsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [doubts,    setDoubts]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string|null>(null);
  const [replyText, setReplyText] = useState<Record<string,string>>({});
  const [sending,   setSending]   = useState<string|null>(null);
  const [filter,    setFilter]    = useState<string>('all');

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const params = filter!=='all' ? `?status=${filter}` : '';
      const r = await api.get(`/doubts${params}`);
      setDoubts(r.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDoubts(); }, [filter]);

  const handleReply = async (doubtId: string) => {
    const text = replyText[doubtId]?.trim();
    if (!text) return;
    setSending(doubtId);
    try {
      const r = await api.post(`/doubts/${doubtId}/reply`, { text });
      setDoubts(prev => prev.map(d => d._id===doubtId ? r.data.data : d));
      setReplyText(prev => ({...prev,[doubtId]:''}));
      toast.success('Reply sent!');
    } catch { toast.error('Failed'); } finally { setSending(null); }
  };

  const handleStatus = async (doubtId: string, status: string) => {
    try {
      await api.put(`/doubts/${doubtId}/status`, { status });
      setDoubts(prev => prev.map(d => d._id===doubtId ? {...d,status} : d));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (doubtId: string) => {
    if (!confirm('Delete this doubt?')) return;
    try {
      await api.delete(`/doubts/${doubtId}`);
      setDoubts(prev => prev.filter(d => d._id!==doubtId));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const statusColor = (s:string) => s==='answered'?'bg-green-500/15 text-green-400':s==='closed'?'bg-slate-700 text-slate-400':'bg-amber-500/15 text-amber-400';

  const openCount     = doubts.filter(d=>d.status==='open').length;
  const answeredCount = doubts.filter(d=>d.status==='answered').length;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:16 }}>
        ← Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Student Doubts</h1>
          <p className={`text-sm mt-1 ${isDark?'text-slate-400':'text-slate-500'}`}>
            <span className="text-amber-400 font-bold">{openCount} open</span> · {answeredCount} answered
          </p>
        </div>
        <button onClick={fetchDoubts} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:'rgba(99,102,241,0.15)', color:'#818cf8', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {[['all','All'],['open','Open'],['answered','Answered'],['closed','Closed']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:'6px 14px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
              background:filter===v?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
              color:filter===v?'#818cf8':'#64748b' }}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-20 skeleton rounded-2xl"/>)}</div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <MessageCircle size={40} className="mx-auto mb-3 text-slate-600"/>
          No doubts found
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <div key={doubt._id} className={`rounded-2xl border ${card} overflow-hidden`}>

              {/* Header */}
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(v=>v===doubt._id?null:doubt._id)}>
                <div className="flex items-start gap-3">
                  <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:14,flexShrink:0 }}>
                    {doubt.userId?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm">{doubt.userId?.fullName}</span>
                      <span className="text-xs text-slate-500">{doubt.userId?.selectedClass}</span>
                      {doubt.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">{doubt.subject}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(doubt.status)}`}>
                        {doubt.status==='answered'?'✅ Answered':doubt.status==='closed'?'🔒 Closed':'⏳ Open'}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{doubt.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500">{doubt.replies?.length||0} replies</span>
                      <span className="text-xs text-slate-500">{new Date(doubt.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={e=>{e.stopPropagation();handleDelete(doubt._id);}} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><Trash2 size={13}/></button>
                    {expanded===doubt._id?<ChevronUp size={16} className="text-slate-400"/>:<ChevronDown size={16} className="text-slate-400"/>}
                  </div>
                </div>
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {expanded===doubt._id && (
                  <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
                    style={{ overflow:'hidden', borderTop:`1px solid ${isDark?'rgba(255,255,255,0.06)':'#f1f5f9'}` }}>
                    <div className="p-4 space-y-4">

                      {/* Full description */}
                      <div className={`p-3 rounded-xl text-sm ${isDark?'bg-slate-700/40':'bg-slate-50'}`}>
                        <p className="font-semibold text-xs text-slate-500 mb-1">Question:</p>
                        {doubt.description}
                      </div>

                      {/* Status buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {doubt.status!=='answered' && (
                          <button onClick={() => handleStatus(doubt._id,'answered')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/15 text-green-400 hover:bg-green-500 hover:text-white transition-all">
                            <CheckCircle size={12}/> Mark Answered
                          </button>
                        )}
                        {doubt.status!=='closed' && (
                          <button onClick={() => handleStatus(doubt._id,'closed')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-slate-400 hover:bg-slate-600 transition-all">
                            <X size={12}/> Close
                          </button>
                        )}
                        {doubt.status!=='open' && (
                          <button onClick={() => handleStatus(doubt._id,'open')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-white transition-all">
                            Reopen
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      {doubt.replies?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-500">Replies:</p>
                          {doubt.replies.map((r:any,i:number) => (
                            <div key={i} style={{ display:'flex',gap:10,padding:'10px 12px',borderRadius:12,
                              background:r.isAdmin?(isDark?'rgba(34,197,94,0.08)':'rgba(34,197,94,0.05)'):(isDark?'rgba(255,255,255,0.04)':'#f8faff'),
                              border:r.isAdmin?'1px solid rgba(34,197,94,0.2)':`1px solid ${isDark?'rgba(255,255,255,0.06)':'#e2e8f0'}` }}>
                              <div style={{ width:28,height:28,borderRadius:'50%',background:r.isAdmin?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:11,flexShrink:0 }}>
                                {r.repliedByName?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ display:'flex',gap:6,marginBottom:2 }}>
                                  <span style={{ fontSize:12,fontWeight:700 }}>{r.repliedByName}</span>
                                  {r.isAdmin&&<span style={{ fontSize:10,padding:'1px 6px',borderRadius:99,background:'rgba(34,197,94,0.15)',color:'#4ade80',fontWeight:700 }}>ADMIN</span>}
                                </div>
                                <p style={{ fontSize:13,color:isDark?'#cbd5e1':'#334155' }}>{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin reply */}
                      <div style={{ display:'flex',gap:8 }}>
                        <input value={replyText[doubt._id]||''} onChange={e=>setReplyText(p=>({...p,[doubt._id]:e.target.value}))}
                          placeholder="Write admin reply..." onKeyDown={e=>e.key==='Enter'&&handleReply(doubt._id)}
                          style={{ flex:1,padding:'9px 14px',borderRadius:10,border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'#e2e8f0'}`,background:isDark?'rgba(255,255,255,0.05)':'#f8faff',color:isDark?'#f1f5f9':'#1e293b',fontSize:13,outline:'none' }} />
                        <button onClick={() => handleReply(doubt._id)} disabled={sending===doubt._id}
                          style={{ padding:'9px 16px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontWeight:700,fontSize:13 }}>
                          {sending===doubt._id?<Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>:<Send size={14}/>}
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
