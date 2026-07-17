'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

export default function SubjectNotesPage() {
  const params   = useParams();
  const grade    = params.grade as string;
  const subName  = decodeURIComponent(params.subject as string);
  const { theme } = useTheme();
  const isDark   = theme === 'dark';
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const classRes = await api.get('/classes');
        const cls = classRes.data.data.find((c: any) => c.grade === parseInt(grade));
        if (!cls) return;
        const subRes = await api.get(`/subjects?classId=${cls._id}`);
        const sub = subRes.data.data.find((s: any) => s.name.toLowerCase() === subName.toLowerCase());
        if (!sub) return;
        const nRes = await api.get(`/notes?subjectId=${sub._id}&limit=50`);
        setNotes(nRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [grade, subName]);

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-5xl mx-auto">
      <Link href={`/dashboard/classes/${grade}/subjects/${encodeURIComponent(subName)}`}
        className={`inline-flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>
        <ArrowLeft size={16} /> Back to {subName}
      </Link>
      <h1 className="text-2xl font-black mb-2">{subName} – Notes</h1>
      <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Class {grade} | {notes.length} notes</p>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 skeleton rounded-xl"/>)}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20"><FileText size={48} className="text-slate-600 mx-auto mb-3"/><p className="text-slate-500">No notes yet</p></div>
      ) : (
        <div className="space-y-3">
          {notes.map((note, i) => (
            <motion.div key={note._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${card} card-hover`}>
              <span className="text-2xl">{note.type==='pdf'?'📄':note.type==='docx'?'📝':'✍️'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{note.title}</p>
                <p className="text-xs text-slate-500">{note.chapterId?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Eye size={11}/>{note.viewCount}</span>
                <Link href={`/dashboard/notes/${note._id}`}>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white transition-all">View</button>
                </Link>
                {note.fileUrl && note.isDownloadable && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                    <button className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 transition-colors"><Download size={14}/></button>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
