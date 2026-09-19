import { prisma } from '../database/db.js';
import { questionService } from './QuestionService.js';
import { executionService } from '../providers/execution/ExecutionService.js';
import { aiService } from '../providers/ai/AIService.js';
import { AssessmentStateMachine } from '../engine/AssessmentStateMachine.js';
import { ScoringEngine } from '../engine/ScoringEngine.js';
import { AdaptiveDifficultyEngine } from '../engine/AdaptiveDifficultyEngine.js';
import { AssessmentState, PracticeMode, ExecutionResult, UserSkillProfile, EvaluationBreakdown } from '../types/index.js';

export class AssessmentService {
  public async startSession(userId: string, questionId?: string, mode: PracticeMode = 'AI_ASSISTED'): Promise<any> {
    const user = await prisma.user.findFirst();
    const activeUserId = user ? user.id : userId;

    let targetQuestionId = questionId;
    if (!targetQuestionId) {
      const allQuestions = await questionService.getAllQuestions();
      const userProfile: UserSkillProfile = JSON.parse(user?.skillProfile || '{}');
      const attempted = await prisma.attempt.findMany({
        where: { userId: activeUserId },
        select: { questionId: true },
      });
      const attemptedIds = attempted.map((a) => a.questionId);
      const selected = AdaptiveDifficultyEngine.selectNextQuestion(allQuestions, userProfile, attemptedIds);
      targetQuestionId = selected.id;
    }

    const q = await questionService.getQuestionById(targetQuestionId);
    if (!q) throw new Error(`Question ${targetQuestionId} not found`);

    const session = await prisma.assessmentSession.create({
      data: {
        userId: activeUserId,
        questionId: targetQuestionId,
        mode,
        state: 'PROBLEM_LOADED',
        currentCode: q.starterCode,
        timeLimitMinutes: 45,
        remainingSeconds: 45 * 60,
      },
    });

    // Create initial code checkpoint
    await prisma.codeVersion.create({
      data: {
        sessionId: session.id,
        versionNumber: 1,
        code: q.starterCode,
        action: 'INITIAL',
      },
    });

    return this.getSessionDetails(session.id);
  }

  public async getSessionDetails(sessionId: string): Promise<any> {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        question: true,
        aiInteractions: { orderBy: { timestamp: 'asc' } },
        codeVersions: { orderBy: { versionNumber: 'desc' } },
      },
    });
    if (!session) throw new Error('Session not found');

    const formattedQ = questionService.formatQuestion(session.question);
    return {
      id: session.id,
      userId: session.userId,
      question: formattedQ,
      mode: session.mode,
      state: session.state as AssessmentState,
      currentCode: session.currentCode,
      understandingText: session.understandingText,
      planText: session.planText,
      implementationText: session.implementationText || '',
      generatedCode: session.generatedCode || '',
      promptQualityScore: session.promptQualityScore,
      planQualityScore: session.planQualityScore,
      hintsUsed: session.hintsUsed,
      solutionRevealed: session.solutionRevealed,
      remainingSeconds: session.remainingSeconds,
      evaluationReport: JSON.parse(session.evaluationReport || '{}'),
      aiInteractions: session.aiInteractions,
      codeVersions: session.codeVersions,
    };
  }

  public async submitUnderstanding(sessionId: string, text: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const q = questionService.formatQuestion(s.question);
    const aiCtx = { question: q, phase: 'UNDERSTANDING', userPrompt: text };

    const aiRes = await aiService.evaluateUnderstanding(aiCtx, text);
    const promptScore = aiRes.promptQuality?.score || (aiRes.status === 'approved' ? 8 : 4);

    await prisma.aIInteraction.create({
      data: {
        sessionId,
        phase: 'UNDERSTANDING',
        userPrompt: text,
        assistantResponse: aiRes.feedback,
        promptScore,
        feedbackType: 'EXPLAIN',
      },
    });

    let newState: AssessmentState = 'UNDERSTANDING_REVIEW';
    if (aiRes.status === 'approved') {
      newState = 'PLAN';
    }

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        understandingText: text,
        promptQualityScore: promptScore,
        state: newState,
      },
    });

    return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes };
  }

  public async submitPlan(sessionId: string, planText: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const q = questionService.formatQuestion(s.question);
    const aiCtx = { question: q, phase: 'PLAN', userPlan: planText };

    const aiRes = await aiService.evaluatePlan(aiCtx, planText);
    const planScore = aiRes.status === 'approved' ? 9 : 5;

    await prisma.aIInteraction.create({
      data: {
        sessionId,
        phase: 'PLAN',
        userPrompt: planText,
        assistantResponse: aiRes.feedback,
        promptScore: planScore,
        feedbackType: 'PLAN_REVIEW',
      },
    });

    let newState: AssessmentState = 'PLAN_REVIEW';
    if (aiRes.status === 'approved') {
      newState = 'IMPLEMENTATION';
    }

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        planText,
        planQualityScore: planScore,
        state: newState,
      },
    });

    return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes };
  }

  public async submitImplementation(sessionId: string, text: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const q = questionService.formatQuestion(s.question);
    const aiCtx = {
      question: q,
      phase: 'IMPLEMENTATION',
      userPrompt: s.understandingText,
      userPlan: s.planText,
      userImplementation: text,
    };

    const aiRes = await aiService.evaluateImplementation(aiCtx, text);

    await prisma.aIInteraction.create({
      data: {
        sessionId,
        phase: 'IMPLEMENTATION',
        userPrompt: text,
        assistantResponse: aiRes.feedback,
        promptScore: aiRes.status === 'approved' ? 9 : 4,
        feedbackType: 'CODE_GENERATION',
      },
    });

    let newState: AssessmentState = 'IMPLEMENTATION_REVIEW';
    let generatedCode = s.generatedCode || '';

    if (aiRes.status === 'approved') {
      generatedCode = await aiService.generateCodeFromReasoning(aiCtx);
      newState = 'CODE_READY';

      // Save version checkpoint for AI generated implementation
      const versions = await prisma.codeVersion.count({ where: { sessionId } });
      await prisma.codeVersion.create({
        data: {
          sessionId,
          versionNumber: versions + 1,
          code: generatedCode,
          action: 'AI Generated Implementation',
          testSummary: 'Generated from candidate implementation prompt',
        },
      });
    }

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        implementationText: text,
        generatedCode: generatedCode,
        currentCode: generatedCode || s.currentCode,
        state: newState,
      },
    });

    return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes, generatedCode };
  }


  public async requestHint(sessionId: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const nextLevel = s.hintsUsed + 1;
    const q = questionService.formatQuestion(s.question);
    const aiCtx = { question: q, phase: s.state, hintsUsed: s.hintsUsed };

    const aiRes = await aiService.generateHint(aiCtx, nextLevel);

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: { hintsUsed: nextLevel },
    });

    await prisma.aIInteraction.create({
      data: {
        sessionId,
        phase: s.state,
        userPrompt: `Request Hint Level ${nextLevel}`,
        assistantResponse: aiRes.feedback,
        promptScore: 0,
        feedbackType: 'HINT',
      },
    });

    return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes };
  }

  public async runVisibleTests(sessionId: string, code: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const currentState = s.state as AssessmentState;
    if (!AssessmentStateMachine.isCodeExecutionAllowed(currentState)) {
      throw new Error(`Code execution rejected. Current phase is '${currentState}'. Complete Step 1 (Understand) and Step 2 (Plan) first.`);
    }

    const q = questionService.formatQuestion(s.question);
    const execRes: ExecutionResult = await executionService.runCode({
      code,
      testCases: q.visibleTests,
      timeLimitMs: q.timeLimit,
      memoryLimitMb: q.memoryLimit,
    });

    const nextState: AssessmentState = execRes.success && execRes.passCount < execRes.totalCount ? 'DEBUGGING' : 'TESTING';

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        currentCode: code,
        state: nextState,
      },
    });

    // Save version history
    const versions = await prisma.codeVersion.count({ where: { sessionId } });
    await prisma.codeVersion.create({
      data: {
        sessionId,
        versionNumber: versions + 1,
        code,
        action: 'RUN',
        testSummary: `Passed ${execRes.passCount}/${execRes.totalCount} visible tests`,
      },
    });

    return { session: await this.getSessionDetails(sessionId), executionResult: execRes };
  }

  public async submitAssessment(sessionId: string, code: string): Promise<any> {
    const s = await prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
    if (!s) throw new Error('Session not found');

    const currentState = s.state as AssessmentState;
    if (!AssessmentStateMachine.isCodeExecutionAllowed(currentState)) {
      throw new Error(`Submission rejected. Current phase is '${currentState}'. Complete Step 1 (Understand) and Step 2 (Plan) first.`);
    }

    const q = questionService.formatQuestion(s.question);
    const allTestCases = [...q.visibleTests, ...q.hiddenTests];

    const execRes: ExecutionResult = await executionService.submitCode({
      code,
      testCases: allTestCases,
      timeLimitMs: q.timeLimit,
      memoryLimitMb: q.memoryLimit,
    });

    let reasoningScoreBonus = s.solutionRevealed ? 0 : 1;
    const breakdown: EvaluationBreakdown = ScoringEngine.calculateScore(
      q,
      execRes,
      s.promptQualityScore,
      s.planQualityScore,
      code
    );

    if (s.solutionRevealed) {
      breakdown.reasoningScore = 0;
      breakdown.overallScore = Math.max(0, Math.round((breakdown.overallScore - 2) * 10) / 10);
      breakdown.areasToImprove.unshift('Reference solution was revealed — independent reasoning score adjusted.');
    }

    // Create Attempt record
    const attempt = await prisma.attempt.create({
      data: {
        userId: s.userId,
        questionId: q.id,
        sessionId,
        status: breakdown.status,
        score: breakdown.overallScore,
        executionTimeMs: execRes.totalTimeMs,
        memoryKb: execRes.peakMemoryKb,
        code,
        hintsCount: s.hintsUsed,
        evaluation: JSON.stringify(breakdown),
      },
    });

    // Save test results
    for (let i = 0; i < execRes.testResults.length; i++) {
      const tr = execRes.testResults[i];
      await prisma.testResult.create({
        data: {
          attemptId: attempt.id,
          testType: tr.isHidden ? 'HIDDEN' : 'VISIBLE',
          testIndex: i,
          passed: tr.passed,
          executionTimeMs: tr.executionTimeMs,
          memoryKb: tr.memoryKb,
          expectedOutput: tr.expectedOutput,
          actualOutput: tr.actualOutput,
          errorLog: tr.errorLog,
        },
      });
    }

    // Update User Skill Profile
    const user = await prisma.user.findUnique({ where: { id: s.userId } });
    if (user) {
      const currentProfile: UserSkillProfile = JSON.parse(user.skillProfile || '{}');
      const updatedProfile = AdaptiveDifficultyEngine.updateProfile(
        currentProfile,
        q.topic,
        breakdown.overallScore,
        execRes.passCount === execRes.totalCount,
        s.hintsUsed
      );
      await prisma.user.update({
        where: { id: s.userId },
        data: { skillProfile: JSON.stringify(updatedProfile) },
      });
    }

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        currentCode: code,
        state: 'EVALUATED',
        overallScore: breakdown.overallScore,
        evaluationReport: JSON.stringify(breakdown),
      },
    });

    return {
      session: await this.getSessionDetails(sessionId),
      attempt,
      executionResult: execRes,
      scoreBreakdown: breakdown,
    };
  }

  public async markSolutionRevealed(sessionId: string): Promise<any> {
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: { solutionRevealed: true },
    });
    return this.getSessionDetails(sessionId);
  }
}

export const assessmentService = new AssessmentService();
