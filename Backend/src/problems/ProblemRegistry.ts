import { ProblemModule } from './ProblemModule.js';
import { DSATopic } from '../types/index.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';

export const TOPIC_DISTRIBUTION_GOAL: Record<DSATopic, number> = {
  Arrays: 15,
  Strings: 10,
  Hashing: 10,
  'Two Pointers': 8,
  'Sliding Window': 8,
  'Prefix Sum': 8,
  'Binary Search': 8,
  Sorting: 6,
  Stack: 6,
  Queue: 4,
  'Linked List': 6,
  Trees: 5,
  Graphs: 5,
  Greedy: 3,
  Recursion: 2,
  Backtracking: 2,
  'Dynamic Programming': 6,
  Intervals: 3,
  'Bit Manipulation': 3,
};

export class ProblemRegistry {
  private modulesMap = new Map<string, ProblemModule>();

  public register(module: ProblemModule): void {
    const id = module.specification?.problem?.id;
    if (!id) {
      throw new Error('Cannot register ProblemModule: missing specification.problem.id');
    }
    if (this.modulesMap.has(id)) {
      throw new Error(`Duplicate problem registration for ID '${id}'`);
    }
    this.modulesMap.set(id, module);
  }

  public get(problemId: string): ProblemModule | undefined {
    return this.modulesMap.get(problemId);
  }

  public getAll(): ProblemModule[] {
    return Array.from(this.modulesMap.values());
  }

  public getByTopic(topic: DSATopic): ProblemModule[] {
    return this.getAll().filter((m) => m.specification.problem.topic === topic);
  }

  public has(problemId: string): boolean {
    return this.modulesMap.has(problemId);
  }

  public size(): number {
    return this.modulesMap.size;
  }

  public validateRegistry(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Total count check
    if (this.modulesMap.size !== 118) {
      errors.push(`Registry problem count mismatch: expected 118, found ${this.modulesMap.size}`);
    }

    // 2. Topic distribution check
    const topicCounts: Partial<Record<DSATopic, number>> = {};
    for (const mod of this.getAll()) {
      const t = mod.specification.problem.topic;
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }

    for (const [topic, expected] of Object.entries(TOPIC_DISTRIBUTION_GOAL)) {
      const actual = topicCounts[topic as DSATopic] || 0;
      if (actual !== expected) {
        errors.push(`Topic distribution mismatch for '${topic}': expected ${expected}, found ${actual}`);
      }
    }

    // 3. Specification validation for every registered module
    for (const mod of this.getAll()) {
      const id = mod.specification.problem.id;
      const valRes = validateQuestionSpecification(mod.specification);
      if (!valRes.valid) {
        valRes.errors.forEach((e) => {
          errors.push(`Problem '${id}' spec error [${e.code}] ${e.field}: ${e.message}`);
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const problemRegistry = new ProblemRegistry();
