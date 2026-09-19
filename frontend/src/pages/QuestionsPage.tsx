import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAssessmentStore } from '../store/useAssessmentStore';
import { QuestionData, DSATopic, Difficulty } from '../types';
import { AppShell } from '../components/layout/AppShell';
import { Search, HelpCircle, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { startSession } = useAssessmentStore();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    Promise.all([api.get('/questions'), api.get('/history')]).then(([qRes, hRes]) => {
      if (qRes.data.success) setQuestions(qRes.data.data);
      if (hRes.data.success) setAttempts(hRes.data.data);
      setLoading(false);
    });
  }, []);

  const handleSelectQuestion = async (qId: string) => {
    await startSession(qId, 'AI_ASSISTED');
    navigate(`/practice/${qId}`);
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'BEGINNER':
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const completedSet = new Set(attempts.filter((a) => a.status === 'ACCEPTED').map((a) => a.questionId));

  const filteredQuestions = questions.filter((q) => {
    const isCompleted = completedSet.has(q.id);

    // Search query match (title, topic, difficulty ONLY - NO pattern match)
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.difficulty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTopic = selectedTopic === 'ALL' || q.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'COMPLETED' && isCompleted) ||
      (selectedStatus === 'AVAILABLE' && !isCompleted);

    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center text-blue-600 text-sm gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold">Loading Question Browser...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" /> DSA Practice Question Browser
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any story-based problem to practice guided AI assessment reasoning.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
            Showing {filteredQuestions.length} of {questions.length} Questions
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, or difficulty..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Topic */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Topics</option>
              <option value="Arrays">Arrays</option>
              <option value="Strings">Strings</option>
              <option value="Hashing">Hashing</option>
              <option value="Two Pointers">Two Pointers</option>
              <option value="Sliding Window">Sliding Window</option>
              <option value="Prefix Sum">Prefix Sum</option>
              <option value="Binary Search">Binary Search</option>
              <option value="Sorting">Sorting</option>
              <option value="Stack">Stack</option>
              <option value="Queue">Queue</option>
              <option value="Linked List">Linked List</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
              <option value="Greedy">Greedy</option>
              <option value="Recursion">Recursion</option>
              <option value="Backtracking">Backtracking</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Intervals">Intervals</option>
              <option value="Bit Manipulation">Bit Manipulation</option>
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Question Grid */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2 shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No matching questions found. Try changing your search query or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuestions.map((q, idx) => {
              const isCompleted = completedSet.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.id)}
                  className="bg-white hover:bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group space-y-3 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">Q{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {q.topic}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                      {q.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{q.story}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {isCompleted ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Circle className="w-3.5 h-3.5 text-slate-300" /> Not Attempted
                        </span>
                      )}
                    </div>

                    <span className="text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5 text-xs font-bold">
                      Start Assessment <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};
