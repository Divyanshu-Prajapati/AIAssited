import { QuestionSpecificationSchema } from './schemas/QuestionValidationSchema.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

export interface QuestionValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export function validateQuestionSpecification(question: any): QuestionValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!question || typeof question !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', code: 'INVALID_QUESTION_OBJECT', message: 'Question specification must be an object' }],
      warnings: [],
    };
  }

  // 1. Zod Structural Schema Validation
  const zodResult = QuestionSpecificationSchema.safeParse(question);
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      const fieldPath = issue.path.join('.') || 'root';
      errors.push({
        field: fieldPath,
        code: 'SCHEMA_VALIDATION_ERROR',
        message: issue.message,
      });
    }
  }

  const spec = question as Partial<QuestionSpecification>;

  // 2. Rule 1: No accepted approach exists
  if (!spec.acceptedApproaches || !Array.isArray(spec.acceptedApproaches) || spec.acceptedApproaches.length === 0) {
    errors.push({
      field: 'acceptedApproaches',
      code: 'MISSING_ACCEPTED_APPROACH',
      message: 'Question must have at least one accepted approach',
    });
  } else {
    // Rule 9: An accepted approach has no correctness conditions
    spec.acceptedApproaches.forEach((app, idx) => {
      if (!app.correctnessConditions || !Array.isArray(app.correctnessConditions) || app.correctnessConditions.length === 0) {
        errors.push({
          field: `acceptedApproaches[${idx}].correctnessConditions`,
          code: 'MISSING_CORRECTNESS_CONDITIONS',
          message: `Accepted approach '${app.name || app.id || idx}' must specify at least one correctness condition`,
        });
      }
    });

    // Warning: No optimal approach flagged
    const hasOptimal = spec.acceptedApproaches.some((app) => app.optimal === true);
    if (!hasOptimal) {
      warnings.push({
        field: 'acceptedApproaches',
        code: 'NO_OPTIMAL_APPROACH_FLAGGED',
        message: 'None of the accepted approaches are flagged as optimal',
      });
    }
  }

  // 3. Rule 2, 3, 4: Critical Step requirements check
  const step1Reqs = spec.validation?.understanding?.requirements || [];
  const step2Reqs = spec.validation?.plan?.requirements || [];
  const step3Reqs = spec.validation?.implementation?.requirements || [];

  const hasStep1Critical = step1Reqs.some((r) => r.critical === true);
  if (!hasStep1Critical) {
    errors.push({
      field: 'validation.understanding.requirements',
      code: 'MISSING_STEP1_CRITICAL_REQUIREMENT',
      message: 'Step 1 (Understanding) contract must contain at least one critical requirement',
    });
  }

  const hasStep2Critical = step2Reqs.some((r) => r.critical === true);
  if (!hasStep2Critical) {
    errors.push({
      field: 'validation.plan.requirements',
      code: 'MISSING_STEP2_CRITICAL_REQUIREMENT',
      message: 'Step 2 (Plan) contract must contain at least one critical requirement',
    });
  }

  const hasStep3Critical = step3Reqs.some((r) => r.critical === true);
  if (!hasStep3Critical) {
    errors.push({
      field: 'validation.implementation.requirements',
      code: 'MISSING_STEP3_CRITICAL_REQUIREMENT',
      message: 'Step 3 (Implementation) contract must contain at least one critical requirement',
    });
  }

  // Rule 10: A validation requirement has no semantic concepts
  const allRequirements = [...step1Reqs, ...step2Reqs, ...step3Reqs];
  allRequirements.forEach((req) => {
    if (!req.concepts || !Array.isArray(req.concepts) || req.concepts.length === 0) {
      errors.push({
        field: `requirement[${req.id || 'unknown'}].concepts`,
        code: 'MISSING_SEMANTIC_CONCEPTS',
        message: `Validation requirement '${req.description || req.id}' has no semantic concepts defined`,
      });
    }
  });

  // 4. Rule 5 & 6: Expected time & space complexity missing
  const probTime = spec.problem?.expectedTimeComplexity;
  if (!probTime || typeof probTime !== 'string' || probTime.trim() === '') {
    errors.push({
      field: 'problem.expectedTimeComplexity',
      code: 'MISSING_EXPECTED_TIME_COMPLEXITY',
      message: 'Problem definition must specify expectedTimeComplexity',
    });
  }

  const probSpace = spec.problem?.expectedSpaceComplexity;
  if (!probSpace || typeof probSpace !== 'string' || probSpace.trim() === '') {
    errors.push({
      field: 'problem.expectedSpaceComplexity',
      code: 'MISSING_EXPECTED_SPACE_COMPLEXITY',
      message: 'Problem definition must specify expectedSpaceComplexity',
    });
  }

  // 5. Rule 7: No tests exist
  const tests = spec.tests;
  const exampleTests = tests?.examples || [];
  const visibleTests = tests?.visible || [];
  const hiddenTests = tests?.hidden || [];
  const edgeTests = tests?.edge || [];
  const totalTests = exampleTests.length + visibleTests.length + hiddenTests.length + edgeTests.length;

  if (totalTests === 0) {
    errors.push({
      field: 'tests',
      code: 'MISSING_TESTS',
      message: 'Question must have at least one test case across examples, visible, hidden, or edge suites',
    });
  } else {
    // Rule 13: Test empty input or output
    const allTestsList = [...exampleTests, ...visibleTests, ...hiddenTests, ...edgeTests];
    allTestsList.forEach((t) => {
      if (t.input === undefined || t.input === null || t.expectedOutput === undefined || t.expectedOutput === null) {
        errors.push({
          field: `tests[${t.id || 'unknown'}]`,
          code: 'EMPTY_TEST_INPUT_OR_OUTPUT',
          message: `Test case '${t.id}' has undefined/null input or expectedOutput`,
        });
      }
    });

    if (visibleTests.length < 2) {
      warnings.push({
        field: 'tests.visible',
        code: 'ONLY_ONE_VISIBLE_TEST',
        message: 'Question has fewer than 2 visible test cases',
      });
    }
  }

  // 6. Rule 8: No reference solution exists
  if (!spec.referenceSolutions || !Array.isArray(spec.referenceSolutions) || spec.referenceSolutions.length === 0) {
    errors.push({
      field: 'referenceSolutions',
      code: 'MISSING_REFERENCE_SOLUTION',
      message: 'Question must have at least one reference solution',
    });
  } else {
    // Rule 12: Reference solution refers to a nonexistent approachId
    const validApproachIds = new Set((spec.acceptedApproaches || []).map((a) => a.id));
    spec.referenceSolutions.forEach((ref, idx) => {
      if (!validApproachIds.has(ref.approachId)) {
        errors.push({
          field: `referenceSolutions[${idx}].approachId`,
          code: 'INVALID_REFERENCE_APPROACH_ID',
          message: `Reference solution '${ref.approachId}' refers to a nonexistent accepted approachId`,
        });
      }
    });
  }

  // 7. Rule 11: A question has no meaningful edge case requirement
  const edgeCases = spec.problem?.edgeCases || [];
  const minEdgeCases = spec.validation?.understanding?.minimumEdgeCases || 0;
  if (edgeCases.length === 0 && edgeTests.length === 0 && minEdgeCases === 0) {
    errors.push({
      field: 'problem.edgeCases',
      code: 'MISSING_EDGE_CASE_REQUIREMENT',
      message: 'Question must define meaningful edge cases in problem.edgeCases or tests.edge',
    });
  }

  // 8. Rule 14: Contradictory core metadata
  if (spec.problem?.difficulty === 'EASY' && spec.problem?.expectedTimeComplexity?.includes('O(N!)')) {
    errors.push({
      field: 'problem.difficulty',
      code: 'CONTRADICTORY_METADATA',
      message: 'Problem claims EASY difficulty but has O(N!) factorial complexity',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
