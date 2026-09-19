import React from 'react';
import { AssessmentState } from '../../types';
import { CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';

interface PhaseStepperProps {
  state: AssessmentState;
}

export const PhaseStepper: React.FC<PhaseStepperProps> = ({ state }) => {
  const steps: { key: AssessmentState; label: string; stepNumber: number }[] = [
    { key: 'UNDERSTANDING', label: '1. Understand', stepNumber: 1 },
    { key: 'PLAN', label: '2. Plan', stepNumber: 2 },
    { key: 'IMPLEMENTATION', label: '3. Implement', stepNumber: 3 },
    { key: 'TESTING', label: '4. Test', stepNumber: 4 },
    { key: 'DEBUGGING', label: '5. Debug', stepNumber: 5 },
    { key: 'SUBMITTING', label: '6. Submit', stepNumber: 6 },
  ];

  const getStepNumber = (s: AssessmentState): number => {
    switch (s) {
      case 'PROBLEM_LOADED':
      case 'UNDERSTANDING':
      case 'UNDERSTANDING_REVIEW':
        return 1;
      case 'PLAN':
      case 'PLAN_REVIEW':
        return 2;
      case 'IMPLEMENTATION':
      case 'IMPLEMENTATION_REVIEW':
      case 'CODE_GENERATING':
        return 3;
      case 'CODE_READY':
      case 'TESTING':
        return 4;
      case 'DEBUGGING':
        return 5;
      case 'SUBMITTING':
      case 'EVALUATED':
      case 'COMPLETED':
        return 6;
      default:
        return 1;
    }
  };

  const currentStep = getStepNumber(state);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-1 sm:gap-2 flex-1 max-w-4xl">
        {steps.map((st, idx) => {
          const isCompleted = currentStep > st.stepNumber;
          const isCurrent = currentStep === st.stepNumber;
          const isLocked = currentStep < st.stepNumber;

          return (
            <React.Fragment key={st.key}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Sparkles className="w-3.5 h-3.5 text-blue-100 shrink-0 animate-pulse" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{st.label}</span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 max-w-[20px] sm:max-w-[40px] transition-colors ${
                    currentStep > st.stepNumber ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700">Phase:</span>
        <span className="font-bold text-blue-600">{state}</span>
      </div>
    </div>
  );
};
