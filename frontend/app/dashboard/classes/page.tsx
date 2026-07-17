'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

const subjectsByClass: Record<number, string[]> = {
  1: ['Mathematics', 'English', 'Hindi', 'EVS'],
  2: ['Mathematics', 'English', 'Hindi', 'EVS'],
  3: ['Mathematics', 'English', 'Hindi', 'EVS'],
  4: ['Mathematics', 'English', 'Hindi', 'EVS', 'Computer'],
  5: ['Mathematics', 'English', 'Hindi', 'EVS', 'Computer'],
  6: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'],
  7: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'],
  8: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'],
  9: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer', 'Sanskrit'],
  10: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer'],
  11: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  12: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
};

const classColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-indigo-500 to-blue-600',
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-teal-500 to-cyan-500',
];

export default function ClassesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        if (res.data.data.length > 0) {
          setClasses(res.data.data);
        } else {
          // Use default classes 1-12
          setClasses(Array.from({ length: 12 }, (_, i) => ({
            _id: String(i + 1),
            grade: i + 1,
            name: `Class ${i + 1}`,
            description: `Complete curriculum for Class ${i + 1}`,
            subjects: subjectsByClass[i + 1]?.length || 4
          })));
        }
      } catch {
        setClasses(Array.from({ length: 12 }, (_, i) => ({
          _id: String(i + 1),
          grade: i + 1,
          name: `Class ${i + 1}`,
          description: `Complete curriculum for Class ${i + 1}`,
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black mb-2">All Classes</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Choose your class to access subjects, notes, videos and tests
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((cls, i) => (
            <motion.div
              key={cls._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/classes/${cls.grade || cls._id}`}>
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} card-hover cursor-pointer group relative overflow-hidden`}>
                  {/* Background gradient */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${classColors[i % classColors.length]} opacity-10 rounded-full -translate-y-6 translate-x-6 group-hover:opacity-20 transition-opacity`} />

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${classColors[i % classColors.length]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-black text-xl">{cls.grade}</span>
                  </div>

                  <h3 className="font-black text-lg mb-1">{cls.name}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-4 line-clamp-2`}>
                    {cls.description || `Complete study material for ${cls.name}`}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(subjectsByClass[cls.grade] || ['Math', 'Science', 'English']).slice(0, 3).map((sub) => (
                        <span key={sub} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          {sub.length > 5 ? sub.substring(0, 4) + '.' : sub}
                        </span>
                      ))}
                    </div>
                    <ArrowRight size={16} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} group-hover:text-violet-400 group-hover:translate-x-1 transition-all`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
