"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const RuleBasedAIProvider_js_1 = require("./RuleBasedAIProvider.js");
const LocalOllamaProvider_js_1 = require("./LocalOllamaProvider.js");
class AIService {
    ruleProvider;
    ollamaProvider;
    constructor() {
        this.ruleProvider = new RuleBasedAIProvider_js_1.RuleBasedAIProvider();
        this.ollamaProvider = new LocalOllamaProvider_js_1.LocalOllamaProvider();
    }
    async getActiveProvider() {
        const ollamaReady = await this.ollamaProvider.isAvailable();
        if (ollamaReady) {
            return { provider: this.ollamaProvider, isOllama: true };
        }
        return { provider: this.ruleProvider, isOllama: false };
    }
    async evaluateUnderstanding(ctx, text) {
        const { provider } = await this.getActiveProvider();
        return provider.evaluateUnderstanding(ctx, text);
    }
    async evaluatePlan(ctx, planText) {
        const { provider } = await this.getActiveProvider();
        return provider.evaluatePlan(ctx, planText);
    }
    async generateHint(ctx, level) {
        const { provider } = await this.getActiveProvider();
        return provider.generateHint(ctx, level);
    }
    async debugCode(ctx) {
        const { provider } = await this.getActiveProvider();
        return provider.debugCode(ctx);
    }
    async reviewCode(ctx) {
        const { provider } = await this.getActiveProvider();
        return provider.reviewCode(ctx);
    }
    async dryRun(ctx, userInput) {
        const { provider } = await this.getActiveProvider();
        return provider.dryRun(ctx, userInput);
    }
    async reviewPrompt(ctx, promptText) {
        const { provider } = await this.getActiveProvider();
        return provider.reviewPrompt(ctx, promptText);
    }
    async reviewConcept(ctx) {
        const { provider } = await this.getActiveProvider();
        return provider.reviewConcept(ctx);
    }
    async generateSolution(ctx, confirmed) {
        const { provider } = await this.getActiveProvider();
        return provider.generateSolution(ctx, confirmed);
    }
    async getStatus() {
        const ollamaReady = await this.ollamaProvider.isAvailable();
        return {
            mode: ollamaReady ? 'Local Ollama LLM' : 'Guarded Rule-Based Practice Engine',
            ollamaAvailable: ollamaReady,
        };
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
