'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  BookOpen, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, Loader2, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface MobileForm    { mobile: string }
interface PasswordForm  { password: string; confirmPassword: string }

type Step = 'mobile' | 'otp' | 'password' | 'done';

// ── OTP digit input ────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('');

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const arr = value.padEnd(6, '').split('');
    arr[i] = digit;
    const next = arr.join('').slice(0, 6);
    onChange(next);
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
            background: 'rgba(255,255,255,.04)', border: `1px solid ${digits[i]?.trim() ? 'rgba(124,58,237,.6)' : 'rgba(255,255,255,.08)'}`,
            borderRadius: 12, color: '#f1f5f9', outline: 'none', transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.6)'}
          onBlur={e => e.target.style.borderColor = digits[i]?.trim() ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.08)'}
        />
      ))}
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps: Step[] = ['mobile', 'otp', 'password'];
  const idx = steps.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            background: i <= idx ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.06)',
            color: i <= idx ? '#fff' : '#475569',
            border: i === idx ? '2px solid #a78bfa' : '2px solid transparent',
            boxShadow: i === idx ? '0 0 12px rgba(124,58,237,.5)' : 'none',
            transition: 'all .3s',
          }}>
            {i < idx ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 40, height: 2, background: i < idx ? 'linear-gradient(90deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,.06)', transition: 'background .4s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [step, setStep] = useState<Step>('mobile');
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const mobileForm = useForm<MobileForm>();
  const passwordForm = useForm<PasswordForm>();

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  const sendOtp = async (data: MobileForm) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', {
        mobile: data.mobile.trim(),
      });
      setMobile(data.mobile.trim());
      setOtp('');
      setOtpError('');
      setCountdown(60);
      setStep('otp');
      toast.success('OTP sent to your mobile number!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const verifyOtp = async () => {
    if (otp.length < 6) { setOtpError('Please enter the complete 6-digit OTP'); return; }
    setOtpError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        mobile,
        otp,
      });
      setResetToken(res.data.resetToken);
      setStep('password');
      toast.success('OTP verified!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setOtpError(msg || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ──────────────────────────────────────────────
  const resetPassword = async (data: PasswordForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        mobile,
        resetToken,
        password: data.password,
      });

      const { token: newToken, user: newUser } = res.data;

      // Properly set auth state so the app recognises the user as logged in
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      updateUser(newUser);

      setStep('done');
      toast.success('Password reset successful!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Reset failed. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ───────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: '100%', paddingTop: 13, paddingBottom: 13, paddingRight: 14,
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', transition: 'border-color .2s',
  };
  const submitBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px', borderRadius: 12, marginTop: 4,
    background: disabled ? 'rgba(124,58,237,.5)' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 6px 20px rgba(124,58,237,.3)', transition: 'all .2s',
  });

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#07081A', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(124,58,237,.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(236,72,153,.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        <div style={{ background: '#0D0F2A', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: 36, boxShadow: '0 32px 80px rgba(0,0,0,.5)' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Link href="/">
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(124,58,237,.35)', cursor: 'pointer' }}>
                <BookOpen size={24} color="#fff" />
              </div>
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {step === 'mobile'   && 'Forgot Password? 🔑'}
              {step === 'otp'     && 'Enter OTP 📱'}
              {step === 'password' && 'Set New Password 🔒'}
              {step === 'done'    && 'All Done! 🎉'}
            </h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {step === 'mobile'   && 'Enter your registered mobile number'}
              {step === 'otp'     && `OTP sent to +91-${mobile.slice(0, 5)}XXXXX`}
              {step === 'password' && 'Choose a strong new password'}
              {step === 'done'    && 'Redirecting to dashboard…'}
            </p>
          </div>

          {/* Step bar (not shown on done) */}
          {step !== 'done' && <StepBar current={step} />}

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Mobile ──────────────────────────────────────── */}
            {step === 'mobile' && (
              <motion.div key="mobile"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: .25 }}
              >
                <form onSubmit={mobileForm.handleSubmit(sendOtp)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      {/* +91 prefix badge */}
                      <span style={{ position: 'absolute', left: 38, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#64748b', pointerEvents: 'none', userSelect: 'none' }}>+91</span>
                      <input
                        {...mobileForm.register('mobile', {
                          required: 'Mobile number is required',
                          pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
                        })}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        style={{ ...inputBase, paddingLeft: 76 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                      />
                    </div>
                    {mobileForm.formState.errors.mobile && (
                      <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                        {mobileForm.formState.errors.mobile.message}
                      </p>
                    )}
                  </div>

                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: .98 }}
                    type="submit" disabled={loading} style={submitBtn(loading)}>
                    {loading
                      ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      : <><span>Send OTP</span><ArrowRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ─────────────────────────────────────────── */}
            {step === 'otp' && (
              <motion.div key="otp"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: .25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <OtpInput value={otp} onChange={v => { setOtp(v); setOtpError(''); }} />

                {otpError && (
                  <p style={{ fontSize: 12, color: '#f43f5e', textAlign: 'center', marginTop: -8 }}>
                    {otpError}
                  </p>
                )}

                <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: .98 }}
                  type="button" disabled={loading || otp.length < 6}
                  onClick={verifyOtp}
                  style={submitBtn(loading || otp.length < 6)}>
                  {loading
                    ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><span>Verify OTP</span><ArrowRight size={18} /></>}
                </motion.button>

                {/* Resend */}
                <div style={{ textAlign: 'center' }}>
                  {countdown > 0 ? (
                    <span style={{ fontSize: 13, color: '#475569' }}>
                      Resend OTP in <strong style={{ color: '#a78bfa' }}>{countdown}s</strong>
                    </span>
                  ) : (
                    <button type="button"
                      onClick={() => mobileForm.handleSubmit(sendOtp)({ mobile })}
                      style={{ fontSize: 13, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Didn&apos;t receive OTP? Resend
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => setStep('mobile')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', margin: '0 auto' }}>
                  <ArrowLeft size={14} /> Change Number
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: New password ─────────────────────────────────── */}
            {step === 'password' && (
              <motion.div key="password"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: .25 }}
              >
                <form onSubmit={passwordForm.handleSubmit(resetPassword)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* New password */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        {...passwordForm.register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' },
                        })}
                        type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••"
                        style={{ ...inputBase, paddingLeft: 44, paddingRight: 44 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        {...passwordForm.register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: v => v === passwordForm.watch('password') || 'Passwords do not match',
                        })}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        style={{ ...inputBase, paddingLeft: 44, paddingRight: 44 }}
                        onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p style={{ fontSize: 12, color: '#f43f5e', marginTop: 6 }}>
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: .98 }}
                    type="submit" disabled={loading} style={submitBtn(loading)}>
                    {loading
                      ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      : <><span>Reset Password</span><ArrowRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── DONE ────────────────────────────────────────────────── */}
            {step === 'done' && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .4 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: .1 }}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <CheckCircle size={40} color="#22c55e" />
                </motion.div>
                <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
                  Your password has been updated successfully. Taking you to the dashboard…
                </p>
                <Loader2 size={20} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              </motion.div>
            )}

          </AnimatePresence>

          {/* Back to login — shown on step 1 only */}
          {step === 'mobile' && (
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Link href="/login">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.color = '#a78bfa'}
                  onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.color = '#475569'}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </span>
              </Link>
            </div>
          )}

        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 20 }}>
          © 2024 StudyPlatform · All rights reserved
        </p>
      </motion.div>
    </div>
  );
}
