'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Video, FileText, Brain, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

const defaultSubjects: Record<number, Array<{ name: string; icon: string; color: string; desc: string }>> = {
  9: [
    { name: 'Mathematics', icon: '➕', color: 'from-blue-500 to-cyan-500', desc: 'Algebra, Geometry, Trigonometry and more' },
    { name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500', desc: 'Physics, Chemistry, Biology' },
    { name: 'English', icon: '📚', color: 'from-violet-500 to-purple-600', desc: 'Literature, Grammar, Writing' },
    { name: 'Hindi', icon: '🇮🇳', color: 'from-orange-500 to-amber-500', desc: 'हिन्दी साहित्य और व्याकरण' },
    { name: 'Social Science', icon: '🌍', color: 'from-pink-500 to-rose-500', desc: 'History, Geography, Civics' },
    { name: 'Computer', icon: '💻', color: 'from-indigo-500 to-blue-600', desc: 'Programming, Hardware, Applications' },
  ],
  10: [
    { name: 'Mathematics', icon: '➕', color: 'from-blue-500 to-cyan-500', desc: 'Real Numbers, Algebra, Geometry, Trigonometry' },
    { name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500', desc: 'Physics, Chemistry, Biology' },
    { name: 'English', icon: '📚', color: 'from-violet-500 to-purple-600', desc: 'First Flight, Footprints' },
    { name: 'Hindi', icon: '🇮🇳', color: 'from-orange-500 to-amber-500', desc: 'स्पर्श, संचयन' },
    { name: 'Social Science', icon: '🌍', color: 'from-pink-500 to-rose-500', desc: 'India & World, Resources, Democracy' },
    { name: 'Computer', icon: '💻', color: 'from-indigo-500 to-blue-600', desc: 'Programming Fundamentals' },
  ],
  11: [
    { name: 'Physics', icon: '⚡', color: 'from-yellow-500 to-amber-500', desc: 'Mechanics, Waves, Thermodynamics' },
    { name: 'Chemistry', icon: '🧪', color: 'from-green-500 to-emerald-500', desc: 'Organic, Inorganic, Physical Chemistry' },
    { name: 'Mathematics', icon: '➕', color: 'from-blue-500 to-cyan-500', desc: 'Calculus, Vectors, 3D Geometry' },
    { name: 'Biology', icon: '🧬', color: 'from-pink-500 to-rose-500', desc: 'Cell Biology, Genetics, Ecology' },
    { name: 'English', icon: '📚', color: 'from-violet-500 to-purple-600', desc: 'Hornbill, Snapshots' },
    { name: 'Computer Science', icon: '💻', color: 'from-indigo-500 to-blue-600', desc: 'Python, Data Structures' },
  ],
  12: [
    { name: 'Physics', icon: '⚡', color: 'from-yellow-500 to-amber-500', desc: 'Electrostatics, Optics, Modern Physics' },
    { name: 'Chemistry', icon: '🧪', color: 'from-green-500 to-emerald-500', desc: 'Solid State, Electrochemistry, Polymers' },
    { name: 'Mathematics', icon: '➕', color: 'from-blue-500 to-cyan-500', desc: 'Integration, Differential Equations' },
    { name: 'Biology', icon: '🧬', color: 'from-pink-500 to-rose-500', desc: 'Reproduction, Genetics, Biotechnology' },
    { name: 'English', icon: '📚', color: 'from-violet-500 to-purple-600', desc: 'Flamingo, Vistas' },
    { name: 'Computer Science', icon: '💻', color: 'from-indigo-500 to-blue-600', desc: 'Advanced Python, SQL, Networks' },
  ],
};

// Default for other classes
const defaultSubjectList = (grade: number) => [
  { name: 'Mathematics', icon: '➕', color: 'from-blue-500 to-cyan-500', desc: 'Numbers, Operations, Geometry' },
  { name: 'English', icon: '📚', color: 'from-violet-500 to-purple-600', desc: 'Reading, Writing, Grammar' },
  { name: 'Hindi', icon: '🇮🇳', color: 'from-orange-500 to-amber-500', desc: 'हिन्दी भाषा और साहित्य' },
  { name: grade >= 4 ? 'EVS/Science' : 'EVS', icon: '🌿', color: 'from-green-500 to-emerald-500', desc: 'Environment & Science' },
  ...(grade >= 4 ? [{ name: 'Computer', icon: '💻', color: 'from-indigo-500 to-blue-600', desc: 'Computer Basics' }] : []),
];

export default function ClassDetailPage() {
  const params = useParams();
  const grade = parseInt(params.grade as string);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Try API first
        const classRes = await api.get('/classes');
        const cls = classRes.data.data.find((c: any) => c.grade === grade);
        if (cls) {
          setClassData(cls);
          const subRes = await api.get(`/subjects?classId=${cls._id}`);
          if (subRes.data.data.length > 0) {
            setSubjects(subRes.data.data);
            return;
          }
        }
      } catch { }
      // Fallback to defaults
      const defaultSubs = defaultSubjects[grade] || defaultSubjectList(grade);
      setSubjects(defaultSubs.map((s, i) => ({ ...s, _id: `default-${i}`, isDefault: true })));
    };
    fetchSubjects();
  }, [grade]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard/classes" className={`inline-flex items-center gap-2 text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} mb-4 transition-colors`}>
          <ArrowLeft size={16} /> Back to Classes
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl">
            {grade}
          </div>
          <div>
            <h1 className="text-3xl font-black">Class {grade}</h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              {subjects.length} subjects • Notes, Videos & Tests available
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Notes', color: 'text-violet-400', link: `/dashboard/notes?grade=${grade}` },
          { icon: Video, label: 'Videos', color: 'text-blue-400', link: `/dashboard/videos?grade=${grade}` },
          { icon: Brain, label: 'Tests', color: 'text-pink-400', link: `/dashboard/tests?grade=${grade}` },
          { icon: BookOpen, label: 'Subjects', color: 'text-amber-400', count: subjects.length },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} text-center card-hover`}
          >
            <item.icon size={24} className={`${item.color} mx-auto mb-2`} />
            <p className="font-bold text-sm">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Subjects grid */}
      <h2 className="text-xl font-black mb-4">Subjects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject, i) => (
          <motion.div
            key={subject._id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/dashboard/classes/${grade}/subjects/${encodeURIComponent(subject.name || subject._id)}`}>
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'} card-hover cursor-pointer group relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${subject.color || 'from-violet-500 to-purple-600'} opacity-10 rounded-full -translate-y-6 translate-x-6`} />

                <div className="flex items-start gap-4">
                  <div className={`text-4xl`}>{subject.icon || '📖'}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg mb-1">{subject.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-3`}>{subject.desc || subject.description || 'Study materials available'}</p>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                        <FileText size={10} /> Notes
                      </div>
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                        <Video size={10} /> Videos
                      </div>
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                        <Brain size={10} /> Tests
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className={`${isDark ? 'text-slate-600' : 'text-slate-400'} group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1`} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
