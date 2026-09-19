export type Difficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD';

export type DSATopic =
  | 'Arrays'
  | 'Strings'
  | 'Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Prefix Sum'
  | 'Binary Search'
  | 'Sorting'
  | 'Stack'
  | 'Queue'
  | 'Linked List'
  | 'Trees'
  | 'Graphs'
  | 'Greedy'
  | 'Recursion'
  | 'Backtracking'
  | 'Dynamic Programming'
  | 'Intervals'
  | 'Bit Manipulation';

export type PracticeMode =
  | 'GUIDED'
  | 'ASSESSMENT'
  | 'AI_ASSISTED'
  | 'TIMED'
  | 'TOPIC'
  | 'WEAK_AREA'
  | 'MOCK';

export type AssessmentState =
  | 'IDLE'
  | 'PROBLEM_LOADED'
  | 'UNDERSTANDING'
  | 'UNDERSTANDING_REVIEW'
  | 'PLAN'
  | 'PLAN_REVIEW'
  | 'IMPLEMENTATION'
  | 'IMPLEMENTATION_REVIEW'
  | 'CODE_GENERATING'
  | 'CODE_READY'
  | 'TESTING'
  | 'DEBUGGING'
  | 'SUBMITTING'
  | 'EVALUATED'
  | 'COMPLETED';

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'ACCEPTED_BUT_INEFFICIENT'
  | 'PARTIALLY_CORRECT'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface QuestionData {
  id: string;
  title: string;
  story: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  difficulty: Difficulty;
  topic: DSATopic;
  pattern: string;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  timeLimit: number;
  memoryLimit: number;
  starterCode: string;
  visibleTests: TestCase[];
  hiddenTests: TestCase[];
  edgeCases: string[];
  tags: string[];
}

export interface ExecutionRequest {
  code: string;
  testCases: TestCase[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface SingleTestExecutionResult {
  testId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTimeMs: number;
  memoryKb: number;
  errorLog?: string;
  isHidden?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  compiled: boolean;
  compilationError?: string;
  testResults: SingleTestExecutionResult[];
  passCount: number;
  totalCount: number;
  totalTimeMs: number;
  peakMemoryKb: number;
}

export interface PromptQualityAnalysis {
  score: number;
  rating: 'Poor' | 'Needs Improvement' | 'Acceptable' | 'Good' | 'Strong';
  understandingScore: number;
  contextScore: number;
  specificityScore: number;
  edgeCaseScore: number;
  complexityScore: number;
  feedback: string;
  suggestions: string[];
}

export interface UserSkillProfile {
  topicStrength: Record<DSATopic, number>;
  averageScore: number;
  totalSolved: number;
  totalAttempts: number;
  successRate: number;
  averageAttemptsPerQuestion: number;
  hintUsageCount: number;
  debuggingPerformanceScore: number;
  complexityAccuracyScore: number;
  promptQualityAverage: number;
  recentPerformance: { score: number; topic: DSATopic; date: string }[];
}

export interface EvaluationBreakdown {
  correctnessScore: number;
  timeComplexityScore: number;
  spaceComplexityScore: number;
  edgeCaseScore: number;
  codeQualityScore: number;
  reasoningScore: number;
  overallScore: number;
  status: SubmissionStatus;
  detectedTimeComplexity: string;
  detectedSpaceComplexity: string;
  feedbackSummary: string;
  strengths: string[];
  areasToImprove: string[];
}

export interface AIResponse {
  type: 'explain' | 'plan_review' | 'implementation_review' | 'code_generation' | 'hint' | 'debug' | 'optimize' | 'dry_run' | 'concept_review' | 'solution';
  status: 'approved' | 'needs_improvement' | 'guarded' | 'revealed';
  feedback: string;
  missingItems?: string[];
  nextSuggestedAction?: string;
  hintLevel?: number;
  promptQuality?: PromptQualityAnalysis;
  shouldRevealSolution?: boolean;
  solutionCode?: string;
  generatedCode?: string;
  explanationText?: string;
  codeGenerationAllowed?: boolean;
}
