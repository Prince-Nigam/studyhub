'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BookOpen, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LoginForm { email: string; password: string; }

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // Try admin login first
      try {
        const adminRes = await api.post('/auth/admin/login', data);
        if (adminRes.data.success) {
          const { token, user: adminUser } = adminRes.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(adminUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          toast.success('Welcome Admin!');
          router.push('/admin/dashboard');
          return;
        }
      } catch { /* not admin, try student */ }

      // Try student login
      await login(data.email, data.password);

    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07081A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position:'absolute', top:'-100px', left:'-100px', width:400, height:400, borderRadius:'50%', background:'rgba(124,58,237,.15)', filter:'blur(100px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:300, height:300, borderRadius:'50%', background:'rgba(236,72,153,.1)', filter:'blur(80px)', pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity:0, y:28, scale:.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:.5 }}
        style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}
      >
        <div style={{ background:'#0D0F2A', border:'1px solid rgba(255,255,255,.08)', borderRadius:24, padding:36, boxShadow:'0 32px 80px rgba(0,0,0,.5)' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <Link href="/">
              <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 20px rgba(124,58,237,.35)', cursor:'pointer' }}>
                <BookOpen size={24} color="#fff" />
              </div>
            </Link>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#fff', marginBottom:6 }}>Welcome Back! 👋</h1>
            <p style={{ fontSize:14, color:'#64748b' }}>Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:8 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} color="#475569" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                  })}
                  type="email"
                  placeholder="your@email.com"
                  style={{
                    width:'100%', paddingLeft:44, paddingRight:14, paddingTop:13, paddingBottom:13,
                    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                    borderRadius:12, color:'#f1f5f9', fontSize:14, outline:'none',
                    transition:'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                />
              </div>
              {errors.email && <p style={{ fontSize:12, color:'#f43f5e', marginTop:6 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:8 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} color="#475569" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    width:'100%', paddingLeft:44, paddingRight:44, paddingTop:13, paddingBottom:13,
                    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                    borderRadius:12, color:'#f1f5f9', fontSize:14, outline:'none',
                    transition:'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize:12, color:'#f43f5e', marginTop:6 }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: .98 }}
              type="submit"
              disabled={loading}
              style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                padding:'14px', borderRadius:12, marginTop:4,
                background: loading ? 'rgba(124,58,237,.5)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color:'#fff', fontWeight:700, fontSize:15, border:'none', cursor: loading?'not-allowed':'pointer',
                boxShadow:'0 6px 20px rgba(124,58,237,.3)', transition:'all .2s',
              }}
            >
              {loading ? <Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} /> : (
                <><span>Sign In</span><ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
            <span style={{ fontSize:12, color:'#334155' }}>Don't have an account?</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }} />
          </div>

          <Link href="/signup">
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'13px', borderRadius:12, border:'1px solid rgba(255,255,255,.08)',
              background:'rgba(255,255,255,.03)', color:'#94a3b8', fontWeight:600, fontSize:14,
              cursor:'pointer', transition:'all .2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,.3)'; (e.currentTarget as HTMLDivElement).style.color = '#a78bfa'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}>
              Create Free Account →
            </div>
          </Link>

        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#1e293b', marginTop:20 }}>
          © 2024 StudyPlatform · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
