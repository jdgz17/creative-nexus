import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HeaderNav } from './components/layout/HeaderNav';
import { IdeaGeneratorView } from './modules/generator/IdeaGeneratorView';
import { TimelineView } from './modules/timeline/TimelineView';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-300 font-sans">
        {/* Friendly Top Navigation */}
        <HeaderNav />

        {/* Main Content Area */}
        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<IdeaGeneratorView />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
