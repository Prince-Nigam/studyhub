'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Bell, Shield, Trash2, LogOut } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const isDark = theme === 'dark';
  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Settings</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Manage your preferences</p>
      </motion.div>

      <div className="space-y-4">
        {/* Theme */}
        <div className={`p-5 rounded-2xl border ${card}`}>
          <h3 className="font-bold mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-amber-400" />}
              <div>
                <p className="font-semibold text-sm">Theme</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isDark ? 'Dark mode enabled' : 'Light mode enabled'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-violet-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Account */}
        <div className={`p-5 rounded-2xl border ${card}`}>
          <h3 className="font-bold mb-4">Account</h3>
          <div className="space-y-3">
            <Link href="/dashboard/profile">
              <div className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-violet-400" />
                  <span className="text-sm font-semibold">Edit Profile & Change Password</span>
                </div>
                <span className="text-slate-500 text-sm">›</span>
              </div>
            </Link>
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'} transition-colors text-red-400`}
            >
              <LogOut size={18} />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>

        {/* About */}
        <div className={`p-5 rounded-2xl border ${card}`}>
          <h3 className="font-bold mb-2">About StudyPlatform</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Premium Full Stack Study Platform for Class 1-12. Featuring notes, videos, MCQ tests, attendance tracking and more.
          </p>
          <p className="text-xs text-slate-500 mt-2">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
