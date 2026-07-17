'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Download, Eye, Search, BookOpen, Filter, Bookmark, Star } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';

const typeColors: Record<string, string> = {
  pdf: 'bg-red-500/20 text-red-400',
  docx: 'bg-blue-500/20 text-blue-400',
  ppt: 'bg-orange-500/20 text-orange-400',
  image: 'bg-green-500/20 text-green-400',
  'rich-text': 'bg-violet-500/20 text-violet-400',
};

const typeIcons: Record<string, string> = {
  pdf: '📄', docx: '📝', ppt: '📊', image: '🖼️', 'rich-text': '✍️'
};

export default function NotesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.append('search', search);
      if (filterType) params.append('type', filterType);

      const res = await api.get(`/notes?${params}`);
      setNotes(res.data.data);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [page, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNotes();
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-2">Study Notes</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Chapter-wise notes, PDFs and study materials</p>
      </motion.div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title or topic..."
            className={`w-full pl-9 pr-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
          />
        </form>

        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className={`px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-violet-500 transition-all`}
        >
          <option value="">All Types</option>
          <option value="rich-text">Rich Text</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="ppt">PPT</option>
          <option value="image">Images</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={60} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No notes found</h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Notes will appear here once added by admin</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note, i) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/dashboard/notes/${note._id}`}>
                  <div className={`p-5 rounded-2xl border ${card} card-hover cursor-pointer group h-full flex flex-col`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{typeIcons[note.type] || '📄'}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColors[note.type] || 'bg-slate-700 text-slate-400'}`}>
                        {note.type?.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors flex-1">
                      {note.title}
                    </h3>

                    {note.subjectId && (
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
                        {note.subjectId.name} • {note.classId?.name}
                      </p>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <span className="flex items-center gap-1"><Eye size={12} /> {note.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Download size={12} /> {note.downloadCount || 0}</span>
                      {note.isDownloadable && <span className="ml-auto text-violet-400">Downloadable</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white disabled:opacity-30' : 'bg-white border-slate-200 text-slate-900 disabled:opacity-30'} hover:bg-violet-500 hover:border-violet-500 hover:text-white transition-all`}
              >
                Previous
              </button>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 12)}
                className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white disabled:opacity-30' : 'bg-white border-slate-200 text-slate-900 disabled:opacity-30'} hover:bg-violet-500 hover:border-violet-500 hover:text-white transition-all`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
