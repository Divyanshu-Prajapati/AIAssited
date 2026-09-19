import { QuestionData, AIResponse, PromptQualityAnalysis, ExecutionResult } from '../../types/index.js';

export interface AIContext {
  question: QuestionData;
  phase: string;
  userPrompt?: string;
  userPlan?: string;
  userImplementation?: string;
  code?: string;
  testResults?: ExecutionResult;
  hintsUsed?: number;
  conversationHistory?: { role: 'user' | 'assistant'; text: string }[];
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  evaluateUnderstanding(ctx: AIContext, text: string): Promise<AIResponse>;
  evaluatePlan(ctx: AIContext, planText: string): Promise<AIResponse>;
  evaluateImplementation(ctx: AIContext, implText: string): Promise<AIResponse>;
  generateCodeFromReasoning(ctx: AIContext): Promise<string>;
  generateHint(ctx: AIContext, level: number): Promise<AIResponse>;
  debugCode(ctx: AIContext): Promise<AIResponse>;
  reviewCode(ctx: AIContext): Promise<AIResponse>;
  dryRun(ctx: AIContext, userInput: string): Promise<AIResponse>;
  reviewPrompt(ctx: AIContext, promptText: string): Promise<PromptQualityAnalysis>;
  reviewConcept(ctx: AIContext): Promise<AIResponse>;
  generateSolution(ctx: AIContext, confirmed: boolean): Promise<AIResponse>;
}
