'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface LeaderEntry {
  rank: number;
  userId: string;
  fullName: string;
  profilePicture?: string;
  selectedClass?: string;
  avgPercentage: number;
  bestScore: number;
  totalTests: number;
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_BG    = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.10)', 'rgba(205,127,50,0.10)'];

function Avatar({ name, pic, size = 48 }: { name: string; pic?: string; size?: number }) {
  if (pic) return (
    <img src={pic} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, color: '#fff', fontSize: size * 0.35,
    }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData]       = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user }  = useAuth();
  const router    = useRouter();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';

  // Theme-aware colors
  const textMain  = isDark ? '#f1f5f9' : '#0f172a';
  const textSub   = isDark ? '#64748b'  : '#64748b';
  const cardBg    = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const cardBdr   = isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0';

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(r => setData(r.data.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div style={{ padding: '24px', maxWidth: 700, margin: '0 auto' }}>
      <button onClick={() => router.back()}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:20 }}>
        â† Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        style={{ marginBottom:32, textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
          <Trophy size={28} color="#FFD700" />
          <h1 style={{ fontSize:28, fontWeight:900, color:textMain, margin:0 }}>Top Students</h1>
        </div>
        <p style={{ color:textSub, fontSize:14 }}>Ranked by average test score across all subjects</p>
      </motion.div>

      {loading && (
        <div style={{ textAlign:'center', padding:'60px 0', color:textSub }}>Loading leaderboard...</div>
      )}

      {!loading && data.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 24px', background:cardBg, borderRadius:20, border:`1px solid ${cardBdr}`, color:textSub }}>
          <Trophy size={40} color="#334155" style={{ marginBottom:12 }} />
          <p style={{ fontWeight:700, color:textMain, marginBottom:4 }}>No results yet</p>
          <p style={{ fontSize:13 }}>Students who attempt tests will appear here</p>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && top3.length > 0 && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:12, marginBottom:32 }}>
          {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
            const isFirst = entry.rank === 1;
            const col     = RANK_COLORS[entry.rank - 1];
            return (
              <motion.div key={entry.userId}
                initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.15 + i * 0.1 }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flex:isFirst?'0 0 180px':'0 0 140px' }}>
                {isFirst && <div style={{ fontSize:28 }}>ðŸ‘‘</div>}

                <div style={{ position:'relative' }}>
                  <Avatar name={entry.fullName} pic={entry.profilePicture} size={isFirst?72:56} />
                  <div style={{ position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%', background:col, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:'#000', border:`2px solid ${isDark?'#060714':'#f8faff'}` }}>
                    {entry.rank}
                  </div>
                </div>

                <div style={{ textAlign:'center' }}>
                  <p style={{ fontWeight:800, color:textMain, fontSize:isFirst?15:13, marginBottom:2 }}>
                    {entry.fullName}
                  </p>
                  {entry.selectedClass && (
                    <p style={{ fontSize:11, color:textSub }}>Class {entry.selectedClass}</p>
                  )}
                </div>

                <div style={{ width:'100%', padding:'10px 14px', background:RANK_BG[entry.rank-1], border:`1px solid ${col}30`, borderRadius:14, textAlign:'center', minHeight:isFirst?100:80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
                  <p style={{ fontSize:isFirst?24:20, fontWeight:900, color:col, lineHeight:1 }}>{entry.avgPercentage}%</p>
                  <p style={{ fontSize:10, color:textSub }}>avg score</p>
                  <p style={{ fontSize:11, color:textSub }}>{entry.totalTests} tests</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Rank 4â€“10 list */}
      {!loading && rest.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {rest.map((entry, i) => {
            const isMe = entry.userId === user?._id;
            return (
              <motion.div key={entry.userId}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.3 + i * 0.05 }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:16,
                  background:isMe?'rgba(124,58,237,0.12)':cardBg,
                  border:`1px solid ${isMe?'rgba(124,58,237,0.3)':cardBdr}` }}>

                <div style={{ width:32, textAlign:'center', fontWeight:800, color:textSub, fontSize:15, flexShrink:0 }}>
                  #{entry.rank}
                </div>

                <Avatar name={entry.fullName} pic={entry.profilePicture} size={40} />

                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, color:textMain, fontSize:14, marginBottom:2 }}>
                    {entry.fullName} {isMe && <span style={{ fontSize:11, color:'#a78bfa' }}>(You)</span>}
                  </p>
                  <p style={{ fontSize:12, color:textSub }}>
                    {entry.selectedClass?`Class ${entry.selectedClass} Â· `:''}{entry.totalTests} tests taken
                  </p>
                </div>

                <div style={{ display:'flex', gap:16, flexShrink:0 }}>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:16, fontWeight:800, color:'#a78bfa', lineHeight:1 }}>{entry.avgPercentage}%</p>
                    <p style={{ fontSize:10, color:textSub }}>avg</p>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:16, fontWeight:800, color:'#34d399', lineHeight:1 }}>{entry.bestScore}%</p>
                    <p style={{ fontSize:10, color:textSub }}>best</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && data.length > 0 && !data.find(e => e.userId === user?._id) && (
        <div style={{ marginTop:20, padding:'14px 18px', borderRadius:16, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', textAlign:'center', color:textSub, fontSize:13 }}>
          Attempt more tests to appear on the leaderboard!
        </div>
      )}
    </div>
  );
}
