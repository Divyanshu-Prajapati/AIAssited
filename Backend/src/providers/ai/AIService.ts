import { AIProvider, AIContext } from './AIProvider.js';
import { RuleBasedAIProvider } from './RuleBasedAIProvider.js';
import { LocalOllamaProvider } from './LocalOllamaProvider.js';
import { AIResponse, PromptQualityAnalysis } from '../../types/index.js';

export class AIService {
  private ruleProvider: RuleBasedAIProvider;
  private ollamaProvider: LocalOllamaProvider;

  constructor() {
    this.ruleProvider = new RuleBasedAIProvider();
    this.ollamaProvider = new LocalOllamaProvider();
  }

  private async getActiveProvider(): Promise<{ provider: AIProvider; isOllama: boolean }> {
    const ollamaReady = await this.ollamaProvider.isAvailable();
    if (ollamaReady) {
      return { provider: this.ollamaProvider, isOllama: true };
    }
    return { provider: this.ruleProvider, isOllama: false };
  }

  public async evaluateUnderstanding(ctx: AIContext, text: string): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.evaluateUnderstanding(ctx, text);
  }

  public async evaluatePlan(ctx: AIContext, planText: string): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.evaluatePlan(ctx, planText);
  }

  public async evaluateImplementation(ctx: AIContext, implText: string): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.evaluateImplementation(ctx, implText);
  }

  public async generateCodeFromReasoning(ctx: AIContext): Promise<string> {
    const { provider } = await this.getActiveProvider();
    return provider.generateCodeFromReasoning(ctx);
  }


  public async generateHint(ctx: AIContext, level: number): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.generateHint(ctx, level);
  }

  public async debugCode(ctx: AIContext): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.debugCode(ctx);
  }

  public async reviewCode(ctx: AIContext): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.reviewCode(ctx);
  }

  public async dryRun(ctx: AIContext, userInput: string): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.dryRun(ctx, userInput);
  }

  public async reviewPrompt(ctx: AIContext, promptText: string): Promise<PromptQualityAnalysis> {
    const { provider } = await this.getActiveProvider();
    return provider.reviewPrompt(ctx, promptText);
  }

  public async reviewConcept(ctx: AIContext): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.reviewConcept(ctx);
  }

  public async generateSolution(ctx: AIContext, confirmed: boolean): Promise<AIResponse> {
    const { provider } = await this.getActiveProvider();
    return provider.generateSolution(ctx, confirmed);
  }

  public async getStatus(): Promise<{ mode: string; ollamaAvailable: boolean }> {
    const ollamaReady = await this.ollamaProvider.isAvailable();
    return {
      mode: ollamaReady ? 'Local Ollama LLM' : 'Guarded Rule-Based Practice Engine',
      ollamaAvailable: ollamaReady,
    };
  }
}

export const aiService = new AIService();
