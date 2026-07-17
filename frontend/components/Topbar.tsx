'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Menu, X, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [q, setQ]               = useState('');
  const [results, setResults]   = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [unread, setUnread]     = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    api.get('/notifications').then(r => setUnread(r.data.unreadCount || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults(r.data.data);
        setOpen(true);
      } catch { } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const total = results ? Object.values(results).reduce((s: number, a: any) => s + a.length, 0) : 0;

  const topbarBg = isDark ? '#09091E' : '#ffffff';
  const border   = isDark ? 'rgba(255,255,255,.06)' : '#e2e8f0';
  const inputBg  = isDark ? 'rgba(255,255,255,.05)' : '#f8faff';
  const inputBdr = isDark ? 'rgba(255,255,255,.08)' : '#e2e8f0';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub  = isDark ? '#64748b'  : '#94a3b8';
  const btnBg    = isDark ? 'rgba(255,255,255,.05)' : '#f1f5f9';

  return (
    <header style={{ height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', gap:16, background:topbarBg, borderBottom:`1px solid ${border}`, position:'sticky', top:0, zIndex:10, flexShrink:0 }}>

      {/* Left: hamburger + search */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
        <button onClick={onMenuClick} className="lg:hidden" style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:8, color: textSub }}>
          <Menu size={20} />
        </button>

        {/* Search */}
        <div ref={ref} style={{ position:'relative', flex:1, maxWidth:400 }}>
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            {loading
              ? <Loader2 size={15} color={textSub} style={{ position:'absolute', left:12, animation:'spin 1s linear infinite' }} />
              : <Search size={15} color={textSub} style={{ position:'absolute', left:12 }} />
            }
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search notes, videos, tests…"
              style={{ width:'100%', paddingLeft:36, paddingRight: q?36:14, paddingTop:9, paddingBottom:9, borderRadius:10, border:`1px solid ${inputBdr}`, background:inputBg, color:textMain, fontSize:13, outline:'none', transition:'border-color .2s' }}
              onFocus={() => q.length >= 2 && setOpen(true)}
            />
            {q && (
              <button onClick={() => { setQ(''); setOpen(false); }} style={{ position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', color:textSub }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results dropdown */}
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }} transition={{ duration:.15 }}
                style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background: isDark?'#12143E':'#ffffff', border:`1px solid ${isDark?'rgba(255,255,255,.08)':'#e2e8f0'}`, borderRadius:14, overflow:'hidden', boxShadow:'0 16px 40px rgba(0,0,0,.4)', zIndex:50, maxHeight:320, overflowY:'auto' }}
                className="scrollbar-hide">
                {total > 0 ? (
                  <>
                    {results?.notes?.length > 0 && <DropSection label="Notes" emoji="📄" items={results.notes} href={id => `/dashboard/notes/${id}`} onClose={() => { setOpen(false); setQ(''); }} textSub={textSub} isDark={isDark} />}
                    {results?.videos?.length > 0 && <DropSection label="Videos" emoji="▶️" items={results.videos} href={id => `/dashboard/videos/${id}`} onClose={() => { setOpen(false); setQ(''); }} textSub={textSub} isDark={isDark} />}
                    {results?.tests?.length > 0 && <DropSection label="Tests" emoji="🧠" items={results.tests} href={id => `/dashboard/tests/${id}`} onClose={() => { setOpen(false); setQ(''); }} textSub={textSub} isDark={isDark} />}
                  </>
                ) : (
                  <div style={{ padding:'20px', textAlign:'center', fontSize:13, color:textSub }}>
                    No results for "{q}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: theme + bell + avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <button onClick={toggleTheme} style={{ width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:btnBg, border:'none', cursor:'pointer', fontSize:16 }}>
          {isDark ? '☀️' : '🌙'}
        </button>

        <Link href="/dashboard/notifications">
          <div style={{ position:'relative', width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:btnBg, cursor:'pointer' }}>
            <Bell size={17} color={textSub} />
            {unread > 0 && (
              <span style={{ position:'absolute', top:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'#7c3aed', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
        </Link>

        <Link href="/dashboard/profile">
          <div style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, overflow:'hidden', flexShrink:0 }}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : user?.fullName?.[0]?.toUpperCase()
              }
            </div>
            <div className="hidden md:block">
              <p style={{ fontSize:13, fontWeight:700, color:textMain, lineHeight:1, whiteSpace:'nowrap' }}>{user?.fullName?.split(' ')[0]}</p>
              <p style={{ fontSize:11, color:textSub, marginTop:2, whiteSpace:'nowrap' }}>{user?.selectedClass || user?.role}</p>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

function DropSection({ label, emoji, items, href, onClose, textSub, isDark }: any) {
  return (
    <div>
      <p style={{ fontSize:10, fontWeight:700, padding:'8px 14px 4px', background: isDark?'rgba(255,255,255,.03)':'#f8faff', color:textSub, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</p>
      {items.map((item: any) => (
        <Link key={item._id} href={href(item._id)} onClick={onClose}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', cursor:'pointer', transition:'background .15s' }}
            className={isDark ? 'hover:bg-white/4' : 'hover:bg-slate-50'}>
            <span style={{ fontSize:15 }}>{emoji}</span>
            <span style={{ fontSize:13, color: isDark?'#e2e8f0':'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title || item.name}</span>
            {item.subjectId?.name && <span style={{ fontSize:11, color:textSub, marginLeft:'auto', flexShrink:0 }}>{item.subjectId.name}</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}
