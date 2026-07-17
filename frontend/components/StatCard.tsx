'use client';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
  delay?: number;
  sub?: string;
}

export default function StatCard({ icon: Icon, label, value, gradient, delay = 0, sub }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} card-hover`}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}
