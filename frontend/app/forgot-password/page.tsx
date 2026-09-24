'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { BookOpen, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ForgotForm { email: string; }

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email: data.email });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Something went wrong. Please try again.');
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
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
              {sent ? 'Check Your Email 📬' : 'Forgot Password? 🔑'}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              {sent
                ? `We've sent a reset link to ${getValues('email')}`
                : "No worries! Enter your email and we'll send a reset link"}
            </p>
          </div>

          {sent ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: .95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: .35 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
                The link expires in <strong style={{ color: '#f1f5f9' }}>15 minutes</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => setSent(false)}
                style={{ fontSize: 13, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Didn&apos;t receive it? Send again
              </button>
            </motion.div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                    type="email"
                    placeholder="your@email.com"
                    style={{
                      width: '100%', paddingLeft: 44, paddingRight: 14, paddingTop: 13, paddingBottom: 13,
                      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none',
                      transition: 'border-color .2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                  />
                </div>
                {errors.email && <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>{errors.email.message}</p>}
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
                  : <><span>Send Reset Link</span><ArrowRight size={18} /></>
                }
              </motion.button>
            </form>
          )}

          {/* Back to login */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/login">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#64748b', cursor: 'pointer', transition: 'color .2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#a78bfa'}
                onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = '#64748b'}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </span>
            </Link>
          </div>

        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 20 }}>
          © 2024 StudyPlatform · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
