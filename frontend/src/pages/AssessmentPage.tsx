import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { AppShell } from '../components/layout/AppShell';
import { PhaseStepper } from '../components/assessment/PhaseStepper';
import { ProblemPanel } from '../components/assessment/ProblemPanel';
import { MonacoJavaEditor } from '../components/editor/MonacoJavaEditor';
import { TestConsolePanel } from '../components/editor/TestConsolePanel';
import { GuardedAIPanel } from '../components/assessment/GuardedAIPanel';
import { VerificationReportModal } from '../components/assessment/VerificationReportModal';

export const AssessmentPage: React.FC = () => {
  const { questionId, sessionId } = useParams<{ questionId?: string; sessionId?: string }>();
  const { session, startSession, loadSession, isLoading, error } = useAssessmentStore();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else if (questionId) {
      if (!session || session.question.id !== questionId) {
        startSession(questionId);
      }
    } else if (!session) {
      startSession();
    }
  }, [questionId, sessionId]);

  if (isLoading && !session) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center text-blue-600 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold">Initializing Guarded Assessment Environment...</span>
        </div>
      </AppShell>
    );
  }

  if (error && !session) {
    return (
      <AppShell>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="text-rose-600 text-base font-bold">Failed to Load Assessment</div>
          <p className="text-xs text-slate-500 max-w-md">{error}</p>
          <button
            onClick={() => startSession(questionId)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20"
          >
            Retry Assessment
          </button>
        </div>
      </AppShell>
    );
  }

  if (!session) return null;

  return (
    <AppShell>
      <div className="h-full flex flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Top Phase Stepper */}
        <PhaseStepper state={session.state} />

        {/* 3-Pane IDE Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Pane: Problem Description (3 cols) */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            <ProblemPanel question={session.question} />
          </div>

          {/* Center Pane: Editor + Console (5 cols) */}
          <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
            <div className="flex-1 min-h-[300px]">
              <MonacoJavaEditor />
            </div>
            <div className="h-48 shrink-0">
              <TestConsolePanel />
            </div>
          </div>

          {/* Right Pane: Guarded AI Assistant (4 cols) */}
          <div className="lg:col-span-4 h-full overflow-hidden">
            <GuardedAIPanel />
          </div>
        </div>

        {/* Verification Score Modal */}
        <VerificationReportModal />
      </div>
    </AppShell>
  );
};
