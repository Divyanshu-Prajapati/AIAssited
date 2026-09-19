import React from 'react';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const VerificationReportModal: React.FC = () => {
  const { scoreReport, session, startSession, clearSession } = useAssessmentStore();
  const navigate = useNavigate();

  if (!scoreReport || !session) return null;

  const handleNextProblem = async () => {
    await startSession();
  };

  const handleGoDashboard = () => {
    clearSession();
    navigate('/dashboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">ACCEPTED</span>;
      case 'ACCEPTED_BUT_INEFFICIENT':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">ACCEPTED (Suboptimal Complexity)</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assessment Verification Report</h2>
              <p className="text-xs text-slate-500 font-mono">
                {session.question.title} ({session.question.topic})
              </p>
            </div>
          </div>
          {getStatusBadge(scoreReport.status)}
        </div>

        {/* Big Score Card */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5 rounded-2xl border border-blue-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-800 font-bold uppercase tracking-wider">Overall Assessment Score</div>
            <div className="text-4xl font-extrabold text-slate-900 mt-1 font-mono">
              {scoreReport.overallScore} <span className="text-xl text-slate-400 font-normal">/ 10</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">{scoreReport.feedbackSummary}</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-white font-mono text-xl font-bold text-blue-600 shadow-sm">
            {Math.round((scoreReport.overallScore / 10) * 100)}%
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Correctness (Tests)</span>
            <div className="text-lg font-bold text-emerald-700 font-mono">{scoreReport.correctnessScore} / 4.0</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Time Complexity</span>
            <div className="text-lg font-bold text-amber-700 font-mono">{scoreReport.timeComplexityScore} / 2.0</div>
            <span className="text-[10px] text-slate-500 block truncate">{scoreReport.detectedTimeComplexity}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Space Complexity</span>
            <div className="text-lg font-bold text-blue-700 font-mono">{scoreReport.spaceComplexityScore} / 1.0</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Edge Cases (Hidden)</span>
            <div className="text-lg font-bold text-indigo-700 font-mono">{scoreReport.edgeCaseScore} / 1.0</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Code Quality</span>
            <div className="text-lg font-bold text-purple-700 font-mono">{scoreReport.codeQualityScore} / 1.0</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Reasoning & Prompt</span>
            <div className="text-lg font-bold text-teal-700 font-mono">{scoreReport.reasoningScore} / 1.0</div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="space-y-3 text-xs">
          {scoreReport.strengths.length > 0 && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1.5 text-slate-800">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demonstrated Strengths:
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 font-sans">
                {scoreReport.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {scoreReport.areasToImprove.length > 0 && (
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1.5 text-slate-800">
              <span className="font-bold text-amber-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-600" /> Recommendation for Improvement:
              </span>
              <ul className="list-disc list-inside text-slate-700 space-y-1 font-sans">
                {scoreReport.areasToImprove.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={handleGoDashboard}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            Dashboard
          </button>

          <button
            onClick={handleNextProblem}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-100" />
            <span>Next Adaptive Problem</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
