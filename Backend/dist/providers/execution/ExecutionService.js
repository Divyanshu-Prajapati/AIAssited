"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionService = exports.ExecutionService = void 0;
const LocalJavaExecutionAdapter_js_1 = require("./LocalJavaExecutionAdapter.js");
const Judge0Adapter_js_1 = require("./Judge0Adapter.js");
class ExecutionService {
    localAdapter;
    judge0Adapter;
    constructor() {
        this.localAdapter = new LocalJavaExecutionAdapter_js_1.LocalJavaExecutionAdapter();
        this.judge0Adapter = new Judge0Adapter_js_1.Judge0Adapter();
    }
    async runCode(req) {
        return this.execute(req);
    }
    async submitCode(req) {
        return this.execute(req);
    }
    async compileCode(code) {
        const res = await this.execute({
            code,
            testCases: [{ id: 'compile_check', input: '', expectedOutput: '' }],
        });
        if (!res.compiled) {
            return { success: false, error: res.compilationError };
        }
        return { success: true };
    }
    async execute(req) {
        // Attempt Judge0 if available, otherwise use local JDK adapter
        const judge0Ready = await this.judge0Adapter.isAvailable();
        if (judge0Ready) {
            try {
                return await this.judge0Adapter.executeJava(req);
            }
            catch (err) {
                console.warn('Judge0 failed, falling back to LocalJavaExecutionAdapter:', err);
            }
        }
        return this.localAdapter.executeJava(req);
    }
}
exports.ExecutionService = ExecutionService;
exports.executionService = new ExecutionService();
