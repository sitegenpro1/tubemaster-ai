
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { KeywordFinder } from './pages/KeywordFinder';
import { ScriptGenerator } from './pages/ScriptGenerator';
import { ThumbnailGenerator } from './pages/ThumbnailGenerator';
import { ThumbnailCompare } from './pages/ThumbnailCompare';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { TitleTime } from './pages/TitleTime';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

function App() {
  // Initialize state from URL hash to handle refreshes
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      return window.location.hash.replace('#', '') || 'home';
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // Handle browser back/forward buttons and initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentView(hash);
      window.scrollTo(0, 0); // Scroll to top on hash change (back button)
    };

    // Initial scroll check
    window.scrollTo(0, 0);

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Wrapper for navigation to ensure URL updates and scrolling
  const handleNavigate = (view: string) => {
    window.location.hash = view; // This triggers the hashchange event above
    // We don't need to setCurrentView here because the event listener handles it
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'keywords':
        return <KeywordFinder />;
      case 'script':
        return <ScriptGenerator />;
      case 'thumbnail-gen':
        return <ThumbnailGenerator />;
      case 'compare':
        return <ThumbnailCompare />;
      case 'competitors':
        return <CompetitorAnalysis />;
      case 'title-time':
        return <TitleTime />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'privacy':
        return <PrivacyPolicy />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
    </Layout>
  );
}

export default App;
