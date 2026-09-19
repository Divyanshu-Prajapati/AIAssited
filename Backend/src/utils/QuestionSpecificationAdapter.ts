import { QuestionData } from '../types/index.js';
import { QuestionSpecification } from '../types/QuestionSpecification.js';
import { GENERIC_JAVA_STARTER } from '../seed/questionBank.js';

export function specToLegacyQuestion(spec: QuestionSpecification): QuestionData {
  const allVisible = [...spec.tests.examples, ...spec.tests.visible].map((t) => ({
    id: t.id,
    input: t.input,
    expectedOutput: t.expectedOutput,
    isHidden: false,
  }));

  const allHidden = [...spec.tests.hidden, ...spec.tests.edge].map((t) => ({
    id: t.id,
    input: t.input,
    expectedOutput: t.expectedOutput,
    isHidden: true,
  }));

  const examples = spec.problem.examples.map((e) => ({
    input: e.input,
    output: e.output,
    explanation: e.explanation,
  }));

  const edgeCases = spec.problem.edgeCases.map((e) => `${e.scenario}: ${e.input} -> ${e.expectedOutput}`);

  return {
    id: spec.problem.id,
    title: spec.problem.title,
    story: spec.problem.story || spec.problem.problemStatement,
    problemStatement: spec.problem.problemStatement,
    inputFormat: spec.problem.inputFormat,
    outputFormat: spec.problem.outputFormat,
    constraints: spec.problem.constraints.join('\n'),
    examples,
    difficulty: spec.problem.difficulty as any,
    topic: spec.problem.topic,
    pattern: spec.problem.pattern,
    expectedTimeComplexity: spec.problem.expectedTimeComplexity,
    expectedSpaceComplexity: spec.problem.expectedSpaceComplexity,
    timeLimit: 2000,
    memoryLimit: 256,
    starterCode: spec.starterCode || GENERIC_JAVA_STARTER,
    visibleTests: allVisible,
    hiddenTests: allHidden,
    edgeCases,
    tags: [spec.problem.topic, spec.problem.difficulty],
  };
}

export function legacyQuestionToSpec(legacy: QuestionData): QuestionSpecification {
  const visibleTests = (legacy.visibleTests || []).map((t) => ({
    id: t.id,
    input: t.input,
    expectedOutput: t.expectedOutput,
    type: 'VISIBLE' as const,
  }));

  const hiddenTests = (legacy.hiddenTests || []).map((t) => ({
    id: t.id,
    input: t.input,
    expectedOutput: t.expectedOutput,
    type: 'HIDDEN' as const,
  }));

  const exampleTests = (legacy.examples || []).map((e, idx) => ({
    id: `ex_${idx + 1}`,
    input: e.input,
    expectedOutput: e.output,
    type: 'EXAMPLE' as const,
    description: e.explanation,
  }));

  const defaultApproach = {
    id: 'primary_approach',
    name: `${legacy.topic} (${legacy.pattern})`,
    description: legacy.problemStatement,
    correctness: 'CORRECT' as const,
    optimal: true,
    timeComplexity: legacy.expectedTimeComplexity,
    spaceComplexity: legacy.expectedSpaceComplexity,
    concepts: [legacy.topic, legacy.pattern],
    correctnessConditions: [`Solves ${legacy.title} correctly`],
  };

  return {
    problem: {
      id: legacy.id,
      title: legacy.title,
      story: legacy.story,
      problemStatement: legacy.problemStatement,
      inputFormat: legacy.inputFormat,
      outputFormat: legacy.outputFormat,
      constraints: legacy.constraints ? legacy.constraints.split('\n') : [],
      examples: legacy.examples || [],
      edgeCases: (legacy.edgeCases || []).map((ec) => ({
        scenario: ec,
        input: '',
        expectedOutput: '',
      })),
      difficulty: legacy.difficulty as any,
      topic: legacy.topic,
      pattern: legacy.pattern,
      expectedTimeComplexity: legacy.expectedTimeComplexity,
      expectedSpaceComplexity: legacy.expectedSpaceComplexity,
    },
    acceptedApproaches: [defaultApproach],
    validation: {
      understanding: {
        requirements: [
          {
            id: 'req_u1',
            description: `Understands ${legacy.title} input/output contract`,
            critical: true,
            category: 'Objective',
            concepts: [legacy.topic],
            acceptableEvidence: [legacy.problemStatement],
          },
        ],
        minimumEdgeCases: 1,
        prohibitedMisunderstandings: [],
      },
      plan: {
        requirements: [
          {
            id: 'req_p1',
            description: `Proposes algorithm for ${legacy.title}`,
            critical: true,
            category: 'Algorithm',
            concepts: [legacy.topic, legacy.pattern],
            acceptableEvidence: [legacy.pattern],
          },
        ],
        acceptedApproaches: [defaultApproach],
        complexity: {
          expectedTime: legacy.expectedTimeComplexity,
          expectedSpace: legacy.expectedSpaceComplexity,
          complexityJustification: `Expected ${legacy.expectedTimeComplexity} time and ${legacy.expectedSpaceComplexity} space.`,
        },
        allowCorrectButInefficient: true,
      },
      implementation: {
        requirements: [
          {
            id: 'req_i1',
            description: `Implements ${legacy.title} logic`,
            critical: true,
            category: 'Implementation',
            concepts: [legacy.topic],
            acceptableEvidence: ['Java solution'],
          },
        ],
        requiredImplementationStages: ['Input reading', 'Processing', 'Output printing'],
        consistencyRules: [],
      },
    },
    consistency: {
      step1ToStep2: [],
      step2ToStep3: [],
      step3ToCode: [],
    },
    tests: {
      examples: exampleTests,
      visible: visibleTests,
      hidden: hiddenTests,
      edge: [],
    },
    referenceSolutions: [
      {
        approachId: 'primary_approach',
        explanation: legacy.problemStatement,
        javaCode: legacy.starterCode,
        timeComplexity: legacy.expectedTimeComplexity,
        spaceComplexity: legacy.expectedSpaceComplexity,
      },
    ],
    starterCode: legacy.starterCode,
  };
}
