'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Video, Brain, ArrowRight, Star,
  ChevronDown, Shield, Search, Menu, X,
  FileText, BarChart3, GraduationCap, CheckCircle,
  Play, Users, Award, Zap,
} from 'lucide-react';

/* ─── Static Data ─────────────────────────────── */
const FEATURES = [
  { icon: FileText,      title: 'Chapter Notes',    desc: 'NCERT-based PDF & rich-text notes for every subject and chapter.',   color: '#7c3aed' },
  { icon: Video,         title: 'Video Lectures',   desc: 'YouTube + recorded lectures with continue-watching support.',        color: '#ec4899' },
  { icon: Brain,         title: 'MCQ Tests',        desc: 'Timed tests with auto-eval, leaderboard and detailed explanations.', color: '#0891b2' },
  { icon: BarChart3,     title: 'Progress Reports', desc: 'Track scores, attendance % and completed chapters easily.',          color: '#059669' },
  { icon: GraduationCap, title: 'All Classes',      desc: 'Complete curriculum — Class 1 to 12, 66+ subjects, 800+ chapters.',  color: '#d97706' },
  { icon: Shield,        title: 'Safe & Secure',    desc: 'JWT auth, role-based access and encrypted passwords.',               color: '#4f46e5' },
];

const SUBJECTS: Record<number, string[]> = {
  1:  ['Maths','English','Hindi','EVS'],
  2:  ['Maths','English','Hindi','EVS'],
  3:  ['Maths','English','Hindi','EVS'],
  4:  ['Maths','English','Hindi','EVS','Computer'],
  5:  ['Maths','English','Hindi','EVS','Computer'],
  6:  ['Maths','Science','English','Hindi','SST','Computer'],
  7:  ['Maths','Science','English','Hindi','SST','Computer'],
  8:  ['Maths','Science','English','Hindi','SST','Computer'],
  9:  ['Maths','Science','English','Hindi','SST','Sanskrit'],
  10: ['Maths','Science','English','Hindi','SST','Computer'],
  11: ['Physics','Chemistry','Maths','Biology','English','CS'],
  12: ['Physics','Chemistry','Maths','Biology','English','CS'],
};

const COLORS = [
  '#7c3aed','#2563eb','#db2777','#d97706',
  '#059669','#4f46e5','#be185d','#0891b2',
  '#ea580c','#7c3aed','#1d4ed8','#9333ea',
];

const STATS = [
  { icon: Users,    value: '10,000+', label: 'Active Students' },
  { icon: BookOpen, value: '800+',    label: 'Chapters'        },
  { icon: Video,    value: '200+',    label: 'Video Lectures'  },
  { icon: Award,    value: '100%',    label: 'Free Access'     },
];

const REVIEWS = [
  { name: 'Rahul Sharma', cls: 'Class 10', text: 'MCQ tests helped me score 95% in board exams. Highly recommend!' },
  { name: 'Priya Singh',  cls: 'Class 12', text: 'Video lectures are crystal clear. Physics became my favourite subject!' },
  { name: 'Arjun Mehta',  cls: 'Class 9',  text: 'The attendance tracker and notes library is extremely helpful for revision.' },
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dropdown, setDropdown]     = useState<string|null>(null);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'Inter, sans-serif', background: '#060714', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Global background layer ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Deep base gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 80%)',
        }} />
        {/* Side ambient glows */}
        <div style={{ position: 'absolute', top: '10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(124,58,237,0.07)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(236,72,153,0.06)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(8,145,178,0.05)', filter: 'blur(100px)' }} />

        {/* ── Floating study icons ── */}
        {[
          { emoji: '📚', x: '5%',  y: '15%', dur: 6,   delay: 0,   size: 28, opacity: 0.18 },
          { emoji: '✏️', x: '90%', y: '10%', dur: 7,   delay: 1,   size: 24, opacity: 0.15 },
          { emoji: '🔬', x: '15%', y: '45%', dur: 8,   delay: 2,   size: 26, opacity: 0.13 },
          { emoji: '📐', x: '80%', y: '40%', dur: 6.5, delay: 0.5, size: 22, opacity: 0.16 },
          { emoji: '🧮', x: '50%', y: '8%',  dur: 9,   delay: 3,   size: 24, opacity: 0.12 },
          { emoji: '📝', x: '70%', y: '70%', dur: 7.5, delay: 1.5, size: 26, opacity: 0.14 },
          { emoji: '🎓', x: '8%',  y: '75%', dur: 8.5, delay: 2.5, size: 30, opacity: 0.13 },
          { emoji: '💡', x: '35%', y: '85%', dur: 6,   delay: 4,   size: 22, opacity: 0.15 },
          { emoji: '🧪', x: '92%', y: '65%', dur: 7,   delay: 0.8, size: 24, opacity: 0.12 },
          { emoji: '📊', x: '25%', y: '20%', dur: 9,   delay: 3.5, size: 20, opacity: 0.14 },
          { emoji: '⚗️', x: '60%', y: '92%', dur: 7,   delay: 2,   size: 22, opacity: 0.11 },
          { emoji: '🔭', x: '45%', y: '55%', dur: 10,  delay: 1,   size: 26, opacity: 0.10 },
        ].map((item, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            fontSize: item.size,
            opacity: item.opacity,
            animation: `floatIcon ${item.dur}s ease-in-out ${item.delay}s infinite`,
            willChange: 'transform',
          }}>
            {item.emoji}
          </div>
        ))}

        <style>{`
          @keyframes floatIcon {
            0%   { transform: translateY(0px) rotate(0deg); }
            33%  { transform: translateY(-18px) rotate(4deg); }
            66%  { transform: translateY(-8px) rotate(-3deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}</style>
      </div>

      {/* ════════════════════════════════
          NAVBAR  (fixed, two rows)
      ════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl shadow-black/60 backdrop-blur-xl' : ''}`}
        style={{ background: scrolled ? 'rgba(6,7,20,0.85)' : '#060714', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Row 1 — main */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 no-underline">
            <div style={{ width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(124,58,237,.35)' }}>
              <BookOpen size={18} color="#fff"/>
            </div>
            <span style={{ fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-0.02em' }}>
              Study<span style={{ color:'#a78bfa' }}>Platform</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <Link href="/dashboard/tests">
              <span className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/6 transition-all cursor-pointer">MCQ Tests</span>
            </Link>
            <Link href="/dashboard/notes">
              <span className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/6 transition-all cursor-pointer">Notes</span>
            </Link>
          </nav>

          {/* Right buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
            <Link href="/login" className="hidden sm:block">
              <span className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">Login</span>
            </Link>
            <Link href="/signup">
              <span style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 20px',borderRadius:10,background:'#7c3aed',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,.35)' }}
                className="hover:bg-violet-500 transition-colors whitespace-nowrap">
                Get Started <ArrowRight size={14}/>
              </span>
            </Link>

            <button onClick={() => setMobileMenu(v=>!v)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/6 transition-all" style={{ border:'none',background:'none',cursor:'pointer' }}>
              {mobileMenu ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>

        {/* Row 2 — class quick links hidden */}

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }}
              style={{ overflow:'hidden',borderTop:'1px solid rgba(255,255,255,.06)',background:'#0D0E28' }}>
              <div style={{ padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <Link key={n} href="/signup" onClick={() => setMobileMenu(false)}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',cursor:'pointer' }}>
                      <span style={{ width:28,height:28,borderRadius:8,background:`${COLORS[n-1]}30`,color:COLORS[n-1],fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{n}</span>
                      <span style={{ fontSize:13,color:'#e2e8f0',fontWeight:600 }}>Class {n}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ════════════════════════════════
          HERO — proper two-column layout
          top padding = navbar height (104px)
      ════════════════════════════════ */}
      <section style={{ paddingTop: 120, paddingBottom: 80, position:'relative', overflow:'hidden', zIndex: 1 }}>
        {/* bg glow */}
        <div style={{ position:'absolute',top:'-80px',left:'-80px',width:500,height:500,borderRadius:'50%',background:'rgba(124,58,237,.10)',filter:'blur(120px)',pointerEvents:'none'}}/>
        <div style={{ position:'absolute',bottom:0,right:'-60px',width:400,height:400,borderRadius:'50%',background:'rgba(236,72,153,.07)',filter:'blur(100px)',pointerEvents:'none'}}/>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display:'grid',gridTemplateColumns:'1fr',gap:48,alignItems:'center' }} className="lg:grid-cols-2-custom">

            {/* ── LEFT ── */}
            <motion.div initial={{ opacity:0,x:-28 }} animate={{ opacity:1,x:0 }} transition={{ duration:.7 }}
              style={{ maxWidth: 560 }}>

              {/* Badge */}
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:99,background:'rgba(124,58,237,.12)',border:'1px solid rgba(124,58,237,.25)',marginBottom:24 }}>
                <Zap size={12} color="#a78bfa"/>
                <span style={{ fontSize:12,fontWeight:600,color:'#a78bfa' }}>India's Premium Study Platform — Class 1 to 12</span>
              </div>

              {/* Heading */}
              <h1 style={{ fontSize:'clamp(36px,5vw,58px)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.02em',marginBottom:20,color:'#fff' }}>
                Learn Smarter,<br/>
                <span style={{ background:'linear-gradient(135deg,#a78bfa,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                  Score Higher
                </span>
              </h1>

              {/* Sub */}
              <p style={{ fontSize:17,color:'#94a3b8',lineHeight:1.65,marginBottom:32,maxWidth:480 }}>
                Complete NCERT curriculum — notes, video lectures, MCQ tests and attendance tracking for every class from 1 to 12.
              </p>

              {/* CTA buttons */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:12,marginBottom:36 }}>
                <Link href="/signup">
                  <motion.button whileHover={{ scale:1.03,y:-2 }} whileTap={{ scale:.97 }}
                    style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:12,background:'#7c3aed',color:'#fff',fontWeight:700,fontSize:16,border:'none',cursor:'pointer',boxShadow:'0 8px 24px rgba(124,58,237,.35)' }}>
                    Start for Free <ArrowRight size={18}/>
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button whileHover={{ scale:1.03,y:-2 }} whileTap={{ scale:.97 }}
                    style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 24px',borderRadius:12,background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'#cbd5e1',fontWeight:600,fontSize:16,cursor:'pointer' }}>
                    Login / Register
                  </motion.button>
                </Link>
              </div>

              {/* Social proof */}
              <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:20 }}>
                <div style={{ display:'flex' }}>
                  {['🧑‍🎓','👩‍🎓','🧑‍💻','👩‍🎓'].map((e,i) => (
                    <div key={i} style={{ width:34,height:34,borderRadius:'50%',background:'#12143E',border:'2px solid #07081A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginLeft: i===0?0:-10 }}>{e}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex',gap:2,marginBottom:3 }}>{[...Array(5)].map((_,i)=><Star key={i} size={12} fill="#fbbf24" color="#fbbf24"/>)}</div>
                  <span style={{ fontSize:13,color:'#94a3b8' }}><strong style={{ color:'#fff' }}>10,000+</strong> students learning</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#94a3b8' }}>
                  <CheckCircle size={14} color="#4ade80"/> 100% Free Access
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT — Dashboard preview ── */}
            <motion.div initial={{ opacity:0,x:28 }} animate={{ opacity:1,x:0 }} transition={{ duration:.7,delay:.15 }}
              className="hidden lg:flex justify-center" style={{ position:'relative' }}>

              <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:4,repeat:Infinity,ease:'easeInOut' }}
                style={{ width:340,borderRadius:20,overflow:'hidden',border:'1px solid rgba(255,255,255,.08)',background:'rgba(13,14,40,.96)',boxShadow:'0 40px 80px rgba(0,0,0,.6)' }}>

                {/* Window bar */}
                <div style={{ display:'flex',alignItems:'center',gap:6,padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                  {['#f87171','#fbbf24','#4ade80'].map((c,i) => <div key={i} style={{ width:12,height:12,borderRadius:'50%',background:c,opacity:.8 }}/>)}
                  <span style={{ fontSize:12,color:'#475569',margin:'0 auto',fontWeight:500 }}>Student Dashboard</span>
                </div>

                <div style={{ padding:18,display:'flex',flexDirection:'column',gap:14 }}>
                  {/* Welcome */}
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontSize:11,color:'#64748b',marginBottom:2 }}>Good Morning 🌅</p>
                      <p style={{ fontSize:14,fontWeight:700,color:'#fff' }}>Welcome back, Arjun!</p>
                    </div>
                    <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:14 }}>A</div>
                  </div>

                  {/* 4 stat boxes */}
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
                    {[{e:'📄',v:'89',l:'Notes'},{e:'🎬',v:'47',l:'Videos'},{e:'🧠',v:'24',l:'Tests'},{e:'📅',v:'92%',l:'Attend.'}].map(s => (
                      <div key={s.l} style={{ padding:'10px 6px',borderRadius:12,textAlign:'center',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)' }}>
                        <div style={{ fontSize:18,marginBottom:4 }}>{s.e}</div>
                        <div style={{ fontSize:14,fontWeight:800,color:'#fff',lineHeight:1 }}>{s.v}</div>
                        <div style={{ fontSize:10,color:'#64748b',marginTop:2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                    <p style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'.08em' }}>Subject Progress</p>
                    {[{s:'Mathematics',p:82,c:'#7c3aed'},{s:'Science',p:74,c:'#0891b2'},{s:'English',p:91,c:'#ec4899'}].map(row => (
                      <div key={row.s} style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <span style={{ fontSize:11,color:'#94a3b8',width:80,flexShrink:0 }}>{row.s}</span>
                        <div style={{ flex:1,height:6,borderRadius:99,background:'rgba(255,255,255,.06)' }}>
                          <div style={{ height:'100%',borderRadius:99,background:row.c,width:`${row.p}%` }}/>
                        </div>
                        <span style={{ fontSize:11,fontWeight:700,color:'#fff',width:30,textAlign:'right',flexShrink:0 }}>{row.p}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Test result */}
                  <div style={{ display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:12,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.15)' }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:'rgba(16,185,129,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'#34d399',fontSize:13,flexShrink:0 }}>95%</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:'#fff',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>Real Numbers — MCQ Test</p>
                      <p style={{ fontSize:11,color:'#34d399' }}>Passed ✓ · 19/20 correct</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating chips */}
              <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:3,repeat:Infinity }}
                style={{ position:'absolute',top:-12,right:-12,padding:'8px 14px',borderRadius:12,background:'linear-gradient(135deg,#ec4899,#be185d)',fontSize:12,fontWeight:700,color:'#fff',boxShadow:'0 8px 20px rgba(236,72,153,.35)',zIndex:10,whiteSpace:'nowrap' }}>
                🔥 New Test Live!
              </motion.div>
              <motion.div animate={{ y:[0,7,0] }} transition={{ duration:3.5,repeat:Infinity,delay:.5 }}
                style={{ position:'absolute',bottom:-12,left:-12,padding:'8px 14px',borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',fontSize:12,fontWeight:700,color:'#fff',boxShadow:'0 8px 20px rgba(124,58,237,.35)',zIndex:10,whiteSpace:'nowrap' }}>
                🎉 95% in Boards!
              </motion.div>
            </motion.div>

          </div>{/* end grid */}
        </div>
      </section>

      {/* ════════════════════════════════
          STATS STRIP
      ════════════════════════════════ */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,.06)',borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,0.02)',backdropFilter:'blur(10px)',position:'relative',zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:0 }} className="sm:grid-cols-4-custom">
            {STATS.map((s,i) => (
              <motion.div key={i} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.08 }}
                style={{ display:'flex',alignItems:'center',gap:14,padding:'20px 24px',borderRight: i<3 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                <div style={{ width:44,height:44,borderRadius:12,background:'rgba(124,58,237,.12)',border:'1px solid rgba(124,58,237,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <s.icon size={20} color="#a78bfa"/>
                </div>
                <div>
                  <p style={{ fontSize:22,fontWeight:900,color:'#fff',lineHeight:1 }}>{s.value}</p>
                  <p style={{ fontSize:12,color:'#64748b',marginTop:3 }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          CLASSES GRID — properly contained
      ════════════════════════════════ */}
      <section style={{ padding:'64px 0', position:'relative', zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:40,flexWrap:'wrap',gap:12 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8 }}>Browse by Class</p>
              <h2 style={{ fontSize:'clamp(24px,3.5vw,38px)',fontWeight:900,color:'#fff',lineHeight:1.1 }}>
                Class 10 & 12 —{' '}
                <span style={{ background:'linear-gradient(135deg,#67e8f9,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                  Fully Covered
                </span>
              </h2>
            </div>
            <Link href="/signup">
              <span style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:'#a78bfa',cursor:'pointer' }}
                className="hover:text-violet-300 transition-colors">
                View All <ArrowRight size={14}/>
              </span>
            </Link>
          </div>

          {/* 6-column grid — all 12 cards properly contained */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12 }}
            className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((n,i) => (
              <motion.div key={n} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.04 }}>
                <Link href="/signup">
                  <div className="group" style={{
                    padding:'16px 14px',
                    borderRadius:16,
                    border:'1px solid rgba(255,255,255,.07)',
                    background:'rgba(255,255,255,0.03)',
                    backdropFilter:'blur(8px)',
                    cursor:'pointer',
                    transition:'all .25s',
                    overflow:'hidden',
                    position:'relative',
                    height:'100%',
                    boxSizing:'border-box',
                    display:'flex',
                    flexDirection:'column',
                    gap:10,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(124,58,237,.4)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 32px rgba(0,0,0,.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,.07)'; (e.currentTarget as HTMLDivElement).style.transform='none'; (e.currentTarget as HTMLDivElement).style.boxShadow='none'; }}>

                    {/* Class number */}
                    <div style={{ width:40,height:40,borderRadius:10,background:COLORS[i],display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:18,boxShadow:`0 4px 12px ${COLORS[i]}40`,flexShrink:0 }}>
                      {n}
                    </div>

                    {/* Title + count */}
                    <div>
                      <p style={{ fontSize:13,fontWeight:800,color:'#f1f5f9',marginBottom:3 }}>Class {n}</p>
                      <p style={{ fontSize:11,color:'#64748b' }}>{SUBJECTS[n].length} Subjects</p>
                    </div>

                    {/* Subject tags — max 2 shown + remainder */}
                    <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                      {SUBJECTS[n].slice(0,2).map(sub => (
                        <span key={sub} style={{ fontSize:10,padding:'3px 8px',borderRadius:99,background:'rgba(255,255,255,.05)',color:'#94a3b8',fontWeight:500,whiteSpace:'nowrap' }}>
                          {sub}
                        </span>
                      ))}
                      {SUBJECTS[n].length > 2 && (
                        <span style={{ fontSize:10,padding:'3px 8px',borderRadius:99,background:`${COLORS[i]}20`,color:COLORS[i],fontWeight:600,whiteSpace:'nowrap' }}>
                          +{SUBJECTS[n].length - 2}
                        </span>
                      )}
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FEATURES — horizontal list style
      ════════════════════════════════ */}
      <section style={{ padding:'64px 0', background:'rgba(255,255,255,0.015)', borderTop:'1px solid rgba(255,255,255,.05)', borderBottom:'1px solid rgba(255,255,255,.05)', position:'relative', zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <p style={{ fontSize:11,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10 }}>Why StudyPlatform</p>
            <h2 style={{ fontSize:'clamp(24px,3.5vw,38px)',fontWeight:900,color:'#fff',marginBottom:12 }}>
              Everything in{' '}
              <span style={{ background:'linear-gradient(135deg,#a78bfa,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                One Place
              </span>
            </h2>
            <p style={{ color:'#64748b',fontSize:16,maxWidth:500,margin:'0 auto' }}>Smart tools and complete content for every serious student.</p>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'repeat(1,1fr)',gap:12 }} className="sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f,i) => (
              <motion.div key={i} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.07 }}>
                <div style={{
                  display:'flex',alignItems:'flex-start',gap:16,
                  padding:'20px',borderRadius:16,
                  border:'1px solid rgba(255,255,255,.06)',
                  background:'#0A0B1A',
                  transition:'all .25s',
                  height:'100%',boxSizing:'border-box',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,.12)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(255,255,255,.06)'; (e.currentTarget as HTMLDivElement).style.transform='none'; }}>

                  <div style={{ width:46,height:46,borderRadius:12,background:`${f.color}18`,border:`1px solid ${f.color}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <f.icon size={22} color={f.color}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <h3 style={{ fontSize:15,fontWeight:700,color:'#f1f5f9',marginBottom:6 }}>{f.title}</h3>
                    <p style={{ fontSize:13,color:'#64748b',lineHeight:1.6 }}>{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          REVIEWS
      ════════════════════════════════ */}
      <section style={{ padding:'64px 0', position:'relative', zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign:'center',marginBottom:48 }}>
            <h2 style={{ fontSize:'clamp(24px,3.5vw,38px)',fontWeight:900,color:'#fff' }}>
              What Students{' '}
              <span style={{ background:'linear-gradient(135deg,#fbbf24,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Say</span>
            </h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(1,1fr)',gap:14 }} className="md:grid-cols-3">
            {REVIEWS.map((r,i) => (
              <motion.div key={i} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.1 }}>
                <div style={{ padding:'22px',borderRadius:16,border:'1px solid rgba(255,255,255,.07)',background:'#0D0E28',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',gap:14 }}>
                  <div style={{ display:'flex',gap:3 }}>{[...Array(5)].map((_,j)=><Star key={j} size={14} fill="#fbbf24" color="#fbbf24"/>)}</div>
                  <p style={{ fontSize:14,color:'#94a3b8',lineHeight:1.65,flex:1 }}>"{r.text}"</p>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'#fff',flexShrink:0 }}>{r.name[0]}</div>
                    <div>
                      <p style={{ fontSize:14,fontWeight:700,color:'#f1f5f9' }}>{r.name}</p>
                      <p style={{ fontSize:12,color:'#64748b' }}>{r.cls}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA BANNER
      ════════════════════════════════ */}
      <section style={{ padding:'0 0 64px', position:'relative', zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ position:'relative',overflow:'hidden',borderRadius:24,padding:'56px 48px',textAlign:'center',background:'linear-gradient(135deg,#4c1d95 0%,#3730a3 50%,#0e7490 100%)' }}>
            <div style={{ position:'absolute',top:-60,left:-60,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.08)',filter:'blur(40px)',pointerEvents:'none' }}/>
            <div style={{ position:'absolute',bottom:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.08)',filter:'blur(40px)',pointerEvents:'none' }}/>
            <div style={{ position:'relative',zIndex:1 }}>
              <p style={{ fontSize:12,fontWeight:700,color:'rgba(196,181,253,.8)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14 }}>Start Learning Today</p>
              <h2 style={{ fontSize:'clamp(28px,4vw,46px)',fontWeight:900,color:'#fff',marginBottom:14,lineHeight:1.1 }}>Ready to Score Higher?</h2>
              <p style={{ fontSize:17,color:'rgba(196,181,253,.8)',marginBottom:32,maxWidth:480,margin:'0 auto 32px' }}>Join 10,000+ students. Complete curriculum, free forever.</p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginBottom:24 }}>
                <Link href="/signup">
                  <motion.button whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:.97 }}
                    style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'14px 32px',borderRadius:14,background:'#fff',color:'#4c1d95',fontWeight:800,fontSize:16,border:'none',cursor:'pointer',boxShadow:'0 8px 24px rgba(0,0,0,.2)' }}>
                    Create Free Account <ArrowRight size={18}/>
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:.97 }}
                    style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'14px 28px',borderRadius:14,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',color:'#fff',fontWeight:600,fontSize:16,cursor:'pointer' }}>
                    Sign In
                  </motion.button>
                </Link>
              </div>
              <div style={{ display:'flex',flexWrap:'wrap',justifyContent:'center',gap:24 }}>
                {['No credit card required','Instant access','All Classes 1-12 free'].map(t => (
                  <div key={t} style={{ display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(196,181,253,.8)' }}>
                    <CheckCircle size={14}/>{t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.06)', background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)', padding:'32px 0', position:'relative', zIndex:1 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#5b21b6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <BookOpen size={15} color="#fff"/>
              </div>
              <span style={{ fontWeight:900,color:'#fff',fontSize:15 }}>StudyPlatform</span>
            </div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:20 }}>
              {[['Student Login','/login'],['Sign Up','/signup']].map(([l,h]) => (
                <Link key={l} href={h}><span style={{ fontSize:13,color:'#64748b',cursor:'pointer',transition:'color .15s' }} className="hover:text-white">{l}</span></Link>
              ))}
            </div>
            <p style={{ fontSize:13,color:'#475569' }}>© 2024 StudyPlatform. Class 1–12 Learning.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
