import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import { Play, Send, RotateCcw, Code2, AlertTriangle } from 'lucide-react';

export const MonacoJavaEditor: React.FC = () => {
  const {
    currentCode,
    updateCode,
    resetCodeToStarter,
    runCode,
    submitAssessment,
    session,
    isExecuting,
    isSubmitting,
    restoreVersion,
    error,
  } = useAssessmentStore();

  const editorRef = useRef<any>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Ctrl+Enter -> Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });

    // Ctrl+Shift+Enter -> Submit Code
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        submitAssessment();
      }
    );
  };

  const handleConfirmReset = () => {
    resetCodeToStarter();
    setShowResetConfirm(false);
  };

  const isCodeUnlocked =
    session?.state === 'CODE_READY' ||
    session?.state === 'TESTING' ||
    session?.state === 'DEBUGGING' ||
    session?.state === 'SUBMITTING' ||
    session?.state === 'EVALUATED' ||
    session?.state === 'COMPLETED';

  const isAiGenerated = Boolean(session?.generatedCode) || session?.state === 'CODE_READY' || session?.state === 'TESTING' || session?.state === 'DEBUGGING';

  return (
    <div className="h-full flex flex-col bg-white text-slate-800 relative">
      {/* Lock Overlay if candidate has not passed Reasoning steps */}
      {!isCodeUnlocked && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl max-w-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold">
              🔒
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Java Editor Locked</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete Step 1 (Problem Understanding), Step 2 (Algorithm & DS Plan), and Step 3 (Implementation Prompt) in the Guarded AI panel to generate and unlock Java code execution.
            </p>
          </div>
        </div>
      )}

      {/* Editor Header Toolbar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Main.java</span>
            {isAiGenerated ? (
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AI Generated from Implementation Prompt
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Java 24
              </span>
            )}
          </div>

          {/* Version History Dropdown */}
          {session?.codeVersions && session.codeVersions.length > 0 && (
            <div className="relative group text-xs">
              <select
                onChange={(e) => {
                  const ver = session.codeVersions.find((v) => v.id === e.target.value);
                  if (ver) restoreVersion(ver.code);
                }}
                className="bg-white text-slate-700 border border-slate-200 text-[11px] font-mono px-2.5 py-1 rounded-md focus:outline-none cursor-pointer shadow-sm"
              >
                <option value="">History Checkpoints ({session.codeVersions.length})</option>
                {session.codeVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} - {v.action} ({v.testSummary || 'Draft'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset Starter Code"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => runCode()}
            disabled={isExecuting || isSubmitting || !isCodeUnlocked}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isExecuting ? 'Running...' : 'Run (Ctrl+Enter)'}</span>
          </button>

          <button
            onClick={() => submitAssessment()}
            disabled={isExecuting || isSubmitting || !isCodeUnlocked}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Backend Guard Error Toast */}
      {error && (
        <div className="bg-rose-50 px-4 py-2 border-b border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </span>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 relative border-b border-slate-200">
        <Editor
          height="100%"
          language="java"
          theme="light"
          value={currentCode}
          onChange={(val) => updateCode(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            formatOnPaste: true,
            formatOnType: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Reset Code Confirmation</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reset your Java code to the empty starter template? Any unsaved edits for this question will be discarded.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow"
              >
                Reset Starter Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
