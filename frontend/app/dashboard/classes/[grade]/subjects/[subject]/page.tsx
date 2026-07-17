'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Video, Brain, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function SubjectDetailPage() {
  const params = useParams();
  const grade = params.grade as string;
  const subjectName = decodeURIComponent(params.subject as string);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [chapters, setChapters] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'notes' | 'videos' | 'tests'>('chapters');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // find class by grade
        const classRes = await api.get('/classes');
        const cls = classRes.data.data.find((c: any) => c.grade === parseInt(grade));
        if (!cls) { setLoading(false); return; }

        // find subject by name
        const subRes = await api.get(`/subjects?classId=${cls._id}`);
        const subject = subRes.data.data.find(
          (s: any) => s.name.toLowerCase() === subjectName.toLowerCase()
        );
        if (!subject) { setLoading(false); return; }

        // fetch everything for this subject
        const [chRes, nRes, vRes, tRes] = await Promise.all([
          api.get(`/chapters?subjectId=${subject._id}`),
          api.get(`/notes?subjectId=${subject._id}&limit=20`),
          api.get(`/videos?subjectId=${subject._id}&limit=20`),
          api.get(`/tests?subjectId=${subject._id}&isPublished=true`),
        ]);
        setChapters(chRes.data.data);
        setNotes(nRes.data.data);
        setVideos(vRes.data.data);
        setTests(tRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetchData();
  }, [grade, subjectName]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  const tabs = [
    { id: 'chapters', label: 'Chapters', icon: BookOpen, count: chapters.length },
    { id: 'notes',    label: 'Notes',    icon: FileText, count: notes.length },
    { id: 'videos',   label: 'Videos',   icon: Video,    count: videos.length },
    { id: 'tests',    label: 'Tests',    icon: Brain,    count: tests.length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className={`flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <Link href="/dashboard/classes" className="hover:text-violet-400 transition-colors">Classes</Link>
        <ChevronRight size={14} />
        <Link href={`/dashboard/classes/${grade}`} className="hover:text-violet-400 transition-colors">Class {grade}</Link>
        <ChevronRight size={14} />
        <span className="text-white font-semibold">{subjectName}</span>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl">
            📖
          </div>
          <div>
            <h1 className="text-3xl font-black">{subjectName}</h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Class {grade} · {chapters.length} chapters
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-500 text-white'
                : `${card} hover:border-violet-500/50`
            }`}
          >
            <tab.icon size={20} className="mb-2" />
            <p className="text-xl font-black">{tab.count}</p>
            <p className="text-xs font-medium opacity-80">{tab.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Chapters */}
          {activeTab === 'chapters' && (
            <div className="space-y-3">
              {chapters.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No chapters added yet</p>
                </div>
              ) : chapters.map((ch, i) => (
                <motion.div
                  key={ch._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${card} card-hover`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-400 font-black">
                    {ch.chapterNumber || i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{ch.name}</p>
                    {ch.description && (
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>{ch.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/notes?chapterId=${ch._id}`}>
                      <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-slate-700 text-slate-400 hover:bg-violet-500/20 hover:text-violet-400' : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-600'} transition-colors cursor-pointer`}>
                        Notes
                      </span>
                    </Link>
                    <Link href={`/dashboard/videos?chapterId=${ch._id}`}>
                      <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-slate-700 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'} transition-colors cursor-pointer`}>
                        Videos
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <FileText size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No notes for this subject yet</p>
                </div>
              ) : notes.map((note, i) => (
                <Link key={note._id} href={`/dashboard/notes/${note._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-2xl border ${card} card-hover cursor-pointer group`}
                  >
                    <span className="text-3xl mb-3 block">
                      {note.type === 'pdf' ? '📄' : note.type === 'docx' ? '📝' : '✍️'}
                    </span>
                    <h3 className="font-bold text-sm group-hover:text-violet-400 transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{note.type?.toUpperCase()}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Videos */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Video size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No videos for this subject yet</p>
                </div>
              ) : videos.map((video, i) => (
                <Link key={video._id} href={`/dashboard/videos/${video._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border ${card} card-hover cursor-pointer group overflow-hidden`}
                  >
                    <div className="relative aspect-video bg-slate-700">
                      {video.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video size={30} className="text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-violet-400 transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Tests */}
          {activeTab === 'tests' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Brain size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No tests published for this subject yet</p>
                </div>
              ) : tests.map((test, i) => (
                <Link key={test._id} href={`/dashboard/tests/${test._id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-5 rounded-2xl border ${card} card-hover cursor-pointer group`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Brain size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-violet-400 transition-colors">{test.title}</h3>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>{test.totalQuestions} Q</span>
                      <span>{test.timeLimit} min</span>
                      <span>{test.totalMarks} marks</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
