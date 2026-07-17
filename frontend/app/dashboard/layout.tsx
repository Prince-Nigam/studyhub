'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useTheme } from '@/components/ThemeProvider';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
    if (!loading && isAuthenticated && user?.role === 'admin') router.push('/admin/dashboard');
  }, [isAuthenticated, loading, user, router]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#07081A', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(124,58,237,.35)' }}>
          <Loader2 size={26} color="#fff" style={{ animation:'spin 1s linear infinite' }} />
        </div>
        <p style={{ color:'#475569', fontSize:14 }}>Loading your workspace…</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return null;

  const bg = theme === 'dark' ? '#07081A' : '#f8faff';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:bg }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:40 }} className="lg:hidden">
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position:'absolute', left:0, top:0, height:'100%' }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Topbar onMenuClick={() => setMobileOpen(v => !v)} />
        <main style={{ flex:1, overflowY:'auto', padding:'24px 28px' }} className="scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
