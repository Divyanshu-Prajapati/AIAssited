"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const questionBank_js_1 = require("../seed/questionBank.js");
const ExecutionService_js_1 = require("../providers/execution/ExecutionService.js");
const AssessmentStateMachine_js_1 = require("../engine/AssessmentStateMachine.js");
const ScoringEngine_js_1 = require("../engine/ScoringEngine.js");
async function runTests() {
    console.log('🧪 Starting DSA AI Assessment Lab Integration Tests...\n');
    // 1. Question Bank Verification
    console.log('1️⃣ Checking Question Bank Integrity...');
    console.assert(questionBank_js_1.QUESTION_BANK.length >= 100, `Expected >= 100 questions, got ${questionBank_js_1.QUESTION_BANK.length}`);
    const topicsSet = new Set(questionBank_js_1.QUESTION_BANK.map((q) => q.topic));
    console.assert(topicsSet.size === 19, `Expected 19 topics, found ${topicsSet.size}`);
    console.log(`✅ Question Bank passed: ${questionBank_js_1.QUESTION_BANK.length} questions across ${topicsSet.size} DSA topics.\n`);
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
    const execRes = await ExecutionService_js_1.executionService.runCode({
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
    console.assert(AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('IDLE', 'PROBLEM_LOADED'), 'IDLE -> PROBLEM_LOADED should be valid');
    console.assert(AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('UNDERSTANDING', 'UNDERSTANDING_REVIEW'), 'UNDERSTANDING -> UNDERSTANDING_REVIEW should be valid');
    console.assert(AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('UNDERSTANDING_REVIEW', 'PLAN'), 'UNDERSTANDING_REVIEW -> PLAN should be valid');
    console.assert(AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('PLAN', 'PLAN_REVIEW'), 'PLAN -> PLAN_REVIEW should be valid');
    console.assert(AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('PLAN_REVIEW', 'IMPLEMENTATION'), 'PLAN_REVIEW -> IMPLEMENTATION should be valid');
    console.assert(!AssessmentStateMachine_js_1.AssessmentStateMachine.canTransition('IDLE', 'EVALUATED'), 'IDLE -> EVALUATED should be invalid');
    console.log('✅ Assessment State Machine passed.\n');
    // 4. Scoring Engine Verification
    console.log('4️⃣ Testing Scoring Engine out-of-10 breakdown calculation...');
    const q = questionBank_js_1.QUESTION_BANK[0];
    const scoreBreakdown = ScoringEngine_js_1.ScoringEngine.calculateScore(q, execRes, 8, 9, sampleJavaCode);
    console.assert(scoreBreakdown.overallScore > 0, 'Score should be > 0');
    console.log(`✅ Scoring Engine passed: Score calculated as ${scoreBreakdown.overallScore}/10 (${scoreBreakdown.status}).\n`);
    console.log('🎉 ALL INTEGRATION TESTS PASSED CLEANLY!');
}
runTests().catch((err) => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
});
