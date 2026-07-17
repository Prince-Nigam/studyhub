'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, cRes] = await Promise.all([api.get('/users?limit=100'), api.get('/classes')]);
        setUsers(uRes.data.data);
        setClasses(cRes.data.data);
      } catch { }
    };
    fetchData();
  }, []);

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubject('');
    if (classId) {
      try {
        const res = await api.get(`/subjects?classId=${classId}`);
        setSubjects(res.data.data);
      } catch { }
    }
  };

  const handleMarkAll = (status: string) => {
    const newData: Record<string, string> = {};
    users.forEach(u => newData[u._id] = status);
    setAttendanceData(newData);
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedDate) { toast.error('Select subject and date'); return; }
    setSaving(true);
    try {
      const records = Object.entries(attendanceData).map(([userId, status]) => ({ userId, status }));
      await api.post('/attendance/bulk', {
        subjectId: selectedSubject,
        classId: selectedClass,
        date: selectedDate,
        records
      });
      toast.success('Attendance saved!');
      setAttendanceData({});
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const input = `px-4 py-2.5 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'} focus:outline-none focus:border-indigo-500 text-sm`;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Mark Attendance</h1>

      <div className={`p-5 rounded-2xl border ${card} mb-6`}>
        <div className="flex flex-wrap gap-3 mb-4">
          <select value={selectedClass} onChange={e => handleClassChange(e.target.value)} className={input}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={input}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={input} />
        </div>

        {users.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => handleMarkAll('present')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all">✓ Mark All Present</button>
            <button onClick={() => handleMarkAll('absent')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">✗ Mark All Absent</button>
          </div>
        )}
      </div>

      {users.length > 0 && (
        <div className={`rounded-2xl border ${card} overflow-hidden mb-4`}>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Student</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Present</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Absent</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {users.map((user) => (
                <tr key={user._id} className={`${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.fullName?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm">{user.fullName}</span>
                    </div>
                  </td>
                  {['present', 'absent', 'late'].map(status => (
                    <td key={status} className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`attendance-${user._id}`}
                        checked={attendanceData[user._id] === status}
                        onChange={() => setAttendanceData(prev => ({ ...prev, [user._id]: status }))}
                        className={`w-4 h-4 ${status === 'present' ? 'accent-green-500' : status === 'absent' ? 'accent-red-500' : 'accent-amber-500'}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.length > 0 && (
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Save Attendance
        </button>
      )}
    </div>
  );
}
