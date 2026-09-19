import { Router } from 'express';
import { ApiController } from '../controllers/apiController.js';

const router = Router();

// Questions
router.get('/questions', ApiController.getQuestions);
router.get('/questions/:id', ApiController.getQuestionById);

// Assessment Session
router.post('/assessment/start', ApiController.startAssessment);
router.get('/assessment/:id', ApiController.getSession);
router.post('/assessment/:id/understanding', ApiController.submitUnderstanding);
router.post('/assessment/:id/plan', ApiController.submitPlan);
router.post('/assessment/:id/implementation', ApiController.submitImplementation);
router.post('/assessment/:id/hint', ApiController.requestHint);
router.post('/assessment/:id/run', ApiController.runCode);
router.post('/assessment/:id/submit', ApiController.submitAssessment);

// AI Assistant
router.post('/ai/ask', ApiController.askAI);

// Analytics & History
router.get('/analytics', ApiController.getAnalytics);
router.get('/history', ApiController.getHistory);

// System Status
router.get('/system/status', ApiController.getSystemStatus);

export default router;
