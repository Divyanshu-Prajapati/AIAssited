import React, { useState } from 'react';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { CheckCircle2, XCircle, Clock, HardDrive, Shield, AlertTriangle } from 'lucide-react';

export const TestConsolePanel: React.FC = () => {
  const { executionResult, isExecuting, isSubmitting } = useAssessmentStore();
  const [selectedTestIdx, setSelectedTestIdx] = useState(0);

  if (isExecuting || isSubmitting) {
    return (
      <div className="h-full bg-white border-t border-slate-200 p-4 flex items-center justify-center text-xs text-blue-600 gap-3">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold">Executing Java code through local sandboxed process...</span>
      </div>
    );
  }

  if (!executionResult) {
    return (
      <div className="h-full bg-white border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Click "Run (Ctrl+Enter)" to execute visible test cases.</span>
        <span className="text-[11px] text-slate-400">Ctrl+Shift+Enter to Submit</span>
      </div>
    );
  }

  const { compiled, compilationError, testResults, passCount, totalCount, totalTimeMs, peakMemoryKb } =
    executionResult;

  if (!compiled) {
    return (
      <div className="h-full bg-white border-t border-slate-200 p-4 font-mono text-xs overflow-y-auto space-y-2">
        <div className="flex items-center gap-2 text-rose-600 font-bold">
          <AlertTriangle className="w-4 h-4" /> Compilation Error
        </div>
        <pre className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-800 text-[11px] whitespace-pre-wrap">
          {compilationError}
        </pre>
      </div>
    );
  }

  const activeTest = testResults[selectedTestIdx] || testResults[0];

  return (
    <div className="h-full flex flex-col bg-white border-t border-slate-200 text-slate-800">
      {/* Test Bar Summary */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold">
            {passCount === totalCount ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed ({passCount}/{totalCount})
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-rose-600" /> Failed ({totalCount - passCount}/{totalCount})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> {totalTimeMs}ms
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> {Math.round(peakMemoryKb / 1024)}MB
            </span>
          </div>
        </div>

        {/* Test Selector Tabs */}
        <div className="flex items-center gap-1">
          {testResults.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTestIdx(idx)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors ${
                selectedTestIdx === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tc.passed ? (
                <CheckCircle2 className={`w-3 h-3 ${selectedTestIdx === idx ? 'text-white' : 'text-emerald-600'}`} />
              ) : (
                <XCircle className={`w-3 h-3 ${selectedTestIdx === idx ? 'text-white' : 'text-rose-600'}`} />
              )}
              <span>Case #{idx + 1}</span>
              {tc.isHidden && <Shield className="w-3 h-3 ml-0.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Test Detail */}
      {activeTest && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {activeTest.isHidden ? (
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 flex items-center gap-3 text-indigo-900 font-sans">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold">Hidden Test Case #{selectedTestIdx + 1}</div>
                <div className="text-[11px] text-indigo-700">
                  Inputs and expected outputs for hidden evaluation tests are protected until assessment completion.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-sans font-medium text-[11px]">Input:</span>
                <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 mt-1 whitespace-pre-wrap text-[11px]">
                  {activeTest.input}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 font-sans font-medium text-[11px]">Expected Output:</span>
                <pre className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-emerald-700 font-bold mt-1 whitespace-pre-wrap text-[11px]">
                  {activeTest.expectedOutput}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 font-sans font-medium text-[11px]">Your Output:</span>
                <pre
                  className={`p-2.5 rounded-lg border ${
                    activeTest.passed
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-bold'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900 font-bold'
                  } mt-1 whitespace-pre-wrap text-[11px]`}
                >
                  {activeTest.actualOutput || (activeTest.errorLog ? `Error: ${activeTest.errorLog}` : 'Empty')}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
