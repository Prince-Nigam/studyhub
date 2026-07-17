'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap, FileText, Video,
  Brain, Calendar, Download, User, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, Trophy,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/dashboard/classes',       icon: GraduationCap,   label: 'Classes'    },
  { href: '/dashboard/notes',         icon: FileText,        label: 'Notes'      },
  { href: '/dashboard/videos',        icon: Video,           label: 'Videos'     },
  { href: '/dashboard/tests',         icon: Brain,           label: 'MCQ Tests'  },
  { href: '/dashboard/results',       icon: Trophy,          label: 'Results'    },
  { href: '/dashboard/attendance',    icon: Calendar,        label: 'Attendance' },
  { href: '/dashboard/downloads',     icon: Download,        label: 'Downloads'  },
  { href: '/dashboard/notifications', icon: Bell,            label: 'Alerts'     },
  { href: '/dashboard/profile',       icon: User,            label: 'Profile'    },
  { href: '/dashboard/settings',      icon: Settings,        label: 'Settings'   },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const active = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: .28, ease: [.4,0,.2,1] }}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        height: '100vh', flexShrink: 0, overflow: 'hidden',
        background: '#09091E', borderRight: '1px solid rgba(255,255,255,.06)',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 14px', height:60, flexShrink:0, borderBottom:'1px solid rgba(255,255,255,.06)', justifyContent: collapsed?'center':'flex-start' }}>
        <div style={{ width:36, height:36, minWidth:36, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(124,58,237,.3)', flexShrink:0 }}>
          <BookOpen size={16} color="#fff" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:.18 }}>
              <p style={{ fontWeight:900, fontSize:15, color:'#fff', lineHeight:1, whiteSpace:'nowrap' }}>StudyPlatform</p>
              <p style={{ fontSize:10, color:'#475569', marginTop:2 }}>Premium Learning</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }} className="scrollbar-hide">
        {NAV.map(item => {
          const on = active(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale:.97 }}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding: collapsed ? '9px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius:11, cursor:'pointer', transition:'all .15s',
                  background: on ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'transparent',
                  boxShadow: on ? '0 4px 12px rgba(124,58,237,.28)' : 'none',
                }}
                className={on ? '' : 'hover-nav'}
              >
                <item.icon size={18} color={on ? '#fff' : '#64748b'} style={{ flexShrink:0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      style={{ fontSize:13, fontWeight:600, color: on ? '#fff' : '#94a3b8', whiteSpace:'nowrap' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding:'8px', borderTop:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:12, background:'rgba(255,255,255,.04)', justifyContent: collapsed?'center':'flex-start' }}>
          {/* Avatar */}
          <div style={{ width:34, height:34, minWidth:34, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, flexShrink:0, overflow:'hidden' }}>
            {user?.profilePicture
              ? <img src={user.profilePicture} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : user?.fullName?.[0]?.toUpperCase()
            }
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.fullName}</p>
                <p style={{ fontSize:11, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.selectedClass || user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                onClick={logout}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', borderRadius:8, flexShrink:0 }}
                title="Logout">
                <LogOut size={15} color="#64748b" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          position:'absolute', right:-12, top:72, width:24, height:24,
          borderRadius:'50%', background:'#7c3aed', border:'2px solid #09091E',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', boxShadow:'0 2px 8px rgba(124,58,237,.4)', zIndex:30,
        }}>
        {collapsed ? <ChevronRight size={12} color="#fff" /> : <ChevronLeft size={12} color="#fff" />}
      </button>
    </motion.aside>
  );
}
