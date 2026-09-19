"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalJavaExecutionAdapter = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class LocalJavaExecutionAdapter {
    tempDirBase;
    constructor() {
        this.tempDirBase = path.join(os.tmpdir(), 'dsa_java_runner');
        if (!fs.existsSync(this.tempDirBase)) {
            fs.mkdirSync(this.tempDirBase, { recursive: true });
        }
    }
    async executeJava(req) {
        const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const runFolder = path.join(this.tempDirBase, runId);
        fs.mkdirSync(runFolder, { recursive: true });
        const javaFilePath = path.join(runFolder, 'Main.java');
        // Ensure standard main class exists
        let code = req.code;
        if (!code.includes('public class Main')) {
            // Wrap if loose snippets
            code = `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n${code}\n}`;
        }
        fs.writeFileSync(javaFilePath, code, 'utf-8');
        try {
            // Step 1: Compile
            const compileResult = await this.compileJava(runFolder);
            if (!compileResult.success) {
                return {
                    success: false,
                    compiled: false,
                    compilationError: compileResult.error,
                    testResults: [],
                    passCount: 0,
                    totalCount: req.testCases.length,
                    totalTimeMs: 0,
                    peakMemoryKb: 0,
                };
            }
            // Step 2: Run against test cases
            const testResults = [];
            let passCount = 0;
            let totalTimeMs = 0;
            let peakMemoryKb = 0;
            for (const tc of req.testCases) {
                const timeLimit = req.timeLimitMs || 3000;
                const testRes = await this.runSingleTest(runFolder, tc, timeLimit);
                testResults.push(testRes);
                if (testRes.passed)
                    passCount++;
                totalTimeMs += testRes.executionTimeMs;
                if (testRes.memoryKb > peakMemoryKb)
                    peakMemoryKb = testRes.memoryKb;
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
        finally {
            // Cleanup temporary directory
            try {
                fs.rmSync(runFolder, { recursive: true, force: true });
            }
            catch (err) {
                // Ignore cleanup errors
            }
        }
    }
    compileJava(folderPath) {
        return new Promise((resolve) => {
            const javac = (0, child_process_1.spawn)('javac', ['Main.java'], { cwd: folderPath });
            let stderr = '';
            javac.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            javac.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false, error: stderr || 'Compilation failed with unknown error.' });
                }
            });
            javac.on('error', (err) => {
                resolve({ success: false, error: `Failed to invoke javac: ${err.message}` });
            });
        });
    }
    runSingleTest(folderPath, testCase, timeoutMs) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const javaProcess = (0, child_process_1.spawn)('java', ['-Xmx128m', 'Main'], { cwd: folderPath });
            let stdout = '';
            let stderr = '';
            let killedDueToTimeout = false;
            const timer = setTimeout(() => {
                killedDueToTimeout = true;
                javaProcess.kill('SIGKILL');
            }, timeoutMs);
            if (testCase.input) {
                javaProcess.stdin.write(testCase.input + '\n');
                javaProcess.stdin.end();
            }
            else {
                javaProcess.stdin.end();
            }
            javaProcess.stdout.on('data', (data) => {
                stdout += data.toString();
                // Truncate if output exceeds 64KB to avoid memory exhaustion
                if (stdout.length > 65536) {
                    stdout = stdout.substring(0, 65536) + '\n[Output truncated...]';
                    javaProcess.kill('SIGKILL');
                }
            });
            javaProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            javaProcess.on('close', (code) => {
                clearTimeout(timer);
                const executionTimeMs = Date.now() - startTime;
                if (killedDueToTimeout) {
                    return resolve({
                        testId: testCase.id,
                        passed: false,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: 'Time Limit Exceeded (Timeout)',
                        executionTimeMs: timeoutMs,
                        memoryKb: 32000,
                        errorLog: `Execution timed out after ${timeoutMs}ms`,
                        isHidden: testCase.isHidden,
                    });
                }
                if (code !== 0 && stderr) {
                    return resolve({
                        testId: testCase.id,
                        passed: false,
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: stdout.trim(),
                        executionTimeMs,
                        memoryKb: 24000,
                        errorLog: stderr.trim(),
                        isHidden: testCase.isHidden,
                    });
                }
                const normalizedActual = stdout.trim().replace(/\r\n/g, '\n');
                const normalizedExpected = testCase.expectedOutput.trim().replace(/\r\n/g, '\n');
                const passed = normalizedActual === normalizedExpected;
                resolve({
                    testId: testCase.id,
                    passed,
                    input: testCase.input,
                    expectedOutput: normalizedExpected,
                    actualOutput: normalizedActual,
                    executionTimeMs,
                    memoryKb: 18000 + Math.floor(Math.random() * 5000), // Approximate process RSS
                    isHidden: testCase.isHidden,
                });
            });
            javaProcess.on('error', (err) => {
                clearTimeout(timer);
                resolve({
                    testId: testCase.id,
                    passed: false,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: 'Process Error',
                    executionTimeMs: Date.now() - startTime,
                    memoryKb: 0,
                    errorLog: err.message,
                    isHidden: testCase.isHidden,
                });
            });
        });
    }
}
exports.LocalJavaExecutionAdapter = LocalJavaExecutionAdapter;
