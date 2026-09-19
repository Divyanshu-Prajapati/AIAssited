import React, { useState } from 'react';
import { QuestionData } from '../../types';
import {
  FileText,
  Clock,
  HardDrive,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface ProblemPanelProps {
  question: QuestionData;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({ question }) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'examples' | 'constraints'>('statement');
  const [copiedExample, setCopiedExample] = useState<number | null>(null);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(idx);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 text-slate-800">
      {/* Problem Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-500 font-medium">ID: #{question.id}</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${getDifficultyBadge(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {question.topic}
            </span>
          </div>
        </div>

        <h1 className="text-base font-bold text-slate-900 tracking-tight">{question.title}</h1>

        {/* Complexity Goals (Pattern Hidden from Candidate) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Target Time: {question.expectedTimeComplexity}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 shadow-sm">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Space: {question.expectedSpaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Story Banner */}
      <div className="p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-b border-slate-200 text-xs leading-relaxed text-slate-700 flex gap-2">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-900">Scenario Context: </span>
          {question.story}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
        <button
          onClick={() => setActiveTab('statement')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors ${
            activeTab === 'statement'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Problem Statement
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors ${
            activeTab === 'examples'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Examples ({question.examples.length})
        </button>
        <button
          onClick={() => setActiveTab('constraints')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors ${
            activeTab === 'constraints'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Constraints & Edge Cases
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs leading-relaxed">
        {activeTab === 'statement' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Description
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{question.problemStatement}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-mono font-bold text-blue-700 mb-1 text-[11px]">Input Format</h4>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-line">{question.inputFormat}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-mono font-bold text-emerald-700 mb-1 text-[11px]">Output Format</h4>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-line">{question.outputFormat}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-3">
            {question.examples.map((ex, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 text-xs font-mono">Example #{idx + 1}</span>
                  <button
                    onClick={() => copyToClipboard(ex.input, idx)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm"
                  >
                    {copiedExample === idx ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      'Copy Input'
                    )}
                  </button>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 font-sans font-medium">Input:</span>
                    <pre className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 mt-1 whitespace-pre-wrap">
                      {ex.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans font-medium">Output:</span>
                    <pre className="bg-white p-2.5 rounded-lg border border-slate-200 text-emerald-700 font-bold mt-1 whitespace-pre-wrap">
                      {ex.output}
                    </pre>
                  </div>
                  {ex.explanation && (
                    <div className="text-slate-600 italic text-[11px] font-sans pt-1">
                      <span className="font-semibold text-slate-800">Explanation: </span>
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-amber-700 text-xs flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4" /> Technical Constraints
              </h3>
              <pre className="font-mono text-slate-800 text-[11px] whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200">
                {question.constraints}
              </pre>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Identified Edge Case Scenarios:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                {question.edgeCases.map((ec, i) => (
                  <li key={i}>{ec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
