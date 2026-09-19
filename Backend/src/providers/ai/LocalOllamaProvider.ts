import { AIProvider, AIContext } from './AIProvider.js';
import { AIResponse, PromptQualityAnalysis } from '../../types/index.js';
import { RuleBasedAIProvider } from './RuleBasedAIProvider.js';

export class LocalOllamaProvider implements AIProvider {
  public name = 'Local Ollama LLM';
  private ollamaUrl: string;
  private model: string;
  private fallback: RuleBasedAIProvider;

  constructor(url?: string, model?: string) {
    this.ollamaUrl = url || process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = model || process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
    this.fallback = new RuleBasedAIProvider();
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.ollamaUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  public async reviewPrompt(ctx: AIContext, promptText: string): Promise<PromptQualityAnalysis> {
    const isUp = await this.isAvailable();
    if (!isUp) return this.fallback.reviewPrompt(ctx, promptText);

    const systemPrompt = `You are a strict technical interviewer evaluating a candidate's prompt quality for a DSA coding assessment.
Analyze the candidate's input for: problem understanding, context awareness, technical specificity, edge cases awareness, and complexity analysis.
Return valid JSON ONLY in this format:
{
  "score": 0-10 number,
  "rating": "Poor" | "Needs Improvement" | "Acceptable" | "Good" | "Strong",
  "understandingScore": 0-2,
  "contextScore": 0-2,
  "specificityScore": 0-2,
  "edgeCaseScore": 0-2,
  "complexityScore": 0-2,
  "feedback": "string concise feedback",
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    try {
      const llmRes = await this.queryOllama(systemPrompt, `Problem: ${ctx.question.title}\nCandidate Prompt: "${promptText}"`);
      const parsed = JSON.parse(llmRes);
      return parsed;
    } catch {
      return this.fallback.reviewPrompt(ctx, promptText);
    }
  }

  public async evaluateUnderstanding(ctx: AIContext, text: string): Promise<AIResponse> {
    const isUp = await this.isAvailable();
    if (!isUp) return this.fallback.evaluateUnderstanding(ctx, text);

    const promptQuality = await this.reviewPrompt(ctx, text);
    if (promptQuality.score < 5) {
      return {
        type: 'explain',
        status: 'needs_improvement',
        feedback: `Your understanding breakdown needs higher technical specificity.\n\n${promptQuality.feedback}`,
        promptQuality,
        nextSuggestedAction: 'Refine input/output bounds and edge cases.',
      };
    }

    return {
      type: 'explain',
      status: 'approved',
      feedback: 'Excellent problem understanding! Constraints and input/output contracts are well defined. Proceed to STEP 2: PLAN.',
      promptQuality,
      nextSuggestedAction: 'Click "Proceed to Plan" or write your algorithm proposal.',
    };
  }

  public async evaluatePlan(ctx: AIContext, planText: string): Promise<AIResponse> {
    const isUp = await this.isAvailable();
    if (!isUp) return this.fallback.evaluatePlan(ctx, planText);

    const systemPrompt = `Evaluate this algorithm plan for DSA problem "${ctx.question.title}" (Topic: ${ctx.question.topic}, Pattern: ${ctx.question.pattern}).
Do NOT write code. Check if brute force, optimized approach, data structure, and complexity are stated.
Return JSON: { "type": "plan_review", "status": "approved" | "needs_improvement", "feedback": "string", "missingItems": ["item1"] }`;

    try {
      const llmRes = await this.queryOllama(systemPrompt, planText);
      const parsed = JSON.parse(llmRes);
      return parsed;
    } catch {
      return this.fallback.evaluatePlan(ctx, planText);
    }
  }

  public async evaluateImplementation(ctx: AIContext, implText: string): Promise<AIResponse> {
    const isUp = await this.isAvailable();
    if (!isUp) return this.fallback.evaluateImplementation(ctx, implText);

    const systemPrompt = `Evaluate this implementation prompt for DSA problem "${ctx.question.title}".
Check if candidate details input parsing, variables, loop logic, and alignment with their Step 2 Plan ("${ctx.userPlan || ''}").
Return JSON ONLY: { "type": "code_generation", "status": "approved" | "needs_improvement", "feedback": "string", "missingItems": ["item1"] }`;

    try {
      const llmRes = await this.queryOllama(systemPrompt, implText);
      const parsed = JSON.parse(llmRes);
      return parsed;
    } catch {
      return this.fallback.evaluateImplementation(ctx, implText);
    }
  }

  public async generateCodeFromReasoning(ctx: AIContext): Promise<string> {
    const isUp = await this.isAvailable();
    if (!isUp) return this.fallback.generateCodeFromReasoning(ctx);

    const systemPrompt = `Generate clean, efficient Java code for problem "${ctx.question.title}" in class Main with a main method.
Follow the candidate's implementation prompt: "${ctx.userImplementation}" and algorithm plan: "${ctx.userPlan}".
Output ONLY executable Java code.`;

    try {
      const code = await this.queryOllama(systemPrompt, 'Generate Java code');
      if (code && code.includes('class Main')) return code;
      return this.fallback.generateCodeFromReasoning(ctx);
    } catch {
      return this.fallback.generateCodeFromReasoning(ctx);
    }
  }


  public async generateHint(ctx: AIContext, level: number): Promise<AIResponse> {
    return this.fallback.generateHint(ctx, level);
  }

  public async debugCode(ctx: AIContext): Promise<AIResponse> {
    return this.fallback.debugCode(ctx);
  }

  public async reviewCode(ctx: AIContext): Promise<AIResponse> {
    return this.fallback.reviewCode(ctx);
  }

  public async dryRun(ctx: AIContext, userInput: string): Promise<AIResponse> {
    return this.fallback.dryRun(ctx, userInput);
  }

  public async reviewConcept(ctx: AIContext): Promise<AIResponse> {
    return this.fallback.reviewConcept(ctx);
  }

  public async generateSolution(ctx: AIContext, confirmed: boolean): Promise<AIResponse> {
    return this.fallback.generateSolution(ctx, confirmed);
  }

  private async queryOllama(system: string, prompt: string): Promise<string> {
    const res = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${system}\n\nCandidate Input:\n${prompt}`,
        stream: false,
        format: 'json',
      }),
    });

    if (!res.ok) throw new Error('Ollama call failed');
    const data = (await res.json()) as { response: string };
    return data.response;
  }
}
