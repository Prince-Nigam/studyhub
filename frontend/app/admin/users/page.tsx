'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Ban, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '20' });
      if (search) params.append('search', search);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await api.put(`/users/${userId}/block`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    } catch { toast.error('Failed to update user status'); }
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => router.push('/admin/dashboard')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', marginBottom:12 }}>
        ← Dashboard
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Manage Users</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{total} registered students</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name, email or mobile..."
            className={`w-full pl-9 pr-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 transition-all`}
          />
        </div>
        <button onClick={fetchUsers} className="px-5 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
          Search
        </button>
      </div>

      <div className={`rounded-2xl border ${card} overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-indigo-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users size={60} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                  {['Student', 'Email', 'Mobile', 'Class', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{user.mobile}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{user.selectedClass || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBlock(user._id, user.isBlocked)}
                          title={user.isBlocked ? 'Unblock' : 'Block'}
                          className={`p-1.5 rounded-lg ${user.isBlocked ? 'text-green-400 hover:bg-green-500/10' : 'text-amber-400 hover:bg-amber-500/10'} transition-colors`}
                        >
                          {user.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
