'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, Zap, Video, FileText, ExternalLink } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';

const typeIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  test: Zap,
  video: Video,
  note: FileText,
  alert: AlertTriangle,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/20 text-green-400 border-green-500/20',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  test: 'bg-violet-500/20 text-violet-400 border-violet-500/20',
  video: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  note: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
  alert: 'bg-red-500/20 text-red-400 border-red-500/20',
};

export default function NotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { }
  };

  const handleClick = async (notif: any) => {
    if (!notif.isRead) await markRead(notif._id);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-black mb-1">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-violet-400 font-semibold">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white transition-all"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            You'll see updates, alerts and announcements here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || typeColors.info;

            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${card}
                  ${!notif.isRead ? (isDark ? 'border-violet-500/30 bg-violet-500/5' : 'border-violet-200 bg-violet-50/50') : ''}
                  hover:scale-[1.01]`}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-bold text-sm ${!notif.isRead ? 'text-white' : isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {notif.link && (
                    <span style={{ fontSize:11, color:'#a78bfa', display:'inline-flex', alignItems:'center', gap:3, marginTop:4, fontWeight:600 }}>
                      <ExternalLink size={11}/> Tap to open
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
