"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Adapter = void 0;
class Judge0Adapter {
    judge0Url;
    constructor(url) {
        this.judge0Url = url || process.env.JUDGE0_URL || 'http://localhost:2358';
    }
    async isAvailable() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${this.judge0Url}/system_info`, { signal: controller.signal });
            clearTimeout(timeoutId);
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async executeJava(req) {
        // Java language ID in Judge0 is 62
        const languageId = 62;
        const testResults = [];
        let passCount = 0;
        let totalTimeMs = 0;
        let peakMemoryKb = 0;
        for (const tc of req.testCases) {
            try {
                const payload = {
                    source_code: req.code,
                    language_id: languageId,
                    stdin: tc.input,
                    expected_output: tc.expectedOutput,
                    cpu_time_limit: (req.timeLimitMs || 2000) / 1000,
                    memory_limit: (req.memoryLimitMb || 256) * 1024,
                };
                const res = await fetch(`${this.judge0Url}/submissions?wait=true`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    throw new Error(`Judge0 responded with status ${res.status}`);
                }
                const data = (await res.json());
                if (data.status.id === 6) {
                    // Compilation error
                    return {
                        success: false,
                        compiled: false,
                        compilationError: data.compile_output || data.stderr || 'Compilation Error',
                        testResults: [],
                        passCount: 0,
                        totalCount: req.testCases.length,
                        totalTimeMs: 0,
                        peakMemoryKb: 0,
                    };
                }
                const actualOutput = (data.stdout || '').trim();
                const expectedOutput = tc.expectedOutput.trim();
                const passed = data.status.id === 3 && actualOutput === expectedOutput;
                const timeMs = Math.round(parseFloat(data.time || '0') * 1000);
                const memKb = data.memory || 0;
                if (passed)
                    passCount++;
                totalTimeMs += timeMs;
                if (memKb > peakMemoryKb)
                    peakMemoryKb = memKb;
                testResults.push({
                    testId: tc.id,
                    passed,
                    input: tc.input,
                    expectedOutput,
                    actualOutput,
                    executionTimeMs: timeMs,
                    memoryKb: memKb,
                    errorLog: data.stderr || (data.status.id !== 3 ? data.status.description : undefined),
                    isHidden: tc.isHidden,
                });
            }
            catch (err) {
                testResults.push({
                    testId: tc.id,
                    passed: false,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: 'Execution Error',
                    executionTimeMs: 0,
                    memoryKb: 0,
                    errorLog: err.message,
                    isHidden: tc.isHidden,
                });
            }
        }
        return {
            success: true,
            compiled: true,
            testResults,
            passCount,
            totalCount: req.testCases.length,
            totalTimeMs,
            peakMemoryKb,
        };
    }
}
exports.Judge0Adapter = Judge0Adapter;
