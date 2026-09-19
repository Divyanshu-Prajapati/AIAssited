import { create } from 'zustand';
import api from '../services/api';
import {
  SessionData,
  ExecutionResult,
  EvaluationBreakdown,
  PracticeMode,
} from '../types';

interface AssessmentStore {
  session: SessionData | null;
  currentCode: string;
  codeByQuestion: Record<string, string>;
  executionResult: ExecutionResult | null;
  scoreReport: EvaluationBreakdown | null;
  systemStatus: { javaAvailable: boolean; aiEngine: string; ollamaAvailable: boolean } | null;
  isLoading: boolean;
  isExecuting: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchSystemStatus: () => Promise<void>;
  startSession: (questionId?: string, mode?: PracticeMode) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  updateCode: (code: string) => void;
  resetCodeToStarter: () => void;
  submitUnderstanding: (text: string) => Promise<void>;
  submitPlan: (planText: string) => Promise<void>;
  submitImplementation: (text: string) => Promise<void>;
  requestHint: () => Promise<void>;
  runCode: () => Promise<void>;
  submitAssessment: () => Promise<void>;
  askAI: (action: string, prompt?: string, confirmed?: boolean) => Promise<any>;
  restoreVersion: (code: string) => void;
  clearSession: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  session: null,
  currentCode: '',
  codeByQuestion: {},
  executionResult: null,
  scoreReport: null,
  systemStatus: null,
  isLoading: false,
  isExecuting: false,
  isSubmitting: false,
  error: null,

  fetchSystemStatus: async () => {
    try {
      const res = await api.get('/system/status');
      if (res.data.success) {
        set({ systemStatus: res.data.data });
      }
    } catch {
      // Ignore background status failure
    }
  },

  startSession: async (questionId?: string, mode: PracticeMode = 'AI_ASSISTED') => {
    set({ isLoading: true, error: null, executionResult: null, scoreReport: null });
    try {
      const res = await api.post('/assessment/start', { questionId, mode });
      if (res.data.success) {
        const sessionData: SessionData = res.data.data;
        const qId = sessionData.question.id;
        const existingCode = get().codeByQuestion[qId] || sessionData.currentCode || sessionData.question.starterCode;

        set((state) => ({
          session: sessionData,
          currentCode: existingCode,
          codeByQuestion: { ...state.codeByQuestion, [qId]: existingCode },
          isLoading: false,
        }));
      } else {
        set({ error: res.data.error || 'Failed to start session', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/assessment/${sessionId}`);
      if (res.data.success) {
        const sessionData: SessionData = res.data.data;
        const qId = sessionData.question.id;
        const existingCode = get().codeByQuestion[qId] || sessionData.currentCode || sessionData.question.starterCode;

        set((state) => ({
          session: sessionData,
          currentCode: existingCode,
          codeByQuestion: { ...state.codeByQuestion, [qId]: existingCode },
          scoreReport: sessionData.evaluationReport?.overallScore ? sessionData.evaluationReport : null,
          isLoading: false,
        }));
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateCode: (code: string) => {
    const { session } = get();
    if (!session) return;
    const qId = session.question.id;
    set((state) => ({
      currentCode: code,
      codeByQuestion: { ...state.codeByQuestion, [qId]: code },
    }));
  },

  resetCodeToStarter: () => {
    const { session } = get();
    if (!session) return;
    const starter = session.question.starterCode;
    const qId = session.question.id;
    set((state) => ({
      currentCode: starter,
      codeByQuestion: { ...state.codeByQuestion, [qId]: starter },
    }));
  },

  submitUnderstanding: async (text: string) => {
    const { session } = get();
    if (!session) return;
    set({ isLoading: true });
    try {
      const res = await api.post(`/assessment/${session.id}/understanding`, { text });
      if (res.data.success) {
        set({ session: res.data.data.session, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  submitPlan: async (planText: string) => {
    const { session } = get();
    if (!session) return;
    set({ isLoading: true });
    try {
      const res = await api.post(`/assessment/${session.id}/plan`, { planText });
      if (res.data.success) {
        set({ session: res.data.data.session, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  submitImplementation: async (text: string) => {
    const { session } = get();
    if (!session) return;
    set({ isLoading: true });
    try {
      const res = await api.post(`/assessment/${session.id}/implementation`, { text });
      if (res.data.success) {
        const sessionData: SessionData = res.data.data.session;
        const qId = sessionData.question.id;
        const newCode = sessionData.generatedCode || sessionData.currentCode;

        set((state) => ({
          session: sessionData,
          currentCode: newCode,
          codeByQuestion: { ...state.codeByQuestion, [qId]: newCode },
          isLoading: false,
        }));
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },


  requestHint: async () => {
    const { session } = get();
    if (!session) return;
    set({ isLoading: true });
    try {
      const res = await api.post(`/assessment/${session.id}/hint`);
      if (res.data.success) {
        set({ session: res.data.data.session, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  runCode: async () => {
    const { session, currentCode } = get();
    if (!session) return;
    set({ isExecuting: true, error: null });
    try {
      const res = await api.post(`/assessment/${session.id}/run`, { code: currentCode });
      if (res.data.success) {
        set({
          session: res.data.data.session,
          executionResult: res.data.data.executionResult,
          isExecuting: false,
        });
      } else {
        set({ error: res.data.error, isExecuting: false });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      set({ error: msg, isExecuting: false });
    }
  },

  submitAssessment: async () => {
    const { session, currentCode } = get();
    if (!session) return;
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.post(`/assessment/${session.id}/submit`, { code: currentCode });
      if (res.data.success) {
        set({
          session: res.data.data.session,
          executionResult: res.data.data.executionResult,
          scoreReport: res.data.data.scoreBreakdown,
          isSubmitting: false,
        });
      } else {
        set({ error: res.data.error, isSubmitting: false });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message;
      set({ error: msg, isSubmitting: false });
    }
  },

  askAI: async (action: string, prompt?: string, confirmed?: boolean) => {
    const { session, currentCode } = get();
    if (!session) return null;
    try {
      const res = await api.post('/ai/ask', {
        sessionId: session.id,
        action,
        userPrompt: prompt,
        code: currentCode,
        confirmed,
      });
      if (res.data.success) {
        const refreshed = await api.get(`/assessment/${session.id}`);
        if (refreshed.data.success) {
          set({ session: refreshed.data.data });
        }
        return res.data.data;
      }
    } catch (err: any) {
      set({ error: err.message });
    }
    return null;
  },

  restoreVersion: (code: string) => {
    const { session } = get();
    if (!session) return;
    const qId = session.question.id;
    set((state) => ({
      currentCode: code,
      codeByQuestion: { ...state.codeByQuestion, [qId]: code },
    }));
  },

  clearSession: () => {
    set({ session: null, currentCode: '', executionResult: null, scoreReport: null });
  },
}));
