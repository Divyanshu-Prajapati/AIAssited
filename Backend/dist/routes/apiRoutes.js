"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiController_js_1 = require("../controllers/apiController.js");
const router = (0, express_1.Router)();
// Questions
router.get('/questions', apiController_js_1.ApiController.getQuestions);
router.get('/questions/:id', apiController_js_1.ApiController.getQuestionById);
// Assessment Session
router.post('/assessment/start', apiController_js_1.ApiController.startAssessment);
router.get('/assessment/:id', apiController_js_1.ApiController.getSession);
router.post('/assessment/:id/understanding', apiController_js_1.ApiController.submitUnderstanding);
router.post('/assessment/:id/plan', apiController_js_1.ApiController.submitPlan);
router.post('/assessment/:id/hint', apiController_js_1.ApiController.requestHint);
router.post('/assessment/:id/run', apiController_js_1.ApiController.runCode);
router.post('/assessment/:id/submit', apiController_js_1.ApiController.submitAssessment);
// AI Assistant
router.post('/ai/ask', apiController_js_1.ApiController.askAI);
// Analytics & History
router.get('/analytics', apiController_js_1.ApiController.getAnalytics);
router.get('/history', apiController_js_1.ApiController.getHistory);
// System Status
router.get('/system/status', apiController_js_1.ApiController.getSystemStatus);
exports.default = router;
