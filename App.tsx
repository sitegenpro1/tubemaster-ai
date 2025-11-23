
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { KeywordFinder } from './pages/KeywordFinder';
import { ScriptGenerator } from './pages/ScriptGenerator';
import { ThumbnailGenerator } from './pages/ThumbnailGenerator';
import { ThumbnailCompare } from './pages/ThumbnailCompare';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { TitleTime } from './pages/TitleTime';
import { TagsGenerator } from './pages/TagsGenerator';
import { DescriptionGenerator } from './pages/DescriptionGenerator';
import { ThumbnailDownloader } from './pages/ThumbnailDownloader';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  // Initialize state: Priority 1: Hash, Priority 2: LocalStorage, Default: 'home'
  // This ensures that even if the previewer resets the URL, we remember the last page.
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      
      const stored = localStorage.getItem('lastView');
      if (stored) return stored;
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // 1. Persistence & Scroll Fix
  useEffect(() => {
    // Save current view so it persists on refresh
    localStorage.setItem('lastView', currentView);
    
    // FORCE Scroll to top instantly when view changes
    // This fixes the issue of being stuck at the footer when navigating from Home
    window.scrollTo({ top: 0, behavior: 'instant' }); 
  }, [currentView]);

  // 2. Listen for Back/Forward Button changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentView) {
        setCurrentView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home onNavigate={handleNavigate} />;
      case 'keywords': return <KeywordFinder />;
      case 'script': return <ScriptGenerator />;
      case 'thumbnail-gen': return <ThumbnailGenerator />;
      case 'thumbnail-dl': return <ThumbnailDownloader />;
      case 'compare': return <ThumbnailCompare />;
      case 'competitors': return <CompetitorAnalysis />;
      case 'title-time': return <TitleTime />;
      case 'tags-gen': return <TagsGenerator />;
      case 'desc-gen': return <DescriptionGenerator />;
      case 'pricing': return <Pricing onNavigate={handleNavigate} />;
      case 'login': return <Login onNavigate={handleNavigate} />;
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'privacy': return <PrivacyPolicy />;
      default: return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <Layout currentView={currentView} onNavigate={handleNavigate}>
        {renderView()}
      </Layout>
    </AuthProvider>
  );
}

export default App;