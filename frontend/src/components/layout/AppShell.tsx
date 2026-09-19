import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAssessmentStore } from '../../store/useAssessmentStore';
import {
  Code2,
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  History,
  Settings,
  Cpu,
  Bot,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { systemStatus, fetchSystemStatus, startSession, isLoading } = useAssessmentStore();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    fetchSystemStatus();
  }, [fetchSystemStatus]);

  const handleQuickStart = async () => {
    await startSession();
    navigate('/assessment');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/problems', label: 'Question Browser', icon: HelpCircle },
    { path: '/topics', label: 'Practice Topics', icon: BookOpen },
    { path: '/history', label: 'Attempt History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans"
      style={{
        display: 'grid',
        gridTemplateColumns: isCollapsed ? '64px minmax(0, 1fr)' : '250px minmax(0, 1fr)',
        transition: 'grid-template-columns 0.2s ease-in-out',
      }}
    >
      {/* Collapsible Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col justify-between shadow-xs z-30 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-[250px]'
        }`}
      >
        <div>
          {/* Logo Header & Collapse Toggle */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between h-14">
            <RouterLink to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">DSA AI Lab</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">Assessment Simulator</p>
                </div>
              )}
            </RouterLink>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                (link.path === '/problems' && location.pathname.startsWith('/practice'));

              return (
                <RouterLink
                  key={link.path}
                  to={link.path}
                  title={isCollapsed ? link.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                </RouterLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 space-y-3 bg-slate-50/50">
          <button
            onClick={handleQuickStart}
            disabled={isLoading}
            title={isCollapsed ? 'Practice Assessment' : undefined}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 ${
              isCollapsed ? 'px-0' : 'px-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-100 animate-pulse shrink-0" />
            {!isCollapsed && <span className="truncate">Practice Assessment</span>}
          </button>

          {/* System Status Badges */}
          {!isCollapsed ? (
            <div className="text-[11px] font-mono space-y-1 text-slate-500 pt-1">
              <div className="flex items-center justify-between">
                <span>Execution:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> JDK 24
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Mode:</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> {systemStatus?.aiEngine?.split(' ')[0] || 'Guarded'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-[10px] text-slate-500 pt-1" title="JDK 24 | Guarded AI">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-col min-w-0 min-h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  );
};
