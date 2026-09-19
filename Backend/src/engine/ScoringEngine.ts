import { QuestionData, ExecutionResult, EvaluationBreakdown, SubmissionStatus } from '../types/index.js';

export class ScoringEngine {
  public static calculateScore(
    question: QuestionData,
    execResult: ExecutionResult,
    promptQualityScore: number,
    planQualityScore: number,
    code: string
  ): EvaluationBreakdown {
    if (!execResult.compiled) {
      return {
        correctnessScore: 0,
        timeComplexityScore: 0,
        spaceComplexityScore: 0,
        edgeCaseScore: 0,
        codeQualityScore: 0,
        reasoningScore: 0,
        overallScore: 0,
        status: 'COMPILATION_ERROR',
        detectedTimeComplexity: 'N/A',
        detectedSpaceComplexity: 'N/A',
        feedbackSummary: 'Compilation Error: The solution could not compile successfully.',
        strengths: [],
        areasToImprove: ['Fix compiler syntax errors and unresolved symbols.'],
      };
    }

    const totalTests = execResult.totalCount || 1;
    const passedTests = execResult.passCount || 0;
    const passRatio = passedTests / totalTests;

    // 1. Correctness Score (Max 4)
    const correctnessScore = Math.round(passRatio * 4 * 10) / 10;

    // 2. Edge Case Score (Max 1)
    const hiddenTests = execResult.testResults.filter((t) => t.isHidden);
    const hiddenPass = hiddenTests.filter((t) => t.passed).length;
    const hiddenRatio = hiddenTests.length > 0 ? hiddenPass / hiddenTests.length : passRatio;
    const edgeCaseScore = Math.round(hiddenRatio * 1 * 10) / 10;

    // 3. Time Complexity Score (Max 2)
    let timeComplexityScore = 2;
    let detectedTimeComplexity = question.expectedTimeComplexity;
    if (execResult.totalTimeMs > question.timeLimit) {
      timeComplexityScore = 0.5;
      detectedTimeComplexity = 'Time Limit Exceeded';
    } else if (question.expectedTimeComplexity === 'O(N)' || question.expectedTimeComplexity === 'O(1)') {
      // Static check for nested loops if expected is linear or constant
      const matchesNestedLoops = (code.match(/for\s*\(/g) || []).length >= 2 || (code.match(/while\s*\(/g) || []).length >= 2;
      if (matchesNestedLoops && !code.includes('Map') && !code.includes('Set')) {
        timeComplexityScore = 1;
        detectedTimeComplexity = 'O(N²) [Suboptimal nested loops detected]';
      }
    }

    // 4. Space Complexity Score (Max 1)
    let spaceComplexityScore = 1;
    let detectedSpaceComplexity = question.expectedSpaceComplexity;
    if (execResult.peakMemoryKb > question.memoryLimit * 1024) {
      spaceComplexityScore = 0;
      detectedSpaceComplexity = 'Exceeds Memory Limit';
    }

    // 5. Code Quality Score (Max 1)
    let codeQualityScore = 1;
    if (code.length < 30 || code.includes('System.out.print("")')) {
      codeQualityScore = 0.5;
    }

    // 6. Reasoning / Explanation Score (Max 1)
    const reasoningAvg = (promptQualityScore + planQualityScore) / 2;
    const reasoningScore = Math.round((reasoningAvg / 10) * 1 * 10) / 10;

    const overallScore = Math.round(
      (correctnessScore + timeComplexityScore + spaceComplexityScore + edgeCaseScore + codeQualityScore + reasoningScore) * 10
    ) / 10;

    // Determine status
    let status: SubmissionStatus = 'WRONG_ANSWER';
    if (passRatio === 1) {
      if (timeComplexityScore < 2) {
        status = 'ACCEPTED_BUT_INEFFICIENT';
      } else {
        status = 'ACCEPTED';
      }
    } else if (passRatio > 0) {
      status = 'PARTIALLY_CORRECT';
    } else {
      status = 'WRONG_ANSWER';
    }

    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (passRatio === 1) strengths.push('Passed all visible and hidden test cases.');
    if (timeComplexityScore === 2) strengths.push(`Achieved optimal time complexity (${question.expectedTimeComplexity}).`);
    if (reasoningScore >= 0.8) strengths.push('Demonstrated strong problem understanding and algorithm planning.');

    if (passRatio < 1) areasToImprove.push(`Failed ${totalTests - passedTests} out of ${totalTests} test cases.`);
    if (timeComplexityScore < 2) areasToImprove.push(`Optimize algorithm time complexity to reach ${question.expectedTimeComplexity}.`);
    if (reasoningScore < 0.7) areasToImprove.push('Improve prompt specificity and technical plan breakdown.');

    const feedbackSummary = `Assessment Score: ${overallScore}/10 (${status}). Passed ${passedTests}/${totalTests} test cases.`;

    return {
      correctnessScore,
      timeComplexityScore,
      spaceComplexityScore,
      edgeCaseScore,
      codeQualityScore,
      reasoningScore,
      overallScore,
      status,
      detectedTimeComplexity,
      detectedSpaceComplexity,
      feedbackSummary,
      strengths,
      areasToImprove,
    };
  }
}
