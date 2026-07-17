'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Search, Filter } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import Link from 'next/link';

export default function DownloadsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/notes?isDownloadable=true&limit=30');
        setNotes(res.data.data);
      } catch { } finally { setLoading(false); }
    };
    fetchNotes();
  }, []);

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase())
  );

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Downloads</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Download notes, PDFs, assignments and study materials</p>
      </motion.div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search downloadable materials..."
          className={`w-full pl-9 pr-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-violet-500 transition-all`}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Download size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No downloadable materials yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${card} card-hover`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                {note.type === 'pdf' ? '📄' : note.type === 'docx' ? '📝' : note.type === 'ppt' ? '📊' : '✍️'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{note.title}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {note.subjectId?.name} • {note.classId?.name} • {note.type?.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'} px-2 py-1 rounded-full`}>
                  {note.downloadCount || 0} downloads
                </span>
                {note.fileUrl ? (
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-bold hover:bg-violet-600 transition-colors"
                  >
                    <Download size={12} /> Download
                  </a>
                ) : (
                  <Link href={`/dashboard/notes/${note._id}`}>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-600 transition-colors">
                      View
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
