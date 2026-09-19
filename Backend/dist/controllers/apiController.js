"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const QuestionService_js_1 = require("../services/QuestionService.js");
const AssessmentService_js_1 = require("../services/AssessmentService.js");
const AnalyticsService_js_1 = require("../services/AnalyticsService.js");
const AIService_js_1 = require("../providers/ai/AIService.js");
const ExecutionService_js_1 = require("../providers/execution/ExecutionService.js");
class ApiController {
    static async getQuestions(req, res) {
        try {
            const topic = req.query.topic;
            const difficulty = req.query.difficulty;
            const questions = await QuestionService_js_1.questionService.getAllQuestions({ topic, difficulty });
            res.json({ success: true, count: questions.length, data: questions });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async getQuestionById(req, res) {
        try {
            const q = await QuestionService_js_1.questionService.getQuestionById(req.params.id);
            if (!q) {
                res.status(404).json({ success: false, error: 'Question not found' });
                return;
            }
            res.json({ success: true, data: q });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async startAssessment(req, res) {
        try {
            const { questionId, mode } = req.body;
            const session = await AssessmentService_js_1.assessmentService.startSession('default', questionId, mode);
            res.json({ success: true, data: session });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async getSession(req, res) {
        try {
            const session = await AssessmentService_js_1.assessmentService.getSessionDetails(req.params.id);
            res.json({ success: true, data: session });
        }
        catch (err) {
            res.status(404).json({ success: false, error: err.message });
        }
    }
    static async submitUnderstanding(req, res) {
        try {
            const { text } = req.body;
            const result = await AssessmentService_js_1.assessmentService.submitUnderstanding(req.params.id, text);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async submitPlan(req, res) {
        try {
            const { planText } = req.body;
            const result = await AssessmentService_js_1.assessmentService.submitPlan(req.params.id, planText);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async requestHint(req, res) {
        try {
            const result = await AssessmentService_js_1.assessmentService.requestHint(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async runCode(req, res) {
        try {
            const { code } = req.body;
            const result = await AssessmentService_js_1.assessmentService.runVisibleTests(req.params.id, code);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async submitAssessment(req, res) {
        try {
            const { code } = req.body;
            const result = await AssessmentService_js_1.assessmentService.submitAssessment(req.params.id, code);
            res.json({ success: true, data: result });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async askAI(req, res) {
        try {
            const { sessionId, action, userPrompt, code, confirmed } = req.body;
            const session = await AssessmentService_js_1.assessmentService.getSessionDetails(sessionId);
            const ctx = {
                question: session.question,
                phase: session.state,
                userPrompt,
                userPlan: session.planText,
                code: code || session.currentCode,
                hintsUsed: session.hintsUsed,
            };
            let aiRes;
            if (action === 'debug')
                aiRes = await AIService_js_1.aiService.debugCode(ctx);
            else if (action === 'review')
                aiRes = await AIService_js_1.aiService.reviewCode(ctx);
            else if (action === 'dry_run')
                aiRes = await AIService_js_1.aiService.dryRun(ctx, userPrompt || '');
            else if (action === 'concept')
                aiRes = await AIService_js_1.aiService.reviewConcept(ctx);
            else if (action === 'solution') {
                if (confirmed) {
                    await AssessmentService_js_1.assessmentService.markSolutionRevealed(sessionId);
                }
                aiRes = await AIService_js_1.aiService.generateSolution(ctx, confirmed || false);
            }
            else
                aiRes = await AIService_js_1.aiService.evaluateUnderstanding(ctx, userPrompt || '');
            res.json({ success: true, data: aiRes });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async getAnalytics(req, res) {
        try {
            const data = await AnalyticsService_js_1.analyticsService.getUserDashboard();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async getHistory(req, res) {
        try {
            const data = await AnalyticsService_js_1.analyticsService.getHistory();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    static async getSystemStatus(req, res) {
        try {
            const aiStatus = await AIService_js_1.aiService.getStatus();
            const compileCheck = await ExecutionService_js_1.executionService.compileCode('public class Main { public static void main(String[] a) {} }');
            res.json({
                success: true,
                data: {
                    executionEngine: 'Local JDK 24 Sandboxed Runner',
                    javaAvailable: compileCheck.success,
                    aiEngine: aiStatus.mode,
                    ollamaAvailable: aiStatus.ollamaAvailable,
                },
            });
        }
        catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}
exports.ApiController = ApiController;
