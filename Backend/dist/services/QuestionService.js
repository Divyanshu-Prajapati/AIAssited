"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionService = exports.QuestionService = void 0;
const db_js_1 = require("../database/db.js");
class QuestionService {
    async getAllQuestions(filters) {
        const where = {};
        if (filters?.topic)
            where.topic = filters.topic;
        if (filters?.difficulty)
            where.difficulty = filters.difficulty;
        const raw = await db_js_1.prisma.question.findMany({ where });
        return raw.map(this.formatQuestion);
    }
    async getQuestionById(id) {
        const raw = await db_js_1.prisma.question.findUnique({ where: { id } });
        if (!raw)
            return null;
        return this.formatQuestion(raw);
    }
    formatQuestion(q) {
        return {
            id: q.id,
            title: q.title,
            story: q.story,
            problemStatement: q.problemStatement,
            inputFormat: q.inputFormat,
            outputFormat: q.outputFormat,
            constraints: q.constraints,
            examples: JSON.parse(q.examples || '[]'),
            difficulty: q.difficulty,
            topic: q.topic,
            pattern: q.pattern,
            expectedTimeComplexity: q.expectedTimeComplexity,
            expectedSpaceComplexity: q.expectedSpaceComplexity,
            timeLimit: q.timeLimit,
            memoryLimit: q.memoryLimit,
            starterCode: q.starterCode,
            visibleTests: JSON.parse(q.visibleTests || '[]'),
            hiddenTests: JSON.parse(q.hiddenTests || '[]'),
            edgeCases: JSON.parse(q.edgeCases || '[]'),
            tags: JSON.parse(q.tags || '[]'),
        };
    }
}
exports.QuestionService = QuestionService;
exports.questionService = new QuestionService();
