import { ProblemModule, OutputValidationMode } from './ProblemModule.js';
import { DSATopic, Difficulty } from '../types/index.js';
import { GENERIC_JAVA_STARTER } from './constants.js';

export interface ModuleConfig {
  id: string;
  title: string;
  story: string;
  problemStatement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string[];
  difficulty: Difficulty;
  topic: DSATopic;
  pattern: string;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  optimalApproachName: string;
  optimalConcepts: string[];
  javaCode: string;
  examples: { input: string; output: string; explanation?: string }[];
  visibleTests: { id: string; input: string; expectedOutput: string; description: string }[];
  hiddenTests: { id: string; input: string; expectedOutput: string; description: string }[];
  edgeTests: { id: string; input: string; expectedOutput: string; description: string }[];
  outputValidationMode?: OutputValidationMode;
  customValidatorId?: string;
  prohibitedMisunderstandings?: string[];
}

export function createProblemModule(cfg: ModuleConfig): ProblemModule {
  const approachId = `${cfg.id.toLowerCase().replace(/-/g, '_')}_optimal`;

  return {
    outputValidationMode: cfg.outputValidationMode || 'EXACT',
    customValidatorId: cfg.customValidatorId,
    specification: {
      specificationStatus: 'VALIDATED',
      specificationVersion: 1,
      problem: {
        id: cfg.id,
        title: cfg.title,
        story: cfg.story,
        problemStatement: cfg.problemStatement,
        inputFormat: cfg.inputFormat || 'Line 1: Input size N\nLine 2: N space-separated elements.',
        outputFormat: cfg.outputFormat || 'Print single integer or calculated output.',
        constraints: cfg.constraints || ['1 <= N <= 10^5', '-10^4 <= val <= 10^4'],
        examples: cfg.examples,
        edgeCases: cfg.edgeTests.map((e) => ({
          scenario: e.description,
          input: e.input,
          expectedOutput: e.expectedOutput,
          explanation: `Edge case: ${e.description}`,
        })),
        difficulty: cfg.difficulty,
        topic: cfg.topic,
        pattern: cfg.pattern,
        expectedTimeComplexity: cfg.expectedTimeComplexity,
        expectedSpaceComplexity: cfg.expectedSpaceComplexity,
      },
      acceptedApproaches: [
        {
          id: approachId,
          name: cfg.optimalApproachName,
          description: `Optimal solution using ${cfg.pattern} strategy.`,
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: cfg.expectedTimeComplexity,
          spaceComplexity: cfg.expectedSpaceComplexity,
          concepts: cfg.optimalConcepts,
          correctnessConditions: [`Executes ${cfg.pattern} algorithm correctly.`],
        },
      ],
      validation: {
        understanding: {
          requirements: [
            {
              id: 'req_u1',
              description: `Identifies core problem contract for ${cfg.title}`,
              critical: true,
              category: 'Objective',
              concepts: [cfg.topic.toLowerCase(), cfg.pattern.toLowerCase()],
              acceptableEvidence: [cfg.title.toLowerCase(), 'find answer', 'compute output'],
            },
            {
              id: 'req_u2',
              description: 'Recognizes handling of edge cases and bounds',
              critical: true,
              category: 'EdgeCases',
              concepts: ['edge case', 'bounds'],
              acceptableEvidence: ['handles edge cases', 'check boundaries'],
            },
          ],
          minimumEdgeCases: 1,
          prohibitedMisunderstandings: cfg.prohibitedMisunderstandings || ['Selecting invalid indices out of bounds'],
        },
        plan: {
          requirements: [
            {
              id: 'req_p1',
              description: `Proposes optimal strategy using ${cfg.pattern}`,
              critical: true,
              category: 'Algorithm',
              concepts: [cfg.pattern.toLowerCase(), cfg.topic.toLowerCase()],
              acceptableEvidence: [cfg.pattern.toLowerCase(), cfg.optimalApproachName.toLowerCase()],
            },
            {
              id: 'req_p2',
              description: `Specifies time and space complexity bounds`,
              critical: true,
              category: 'Complexity',
              concepts: ['time complexity', 'space complexity'],
              acceptableEvidence: [`${cfg.expectedTimeComplexity} time`, `${cfg.expectedSpaceComplexity} space`],
            },
          ],
          acceptedApproaches: [approachId],
          complexity: {
            expectedTime: cfg.expectedTimeComplexity,
            expectedSpace: cfg.expectedSpaceComplexity,
            allowedTimeComplexities: [cfg.expectedTimeComplexity],
            allowedSpaceComplexities: [cfg.expectedSpaceComplexity],
            complexityJustification: `Optimal ${cfg.pattern} achieves ${cfg.expectedTimeComplexity}.`,
          },
          allowCorrectButInefficient: true,
        },
        implementation: {
          requirements: [
            {
              id: 'req_i1',
              description: 'Iterates and updates algorithm state',
              critical: true,
              category: 'Implementation',
              concepts: ['loop', 'variable update'],
              acceptableEvidence: ['for loop', 'Scanner input', 'System.out.println'],
            },
          ],
          requiredImplementationStages: ['Input parsing', 'Algorithm loop', 'Output result'],
          consistencyRules: ['Step 3 implementation must match Step 2 plan proposal'],
        },
      },
      consistency: {
        step1ToStep2: ['Plan must satisfy input/output contract identified in Step 1'],
        step2ToStep3: ['Implementation logic must match Step 2 algorithm proposal'],
        step3ToCode: ['Generated code must execute required algorithm loop'],
      },
      tests: {
        examples: cfg.examples.map((ex, i) => ({
          id: `ex_${i + 1}`,
          input: ex.input,
          expectedOutput: ex.output,
          type: 'EXAMPLE' as const,
          description: ex.explanation || `Example ${i + 1}`,
        })),
        visible: cfg.visibleTests.map((vt) => ({
          id: vt.id,
          input: vt.input,
          expectedOutput: vt.expectedOutput,
          type: 'VISIBLE' as const,
          description: vt.description,
        })),
        hidden: cfg.hiddenTests.map((ht) => ({
          id: ht.id,
          input: ht.input,
          expectedOutput: ht.expectedOutput,
          type: 'HIDDEN' as const,
          description: ht.description,
        })),
        edge: cfg.edgeTests.map((et) => ({
          id: et.id,
          input: et.input,
          expectedOutput: et.expectedOutput,
          type: 'EDGE' as const,
          description: et.description,
        })),
      },
      referenceSolutions: [
        {
          approachId,
          explanation: `Reference implementation using ${cfg.pattern}.`,
          javaCode: cfg.javaCode,
          timeComplexity: cfg.expectedTimeComplexity,
          spaceComplexity: cfg.expectedSpaceComplexity,
        },
      ],
      starterCode: GENERIC_JAVA_STARTER,
    },
  };
}
