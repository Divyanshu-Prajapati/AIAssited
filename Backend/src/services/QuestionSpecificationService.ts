import { prisma } from '../database/db.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';
import { validateQuestionSpecification, QuestionValidationResult } from '../validation/QuestionSpecificationValidator.js';
import { legacyQuestionToSpec } from '../utils/QuestionSpecificationAdapter.js';
import { problemRegistry } from '../problems/index.js';


export class QuestionSpecificationService {
  public parseSpecification(rawJson?: string | null): QuestionSpecification | null {
    if (!rawJson || rawJson.trim() === '' || rawJson === '{}') return null;
    try {
      return JSON.parse(rawJson) as QuestionSpecification;
    } catch {
      return null;
    }
  }

  public validateStoredSpecification(spec: any): QuestionValidationResult {
    return validateQuestionSpecification(spec);
  }

  public async getSpecificationByQuestionId(questionId: string): Promise<QuestionSpecification | null> {
    // 1. Check ProblemRegistry (handles normalized IDs like ARR-001, ARR-002, etc.)
    const normalizedId = questionId === 'arr_01' ? 'ARR-001' : questionId === 'arr_02' ? 'ARR-002' : questionId;
    const regModule = problemRegistry.get(normalizedId);
    if (regModule) {
      return regModule.specification;
    }

    // 2. Query database for specification column
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q) return null;

    if (q.specification && q.specification !== '{}') {
      const parsed = this.parseSpecification(q.specification);
      if (parsed) return parsed;
    }

    // 3. Fallback to legacy unvalidated conversion shell
    const legacy = {
      id: q.id,
      title: q.title,
      story: q.story,
      problemStatement: q.problemStatement,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      constraints: q.constraints,
      examples: JSON.parse(q.examples || '[]'),
      difficulty: q.difficulty as any,
      topic: q.topic as any,
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

    return legacyQuestionToSpec(legacy);
  }

  public async getValidatedSpecification(questionId: string): Promise<QuestionSpecification> {
    const spec = await this.getSpecificationByQuestionId(questionId);
    if (!spec) {
      throw new Error(`Question specification not found for ID '${questionId}'`);
    }

    if (spec.specificationStatus !== 'VALIDATED') {
      throw new Error(
        `Question '${questionId}' specification is not validated for assessment. Status: '${spec.specificationStatus}'`
      );
    }

    const valRes = this.validateStoredSpecification(spec);
    if (!valRes.valid) {
      const errMsgs = valRes.errors.map((e) => `[${e.code}] ${e.field}: ${e.message}`).join('; ');
      throw new Error(`Question '${questionId}' specification failed validation checks: ${errMsgs}`);
    }

    return spec;
  }

  public async assertQuestionIsAssessmentReady(questionId: string): Promise<QuestionSpecification> {
    return this.getValidatedSpecification(questionId);
  }
}

export const questionSpecificationService = new QuestionSpecificationService();
