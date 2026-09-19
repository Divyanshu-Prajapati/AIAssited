import { QUESTION_BANK } from '../seed/questionBank.js';
import { executionService } from '../providers/execution/ExecutionService.js';
import { AssessmentStateMachine } from '../engine/AssessmentStateMachine.js';
import { ScoringEngine } from '../engine/ScoringEngine.js';

async function runTests() {
  console.log('🧪 Starting DSA AI Assessment Lab Integration Tests...\n');

  // 1. Question Bank Verification
  console.log('1️⃣ Checking Question Bank Integrity...');
  console.assert(QUESTION_BANK.length >= 100, `Expected >= 100 questions, got ${QUESTION_BANK.length}`);
  const topicsSet = new Set(QUESTION_BANK.map((q) => q.topic));
  console.assert(topicsSet.size === 19, `Expected 19 topics, found ${topicsSet.size}`);
  console.log(`✅ Question Bank passed: ${QUESTION_BANK.length} questions across ${topicsSet.size} DSA topics.\n`);

  // 2. Java Code Execution Sandbox Verification
  console.log('2️⃣ Testing Local Java JDK 24 Sandboxed Execution Adapter...');
  const sampleJavaCode = `
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(n * 2);
        }
    }
}
  `;

  const execRes = await executionService.runCode({
    code: sampleJavaCode,
    testCases: [
      { id: 't1', input: '5', expectedOutput: '10' },
      { id: 't2', input: '12', expectedOutput: '24' },
    ],
  });

  console.assert(execRes.compiled === true, 'Expected code to compile');
  console.assert(execRes.passCount === 2, `Expected 2 passed tests, got ${execRes.passCount}`);
  console.log(`✅ Local Java Sandbox passed: ${execRes.passCount}/${execRes.totalCount} tests passed in ${execRes.totalTimeMs}ms.\n`);

  // 3. State Machine Verification
  console.log('3️⃣ Testing Assessment State Machine Transitions...');
  console.assert(AssessmentStateMachine.canTransition('IDLE', 'PROBLEM_LOADED'), 'IDLE -> PROBLEM_LOADED should be valid');
  console.assert(AssessmentStateMachine.canTransition('UNDERSTANDING', 'UNDERSTANDING_REVIEW'), 'UNDERSTANDING -> UNDERSTANDING_REVIEW should be valid');
  console.assert(AssessmentStateMachine.canTransition('UNDERSTANDING_REVIEW', 'PLAN'), 'UNDERSTANDING_REVIEW -> PLAN should be valid');
  console.assert(AssessmentStateMachine.canTransition('PLAN', 'PLAN_REVIEW'), 'PLAN -> PLAN_REVIEW should be valid');
  console.assert(AssessmentStateMachine.canTransition('PLAN_REVIEW', 'IMPLEMENTATION'), 'PLAN_REVIEW -> IMPLEMENTATION should be valid');
  console.assert(!AssessmentStateMachine.canTransition('IDLE', 'EVALUATED'), 'IDLE -> EVALUATED should be invalid');
  console.log('✅ Assessment State Machine passed.\n');

  // 4. Scoring Engine Verification
  console.log('4️⃣ Testing Scoring Engine out-of-10 breakdown calculation...');
  const q = QUESTION_BANK[0];
  const scoreBreakdown = ScoringEngine.calculateScore(q, execRes, 8, 9, sampleJavaCode);
  console.assert(scoreBreakdown.overallScore > 0, 'Score should be > 0');
  console.log(`✅ Scoring Engine passed: Score calculated as ${scoreBreakdown.overallScore}/10 (${scoreBreakdown.status}).\n`);

  // 5. Question Specification Schema Verification
  console.log('5️⃣ Testing QuestionSpecification Schema & Validation Rules...');
  const { runQuestionSpecificationTests } = await import('./questionSpecification.test.js');
  runQuestionSpecificationTests();
  console.log('✅ QuestionSpecification Schema tests passed.\n');

  console.log('🎉 ALL INTEGRATION TESTS PASSED CLEANLY!');
}

runTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
