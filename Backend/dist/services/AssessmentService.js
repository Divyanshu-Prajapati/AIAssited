"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentService = exports.AssessmentService = void 0;
const db_js_1 = require("../database/db.js");
const QuestionService_js_1 = require("./QuestionService.js");
const ExecutionService_js_1 = require("../providers/execution/ExecutionService.js");
const AIService_js_1 = require("../providers/ai/AIService.js");
const AssessmentStateMachine_js_1 = require("../engine/AssessmentStateMachine.js");
const ScoringEngine_js_1 = require("../engine/ScoringEngine.js");
const AdaptiveDifficultyEngine_js_1 = require("../engine/AdaptiveDifficultyEngine.js");
class AssessmentService {
    async startSession(userId, questionId, mode = 'AI_ASSISTED') {
        const user = await db_js_1.prisma.user.findFirst();
        const activeUserId = user ? user.id : userId;
        let targetQuestionId = questionId;
        if (!targetQuestionId) {
            const allQuestions = await QuestionService_js_1.questionService.getAllQuestions();
            const userProfile = JSON.parse(user?.skillProfile || '{}');
            const attempted = await db_js_1.prisma.attempt.findMany({
                where: { userId: activeUserId },
                select: { questionId: true },
            });
            const attemptedIds = attempted.map((a) => a.questionId);
            const selected = AdaptiveDifficultyEngine_js_1.AdaptiveDifficultyEngine.selectNextQuestion(allQuestions, userProfile, attemptedIds);
            targetQuestionId = selected.id;
        }
        const q = await QuestionService_js_1.questionService.getQuestionById(targetQuestionId);
        if (!q)
            throw new Error(`Question ${targetQuestionId} not found`);
        const session = await db_js_1.prisma.assessmentSession.create({
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
        await db_js_1.prisma.codeVersion.create({
            data: {
                sessionId: session.id,
                versionNumber: 1,
                code: q.starterCode,
                action: 'INITIAL',
            },
        });
        return this.getSessionDetails(session.id);
    }
    async getSessionDetails(sessionId) {
        const session = await db_js_1.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                question: true,
                aiInteractions: { orderBy: { timestamp: 'asc' } },
                codeVersions: { orderBy: { versionNumber: 'desc' } },
            },
        });
        if (!session)
            throw new Error('Session not found');
        const formattedQ = QuestionService_js_1.questionService.formatQuestion(session.question);
        return {
            id: session.id,
            userId: session.userId,
            question: formattedQ,
            mode: session.mode,
            state: session.state,
            currentCode: session.currentCode,
            understandingText: session.understandingText,
            planText: session.planText,
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
    async submitUnderstanding(sessionId, text) {
        const s = await db_js_1.prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
        if (!s)
            throw new Error('Session not found');
        const q = QuestionService_js_1.questionService.formatQuestion(s.question);
        const aiCtx = { question: q, phase: 'UNDERSTANDING', userPrompt: text };
        const aiRes = await AIService_js_1.aiService.evaluateUnderstanding(aiCtx, text);
        const promptScore = aiRes.promptQuality?.score || (aiRes.status === 'approved' ? 8 : 4);
        await db_js_1.prisma.aIInteraction.create({
            data: {
                sessionId,
                phase: 'UNDERSTANDING',
                userPrompt: text,
                assistantResponse: aiRes.feedback,
                promptScore,
                feedbackType: 'EXPLAIN',
            },
        });
        let newState = 'UNDERSTANDING_REVIEW';
        if (aiRes.status === 'approved') {
            newState = 'PLAN';
        }
        await db_js_1.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                understandingText: text,
                promptQualityScore: promptScore,
                state: newState,
            },
        });
        return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes };
    }
    async submitPlan(sessionId, planText) {
        const s = await db_js_1.prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
        if (!s)
            throw new Error('Session not found');
        const q = QuestionService_js_1.questionService.formatQuestion(s.question);
        const aiCtx = { question: q, phase: 'PLAN', userPlan: planText };
        const aiRes = await AIService_js_1.aiService.evaluatePlan(aiCtx, planText);
        const planScore = aiRes.status === 'approved' ? 9 : 5;
        await db_js_1.prisma.aIInteraction.create({
            data: {
                sessionId,
                phase: 'PLAN',
                userPrompt: planText,
                assistantResponse: aiRes.feedback,
                promptScore: planScore,
                feedbackType: 'PLAN_REVIEW',
            },
        });
        let newState = 'PLAN_REVIEW';
        if (aiRes.status === 'approved') {
            newState = 'IMPLEMENTATION';
        }
        await db_js_1.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                planText,
                planQualityScore: planScore,
                state: newState,
            },
        });
        return { session: await this.getSessionDetails(sessionId), aiResponse: aiRes };
    }
    async requestHint(sessionId) {
        const s = await db_js_1.prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
        if (!s)
            throw new Error('Session not found');
        const nextLevel = s.hintsUsed + 1;
        const q = QuestionService_js_1.questionService.formatQuestion(s.question);
        const aiCtx = { question: q, phase: s.state, hintsUsed: s.hintsUsed };
        const aiRes = await AIService_js_1.aiService.generateHint(aiCtx, nextLevel);
        await db_js_1.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: { hintsUsed: nextLevel },
        });
        await db_js_1.prisma.aIInteraction.create({
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
    async runVisibleTests(sessionId, code) {
        const s = await db_js_1.prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
        if (!s)
            throw new Error('Session not found');
        const currentState = s.state;
        if (!AssessmentStateMachine_js_1.AssessmentStateMachine.isCodeExecutionAllowed(currentState)) {
            throw new Error(`Code execution rejected. Current phase is '${currentState}'. Complete Step 1 (Understand) and Step 2 (Plan) first.`);
        }
        const q = QuestionService_js_1.questionService.formatQuestion(s.question);
        const execRes = await ExecutionService_js_1.executionService.runCode({
            code,
            testCases: q.visibleTests,
            timeLimitMs: q.timeLimit,
            memoryLimitMb: q.memoryLimit,
        });
        const nextState = execRes.success && execRes.passCount < execRes.totalCount ? 'DEBUGGING' : 'TESTING';
        await db_js_1.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                currentCode: code,
                state: nextState,
            },
        });
        // Save version history
        const versions = await db_js_1.prisma.codeVersion.count({ where: { sessionId } });
        await db_js_1.prisma.codeVersion.create({
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
    async submitAssessment(sessionId, code) {
        const s = await db_js_1.prisma.assessmentSession.findUnique({ where: { id: sessionId }, include: { question: true } });
        if (!s)
            throw new Error('Session not found');
        const currentState = s.state;
        if (!AssessmentStateMachine_js_1.AssessmentStateMachine.isCodeExecutionAllowed(currentState)) {
            throw new Error(`Submission rejected. Current phase is '${currentState}'. Complete Step 1 (Understand) and Step 2 (Plan) first.`);
        }
        const q = QuestionService_js_1.questionService.formatQuestion(s.question);
        const allTestCases = [...q.visibleTests, ...q.hiddenTests];
        const execRes = await ExecutionService_js_1.executionService.submitCode({
            code,
            testCases: allTestCases,
            timeLimitMs: q.timeLimit,
            memoryLimitMb: q.memoryLimit,
        });
        let reasoningScoreBonus = s.solutionRevealed ? 0 : 1;
        const breakdown = ScoringEngine_js_1.ScoringEngine.calculateScore(q, execRes, s.promptQualityScore, s.planQualityScore, code);
        if (s.solutionRevealed) {
            breakdown.reasoningScore = 0;
            breakdown.overallScore = Math.max(0, Math.round((breakdown.overallScore - 2) * 10) / 10);
            breakdown.areasToImprove.unshift('Reference solution was revealed — independent reasoning score adjusted.');
        }
        // Create Attempt record
        const attempt = await db_js_1.prisma.attempt.create({
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
            await db_js_1.prisma.testResult.create({
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
        const user = await db_js_1.prisma.user.findUnique({ where: { id: s.userId } });
        if (user) {
            const currentProfile = JSON.parse(user.skillProfile || '{}');
            const updatedProfile = AdaptiveDifficultyEngine_js_1.AdaptiveDifficultyEngine.updateProfile(currentProfile, q.topic, breakdown.overallScore, execRes.passCount === execRes.totalCount, s.hintsUsed);
            await db_js_1.prisma.user.update({
                where: { id: s.userId },
                data: { skillProfile: JSON.stringify(updatedProfile) },
            });
        }
        await db_js_1.prisma.assessmentSession.update({
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
    async markSolutionRevealed(sessionId) {
        await db_js_1.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: { solutionRevealed: true },
        });
        return this.getSessionDetails(sessionId);
    }
}
exports.AssessmentService = AssessmentService;
exports.assessmentService = new AssessmentService();
