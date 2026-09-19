import { QuestionSpecification } from '../types/QuestionSpecification.js';
import { ValidationEvaluationResult, ValidationDecision } from '../types/ValidationDecision.js';
import { deterministicValidator } from './deterministic/DeterministicValidator.js';
import { semanticValidator } from './semantic/SemanticValidator.js';
import { consistencyValidator, CrossStepContext } from './consistency/ConsistencyValidator.js';

export class DecisionEngine {
  /**
   * Evaluates Step 1: Problem Understanding
   */
  public evaluateStep1(
    understandingText: string,
    spec: QuestionSpecification
  ): ValidationEvaluationResult {
    // 1. Deterministic validation
    const det = deterministicValidator.validateStep1(understandingText, spec);
    if (det.result.decision === 'FAIL' || det.result.decision === 'INSUFFICIENT_EVIDENCE') {
      return det.result;
    }

    // 2. Semantic validation
    const sem = semanticValidator.evaluateSemanticEquivalence(understandingText, spec, 'UNDERSTANDING');
    if (sem.decision === 'FAIL') {
      return sem;
    }

    return det.result;
  }

  /**
   * Evaluates Step 2: Algorithmic Plan
   */
  public evaluateStep2(
    planText: string,
    spec: QuestionSpecification,
    crossContext?: CrossStepContext
  ): ValidationEvaluationResult {
    // 1. Deterministic check
    const det = deterministicValidator.validateStep2(planText, spec);
    if (det.result.decision === 'FAIL' || det.result.decision === 'INSUFFICIENT_EVIDENCE') {
      return det.result;
    }

    // 2. Semantic check
    const sem = semanticValidator.evaluateSemanticEquivalence(planText, spec, 'PLAN');
    if (sem.decision === 'FAIL') {
      return sem;
    }

    return det.result;
  }

  /**
   * Evaluates Step 3: Implementation Strategy & Code Readiness
   */
  public evaluateStep3(
    implText: string,
    spec: QuestionSpecification,
    crossContext?: CrossStepContext
  ): ValidationEvaluationResult {
    // 1. Consistency check with Step 2 plan if provided
    if (crossContext?.step2Text) {
      const consistency = consistencyValidator.validateStep2ToStep3(crossContext.step2Text, implText, spec);
      if (!consistency.consistent) {
        return consistency.decision;
      }
    }

    // 2. Deterministic check
    const det = deterministicValidator.validateStep3(implText, spec);
    if (det.result.decision === 'FAIL' || det.result.decision === 'INSUFFICIENT_EVIDENCE') {
      return det.result;
    }

    // 3. Semantic check
    const sem = semanticValidator.evaluateSemanticEquivalence(implText, spec, 'IMPLEMENTATION');
    if (sem.decision === 'FAIL') {
      return sem;
    }

    return det.result;
  }

  /**
   * Validates cross-step consistency explicitly
   */
  public validateConsistency(
    crossContext: CrossStepContext,
    spec: QuestionSpecification
  ): ValidationEvaluationResult {
    if (crossContext.step2Text && crossContext.step3Text) {
      const step2To3 = consistencyValidator.validateStep2ToStep3(crossContext.step2Text, crossContext.step3Text, spec);
      if (!step2To3.consistent) return step2To3.decision;
    }

    if (crossContext.step3Text && crossContext.codeText) {
      const step3ToCode = consistencyValidator.validateStep3ToCode(crossContext.step3Text, crossContext.codeText, spec);
      if (!step3ToCode.consistent) return step3ToCode.decision;
    }

    return {
      decision: 'PASS',
      confidence: 1.0,
      criticalFailures: [],
      missingRequirements: [],
      matchedRequirements: ['All cross-step consistency checks passed.'],
      contradictions: [],
      feedback: 'Cross-step consistency validated.',
      evidence: [],
      score: 100,
    };
  }
}

export const decisionEngine = new DecisionEngine();
