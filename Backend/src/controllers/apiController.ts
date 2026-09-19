import { Request, Response } from 'express';
import { questionService } from '../services/QuestionService.js';
import { assessmentService } from '../services/AssessmentService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { aiService } from '../providers/ai/AIService.js';
import { executionService } from '../providers/execution/ExecutionService.js';
import { DSATopic, Difficulty } from '../types/index.js';

export class ApiController {
  public static async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const topic = req.query.topic as DSATopic | undefined;
      const difficulty = req.query.difficulty as Difficulty | undefined;
      const questions = await questionService.getAllQuestions({ topic, difficulty });
      res.json({ success: true, count: questions.length, data: questions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getQuestionById(req: Request, res: Response): Promise<void> {
    try {
      const q = await questionService.getQuestionById(req.params.id as string);
      if (!q) {
        res.status(404).json({ success: false, error: 'Question not found' });
        return;
      }
      res.json({ success: true, data: q });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async startAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { questionId, mode } = req.body;
      const session = await assessmentService.startSession('default', questionId, mode);
      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await assessmentService.getSessionDetails(req.params.id as string);
      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  public static async submitUnderstanding(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      const result = await assessmentService.submitUnderstanding(req.params.id as string, text);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async submitPlan(req: Request, res: Response): Promise<void> {
    try {
      const { planText } = req.body;
      const result = await assessmentService.submitPlan(req.params.id as string, planText);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async submitImplementation(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      const result = await assessmentService.submitImplementation(req.params.id as string, text);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }


  public static async requestHint(req: Request, res: Response): Promise<void> {
    try {
      const result = await assessmentService.requestHint(req.params.id as string);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async runCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const result = await assessmentService.runVisibleTests(req.params.id as string, code);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async submitAssessment(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const result = await assessmentService.submitAssessment(req.params.id as string, code);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async askAI(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, action, userPrompt, code, confirmed } = req.body;
      const session = await assessmentService.getSessionDetails(sessionId);
      const ctx = {
        question: session.question,
        phase: session.state,
        userPrompt,
        userPlan: session.planText,
        code: code || session.currentCode,
        hintsUsed: session.hintsUsed,
      };

      let aiRes;
      if (action === 'debug') aiRes = await aiService.debugCode(ctx);
      else if (action === 'review') aiRes = await aiService.reviewCode(ctx);
      else if (action === 'dry_run') aiRes = await aiService.dryRun(ctx, userPrompt || '');
      else if (action === 'concept') aiRes = await aiService.reviewConcept(ctx);
      else if (action === 'solution') {
        if (confirmed) {
          await assessmentService.markSolutionRevealed(sessionId);
        }
        aiRes = await aiService.generateSolution(ctx, confirmed || false);
      } else aiRes = await aiService.evaluateUnderstanding(ctx, userPrompt || '');

      res.json({ success: true, data: aiRes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getUserDashboard();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getHistory();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const aiStatus = await aiService.getStatus();
      const compileCheck = await executionService.compileCode('public class Main { public static void main(String[] a) {} }');
      res.json({
        success: true,
        data: {
          executionEngine: 'Local JDK 24 Sandboxed Runner',
          javaAvailable: compileCheck.success,
          aiEngine: aiStatus.mode,
          ollamaAvailable: aiStatus.ollamaAvailable,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
