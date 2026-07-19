'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap, BookOpen, Video, Brain,
  Calendar, Users, Bell, Megaphone, Shield, LogOut, FileText,
  Layers, RefreshCw, Trophy, MessageCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Loader2 } from 'lucide-react';

const adminNav = [
  { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/classes',       icon: GraduationCap,   label: 'Classes' },
  { href: '/admin/subjects',      icon: BookOpen,        label: 'Subjects' },
  { href: '/admin/chapters',      icon: Layers,          label: 'Chapters' },
  { href: '/admin/notes',         icon: FileText,        label: 'Notes' },
  { href: '/admin/videos',        icon: Video,           label: 'Videos' },
  { href: '/admin/tests',         icon: Brain,           label: 'Tests' },
  { href: '/admin/results',       icon: Trophy,          label: 'Results' },
  { href: '/admin/doubts',        icon: MessageCircle,   label: 'Doubts' },
  { href: '/admin/attendance',    icon: Calendar,        label: 'Attendance' },
  { href: '/admin/users',         icon: Users,           label: 'Users' },
  { href: '/admin/announcements', icon: Megaphone,       label: 'Announcements' },
  { href: '/admin/notifications', icon: Bell,            label: 'Notifications' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }, [router]);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/login');
    }
    if (!loading && isAuthenticated && user?.role !== 'admin' && pathname !== '/admin/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-indigo-500" />
    </div>
  );

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Admin Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          height: '100vh', flexShrink: 0, overflow: 'hidden',
          background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)',
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 14px', height: 64, flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 36, height: 36, minWidth: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)', flexShrink: 0,
          }}>
            <Shield size={18} color="#fff" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}
              >
                <p style={{ fontWeight: 900, fontSize: 15, color: '#fff', lineHeight: 1, whiteSpace: 'nowrap' }}>Admin Panel</p>
                <p style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>StudyPlatform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1, padding: '10px 8px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 2,
        }} className="scrollbar-hide">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '9px 0' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 11, cursor: 'pointer', transition: 'all .15s',
                    background: isActive
                      ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
                      : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.28)' : 'none',
                  }}
                  className={isActive ? '' : 'hover-nav'}
                >
                  <item.icon size={18} color={isActive ? '#fff' : '#64748b'} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                          fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                          color: isActive ? '#fff' : '#94a3b8',
                        }}
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
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <div style={{
              width: 34, height: 34, minWidth: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName}
                  </p>
                  <p style={{ fontSize: 11, color: '#475569' }}>Administrator</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={logout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 8, flexShrink: 0 }}
                  title="Logout"
                >
                  <LogOut size={15} color="#64748b" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            position: 'absolute', right: -12, top: 72,
            width: 24, height: 24, borderRadius: '50%',
            background: '#6366f1', border: '2px solid #0f172a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.4)', zIndex: 30,
          }}
        >
          {collapsed ? <ChevronRight size={12} color="#fff" /> : <ChevronLeft size={12} color="#fff" />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-16 flex items-center justify-between px-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b backdrop-blur-xl`}>
          <h1 className="font-bold capitalize">
            {pathname.split('/').slice(-1)[0].replace(/-/g, ' ') || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              title="Refresh page"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
              style={{ border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield size={14} className="text-indigo-400" />
              Admin Mode
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
