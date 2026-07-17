'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Phone, BookOpen, Lock, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    selectedClass: user?.selectedClass || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(profileData).forEach(([k, v]) => formData.append(k, v));
      if (profilePic) formData.append('profilePicture', profilePic);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Your Profile</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Manage your account information and settings</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile picture card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border ${card} flex flex-col items-center text-center`}
        >
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600">
              {previewUrl ? (
                <Image src={previewUrl} alt="Profile" width={112} height={112} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-4xl">
                  {user?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-violet-500 border-4 border-slate-800 flex items-center justify-center text-white hover:bg-violet-600 transition-colors"
            >
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <h2 className="font-black text-xl">{user?.fullName}</h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-2`}>{user?.email}</p>
          <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold capitalize">
            {user?.role}
          </span>

          {/* Study progress */}
          <div className={`w-full mt-5 pt-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} space-y-3`}>
            {[
              { label: 'Tests Attempted', value: user?.studyProgress?.totalTestsAttempted || 0 },
              { label: 'Videos Watched', value: user?.studyProgress?.totalVideosWatched || 0 },
              { label: 'Notes Read', value: user?.studyProgress?.totalNotesRead || 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</span>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="md:col-span-2 space-y-5">
          {/* Edit profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl border ${card}`}
          >
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <User size={18} className="text-violet-400" /> Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                <input
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(p => ({ ...p, fullName: e.target.value }))}
                  className={input}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                <input value={user?.email} disabled className={`${input} opacity-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mobile</label>
                <input
                  value={profileData.mobile}
                  onChange={(e) => setProfileData(p => ({ ...p, mobile: e.target.value }))}
                  className={input}
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Selected Class</label>
                <select
                  value={profileData.selectedClass}
                  onChange={(e) => setProfileData(p => ({ ...p, selectedClass: e.target.value }))}
                  className={input}
                >
                  <option value="">Select your class</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={`Class ${i+1}`}>Class {i+1}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="mt-5 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </motion.div>

          {/* Change password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl border ${card}`}
          >
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Lock size={18} className="text-violet-400" /> Change Password
            </h3>

            <div className="space-y-4">
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div key={field}>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    value={passwordData[field as keyof typeof passwordData]}
                    onChange={(e) => setPasswordData(p => ({ ...p, [field]: e.target.value }))}
                    className={input}
                    placeholder="••••••••"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={pwLoading}
              className="mt-5 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-70"
            >
              {pwLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
