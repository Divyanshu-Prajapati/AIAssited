"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalOllamaProvider = void 0;
const RuleBasedAIProvider_js_1 = require("./RuleBasedAIProvider.js");
class LocalOllamaProvider {
    name = 'Local Ollama LLM';
    ollamaUrl;
    model;
    fallback;
    constructor(url, model) {
        this.ollamaUrl = url || process.env.OLLAMA_URL || 'http://localhost:11434';
        this.model = model || process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
        this.fallback = new RuleBasedAIProvider_js_1.RuleBasedAIProvider();
    }
    async isAvailable() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${this.ollamaUrl}/api/tags`, { signal: controller.signal });
            clearTimeout(timeoutId);
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async reviewPrompt(ctx, promptText) {
        const isUp = await this.isAvailable();
        if (!isUp)
            return this.fallback.reviewPrompt(ctx, promptText);
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
        }
        catch {
            return this.fallback.reviewPrompt(ctx, promptText);
        }
    }
    async evaluateUnderstanding(ctx, text) {
        const isUp = await this.isAvailable();
        if (!isUp)
            return this.fallback.evaluateUnderstanding(ctx, text);
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
    async evaluatePlan(ctx, planText) {
        const isUp = await this.isAvailable();
        if (!isUp)
            return this.fallback.evaluatePlan(ctx, planText);
        const systemPrompt = `Evaluate this algorithm plan for DSA problem "${ctx.question.title}" (Topic: ${ctx.question.topic}, Pattern: ${ctx.question.pattern}).
Do NOT write code. Check if brute force, optimized approach, data structure, and complexity are stated.
Return JSON: { "type": "plan_review", "status": "approved" | "needs_improvement", "feedback": "string", "missingItems": ["item1"] }`;
        try {
            const llmRes = await this.queryOllama(systemPrompt, planText);
            const parsed = JSON.parse(llmRes);
            return parsed;
        }
        catch {
            return this.fallback.evaluatePlan(ctx, planText);
        }
    }
    async generateHint(ctx, level) {
        return this.fallback.generateHint(ctx, level);
    }
    async debugCode(ctx) {
        return this.fallback.debugCode(ctx);
    }
    async reviewCode(ctx) {
        return this.fallback.reviewCode(ctx);
    }
    async dryRun(ctx, userInput) {
        return this.fallback.dryRun(ctx, userInput);
    }
    async reviewConcept(ctx) {
        return this.fallback.reviewConcept(ctx);
    }
    async generateSolution(ctx, confirmed) {
        return this.fallback.generateSolution(ctx, confirmed);
    }
    async queryOllama(system, prompt) {
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
        if (!res.ok)
            throw new Error('Ollama call failed');
        const data = (await res.json());
        return data.response;
    }
}
exports.LocalOllamaProvider = LocalOllamaProvider;
