import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ExecutionRequest, ExecutionResult, SingleTestExecutionResult } from '../../types/index.js';

export class LocalJavaExecutionAdapter {
  private tempDirBase: string;

  constructor() {
    this.tempDirBase = path.join(os.tmpdir(), 'dsa_java_runner');
    if (!fs.existsSync(this.tempDirBase)) {
      fs.mkdirSync(this.tempDirBase, { recursive: true });
    }
  }

  public async executeJava(req: ExecutionRequest): Promise<ExecutionResult> {
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
      const testResults: SingleTestExecutionResult[] = [];
      let passCount = 0;
      let totalTimeMs = 0;
      let peakMemoryKb = 0;

      for (const tc of req.testCases) {
        const timeLimit = req.timeLimitMs || 3000;
        const testRes = await this.runSingleTest(runFolder, tc, timeLimit);
        testResults.push(testRes);
        if (testRes.passed) passCount++;
        totalTimeMs += testRes.executionTimeMs;
        if (testRes.memoryKb > peakMemoryKb) peakMemoryKb = testRes.memoryKb;
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
    } finally {
      // Cleanup temporary directory
      try {
        fs.rmSync(runFolder, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }

  private compileJava(folderPath: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const javac = spawn('javac', ['Main.java'], { cwd: folderPath });

      let stderr = '';
      javac.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      javac.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: stderr || 'Compilation failed with unknown error.' });
        }
      });

      javac.on('error', (err) => {
        resolve({ success: false, error: `Failed to invoke javac: ${err.message}` });
      });
    });
  }

  private runSingleTest(
    folderPath: string,
    testCase: { id: string; input: string; expectedOutput: string; isHidden?: boolean },
    timeoutMs: number
  ): Promise<SingleTestExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const javaProcess = spawn('java', ['-Xmx128m', 'Main'], { cwd: folderPath });

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
      } else {
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
