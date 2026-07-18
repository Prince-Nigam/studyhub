'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy, BarChart2, Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import api from '@/services/api';
import toast from 'react-hot-toast';

type TestState = 'intro' | 'taking' | 'submitted';

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<TestState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prevAttempts, setPrevAttempts] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const [testRes, resultsRes] = await Promise.all([
          api.get(`/tests/${params.id}`),
          api.get(`/users/my-results`).catch(() => ({ data: { data: [] } })),
        ]);
        setTest(testRes.data.data);
        setTimeLeft(testRes.data.data.timeLimit * 60);

        // Check previous attempts
        const prevResults = (resultsRes.data.data || []).filter((r: any) =>
          (r.testId?._id || r.testId) === params.id
        );
        setPrevAttempts(prevResults.length);
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Test not found');
        router.push('/dashboard/tests');
      } finally { setLoading(false); }
    };
    fetchTest();
  }, [params.id]);

  // Timer
  useEffect(() => {
    if (state !== 'taking' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
      setTimeTaken(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state, timeLeft]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersArray = test.questions.map((q: any) => ({
        questionId: q._id,
        selectedOption: answers[q._id] ?? null
      }));
      const res = await api.post(`/tests/${params.id}/submit`, {
        answers: answersArray,
        timeTaken
      });
      setResult(res.data.result);
      setState('submitted');
      toast(res.data.message, { icon: res.data.result.passed ? '🎉' : '📚' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to submit test');
    } finally { setSubmitting(false); }
  }, [answers, test, params.id, timeTaken, submitting]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={48} className="animate-spin text-violet-500" />
    </div>
  );

  if (!test) return null;

  const card = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm';
  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const progress = test.questions?.length ? (answeredCount / test.questions.length) * 100 : 0;

  // Intro screen
  if (state === 'intro') return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/dashboard/tests')}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'none', background:'rgba(255,255,255,0.06)', color:'#94a3b8', fontWeight:600, fontSize:13, cursor:'pointer', marginBottom:16 }}>
        ← Back to Tests
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border ${card} text-center`}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <Brain size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-black mb-2">{test.title}</h1>
        {test.subjectId && <p className="text-violet-400 font-semibold mb-4">{test.subjectId.name} • {test.classId?.name}</p>}
        {test.description && <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>{test.description}</p>}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-violet-400">{test.totalQuestions}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Questions</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-blue-400 flex items-center justify-center gap-1">
              <Clock size={20} />{test.timeLimit}m
            </p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Time Limit</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-amber-400">{test.totalMarks}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Marks</p>
          </div>
        </div>

        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6 space-y-1 text-left rounded-xl p-4 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
          <p>✅ Passing marks: {test.passingMarks}/{test.totalMarks}</p>
          <p>⏰ Timer starts when you click Start Test</p>
          <p>⚡ Results shown immediately after submission</p>
          <p>📊 Detailed explanation for each answer provided</p>
          {test.maxAttempts > 0 && (
            <p>🔁 Attempts allowed: {test.maxAttempts} | Your attempts: {prevAttempts}</p>
          )}
          {test.maxAttempts === 0 && <p>🔁 Unlimited attempts allowed</p>}
        </div>

        {/* Attempt check */}
        {test.maxAttempts > 0 && prevAttempts >= test.maxAttempts ? (
          <div style={{ padding:'16px', borderRadius:14, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', textAlign:'center', marginBottom:12 }}>
            <p style={{ color:'#f87171', fontWeight:700, fontSize:15, marginBottom:4 }}>
              ❌ Maximum attempts reached ({prevAttempts}/{test.maxAttempts})
            </p>
            <p style={{ color:'#94a3b8', fontSize:13 }}>You cannot attempt this test again.</p>
            <button onClick={() => router.push('/dashboard/results')}
              style={{ marginTop:12, padding:'8px 20px', borderRadius:10, border:'none', background:'rgba(239,68,68,0.2)', color:'#f87171', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              View My Results →
            </button>
          </div>
        ) : (
          <button
            onClick={() => setState('taking')}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-violet-500/25 transition-all hover:-translate-y-1"
          >
            {prevAttempts > 0 ? `🔁 Re-attempt Test (${prevAttempts}/${test.maxAttempts || '∞'} used)` : '🚀 Start Test'}
          </button>
        )}
      </motion.div>
    </div>
  );

  // Test taking
  if (state === 'taking') {
    const question = test.questions[currentQ];
    const timePercent = (timeLeft / (test.timeLimit * 60)) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        {/* Header bar */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-4 ${card}`}>
          <div>
            <p className="text-sm font-semibold">{test.title}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Q{currentQ + 1} of {test.questions.length} • {answeredCount} answered
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400'} font-mono font-bold`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} mb-6 overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className={`p-6 rounded-2xl border ${card} mb-4`}
          >
            <div className="flex items-start gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {currentQ + 1}
              </span>
              <p className="font-semibold text-lg leading-relaxed">{question.questionText}</p>
            </div>

            <div className="space-y-3">
              {question.options.map((opt: any, idx: number) => {
                const isSelected = answers[question._id] === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnswers(prev => ({ ...prev, [question._id]: idx }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-700/50'
                        : 'border-slate-200 hover:border-violet-300 bg-slate-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isSelected ? 'border-violet-500 bg-violet-500 text-white' : isDark ? 'border-slate-600' : 'border-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{opt.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 disabled:opacity-30' : 'bg-slate-100 hover:bg-slate-200 disabled:opacity-30'} transition-all`}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5 overflow-x-auto max-w-xs">
            {test.questions.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${
                  idx === currentQ ? 'bg-violet-500 text-white' :
                  answers[test.questions[idx]._id] !== undefined && answers[test.questions[idx]._id] !== null
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQ === test.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-70"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : '✅'} Submit
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(q => Math.min(test.questions.length - 1, q + 1))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results screen
  if (state === 'submitted' && result) return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-3xl border ${card} text-center mb-6`}
      >
        <div className="text-6xl mb-4">{result.passed ? '🎉' : '📚'}</div>
        <h2 className="text-2xl font-black mb-1">{result.passed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
          {result.passed ? 'You passed the test!' : `You need ${test.passingMarks - result.score} more marks to pass.`}
        </p>

        {/* Score circle */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-36 h-36 rounded-full border-4 ${result.passed ? 'border-green-500' : 'border-amber-500'} flex flex-col items-center justify-center`}>
            <span className={`text-4xl font-black ${result.passed ? 'text-green-400' : 'text-amber-400'}`}>{result.percentage}%</span>
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{result.score}/{result.totalMarks}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-xl font-black text-green-400">{result.correctAnswers}</p>
            <p className="text-xs text-slate-500">Correct</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-xl font-black text-red-400">{result.wrongAnswers}</p>
            <p className="text-xs text-slate-500">Wrong</p>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className="text-xl font-black text-slate-400">{result.skipped}</p>
            <p className="text-xs text-slate-500">Skipped</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/tests')}
            className={`flex-1 py-3 rounded-xl font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition-all`}
          >
            Back to Tests
          </button>
          <button
            onClick={() => router.push('/dashboard/results')}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
          >
            View All Results
          </button>
        </div>
      </motion.div>

      {/* Answer review */}
      {result.questions && (
        <div className="space-y-4">
          <h3 className="text-lg font-black">Answer Review</h3>
          {result.questions.map((q: any, i: number) => {
            const userAnswer = result.answers?.[i];
            const isCorrect = userAnswer?.isCorrect;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect
                    ? <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                    : <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className="font-semibold">{q.questionText}</p>
                </div>

                <div className="space-y-2 ml-7">
                  {q.options.map((opt: any, idx: number) => {
                    const isUser = userAnswer?.selectedOption === idx;
                    const isRight = opt.isCorrect;

                    return (
                      <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                        isRight ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
                        isUser && !isRight ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <span className="font-bold text-xs">{String.fromCharCode(65 + idx)}.</span>
                        {opt.text}
                        {isRight && <CheckCircle size={14} className="ml-auto flex-shrink-0" />}
                        {isUser && !isRight && <XCircle size={14} className="ml-auto flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className={`mt-3 ml-7 p-3 rounded-xl text-sm ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return null;
}
