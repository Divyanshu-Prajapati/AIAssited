import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { AppShell } from '../components/layout/AppShell';
import {
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  Zap,
  History as HistoryIcon,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { startSession, isLoading } = useAssessmentStore();
  const [data, setData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleStartMode = async (mode: string) => {
    await startSession(undefined, mode as any);
    navigate('/assessment');
  };

  if (loadingDashboard) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center text-blue-600 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold">Loading assessment analytics...</span>
        </div>
      </AppShell>
    );
  }

  const chartData = Object.entries(data?.skillProfile?.topicStrength || {}).map(
    ([topic, score]) => ({
      topic,
      score: score as number,
    })
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Top Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-7 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                  DSA Coding Assessment Simulator
                </span>
                <span className="text-xs font-mono text-blue-100">Candidate: {data?.user?.name || 'Engineer'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Master Technical Coding Assessments with Guarded AI
              </h1>
              <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                Experience realistic HackerRank & Capgemini-style AI-assisted DSA assessments with local code execution, hidden test validation, and adaptive difficulty.
              </p>
            </div>

            <button
              onClick={() => handleStartMode('AI_ASSISTED')}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-black/10 transition-all active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Start Practice Assessment</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Problems Solved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{data?.solved || 0}</div>
            <div className="text-[11px] text-slate-500">Out of {data?.totalProblems || 118} Bank Questions</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Accuracy Rate</span>
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{data?.accuracy || 0}%</div>
            <div className="text-[11px] text-slate-500">{data?.attempted || 0} Total Submissions</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Average Score</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{data?.averageScore || 0} / 10</div>
            <div className="text-[11px] text-slate-500">Guarded Evaluation Average</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Hints Escalated</span>
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{data?.hintsUsed || 0}</div>
            <div className="text-[11px] text-slate-500">Progressive Clues Used</div>
          </div>
        </div>

        {/* Practice Modes Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Select Practice Assessment Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleStartMode('AI_ASSISTED')}
              className="bg-white hover:bg-blue-50/50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group space-y-3 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI-Assisted Assessment</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Guarded state-machine evaluation requiring understanding & plan breakdown before Java code execution.
                </p>
              </div>
            </div>

            <div
              onClick={() => handleStartMode('TIMED')}
              className="bg-white hover:bg-amber-50/50 p-6 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group space-y-3 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Timed Assessment (45m)</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Simulated timed test environment with persistent timer and automatic submission upon expiry.
                </p>
              </div>
            </div>

            <div
              onClick={() => handleStartMode('WEAK_AREA')}
              className="bg-white hover:bg-emerald-50/50 p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group space-y-3 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Weak Area Practice</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Adaptive difficulty engine automatically selects questions from your lowest-mastery DSA topics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart & Recent History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Topic Mastery Breakdown
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">19 DSA Categories</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 10)}>
                  <XAxis dataKey="topic" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 70 ? '#10B981' : entry.score >= 40 ? '#3B82F6' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Attempts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-indigo-600" /> Recent Submissions
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {data?.recentAttempts && data.recentAttempts.length > 0 ? (
                data.recentAttempts.slice(0, 5).map((att: any) => (
                  <div
                    key={att.id}
                    className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 truncate max-w-[160px]">
                      <div className="font-bold text-slate-900 truncate">{att.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{att.topic}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-emerald-700">{att.score}/10</div>
                      <div className="text-[10px] text-slate-500">{att.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No recent submission attempts yet. Start practice above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
