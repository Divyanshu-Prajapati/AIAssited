import { prisma } from '../database/db.js';
import { QuestionData, DSATopic, Difficulty } from '../types/index.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';
import { questionSpecificationService } from './QuestionSpecificationService.js';
import { problemRegistry } from '../problems/index.js';


export interface QuestionForAssessment {
  question: QuestionData;
  specification: QuestionSpecification | null;
  isSpecificationValidated: boolean;
}

export class QuestionService {
  public async getAllQuestions(filters?: { topic?: DSATopic; difficulty?: Difficulty }): Promise<QuestionData[]> {
    const registryModules = problemRegistry.getAll();
    if (registryModules.length > 0) {
      let filtered = registryModules.map((mod) => this.formatModuleToQuestionData(mod));
      if (filters?.topic) filtered = filtered.filter((q) => q.topic === filters.topic);
      if (filters?.difficulty) filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
      return filtered;
    }

    const where: any = {};
    if (filters?.topic) where.topic = filters.topic;
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    const raw = await prisma.question.findMany({ where });
    return raw.map(this.formatQuestion);
  }

  public async getQuestionById(id: string): Promise<QuestionData | null> {
    const normalizedId = id === 'arr_01' ? 'ARR-001' : id === 'arr_02' ? 'ARR-002' : id;
    const mod = problemRegistry.get(normalizedId);
    if (mod) {
      return this.formatModuleToQuestionData(mod);
    }

    const raw = await prisma.question.findUnique({ where: { id } });
    if (!raw) return null;
    return this.formatQuestion(raw);
  }

  public formatModuleToQuestionData(mod: any): QuestionData {
    const prob = mod.specification.problem;
    const tests = mod.specification.tests;
    return {
      id: prob.id,
      title: prob.title,
      story: prob.story,
      problemStatement: prob.problemStatement,
      inputFormat: prob.inputFormat,
      outputFormat: prob.outputFormat,
      constraints: Array.isArray(prob.constraints) ? prob.constraints.join('\n') : prob.constraints,
      examples: prob.examples || [],
      difficulty: prob.difficulty,
      topic: prob.topic,
      pattern: prob.pattern,
      expectedTimeComplexity: prob.expectedTimeComplexity,
      expectedSpaceComplexity: prob.expectedSpaceComplexity,
      timeLimit: 2000,
      memoryLimit: 256,
      starterCode: mod.specification.starterCode,
      visibleTests: tests.visible || [],
      hiddenTests: tests.hidden || [],
      edgeCases: (prob.edgeCases || []).map((e: any) => typeof e === 'string' ? e : e.scenario),
      tags: [prob.topic, prob.pattern],
    };
  }

  public async getQuestionForAssessment(id: string): Promise<QuestionForAssessment | null> {
    const question = await this.getQuestionById(id);
    if (!question) return null;

    const specification = await questionSpecificationService.getSpecificationByQuestionId(id);
    const isSpecificationValidated = specification?.specificationStatus === 'VALIDATED';

    return {
      question,
      specification,
      isSpecificationValidated,
    };
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

