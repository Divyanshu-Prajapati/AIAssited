import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { TopicsPage } from './pages/TopicsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<QuestionsPage />} />
        <Route path="/practice" element={<QuestionsPage />} />
        <Route path="/practice/:questionId" element={<AssessmentPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/:sessionId" element={<AssessmentPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
