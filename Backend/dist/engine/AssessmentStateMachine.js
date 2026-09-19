"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentStateMachine = void 0;
const VALID_TRANSITIONS = {
    IDLE: ['PROBLEM_LOADED'],
    PROBLEM_LOADED: ['UNDERSTANDING'],
    UNDERSTANDING: ['UNDERSTANDING_REVIEW', 'PROBLEM_LOADED'],
    UNDERSTANDING_REVIEW: ['PLAN', 'UNDERSTANDING'],
    PLAN: ['PLAN_REVIEW', 'UNDERSTANDING'],
    PLAN_REVIEW: ['IMPLEMENTATION', 'PLAN'],
    IMPLEMENTATION: ['TESTING', 'DEBUGGING', 'SUBMISSION', 'PLAN'],
    TESTING: ['DEBUGGING', 'SUBMISSION', 'IMPLEMENTATION'],
    DEBUGGING: ['TESTING', 'SUBMISSION', 'IMPLEMENTATION'],
    SUBMISSION: ['EVALUATED'],
    EVALUATED: ['COMPLETED'],
    COMPLETED: ['PROBLEM_LOADED', 'IDLE'],
};
class AssessmentStateMachine {
    static canTransition(current, next) {
        const allowed = VALID_TRANSITIONS[current] || [];
        return allowed.includes(next);
    }
    static assertTransition(current, next) {
        if (!this.canTransition(current, next)) {
            throw new Error(`Invalid state transition from '${current}' to '${next}'. Candidate must complete previous reasoning steps first.`);
        }
    }
    static isCodeExecutionAllowed(state) {
        const allowed = ['IMPLEMENTATION', 'TESTING', 'DEBUGGING', 'SUBMISSION'];
        return allowed.includes(state);
    }
}
exports.AssessmentStateMachine = AssessmentStateMachine;
