import { prisma } from '../database/db.js';
import { QuestionData, DSATopic, Difficulty } from '../types/index.js';

export class QuestionService {
  public async getAllQuestions(filters?: { topic?: DSATopic; difficulty?: Difficulty }): Promise<QuestionData[]> {
    const where: any = {};
    if (filters?.topic) where.topic = filters.topic;
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    const raw = await prisma.question.findMany({ where });
    return raw.map(this.formatQuestion);
  }

  public async getQuestionById(id: string): Promise<QuestionData | null> {
    const raw = await prisma.question.findUnique({ where: { id } });
    if (!raw) return null;
    return this.formatQuestion(raw);
  }

  public formatQuestion(q: any): QuestionData {
    return {
      id: q.id,
      title: q.title,
      story: q.story,
      problemStatement: q.problemStatement,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      constraints: q.constraints,
      examples: JSON.parse(q.examples || '[]'),
      difficulty: q.difficulty as Difficulty,
      topic: q.topic as DSATopic,
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

export const questionService = new QuestionService();
