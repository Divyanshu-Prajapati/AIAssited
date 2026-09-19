import { DSATopic, Difficulty } from './index.js';

export type SpecificationStatus = 'LEGACY_UNVALIDATED' | 'VALIDATED' | 'INVALID' | 'DRAFT';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface EdgeCase {
  scenario: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface ProblemDefinition {
  id: string;
  title: string;
  story?: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  edgeCases: EdgeCase[];
  difficulty: Difficulty;
  topic: DSATopic;
  pattern: string;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}

export interface AcceptedApproach {
  id: string;
  name: string;
  description: string;
  correctness: 'CORRECT';
  optimal: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  concepts: string[];
  correctnessConditions: string[];
}

export interface ValidationRequirement {
  id: string;
  description: string;
  critical: boolean;
  category: string;
  concepts: string[];
  acceptableEvidence: string[];
  unacceptableEvidence?: string[];
}

export interface ComplexityContract {
  expectedTime: string;
  expectedSpace: string;
  allowedTimeComplexities?: string[];
  allowedSpaceComplexities?: string[];
  complexityJustification: string;
}

export interface UnderstandingContract {
  requirements: ValidationRequirement[];
  minimumEdgeCases: number;
  prohibitedMisunderstandings: string[];
}

export interface PlanContract {
  requirements: ValidationRequirement[];
  acceptedApproaches: string[]; // Approach IDs referencing top-level acceptedApproaches
  complexity: ComplexityContract;
  allowCorrectButInefficient: boolean;
}

export interface ImplementationContract {
  requirements: ValidationRequirement[];
  requiredImplementationStages: string[];
  consistencyRules: string[];
}

export interface ValidationContract {
  understanding: UnderstandingContract;
  plan: PlanContract;
  implementation: ImplementationContract;
}

export interface ConsistencyContract {
  step1ToStep2: string[];
  step2ToStep3: string[];
  step3ToCode: string[];
}

export type TestCaseType = 'EXAMPLE' | 'VISIBLE' | 'HIDDEN' | 'EDGE';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  type: TestCaseType;
  description?: string;
}

export interface QuestionTestSuite {
  examples: TestCase[];
  visible: TestCase[];
  hidden: TestCase[];
  edge: TestCase[];
}

export interface ReferenceSolution {
  approachId: string;
  explanation: string;
  javaCode: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface QuestionSpecification {
  specificationStatus: SpecificationStatus;
  specificationVersion: number;
  problem: ProblemDefinition;
  acceptedApproaches: AcceptedApproach[];
  validation: ValidationContract;
  consistency: ConsistencyContract;
  tests: QuestionTestSuite;
  referenceSolutions: ReferenceSolution[];
  starterCode: string;
}
