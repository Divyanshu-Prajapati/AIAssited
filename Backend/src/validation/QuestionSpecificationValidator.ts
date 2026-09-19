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

export function normalizeComplexity(comp?: string): string {
  if (!comp) return '';
  return comp
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/\*+/g, '')
    .replace(/\^/g, '')
    .replace(/O\(N1\)/g, 'O(N)')
    .replace(/O\(NLOGN\)/g, 'O(NLOGN)')
    .replace(/O\(N2\)/g, 'O(N^2)');
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

  // Check specificationStatus
  if (spec.specificationStatus !== 'VALIDATED') {
    errors.push({
      field: 'specificationStatus',
      code: 'UNVALIDATED_SPECIFICATION',
      message: `Specification status '${spec.specificationStatus || 'UNKNOWN'}' is not VALIDATED`,
    });
  }

  // Check starter code (Rule 9)
  if (!spec.starterCode || typeof spec.starterCode !== 'string' || spec.starterCode.trim() === '') {
    errors.push({
      field: 'starterCode',
      code: 'EMPTY_STARTER_CODE',
      message: 'Starter code cannot be empty',
    });
  }

  // Top-level Accepted Approaches check (Rule 1, 3, 4, 5, 6)
  const approaches = spec.acceptedApproaches || [];
  const approachMap = new Map<string, any>();
  const approachIds = new Set<string>();

  if (!approaches || !Array.isArray(approaches) || approaches.length === 0) {
    errors.push({
      field: 'acceptedApproaches',
      code: 'MISSING_ACCEPTED_APPROACH',
      message: 'Question must have at least one accepted approach',
    });
  } else {
    let hasOptimal = false;

    approaches.forEach((app, idx) => {
      if (approachIds.has(app.id)) {
        errors.push({
          field: `acceptedApproaches[${idx}].id`,
          code: 'DUPLICATE_APPROACH_ID',
          message: `Duplicate approach ID '${app.id}' found`,
        });
      }
      approachIds.add(app.id);
      approachMap.set(app.id, app);

      if (app.optimal === true) {
        hasOptimal = true;
      } else {
        // Rule 4: Correct-but-inefficient explicitly marked
        if (app.correctness !== 'CORRECT') {
          errors.push({
            field: `acceptedApproaches[${idx}].correctness`,
            code: 'INVALID_CORRECTNESS_MARKING',
            message: `Approach '${app.id}' must be marked correctness: CORRECT`,
          });
        }
      }

      // Check correctness conditions
      if (!app.correctnessConditions || !Array.isArray(app.correctnessConditions) || app.correctnessConditions.length === 0) {
        errors.push({
          field: `acceptedApproaches[${idx}].correctnessConditions`,
          code: 'MISSING_CORRECTNESS_CONDITIONS',
          message: `Accepted approach '${app.id}' must specify at least one correctness condition`,
        });
      }
    });

    // Rule 3: At least one accepted approach is optimal
    if (!hasOptimal) {
      errors.push({
        field: 'acceptedApproaches',
        code: 'NO_OPTIMAL_APPROACH_FLAGGED',
        message: 'At least one accepted approach must be flagged as optimal: true',
      });
    }

    // Rule 5 & 6: Complexity contract alignment
    const expectedTimeNorm = normalizeComplexity(spec.problem?.expectedTimeComplexity);
    const expectedSpaceNorm = normalizeComplexity(spec.problem?.expectedSpaceComplexity);

    const optimalApproaches = approaches.filter((a) => a.optimal === true);
    if (optimalApproaches.length > 0) {
      const matchesOptimalTime = optimalApproaches.some(
        (a) => normalizeComplexity(a.timeComplexity) === expectedTimeNorm
      );
      if (!matchesOptimalTime) {
        errors.push({
          field: 'problem.expectedTimeComplexity',
          code: 'CLAIMED_COMPLEXITY_CONTRADICTION',
          message: `Expected time complexity '${spec.problem?.expectedTimeComplexity}' does not match any optimal approach time complexity`,
        });
      }

      const matchesOptimalSpace = optimalApproaches.some(
        (a) => normalizeComplexity(a.spaceComplexity) === expectedSpaceNorm
      );
      if (!matchesOptimalSpace) {
        errors.push({
          field: 'problem.expectedSpaceComplexity',
          code: 'OPTIMAL_APPROACH_COMPLEXITY_MISMATCH',
          message: `Expected space complexity '${spec.problem?.expectedSpaceComplexity}' does not match any optimal approach space complexity`,
        });
      }
    }
  }

  // Check Plan accepted approaches match top-level IDs (Rule 2)
  const planApproachIds = spec.validation?.plan?.acceptedApproaches || [];
  if (Array.isArray(planApproachIds)) {
    planApproachIds.forEach((planAppId, idx) => {
      if (!approachIds.has(planAppId)) {
        errors.push({
          field: `validation.plan.acceptedApproaches[${idx}]`,
          code: 'INVALID_PLAN_APPROACH_ID',
          message: `Plan contract refers to nonexistent approach ID '${planAppId}'`,
        });
      }
    });
  }

  // Check Step 1, 2, 3 requirements (Rule 2, 3, 4, 15, 16, 17)
  const step1Reqs = spec.validation?.understanding?.requirements || [];
  const step2Reqs = spec.validation?.plan?.requirements || [];
  const step3Reqs = spec.validation?.implementation?.requirements || [];

  if (!step1Reqs.some((r) => r.critical === true)) {
    errors.push({
      field: 'validation.understanding.requirements',
      code: 'MISSING_STEP1_CRITICAL_REQUIREMENT',
      message: 'Step 1 (Understanding) contract must contain at least one critical requirement',
    });
  }

  if (!step2Reqs.some((r) => r.critical === true)) {
    errors.push({
      field: 'validation.plan.requirements',
      code: 'MISSING_STEP2_CRITICAL_REQUIREMENT',
      message: 'Step 2 (Plan) contract must contain at least one critical requirement',
    });
  }

  if (!step3Reqs.some((r) => r.critical === true)) {
    errors.push({
      field: 'validation.implementation.requirements',
      code: 'MISSING_STEP3_CRITICAL_REQUIREMENT',
      message: 'Step 3 (Implementation) contract must contain at least one critical requirement',
    });
  }

  // Rule 14: Prohibited misunderstandings
  const prohibited = spec.validation?.understanding?.prohibitedMisunderstandings || [];
  if (!Array.isArray(prohibited) || prohibited.length === 0) {
    errors.push({
      field: 'validation.understanding.prohibitedMisunderstandings',
      code: 'MISSING_PROHIBITED_MISUNDERSTANDINGS',
      message: 'Understanding contract must contain at least one prohibited misunderstanding',
    });
  }

  // Rule 15 & 16 & 17: Requirement semantic concepts, acceptable evidence, empty critical check
  const allReqs = [...step1Reqs, ...step2Reqs, ...step3Reqs];
  const reqIds = new Set<string>();

  allReqs.forEach((req) => {
    if (req.id && reqIds.has(req.id)) {
      errors.push({
        field: `requirement[${req.id}].id`,
        code: 'DUPLICATE_REQUIREMENT_ID',
        message: `Duplicate requirement ID '${req.id}' found`,
      });
    }
    if (req.id) reqIds.add(req.id);

    if (!req.concepts || !Array.isArray(req.concepts) || req.concepts.length === 0) {
      errors.push({
        field: `requirement[${req.id || 'unknown'}].concepts`,
        code: 'MISSING_SEMANTIC_CONCEPTS',
        message: `Validation requirement '${req.id}' must specify semantic concepts`,
      });
    }

    if (!req.acceptableEvidence || !Array.isArray(req.acceptableEvidence) || req.acceptableEvidence.length === 0) {
      errors.push({
        field: `requirement[${req.id || 'unknown'}].acceptableEvidence`,
        code: 'MISSING_ACCEPTABLE_EVIDENCE',
        message: `Validation requirement '${req.id}' must specify acceptable evidence`,
      });
    }

    if (req.critical && (!req.description || req.description.trim() === '')) {
      errors.push({
        field: `requirement[${req.id || 'unknown'}].description`,
        code: 'EMPTY_CRITICAL_REQUIREMENTS',
        message: `Critical requirement '${req.id}' description cannot be empty`,
      });
    }
  });

  // Reference Solutions Check (Rule 7, 8, 12)
  const refSolutions = spec.referenceSolutions || [];
  if (!Array.isArray(refSolutions) || refSolutions.length === 0) {
    errors.push({
      field: 'referenceSolutions',
      code: 'MISSING_REFERENCE_SOLUTION',
      message: 'Question must specify at least one reference solution',
    });
  } else {
    refSolutions.forEach((ref, idx) => {
      if (!approachIds.has(ref.approachId)) {
        errors.push({
          field: `referenceSolutions[${idx}].approachId`,
          code: 'INVALID_REFERENCE_APPROACH_ID',
          message: `Reference solution refers to nonexistent approach ID '${ref.approachId}'`,
        });
      } else {
        const app = approachMap.get(ref.approachId);
        if (app) {
          if (normalizeComplexity(ref.timeComplexity) !== normalizeComplexity(app.timeComplexity)) {
            errors.push({
              field: `referenceSolutions[${idx}].timeComplexity`,
              code: 'REFERENCE_SOLUTION_COMPLEXITY_MISMATCH',
              message: `Reference solution time complexity '${ref.timeComplexity}' does not match approach '${app.id}' time complexity '${app.timeComplexity}'`,
            });
          }
        }
      }

      if (!ref.javaCode || typeof ref.javaCode !== 'string' || ref.javaCode.trim() === '') {
        errors.push({
          field: `referenceSolutions[${idx}].javaCode`,
          code: 'EMPTY_REFERENCE_SOLUTION_CODE',
          message: `Reference solution '${ref.approachId}' Java code cannot be empty`,
        });
      }
    });
  }

  // Test Suite Checks (Rule 10, 11, 12, 13)
  const tests = spec.tests;
  const exampleTests = tests?.examples || [];
  const visibleTests = tests?.visible || [];
  const hiddenTests = tests?.hidden || [];
  const edgeTests = tests?.edge || [];

  const allTests = [...exampleTests, ...visibleTests, ...hiddenTests, ...edgeTests];
  const testIds = new Set<string>();

  if (allTests.length === 0) {
    errors.push({
      field: 'tests',
      code: 'MISSING_TESTS',
      message: 'Question test suite cannot be empty',
    });
  } else {
    allTests.forEach((t) => {
      if (testIds.has(t.id)) {
        errors.push({
          field: `tests[${t.id}]`,
          code: 'DUPLICATE_TEST_ID',
          message: `Duplicate test ID '${t.id}' found across test suite`,
        });
      }
      testIds.add(t.id);

      if (t.input === undefined || t.input === null || t.expectedOutput === undefined || t.expectedOutput === null) {
        errors.push({
          field: `tests[${t.id}]`,
          code: 'EMPTY_TEST_INPUT_OR_OUTPUT',
          message: `Test '${t.id}' input or expectedOutput cannot be undefined/null`,
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

  // Rule 12: Examples must have corresponding test cases
  const problemExamples = spec.problem?.examples || [];
  if (problemExamples.length > 0 && exampleTests.length === 0) {
    errors.push({
      field: 'tests.examples',
      code: 'EXAMPLE_MISSING_TEST_CASE',
      message: 'Problem defines examples but tests.examples is empty',
    });
  }

  // Rule 13: Edge cases must be represented by actual executable tests
  const problemEdgeCases = spec.problem?.edgeCases || [];
  if (problemEdgeCases.length > 0 && edgeTests.length === 0) {
    errors.push({
      field: 'tests.edge',
      code: 'EDGE_CASE_MISSING_TEST_CASE',
      message: 'Problem defines edge cases but tests.edge test suite is empty',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
