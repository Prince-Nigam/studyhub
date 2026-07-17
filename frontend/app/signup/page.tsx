'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, BookOpen, Mail, Lock,
  User, Phone, ArrowRight, Loader2, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface SignupForm {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const getStrength = (pwd: string) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const strengthConfig = [
  { label: '', color: '' },
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f59e0b' },
  { label: 'Good',   color: '#06b6d4' },
  { label: 'Strong', color: '#10b981' },
];

export default function SignupPage() {
  const [showPwd, setShowPwd]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const { register: authRegister } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch('password', '');
  const strength = password ? getStrength(password) : 0;
  const sc       = strengthConfig[strength];

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await authRegister({
        fullName: data.fullName,
        email:    data.email,
        mobile:   data.mobile,
        password: data.password,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasError?: boolean) =>
    `w-full py-3.5 rounded-xl text-white placeholder-slate-500 text-sm transition-all outline-none
    bg-slate-800/60 border ${hasError
      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
      : 'border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
    }`;

  return (
    <div className="min-h-screen flex bg-[#05071a] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 bg-violet-600 -top-20 -left-20" />
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] opacity-15 bg-emerald-500 bottom-10 right-0" />
        <div className="absolute w-[250px] h-[250px] rounded-full blur-[60px] opacity-10 bg-pink-500 top-1/3 left-2/3" />

        <div className="absolute inset-0 opacity-[0.04]"
          style={{backgroundImage:'linear-gradient(rgba(124,58,237,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,1) 1px,transparent 1px)',backgroundSize:'50px 50px'}} />

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/40"
          >
            <BookOpen size={36} className="text-white" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-4"
          >
            Start your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              learning journey
            </span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg mb-10"
          >
            Join thousands of students scoring higher with our platform.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 text-left"
          >
            {[
              '✅ Free access to Class 1–12 notes & videos',
              '✅ Chapter-wise MCQ tests with explanations',
              '✅ Attendance tracking & progress dashboard',
              '✅ Leaderboard & performance analytics',
              '✅ Download notes for offline study',
            ].map((b) => (
              <div key={b} className="flex items-center gap-3 text-slate-300 text-sm">
                <span>{b}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[#080c26]" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-violet-500/30">
              <BookOpen size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white">StudyPlatform</h1>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/40 shadow-2xl">
            <div className="mb-7">
              <h1 className="text-3xl font-black text-white mb-1.5">Create Account 🚀</h1>
              <p className="text-slate-400 text-sm">Sign up free — takes less than a minute</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' }
                    })}
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    className={`${inputCls(!!errors.fullName)} pl-11 pr-4`}
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-xs mt-1">⚠ {errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                    })}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`${inputCls(!!errors.email)} pl-11 pr-4`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">⚠ {errors.email.message}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }
                    })}
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    className={`${inputCls(!!errors.mobile)} pl-11 pr-4`}
                  />
                </div>
                {errors.mobile && <p className="text-red-400 text-xs mt-1">⚠ {errors.mobile.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' }
                    })}
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputCls(!!errors.password)} pl-11 pr-12`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: strength >= i ? sc.color : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: sc.color || '#64748b' }}>
                      {sc.label ? `Password strength: ${sc.label}` : ''}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1">⚠ {errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    {...register('confirmPassword', { required: 'Please confirm your password' })}
                    type={showConf ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputCls(!!errors.confirmPassword)} pl-11 pr-12`}
                  />
                  <button type="button" onClick={() => setShowConf(!showConf)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">⚠ {errors.confirmPassword.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(124,58,237,0.4)',
                }}
              >
                {loading
                  ? <><Loader2 size={20} className="animate-spin" /> Creating account...</>
                  : <><CheckCircle size={18} /> Create Free Account</>
                }
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
