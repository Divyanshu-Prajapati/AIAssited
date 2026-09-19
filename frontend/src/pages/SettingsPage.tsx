import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AppShell } from '../components/layout/AppShell';
import { Settings as SettingsIcon, Cpu, Bot, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/status');
      if (res.data.success) {
        setStatus(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-500" /> Platform & AI Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure execution adapters, local AI providers, model parameters, and system environments.
          </p>
        </div>

        {/* Execution Engine Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" /> Code Execution Engine
            </h2>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-mono font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium font-sans">Primary Execution Adapter:</div>
              <div className="font-bold text-emerald-700 text-sm">{status?.executionEngine || 'Local Java 24 Sandbox'}</div>
              <div className="text-[11px] text-slate-500 font-sans leading-relaxed">
                Compiles and runs Java using local `javac` / `java` with 2s timeouts and memory process caps.
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium font-sans">System Java Status:</div>
              {status?.javaAvailable ? (
                <div className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Java 24 Active & Operational
                </div>
              ) : (
                <div className="font-bold text-rose-700 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Java Unavailable
                </div>
              )}
              <div className="text-[11px] text-slate-500 font-sans leading-relaxed">Zero external paid APIs required.</div>
            </div>
          </div>
        </div>

        {/* AI Assistant Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" /> Guarded AI Provider
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium font-sans">Active AI Engine:</div>
              <div className="font-bold text-blue-700 text-sm">{status?.aiEngine || 'Guarded Rule-Based Practice Engine'}</div>
              <div className="text-[11px] text-slate-500 font-sans leading-relaxed">
                Provides state-machine evaluation, technical keyword checks, and progressive hints.
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium font-sans">Local Ollama LLM Connection:</div>
              {status?.ollamaAvailable ? (
                <div className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected (http://localhost:11434)
                </div>
              ) : (
                <div className="font-bold text-amber-700 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Local AI unavailable — using practice rule engine
                </div>
              )}
              <div className="text-[11px] text-slate-500 font-sans leading-relaxed">
                To use Ollama LLM: Run `brew install ollama` & `ollama pull qwen2.5-coder:7b`.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
