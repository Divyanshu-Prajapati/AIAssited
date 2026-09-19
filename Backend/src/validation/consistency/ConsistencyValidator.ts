import { ValidationEvaluationResult } from '../../types/ValidationDecision.js';
import { QuestionSpecification } from '../../types/QuestionSpecification.js';

export interface CrossStepContext {
  step1Text?: string;
  step2Text?: string;
  step3Text?: string;
  step2Decision?: ValidationEvaluationResult;
  step3Decision?: ValidationEvaluationResult;
  codeText?: string;
}

export class ConsistencyValidator {
  /**
   * Validates consistency between Step 2 (Plan) and Step 3 (Implementation)
   */
  public validateStep2ToStep3(
    step2Text: string,
    step3Text: string,
    spec: QuestionSpecification
  ): {
    consistent: boolean;
    issues: string[];
    decision: ValidationEvaluationResult;
  } {
    const lowerPlan = step2Text.toLowerCase();
    const lowerImpl = step3Text.toLowerCase();
    const issues: string[] = [];

    // 1. Space complexity inconsistency: Plan O(1) space vs Implementation creating O(N) array/map
    const planO1Space = lowerPlan.includes('o(1) space') || lowerPlan.includes('o(1) extra space') || lowerPlan.includes('constant space');
    const implAuxArrayOrMap = lowerImpl.includes('hashmap') || lowerImpl.includes('hashset') || lowerImpl.includes('new int[n]') || lowerImpl.includes('auxiliary array') || lowerImpl.includes('extra array');

    if (planO1Space && implAuxArrayOrMap) {
      issues.push('Complexity Mismatch: Step 2 specified O(1) constant space, but Step 3 describes using an O(N) auxiliary data structure (HashMap/Array).');
    }

    // 2. Algorithm strategy inconsistency: Two Pointers vs HashMap
    const planTwoPointers = lowerPlan.includes('two pointer') || lowerPlan.includes('2 pointer');
    const implHashMap = lowerImpl.includes('hashmap') || lowerImpl.includes('frequency map');
    if (planTwoPointers && implHashMap && !lowerImpl.includes('justification')) {
      issues.push('Strategy Mismatch: Step 2 specified Two Pointers, but Step 3 describes HashMap frequency counting without justification.');
    }

    // 3. Algorithm strategy inconsistency: Binary Search vs Linear Scan
    const planBinarySearch = lowerPlan.includes('binary search') || lowerPlan.includes('log n');
    const implLinearScan = lowerImpl.includes('linear scan') || lowerImpl.includes('loop through every element') || lowerImpl.includes('o(n) scan');
    if (planBinarySearch && implLinearScan && !lowerImpl.includes('justification')) {
      issues.push('Strategy Mismatch: Step 2 specified Binary Search, but Step 3 describes Linear Scanning without justification.');
    }

    const consistent = issues.length === 0;

    return {
      consistent,
      issues,
      decision: {
        decision: consistent ? 'PASS' : 'INCONSISTENT',
        confidence: 0.95,
        criticalFailures: issues,
        missingRequirements: [],
        matchedRequirements: consistent ? ['Step 2 and Step 3 are consistent.'] : [],
        contradictions: issues,
        feedback: consistent
          ? 'Cross-step consistency between Plan and Implementation validated.'
          : `Cross-step inconsistency detected between Step 2 (Plan) and Step 3 (Implementation): ${issues.join(' ')}`,
        evidence: issues,
        score: consistent ? 100 : 0,
      },
    };
  }

  /**
   * Validates consistency between Step 3 (Implementation) and generated Code
   */
  public validateStep3ToCode(
    step3Text: string,
    codeText: string,
    spec: QuestionSpecification
  ): {
    consistent: boolean;
    issues: string[];
    decision: ValidationEvaluationResult;
  } {
    const lowerImpl = step3Text.toLowerCase();
    const lowerCode = codeText.toLowerCase();
    const issues: string[] = [];

    // Check basic code presence
    if (!codeText || codeText.trim().length === 0) {
      issues.push('Generated code is empty.');
    }

    // Check scanner input reading if required by problem
    if (spec.problem.inputFormat && lowerCode.includes('class main')) {
      if (!lowerCode.includes('scanner') && !lowerCode.includes('bufferedreader')) {
        issues.push('Code missing input reader (Scanner / BufferedReader) specified in implementation stage.');
      }
    }

    const consistent = issues.length === 0;

    return {
      consistent,
      issues,
      decision: {
        decision: consistent ? 'PASS' : 'INCONSISTENT',
        confidence: 0.9,
        criticalFailures: issues,
        missingRequirements: [],
        matchedRequirements: consistent ? ['Generated code matches implementation plan.'] : [],
        contradictions: issues,
        feedback: consistent
          ? 'Code generation consistency validated.'
          : `Code does not match implementation requirements: ${issues.join(' ')}`,
        evidence: issues,
        score: consistent ? 100 : 0,
      },
    };
  }
}

export const consistencyValidator = new ConsistencyValidator();
