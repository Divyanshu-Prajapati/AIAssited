import { QuestionData } from '../types/index.js';
import { problemRegistry } from '../problems/index.js';
import { GENERIC_JAVA_STARTER } from '../problems/constants.js';

export { GENERIC_JAVA_STARTER };

export function getQuestionBankData(): QuestionData[] {
  return problemRegistry.getAll().map((mod) => {
    const prob = mod.specification.problem;
    const tests = mod.specification.tests;
    return {
      id: prob.id,
      title: prob.title,
      story: prob.story || '',
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
      starterCode: mod.specification.starterCode || GENERIC_JAVA_STARTER,
      visibleTests: tests.visible || [],
      hiddenTests: tests.hidden || [],
      edgeCases: (prob.edgeCases || []).map((e: any) => typeof e === 'string' ? e : e.scenario),
      tags: [prob.topic, prob.pattern],
    };
  });
}

export const QUESTION_BANK: QuestionData[] = new Proxy([] as QuestionData[], {
  get(_target, prop) {
    const list = getQuestionBankData();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});
