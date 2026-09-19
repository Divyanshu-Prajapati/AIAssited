"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const db_js_1 = require("../database/db.js");
class AnalyticsService {
    async getUserDashboard(userId) {
        const user = await db_js_1.prisma.user.findFirst();
        if (!user) {
            return {
                totalProblems: 118,
                solved: 0,
                attempted: 0,
                accuracy: 0,
                averageScore: 0,
                hintsUsed: 0,
                topicStrength: {},
                recentAttempts: [],
            };
        }
        const attempts = await db_js_1.prisma.attempt.findMany({
            where: { userId: user.id },
            include: { question: true },
            orderBy: { submittedAt: 'desc' },
            take: 10,
        });
        const totalAttempted = await db_js_1.prisma.attempt.count({ where: { userId: user.id } });
        const totalAccepted = await db_js_1.prisma.attempt.count({
            where: { userId: user.id, status: 'ACCEPTED' },
        });
        const skillProfile = JSON.parse(user.skillProfile || '{}');
        return {
            user: { id: user.id, name: user.name, email: user.email },
            totalProblems: 118,
            solved: totalAccepted,
            attempted: totalAttempted,
            accuracy: totalAttempted > 0 ? Math.round((totalAccepted / totalAttempted) * 100) : 0,
            averageScore: skillProfile.averageScore || 0,
            hintsUsed: skillProfile.hintUsageCount || 0,
            skillProfile,
            recentAttempts: attempts.map((a) => ({
                id: a.id,
                questionId: a.questionId,
                title: a.question.title,
                topic: a.question.topic,
                difficulty: a.question.difficulty,
                status: a.status,
                score: a.score,
                executionTimeMs: a.executionTimeMs,
                submittedAt: a.submittedAt,
            })),
        };
    }
    async getHistory(userId) {
        const user = await db_js_1.prisma.user.findFirst();
        if (!user)
            return [];
        const attempts = await db_js_1.prisma.attempt.findMany({
            where: { userId: user.id },
            include: { question: true, testResults: true },
            orderBy: { submittedAt: 'desc' },
        });
        return attempts.map((a) => ({
            id: a.id,
            questionId: a.questionId,
            title: a.question.title,
            topic: a.question.topic,
            difficulty: a.question.difficulty,
            pattern: a.question.pattern,
            status: a.status,
            score: a.score,
            code: a.code,
            hintsCount: a.hintsCount,
            executionTimeMs: a.executionTimeMs,
            submittedAt: a.submittedAt,
            evaluation: JSON.parse(a.evaluation || '{}'),
            testResultsCount: a.testResults.length,
            passedCount: a.testResults.filter((t) => t.passed).length,
        }));
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
