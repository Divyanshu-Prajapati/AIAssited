import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  History,
  Settings,
  Cpu,
  Bot,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { systemStatus, fetchSystemStatus, startSession, isLoading } = useAssessmentStore();

  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);

  const handleQuickStart = async () => {
    await startSession();
    navigate('/assessment');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/topics', label: 'Practice Topics', icon: BookOpen },
    { path: '/history', label: 'Attempt History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <RouterLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight">DSA AI Assessment Lab</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">HackerRank & Capgemini Simulator</p>
          </div>
        </RouterLink>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <RouterLink
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </RouterLink>
            );
          })}
        </nav>

        {/* Right Status & Quick Action */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>JDK 24</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-blue-700">
              <Bot className="w-3.5 h-3.5" />
              <span>{systemStatus?.aiEngine || 'Guarded AI'}</span>
            </div>
          </div>

          <button
            onClick={handleQuickStart}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-100 animate-pulse" />
            <span>Start Practice Assessment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
