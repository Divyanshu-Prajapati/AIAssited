import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { DSATopic } from '../types';
import { AppShell } from '../components/layout/AppShell';
import { BookOpen, ChevronRight } from 'lucide-react';

const TOPICS_LIST: { topic: DSATopic; desc: string; iconColor: string }[] = [
  { topic: 'Arrays', desc: 'Contiguous memory, Kadane, Prefix sums, Cycle sort', iconColor: 'text-blue-600' },
  { topic: 'Strings', desc: 'Character frequency, Palindromes, Anagrams, KMP', iconColor: 'text-indigo-600' },
  { topic: 'Hashing', desc: 'HashMaps, Sets, Frequency counts, Subarray sum = K', iconColor: 'text-purple-600' },
  { topic: 'Two Pointers', desc: 'Opposite ends, Fast/slow pointers, Partitioning', iconColor: 'text-emerald-600' },
  { topic: 'Sliding Window', desc: 'Fixed size, Variable window, Dynamic bounds', iconColor: 'text-teal-600' },
  { topic: 'Prefix Sum', desc: 'Range queries, Cumulative counts, Difference arrays', iconColor: 'text-cyan-600' },
  { topic: 'Binary Search', desc: 'Rotated arrays, Search space reduction, Bounds', iconColor: 'text-amber-600' },
  { topic: 'Sorting', desc: 'Custom comparators, Merge sort, Quick select', iconColor: 'text-orange-600' },
  { topic: 'Stack', desc: 'Monotonic stacks, Expression parsing, Balancing', iconColor: 'text-rose-600' },
  { topic: 'Queue', desc: 'Sliding window max, Circular queues, BFS queues', iconColor: 'text-pink-600' },
  { topic: 'Linked List', desc: 'Fast/slow cycle detection, Reversals, Merging', iconColor: 'text-fuchsia-600' },
  { topic: 'Trees', desc: 'Binary search trees, Traversals, Path sums, DFS', iconColor: 'text-violet-600' },
  { topic: 'Graphs', desc: 'BFS/DFS traversals, Shortest paths, Topological sort', iconColor: 'text-blue-700' },
  { topic: 'Greedy', desc: 'Interval scheduling, Minimum refuels, Gas stations', iconColor: 'text-emerald-700' },
  { topic: 'Recursion', desc: 'Divide & conquer, Recursive tree execution', iconColor: 'text-amber-700' },
  { topic: 'Backtracking', desc: 'Subset generation, N-Queens, Grid pathfinding', iconColor: 'text-rose-700' },
  { topic: 'Dynamic Programming', desc: 'Knapsack 0/1, LCS, Coin change, Grid DP', iconColor: 'text-cyan-700' },
  { topic: 'Intervals', desc: 'Merge intervals, Meeting rooms, Non-overlapping', iconColor: 'text-indigo-700' },
  { topic: 'Bit Manipulation', desc: 'Bitwise AND/OR/XOR, Bit masking, Single number', iconColor: 'text-teal-700' },
];

export const TopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { startSession } = useAssessmentStore();
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/questions').then((res) => {
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    });
  }, []);

  const handlePracticeTopic = async (topic: DSATopic) => {
    const topicQ = questions.filter((q) => q.topic === topic);
    const targetQ = topicQ.length > 0 ? topicQ[0] : undefined;
    await startSession(targetQ?.id, 'TOPIC');
    navigate('/assessment');
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Practice by DSA Topic
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any category to practice targeted story-based questions with Guarded AI evaluation.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            19 Categories | 118 Bank Questions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS_LIST.map((t) => {
            const count = questions.filter((q) => q.topic === t.topic).length;
            return (
              <div
                key={t.topic}
                onClick={() => handlePracticeTopic(t.topic)}
                className="bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm ${t.iconColor} group-hover:text-blue-700 transition-colors`}>
                      {t.topic}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {count || 5} Questions
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>Start Practice</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};
