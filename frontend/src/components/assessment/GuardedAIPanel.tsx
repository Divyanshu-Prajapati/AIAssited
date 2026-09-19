import React, { useState } from 'react';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { AssessmentState } from '../../types';
import {
  Bot,
  Send,
  Lightbulb,
  AlertTriangle,
  Play,
  HelpCircle,
  Lock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const GuardedAIPanel: React.FC = () => {
  const { session, submitUnderstanding, submitPlan, submitImplementation, requestHint, askAI, isLoading } = useAssessmentStore();
  const [inputText, setInputText] = useState('');
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);

  if (!session) return null;

  const { state, aiInteractions, hintsUsed } = session;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const text = inputText;
    setInputText('');

    if (state === 'PROBLEM_LOADED' || state === 'UNDERSTANDING' || state === 'UNDERSTANDING_REVIEW') {
      await submitUnderstanding(text);
    } else if (state === 'PLAN' || state === 'PLAN_REVIEW') {
      await submitPlan(text);
    } else if (state === 'IMPLEMENTATION' || state === 'IMPLEMENTATION_REVIEW') {
      await submitImplementation(text);
    } else {
      await askAI('explain', text);
    }
  };

  const handleAskDebug = async () => {
    await askAI('debug');
  };

  const handleAskDryRun = async () => {
    await askAI('dry_run', 'Trace example inputs step by step');
  };

  const handleRevealSolution = async () => {
    await askAI('solution', undefined, true);
    setShowSolutionConfirm(false);
  };

  const needsImprovement = state === 'UNDERSTANDING_REVIEW' || state === 'PLAN_REVIEW' || state === 'IMPLEMENTATION_REVIEW';

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 text-slate-800">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-sm text-slate-900">Guarded AI Evaluation</h2>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> State Enforced
        </span>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={requestHint}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 transition-colors font-semibold text-[11px]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Hint ({hintsUsed}/6)</span>
          </button>

          <button
            onClick={handleAskDebug}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200 transition-colors font-semibold text-[11px]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Debug Clue</span>
          </button>

          <button
            onClick={handleAskDryRun}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors font-semibold text-[11px]"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dry Run</span>
          </button>
        </div>

        <button
          onClick={() => setShowSolutionConfirm(true)}
          className="text-slate-500 hover:text-rose-600 text-[11px] font-medium flex items-center gap-1"
        >
          <Lock className="w-3 h-3" /> Solution
        </button>
      </div>

      {/* Chat Messages & Banners */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
        {/* State Banner */}
        {needsImprovement ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              {state === 'UNDERSTANDING_REVIEW'
                ? 'Step 1 Needs Improvement'
                : state === 'PLAN_REVIEW'
                ? 'Step 2 Needs Improvement'
                : 'Step 3 Implementation Reasoning Needs Detail'}
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Your response is missing technical specifics or disagrees with your previous step. Review the feedback below and submit a revised prompt.
            </p>
          </div>
        ) : state === 'CODE_GENERATING' ? (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1 animate-pulse">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              AI is generating the implementation from your approved approach...
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Converting your step-by-step reasoning into valid Java code...
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-slate-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {state === 'PROBLEM_LOADED' || state === 'UNDERSTANDING'
                ? 'STEP 1: Problem Understanding'
                : state === 'PLAN'
                ? 'STEP 2: Algorithm & Data Structure Plan'
                : state === 'IMPLEMENTATION'
                ? 'STEP 3: Implementation Prompt'
                : 'STEP 4: Testing & Execution Ready'}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {state === 'PROBLEM_LOADED' || state === 'UNDERSTANDING'
                ? 'Explain what the problem asks, input/output structures, constraints, and edge cases to unlock Step 2.'
                : state === 'PLAN'
                ? 'Propose brute-force vs optimized strategy, data structure selection, and O(N) time/space complexity bounds.'
                : state === 'IMPLEMENTATION'
                ? 'Describe how you want the implementation to be written (input handling, variables, loop steps, complexity).'
                : 'Java implementation generated in Monaco Editor! Run visible tests or debug as needed.'}
            </p>
          </div>
        )}

        {/* Chat Thread */}
        {aiInteractions.map((item, idx) => (
          <div key={idx} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed font-sans shadow-sm font-medium">
                {item.userPrompt}
              </div>
            </div>

            {/* AI Assistant message */}
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[85%] bg-slate-50 text-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs leading-relaxed space-y-2 shadow-sm">
                <div className="whitespace-pre-line font-sans">{item.assistantResponse}</div>
                {item.promptScore > 0 && (
                  <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200 flex items-center justify-between font-mono">
                    <span>Prompt Quality Rating:</span>
                    <span className="font-bold text-emerald-700">{item.promptScore}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              state === 'PROBLEM_LOADED' || state === 'UNDERSTANDING' || state === 'UNDERSTANDING_REVIEW'
                ? 'Submit problem understanding (Inputs, Outputs, Constraints, Edge Cases)...'
                : state === 'PLAN' || state === 'PLAN_REVIEW'
                ? 'Submit algorithm strategy, data structure, and O(N) complexity...'
                : state === 'IMPLEMENTATION' || state === 'IMPLEMENTATION_REVIEW'
                ? 'Describe how you want the implementation to be written...'
                : 'Ask AI assistant for technical guidance or clues...'
            }
            rows={2}
            className="w-full bg-white text-slate-900 text-xs rounded-xl p-3 pr-10 border border-slate-200 focus:border-blue-600 focus:outline-none resize-none shadow-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 text-blue-600 hover:text-blue-700 disabled:opacity-30 p-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>


      {/* Solution Reveal Modal */}
      {showSolutionConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Reveal Solution Warning</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Revealing the solution will conclude guarded evaluation mode for this problem and penalize your final reasoning score. Are you sure you want to reveal the reference solution?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSolutionConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRevealSolution}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow"
              >
                Reveal Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
