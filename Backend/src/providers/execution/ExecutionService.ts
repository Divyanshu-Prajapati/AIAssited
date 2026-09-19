import { LocalJavaExecutionAdapter } from './LocalJavaExecutionAdapter.js';
import { Judge0Adapter } from './Judge0Adapter.js';
import { ExecutionRequest, ExecutionResult } from '../../types/index.js';

export class ExecutionService {
  private localAdapter: LocalJavaExecutionAdapter;
  private judge0Adapter: Judge0Adapter;

  constructor() {
    this.localAdapter = new LocalJavaExecutionAdapter();
    this.judge0Adapter = new Judge0Adapter();
  }

  public async runCode(req: ExecutionRequest): Promise<ExecutionResult> {
    return this.execute(req);
  }

  public async submitCode(req: ExecutionRequest): Promise<ExecutionResult> {
    return this.execute(req);
  }

  public async compileCode(code: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.execute({
      code,
      testCases: [{ id: 'compile_check', input: '', expectedOutput: '' }],
    });

    if (!res.compiled) {
      return { success: false, error: res.compilationError };
    }
    return { success: true };
  }

  private async execute(req: ExecutionRequest): Promise<ExecutionResult> {
    // Attempt Judge0 if available, otherwise use local JDK adapter
    const judge0Ready = await this.judge0Adapter.isAvailable();
    if (judge0Ready) {
      try {
        return await this.judge0Adapter.executeJava(req);
      } catch (err) {
        console.warn('Judge0 failed, falling back to LocalJavaExecutionAdapter:', err);
      }
    }
    return this.localAdapter.executeJava(req);
  }
}

export const executionService = new ExecutionService();
