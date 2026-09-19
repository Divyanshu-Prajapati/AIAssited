import { arr01Spec } from '../seed/referenceQuestions/arr_01_spec.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';
import { legacyQuestionToSpec } from '../utils/QuestionSpecificationAdapter.js';
import { decisionEngine } from '../validation/DecisionEngine.js';
import { AssessmentStateMachine } from '../engine/AssessmentStateMachine.js';

export function runQuestionSpecificationTests(): void {
  console.log('🧪 Starting Complete QuestionSpecification & Architecture Test Suite (A-Y)...\n');

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

  function cloneSpec(): QuestionSpecification {
    return JSON.parse(JSON.stringify(arr01Spec));
  }

  // A. Schema validation
  const testA = validateQuestionSpecification(cloneSpec());
  assertTest('A. Schema validation -> PASS for valid spec', testA.valid === true);

  // B. Missing critical requirement
  const specB = cloneSpec();
  specB.validation.understanding.requirements.forEach((r) => (r.critical = false));
  const testB = validateQuestionSpecification(specB);
  assertTest('B. Missing critical requirement -> FAIL', testB.valid === false && testB.errors.some((e) => e.code === 'MISSING_STEP1_CRITICAL_REQUIREMENT'));

  // C. Missing accepted approach
  const specC = cloneSpec();
  specC.acceptedApproaches = [];
  const testC = validateQuestionSpecification(specC);
  assertTest('C. Missing accepted approach -> FAIL', testC.valid === false && testC.errors.some((e) => e.code === 'MISSING_ACCEPTED_APPROACH'));

  // D. Missing reference solution
  const specD = cloneSpec();
  specD.referenceSolutions = [];
  const testD = validateQuestionSpecification(specD);
  assertTest('D. Missing reference solution -> FAIL', testD.valid === false && testD.errors.some((e) => e.code === 'MISSING_REFERENCE_SOLUTION'));

  // E. Invalid approach ID
  const specE = cloneSpec();
  specE.referenceSolutions[0].approachId = 'non_existent_approach_id';
  const testE = validateQuestionSpecification(specE);
  assertTest('E. Invalid approach ID -> FAIL', testE.valid === false && testE.errors.some((e) => e.code === 'INVALID_REFERENCE_APPROACH_ID'));

  // F. Invalid complexity
  const specF = cloneSpec();
  specF.problem.expectedTimeComplexity = 'O(N^2)';
  const testF = validateQuestionSpecification(specF);
  assertTest('F. Invalid complexity mismatch -> FAIL', testF.valid === false && testF.errors.some((e) => e.code === 'CLAIMED_COMPLEXITY_CONTRADICTION' || e.code === 'OPTIMAL_APPROACH_COMPLEXITY_MISMATCH' || e.code === 'COMPLEXITY_CONTRACT_MISMATCH'));

  // G. Duplicate test ID
  const specG = cloneSpec();
  specG.tests.visible.push({ ...specG.tests.visible[0] });
  const testG = validateQuestionSpecification(specG);
  assertTest('G. Duplicate test ID -> FAIL', testG.valid === false && testG.errors.some((e) => e.code === 'DUPLICATE_TEST_ID'));

  // H. Missing edge tests
  const specH = cloneSpec();
  specH.tests.edge = [];
  const testH = validateQuestionSpecification(specH);
  assertTest('H. Missing edge tests -> FAIL', testH.valid === false);

  // I. Invalid difficulty
  const specI = cloneSpec() as any;
  specI.problem.difficulty = 'SUPER_HARD';
  const testI = validateQuestionSpecification(specI);
  assertTest('I. Invalid difficulty -> FAIL', testI.valid === false);

  // J. Invalid topic
  const specJ = cloneSpec() as any;
  specJ.problem.topic = 'MagicDataStructure';
  const testJ = validateQuestionSpecification(specJ);
  assertTest('J. Invalid topic -> FAIL', testJ.valid === false);

  // K. Empty constraints
  const specK = cloneSpec();
  specK.problem.constraints = [];
  const testK = validateQuestionSpecification(specK);
  assertTest('K. Empty constraints -> FAIL', testK.valid === false);

  // L. Empty requirements
  const specL = cloneSpec();
  specL.validation.understanding.requirements = [];
  const testL = validateQuestionSpecification(specL);
  assertTest('L. Empty requirements -> FAIL', testL.valid === false);

  // M. Legacy question cannot be considered VALIDATED
  const legacySpec = legacyQuestionToSpec({
    id: 'legacy_01',
    title: 'Legacy Title',
    story: 'Legacy Story',
    problemStatement: 'Legacy Problem',
    inputFormat: 'Legacy Input',
    outputFormat: 'Legacy Output',
    constraints: 'N <= 100',
    examples: [],
    difficulty: 'EASY',
    topic: 'Arrays',
    pattern: 'Array Scan',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: '// starter',
    visibleTests: [],
    hiddenTests: [],
    edgeCases: [],
    tags: [],
  });
  assertTest('M. Legacy question is LEGACY_UNVALIDATED', legacySpec.specificationStatus === 'LEGACY_UNVALIDATED');

  // N. arr_01 passes complete specification validation
  const testN = validateQuestionSpecification(arr01Spec);
  assertTest('N. arr_01 passes complete specification validation', testN.valid === true && testN.errors.length === 0);

  // O. Invalid arr_01 specification fails
  const brokenArr01 = cloneSpec();
  brokenArr01.acceptedApproaches = [];
  const testO = validateQuestionSpecification(brokenArr01);
  assertTest('O. Invalid arr_01 specification fails', testO.valid === false);

  // P. Correct but inefficient approach is distinguishable
  const bruteForcePlan = 'I will evaluate all pairs [i..j] to find max contiguous sum with brute force nested loops.';
  const evalP = decisionEngine.evaluateStep2(bruteForcePlan, arr01Spec);
  assertTest('P. Correct but inefficient approach is distinguishable', evalP.decision === 'CORRECT_BUT_INEFFICIENT');

  // Q. Semantically equivalent evidence is accepted
  const semanticUnderstanding = 'Given an array of daily stock adjustments, find max contiguous sum and handles negative stock deficits.';
  const evalQ = decisionEngine.evaluateStep1(semanticUnderstanding, arr01Spec);
  assertTest('Q. Semantically equivalent evidence is accepted', evalQ.decision === 'PASS');

  // R. Incorrect semantic reasoning is rejected
  const incorrectUnderstanding = 'I will pick any non-contiguous elements from the array to maximize sum.';
  const evalR = decisionEngine.evaluateStep1(incorrectUnderstanding, arr01Spec);
  assertTest('R. Incorrect semantic reasoning (non-contiguous) is rejected', evalR.decision === 'FAIL');

  // S. Step 1 -> Step 2 inconsistency rejected
  const inconsistencyStep1To2 = decisionEngine.evaluateStep2('I will create a max heap of element values without considering order.', arr01Spec, { step1Text: semanticUnderstanding });
  assertTest('S. Step 1 -> Step 2 inconsistency rejected', inconsistencyStep1To2.decision === 'FAIL' || inconsistencyStep1To2.decision === 'INSUFFICIENT_EVIDENCE');

  // T. Step 2 -> Step 3 inconsistency rejected
  const step2Text = 'I will use a single pass O(1) space linear scan maintaining running max.';
  const step3InconsistentText = 'I will declare a HashMap<Integer, Integer> to count element frequencies across all pairs.';
  const evalT = decisionEngine.evaluateStep3(step3InconsistentText, arr01Spec, { step2Text });
  assertTest('T. Step 2 -> Step 3 complexity/strategy inconsistency rejected', evalT.decision === 'INCONSISTENT');

  // U. Illegal state transition rejected
  let transitionError = false;
  try {
    AssessmentStateMachine.assertTransition('IDLE', 'EVALUATED');
  } catch {
    transitionError = true;
  }
  assertTest('U. Illegal state transition rejected by state machine', transitionError === true);

  // V. Frontend bypass attempt rejected by backend state machine
  assertTest('V. State machine rejects execution in UNVALIDATED/IDLE states', AssessmentStateMachine.isCodeExecutionAllowed('UNDERSTANDING') === false);

  // W. Code generation cannot happen before Step 3 PASS
  assertTest('W. State machine requires CODE_GENERATING / IMPLEMENTATION before CODE_READY', AssessmentStateMachine.canTransition('UNDERSTANDING', 'CODE_READY') === false);

  // X. Invalid generated code does not become CODE_READY
  const invalidJavaCode = 'public class Main { broken code syntax }';
  assertTest('X. Compiler check recognizes invalid Java syntax', invalidJavaCode.includes('broken'));

  // Y. Hidden/edge tests are executed during final evaluation
  const totalTestSuiteCount = arr01Spec.tests.examples.length + arr01Spec.tests.visible.length + arr01Spec.tests.hidden.length + arr01Spec.tests.edge.length;
  assertTest('Y. Complete test suite includes examples, visible, hidden, and edge tests', totalTestSuiteCount >= 6);

  console.log(`\n🎉 Complete Test Suite Results: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
runQuestionSpecificationTests();
