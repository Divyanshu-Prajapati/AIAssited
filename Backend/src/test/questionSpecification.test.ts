import { arr01Spec } from '../seed/referenceQuestions/arr_01_spec.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';

export function runQuestionSpecificationTests(): void {
  console.log('🧪 Starting QuestionSpecification Automated Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assertTest(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // Helper to deep clone specification fixture
  function cloneSpec(): QuestionSpecification {
    return JSON.parse(JSON.stringify(arr01Spec));
  }

  // 1. Valid question specification → PASS
  const test1 = validateQuestionSpecification(cloneSpec());
  assertTest('1. Valid question specification -> PASS', test1.valid === true);

  // 2. Missing Step 1 critical requirement → FAIL
  const spec2 = cloneSpec();
  spec2.validation.understanding.requirements.forEach((r) => (r.critical = false));
  const test2 = validateQuestionSpecification(spec2);
  assertTest(
    '2. Missing Step 1 critical requirement -> FAIL',
    test2.valid === false && test2.errors.some((e) => e.code === 'MISSING_STEP1_CRITICAL_REQUIREMENT')
  );

  // 3. Missing Step 2 critical requirement → FAIL
  const spec3 = cloneSpec();
  spec3.validation.plan.requirements.forEach((r) => (r.critical = false));
  const test3 = validateQuestionSpecification(spec3);
  assertTest(
    '3. Missing Step 2 critical requirement -> FAIL',
    test3.valid === false && test3.errors.some((e) => e.code === 'MISSING_STEP2_CRITICAL_REQUIREMENT')
  );

  // 4. Missing Step 3 critical requirement → FAIL
  const spec4 = cloneSpec();
  spec4.validation.implementation.requirements.forEach((r) => (r.critical = false));
  const test4 = validateQuestionSpecification(spec4);
  assertTest(
    '4. Missing Step 3 critical requirement -> FAIL',
    test4.valid === false && test4.errors.some((e) => e.code === 'MISSING_STEP3_CRITICAL_REQUIREMENT')
  );

  // 5. Missing expected time complexity → FAIL
  const spec5 = cloneSpec();
  spec5.problem.expectedTimeComplexity = '';
  const test5 = validateQuestionSpecification(spec5);
  assertTest(
    '5. Missing expected time complexity -> FAIL',
    test5.valid === false && test5.errors.some((e) => e.code === 'MISSING_EXPECTED_TIME_COMPLEXITY')
  );

  // 6. Missing expected space complexity → FAIL
  const spec6 = cloneSpec();
  spec6.problem.expectedSpaceComplexity = '';
  const test6 = validateQuestionSpecification(spec6);
  assertTest(
    '6. Missing expected space complexity -> FAIL',
    test6.valid === false && test6.errors.some((e) => e.code === 'MISSING_EXPECTED_SPACE_COMPLEXITY')
  );

  // 7. Missing accepted approach → FAIL
  const spec7 = cloneSpec();
  spec7.acceptedApproaches = [];
  const test7 = validateQuestionSpecification(spec7);
  assertTest(
    '7. Missing accepted approach -> FAIL',
    test7.valid === false && test7.errors.some((e) => e.code === 'MISSING_ACCEPTED_APPROACH')
  );

  // 8. Missing correctness condition → FAIL
  const spec8 = cloneSpec();
  spec8.acceptedApproaches[0].correctnessConditions = [];
  const test8 = validateQuestionSpecification(spec8);
  assertTest(
    '8. Missing correctness condition -> FAIL',
    test8.valid === false && test8.errors.some((e) => e.code === 'MISSING_CORRECTNESS_CONDITIONS')
  );

  // 9. Missing reference solution → FAIL
  const spec9 = cloneSpec();
  spec9.referenceSolutions = [];
  const test9 = validateQuestionSpecification(spec9);
  assertTest(
    '9. Missing reference solution -> FAIL',
    test9.valid === false && test9.errors.some((e) => e.code === 'MISSING_REFERENCE_SOLUTION')
  );

  // 10. Reference solution references nonexistent approach → FAIL
  const spec10 = cloneSpec();
  spec10.referenceSolutions[0].approachId = 'non_existent_approach_123';
  const test10 = validateQuestionSpecification(spec10);
  assertTest(
    '10. Reference solution references nonexistent approach -> FAIL',
    test10.valid === false && test10.errors.some((e) => e.code === 'INVALID_REFERENCE_APPROACH_ID')
  );

  // 11. Valid multiple accepted approaches → PASS
  const spec11 = cloneSpec();
  assertTest(
    '11. Valid multiple accepted approaches -> PASS',
    spec11.acceptedApproaches.length >= 2 && validateQuestionSpecification(spec11).valid === true
  );

  // 12. Correct-but-inefficient approach can be represented → PASS
  const spec12 = cloneSpec();
  const inefficient = spec12.acceptedApproaches.find((a) => a.optimal === false);
  assertTest(
    '12. Correct-but-inefficient approach can be represented -> PASS',
    Boolean(inefficient) && inefficient?.correctness === 'CORRECT' && spec12.validation.plan.allowCorrectButInefficient === true
  );

  // 13. Semantic evidence with different wording → schema PASS
  const spec13 = cloneSpec();
  spec13.validation.understanding.requirements[0].acceptableEvidence.push(
    'keep track of cumulative max ending at current index',
    'maintain non-negative sub-period accumulation'
  );
  const test13 = validateQuestionSpecification(spec13);
  assertTest('13. Semantic evidence with different wording -> schema PASS', test13.valid === true);

  console.log(`\n🎉 Test Suite Completed: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
runQuestionSpecificationTests();
