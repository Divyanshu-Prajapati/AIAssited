import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AppShell } from '../components/layout/AppShell';
import { History as HistoryIcon, CheckCircle2, XCircle, Code2 } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);

  useEffect(() => {
    api.get('/history').then((res) => {
      if (res.data.success) {
        setHistory(res.data.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center text-blue-600 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold">Loading attempt history...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-indigo-600" /> Attempt History Log
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review past assessment submissions, scores, execution times, and candidate code checkpoints.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            {history.length} Submissions
          </span>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2 shadow-sm">
            <HistoryIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No submission history recorded yet. Complete a practice assessment to see log details!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Problem Title</th>
                  <th className="p-4 font-bold">Topic</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Score</th>
                  <th className="p-4 font-bold">Time</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {history.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{att.title}</td>
                    <td className="p-4 font-mono text-slate-600">
                      <span className="text-blue-600 font-semibold">{att.topic}</span>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {att.status === 'ACCEPTED' ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACCEPTED
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> {att.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">{att.score}/10</td>
                    <td className="p-4 font-mono text-slate-500">{att.executionTimeMs}ms</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAttempt(att)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold border border-slate-300 transition-colors shadow-sm"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Code Modal */}
        {selectedAttempt && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Submitted Java Code - {selectedAttempt.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="text-slate-500 hover:text-slate-900 text-xs font-mono font-bold"
                >
                  Close
                </button>
              </div>
              <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs overflow-x-auto max-h-96">
                {selectedAttempt.code}
              </pre>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
