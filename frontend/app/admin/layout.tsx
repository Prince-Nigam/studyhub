'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard, GraduationCap, BookOpen, Video, Brain,
  Calendar, Users, Bell, Megaphone, Shield, LogOut, FileText, Layers, RefreshCw, Trophy, MessageCircle
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
  { href: '/admin/doubts',        icon: MessageCircle,   label: 'Doubts'  },
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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }, [router]);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      // Redirect to unified login page (not admin/login)
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
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 h-16">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Admin Panel</p>
            <p className="text-slate-500 text-xs">StudyPlatform</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-slate-500 text-xs">Administrator</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

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
