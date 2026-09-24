'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { BookOpen, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ResetForm { password: string; confirmPassword: string; }

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>();

  // If no token in URL, show error immediately
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const onSubmit = async (data: ResetForm) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token,
        password: data.password,
      });

      // Save token so user is logged in right away
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      setDone(true);
      toast.success(res.data.message || 'Password reset successful!');

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── No token state ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <XCircle size={36} color="#f43f5e" />
        </div>
        <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
          This reset link is invalid or missing. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: .98 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px',
              borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(124,58,237,.3)',
            }}
          >
            Request New Link <ArrowRight size={16} />
          </motion.div>
        </Link>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: .95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: .35 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0' }}
      >
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={36} color="#22c55e" />
        </div>
        <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
          Your password has been reset. Redirecting you to dashboard…
        </p>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* New Password */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>New Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            style={{
              width: '100%', paddingLeft: 44, paddingRight: 44, paddingTop: 13, paddingBottom: 13,
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none',
              transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
          />
          <button type="button" onClick={() => setShowPwd(v => !v)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: v => v === watch('password') || 'Passwords do not match',
            })}
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            style={{
              width: '100%', paddingLeft: 44, paddingRight: 44, paddingTop: 13, paddingBottom: 13,
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none',
              transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>{errors.confirmPassword.message}</p>}
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: .98 }}
        type="submit"
        disabled={loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px', borderRadius: 12, marginTop: 4,
          background: loading ? 'rgba(124,58,237,.5)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 6px 20px rgba(124,58,237,.3)', transition: 'all .2s',
        }}
      >
        {loading
          ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          : <><span>Reset Password</span><ArrowRight size={18} /></>
        }
      </motion.button>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <Link href="/login">
          <span style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#a78bfa'}
            onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = '#64748b'}
          >
            Back to Sign In
          </span>
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(236,72,153,.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        <div style={{ background: '#0D0F2A', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: 36, boxShadow: '0 32px 80px rgba(0,0,0,.5)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link href="/">
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(124,58,237,.35)', cursor: 'pointer' }}>
                <BookOpen size={24} color="#fff" />
              </div>
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Set New Password 🔒</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Choose a strong password for your account</p>
          </div>

          {/* useSearchParams requires Suspense boundary — handled by wrapping component */}
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <Loader2 size={28} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 20 }}>
          © 2024 StudyPlatform · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
