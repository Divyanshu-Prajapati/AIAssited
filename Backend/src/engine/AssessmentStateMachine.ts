import { AssessmentState } from '../types/index.js';

const VALID_TRANSITIONS: Record<AssessmentState, AssessmentState[]> = {
  IDLE: ['PROBLEM_LOADED'],
  PROBLEM_LOADED: ['UNDERSTANDING'],
  UNDERSTANDING: ['UNDERSTANDING_REVIEW', 'PROBLEM_LOADED'],
  UNDERSTANDING_REVIEW: ['PLAN', 'UNDERSTANDING'],
  PLAN: ['PLAN_REVIEW', 'UNDERSTANDING'],
  PLAN_REVIEW: ['IMPLEMENTATION', 'PLAN'],
  IMPLEMENTATION: ['IMPLEMENTATION_REVIEW', 'PLAN'],
  IMPLEMENTATION_REVIEW: ['CODE_GENERATING', 'IMPLEMENTATION'],
  CODE_GENERATING: ['CODE_READY', 'IMPLEMENTATION'],
  CODE_READY: ['TESTING', 'DEBUGGING', 'SUBMITTING', 'IMPLEMENTATION'],
  TESTING: ['DEBUGGING', 'SUBMITTING', 'CODE_READY'],
  DEBUGGING: ['TESTING', 'SUBMITTING', 'CODE_READY'],
  SUBMITTING: ['EVALUATED'],
  EVALUATED: ['COMPLETED'],
  COMPLETED: ['PROBLEM_LOADED', 'IDLE'],
};

export class AssessmentStateMachine {
  public static canTransition(current: AssessmentState, next: AssessmentState): boolean {
    const allowed = VALID_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  public static assertTransition(current: AssessmentState, next: AssessmentState): void {
    if (!this.canTransition(current, next)) {
      throw new Error(
        `Invalid state transition from '${current}' to '${next}'. Candidate must complete previous reasoning steps first.`
      );
    }
  }

  public static isCodeExecutionAllowed(state: AssessmentState): boolean {
    const allowed: AssessmentState[] = ['CODE_READY', 'TESTING', 'DEBUGGING', 'SUBMITTING'];
    return allowed.includes(state);
  }
}
