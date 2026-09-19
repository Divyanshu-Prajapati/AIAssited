import { QuestionSpecification } from '../../types/QuestionSpecification.js';
import { ValidationEvaluationResult } from '../../types/ValidationDecision.js';

export class SemanticValidator {
  /**
   * Evaluates semantic concept equivalence between user text and specification requirements.
   * Ensures candidates are not penalized for stating equivalent algorithms in natural phrasing
   * (e.g. "maintain best subarray sum ending at current index" == "Kadane's algorithm").
   */
  public evaluateSemanticEquivalence(
    text: string,
    spec: QuestionSpecification,
    step: 'UNDERSTANDING' | 'PLAN' | 'IMPLEMENTATION'
  ): ValidationEvaluationResult {
    const lower = text.toLowerCase();
    const evidence: string[] = [];
    const matchedRequirements: string[] = [];
    const missingRequirements: string[] = [];
    const criticalFailures: string[] = [];

    const reqs =
      step === 'UNDERSTANDING'
        ? spec.validation.understanding.requirements
        : step === 'PLAN'
        ? spec.validation.plan.requirements
        : spec.validation.implementation.requirements;

    for (const req of reqs) {
      let matched = false;

      // 1. Direct evidence match
      for (const ev of req.acceptableEvidence) {
        if (lower.includes(ev.toLowerCase())) {
          matched = true;
          evidence.push(`Direct match for '${req.id}': "${ev}"`);
          break;
        }
      }

      // 2. Semantic concept match if direct evidence wasn't matched
      if (!matched && req.concepts && req.concepts.length > 0) {
        const matches = req.concepts.filter((c) => lower.includes(c.toLowerCase()));
        if (matches.length >= Math.ceil(req.concepts.length / 2)) {
          matched = true;
          evidence.push(`Semantic concept match for '${req.id}': [${matches.join(', ')}]`);
        }
      }

      if (matched) {
        matchedRequirements.push(req.description);
      } else {
        missingRequirements.push(req.description);
        if (req.critical) {
          criticalFailures.push(`Missing critical semantic requirement: ${req.description}`);
        }
      }
    }

    const total = reqs.length || 1;
    const score = Math.round((matchedRequirements.length / total) * 100);

    if (criticalFailures.length > 0) {
      return {
        decision: 'FAIL',
        confidence: 0.85,
        criticalFailures,
        missingRequirements,
        matchedRequirements,
        contradictions: [],
        feedback: `Semantic validation failed due to missing critical requirements: ${criticalFailures.join(' ')}`,
        evidence,
        score,
      };
    }

    return {
      decision: 'PASS',
      confidence: 0.9,
      criticalFailures: [],
      missingRequirements: [],
      matchedRequirements,
      contradictions: [],
      feedback: `Semantic validation for ${step} passed successfully.`,
      evidence,
      score,
    };
  }
}

export const semanticValidator = new SemanticValidator();
