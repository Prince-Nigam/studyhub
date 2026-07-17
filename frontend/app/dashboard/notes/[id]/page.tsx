'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Download, Eye, BookmarkPlus, Share2,
  FileText, Clock, Loader2
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function NoteDetailPage() {
  const params = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${params.id}`);
        setNote(res.data.data);
      } catch {
        toast.error('Note not found');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [params.id]);

  const handleDownload = () => {
    if (note?.fileUrl) {
      window.open(note.fileUrl, '_blank');
      toast.success('Download started!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (!note) return (
    <div className="text-center py-20">
      <FileText size={60} className="text-slate-600 mx-auto mb-4" />
      <p className="text-slate-400">Note not found</p>
      <Link href="/dashboard/notes" className="text-violet-400 hover:underline mt-2 block">
        ← Back to Notes
      </Link>
    </div>
  );

  const card = isDark
    ? 'bg-slate-800/60 border-slate-700/50'
    : 'bg-white border-slate-200 shadow-sm';

  const typeEmojis: Record<string, string> = {
    pdf: '📄', docx: '📝', ppt: '📊', image: '🖼️', 'rich-text': '✍️'
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/notes"
        className={`inline-flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
      >
        <ArrowLeft size={16} /> Back to Notes
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${card} mb-6`}
      >
        <div className="flex items-start gap-5">
          <div className="text-5xl">{typeEmojis[note.type] || '📄'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {note.classId && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {note.classId.name}
                </span>
              )}
              {note.subjectId && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-violet-500/20 text-violet-400">
                  {note.subjectId.name}
                </span>
              )}
              {note.chapterId && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {note.chapterId.name}
                </span>
              )}
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {note.type?.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl font-black mb-3">{note.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> {note.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <Download size={14} /> {note.downloadCount} downloads
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {new Date(note.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {note.tags.map((tag: string) => (
              <span
                key={tag}
                className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-700/50">
          {note.isDownloadable && note.fileUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:-translate-y-0.5"
            >
              <Download size={16} /> Download {note.type?.toUpperCase()}
            </button>
          )}
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}>
            <BookmarkPlus size={16} /> Bookmark
          </button>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} transition-colors`}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </motion.div>

      {/* PDF Viewer */}
      {note.fileUrl && (note.type === 'pdf') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-2xl border ${card} mb-6`}
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-violet-400" /> PDF Viewer
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={`${note.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={note.title}
            />
          </div>
        </motion.div>
      )}

      {/* Image viewer */}
      {note.fileUrl && note.type === 'image' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-2xl border ${card} mb-6`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.fileUrl}
            alt={note.title}
            className="w-full rounded-xl object-contain max-h-[600px]"
          />
        </motion.div>
      )}

      {/* Rich text content */}
      {note.content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl border ${card}`}
        >
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileText size={18} className="text-violet-400" /> Content
          </h2>
          <div
            className={`prose max-w-none ${isDark ? 'prose-invert' : ''} text-sm leading-relaxed whitespace-pre-wrap`}
            style={{ color: isDark ? '#94a3b8' : '#475569' }}
          >
            {note.content}
          </div>
        </motion.div>
      )}
    </div>
  );
}
