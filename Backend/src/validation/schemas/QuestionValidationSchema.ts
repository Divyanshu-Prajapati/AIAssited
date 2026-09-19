import { z } from 'zod';

export const DSATopicsEnum = z.enum([
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Prefix Sum',
  'Binary Search',
  'Sorting',
  'Stack',
  'Queue',
  'Linked List',
  'Trees',
  'Graphs',
  'Greedy',
  'Recursion',
  'Backtracking',
  'Dynamic Programming',
  'Intervals',
  'Bit Manipulation',
]);

export const DifficultyEnum = z.enum(['BEGINNER', 'EASY', 'MEDIUM', 'HARD']);

export const SpecificationStatusEnum = z.enum([
  'LEGACY_UNVALIDATED',
  'VALIDATED',
  'INVALID',
  'DRAFT',
]);

export const ExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

export const EdgeCaseSchema = z.object({
  scenario: z.string().min(1, 'Edge case scenario cannot be empty'),
  input: z.string(),
  expectedOutput: z.string(),
  explanation: z.string().optional(),
});

export const ProblemDefinitionSchema = z.object({
  id: z.string().min(1, 'Problem ID cannot be empty'),
  title: z.string().min(1, 'Title cannot be empty'),
  story: z.string().optional(),
  problemStatement: z.string().min(1, 'Problem statement cannot be empty'),
  inputFormat: z.string().min(1, 'Input format cannot be empty'),
  outputFormat: z.string().min(1, 'Output format cannot be empty'),
  constraints: z.array(z.string().min(1)).min(1, 'At least 1 constraint is required'),
  examples: z.array(ExampleSchema).min(1, 'At least 1 example is required'),
  edgeCases: z.array(EdgeCaseSchema).min(1, 'At least 1 edge case is required'),
  difficulty: DifficultyEnum,
  topic: DSATopicsEnum,
  pattern: z.string().min(1, 'Pattern cannot be empty'),
  expectedTimeComplexity: z.string().min(1, 'Expected time complexity cannot be empty'),
  expectedSpaceComplexity: z.string().min(1, 'Expected space complexity cannot be empty'),
});

export const AcceptedApproachSchema = z.object({
  id: z.string().min(1, 'Approach ID cannot be empty'),
  name: z.string().min(1, 'Approach name cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  correctness: z.literal('CORRECT'),
  optimal: z.boolean(),
  timeComplexity: z.string().min(1, 'Time complexity cannot be empty'),
  spaceComplexity: z.string().min(1, 'Space complexity cannot be empty'),
  concepts: z.array(z.string().min(1)).min(1, 'Concepts array cannot be empty'),
  correctnessConditions: z.array(z.string().min(1)).min(1, 'Correctness conditions cannot be empty'),
});

export const ValidationRequirementSchema = z.object({
  id: z.string().min(1, 'Requirement ID cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  critical: z.boolean(),
  category: z.string().min(1, 'Category cannot be empty'),
  concepts: z.array(z.string().min(1)).min(1, 'Concepts array cannot be empty'),
  acceptableEvidence: z.array(z.string().min(1)).min(1, 'Acceptable evidence array cannot be empty'),
  unacceptableEvidence: z.array(z.string()).optional(),
});

export const ComplexityContractSchema = z.object({
  expectedTime: z.string().min(1, 'Expected time complexity cannot be empty'),
  expectedSpace: z.string().min(1, 'Expected space complexity cannot be empty'),
  allowedTimeComplexities: z.array(z.string()).optional(),
  allowedSpaceComplexities: z.array(z.string()).optional(),
  complexityJustification: z.string().min(1, 'Complexity justification cannot be empty'),
});

export const UnderstandingContractSchema = z.object({
  requirements: z.array(ValidationRequirementSchema).min(1, 'Step 1 must have at least 1 requirement'),
  minimumEdgeCases: z.number().min(0),
  prohibitedMisunderstandings: z.array(z.string().min(1)).min(1, 'At least 1 prohibited misunderstanding required'),
});

export const PlanContractSchema = z.object({
  requirements: z.array(ValidationRequirementSchema).min(1, 'Step 2 must have at least 1 requirement'),
  acceptedApproaches: z.array(z.string().min(1)).min(1, 'Plan contract must specify at least 1 approach ID'),
  complexity: ComplexityContractSchema,
  allowCorrectButInefficient: z.boolean(),
});

export const ImplementationContractSchema = z.object({
  requirements: z.array(ValidationRequirementSchema).min(1, 'Step 3 must have at least 1 requirement'),
  requiredImplementationStages: z.array(z.string()),
  consistencyRules: z.array(z.string()),
});

export const ValidationContractSchema = z.object({
  understanding: UnderstandingContractSchema,
  plan: PlanContractSchema,
  implementation: ImplementationContractSchema,
});

export const ConsistencyContractSchema = z.object({
  step1ToStep2: z.array(z.string()),
  step2ToStep3: z.array(z.string()),
  step3ToCode: z.array(z.string()),
});

export const TestCaseSchema = z.object({
  id: z.string().min(1, 'Test ID cannot be empty'),
  input: z.string(),
  expectedOutput: z.string(),
  type: z.enum(['EXAMPLE', 'VISIBLE', 'HIDDEN', 'EDGE']),
  description: z.string().optional(),
});

export const QuestionTestSuiteSchema = z.object({
  examples: z.array(TestCaseSchema).min(1, 'At least 1 example test required'),
  visible: z.array(TestCaseSchema).min(1, 'At least 1 visible test required'),
  hidden: z.array(TestCaseSchema).min(1, 'At least 1 hidden test required'),
  edge: z.array(TestCaseSchema).min(1, 'At least 1 edge test required'),
});

export const ReferenceSolutionSchema = z.object({
  approachId: z.string().min(1, 'Approach ID cannot be empty'),
  explanation: z.string().min(1, 'Explanation cannot be empty'),
  javaCode: z.string().min(1, 'Java code cannot be empty'),
  timeComplexity: z.string().min(1, 'Time complexity cannot be empty'),
  spaceComplexity: z.string().min(1, 'Space complexity cannot be empty'),
});

export const QuestionSpecificationSchema = z.object({
  specificationStatus: SpecificationStatusEnum,
  specificationVersion: z.number().int().min(1),
  problem: ProblemDefinitionSchema,
  acceptedApproaches: z.array(AcceptedApproachSchema).min(1, 'At least 1 accepted approach is required'),
  validation: ValidationContractSchema,
  consistency: ConsistencyContractSchema,
  tests: QuestionTestSuiteSchema,
  referenceSolutions: z.array(ReferenceSolutionSchema).min(1, 'At least 1 reference solution is required'),
  starterCode: z.string().min(1, 'Starter code cannot be empty'),
});
