import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdBanner } from './AdBanner';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isPro } = useAuth();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    // PERFORMANCE FIX: Passive listener prevents scroll blocking
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Keywords', id: 'keywords' },
    { name: 'Grabber', id: 'thumbnail-dl' },
    { name: 'Scripts', id: 'script' },
    { name: 'Spy Tool', id: 'competitors' },
    { name: 'Explainer', id: 'explainer-board' },
  ];

  return (
    <div className="min-h-screen text-slate-200 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100 overflow-x-hidden">
      
      {/* Sticky Header - Added transform-gpu for better compositing */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b transform-gpu ${
          scrolled || isMobileMenuOpen 
            ? 'bg-[#020617]/90 backdrop-blur-xl border-slate-800/80 shadow-lg shadow-black/20' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNavClick('home')}>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-white">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white block leading-none">
                  TubeMaster<span className="text-brand-400">.ai</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold hidden sm:block">Growth Suite</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                {user ? (
                   isPro ? (
                     <span className="text-xs font-mono text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-lg bg-brand-500/10 backdrop-blur-md cursor-pointer" onClick={() => handleNavClick('pricing')}>
                       PLAN: PRO
                     </span>
                   ) : (
                     <button 
                       onClick={() => handleNavClick('pricing')}
                       className="text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 rounded-lg shadow-lg hover:scale-105 transition-transform"
                     >
                       UPGRADE
                     </button>
                   )
                ) : (
                  <button 
                    onClick={() => handleNavClick('login')}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Hamburger Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#020617] border-b border-slate-800 animate-slide-down shadow-2xl absolute w-full left-0 top-16 md:top-20 h-[calc(100vh-4rem)] overflow-y-auto z-40">
            <div className="px-4 py-6 space-y-4">
               {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-5 py-4 rounded-xl text-lg font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {item.name}
                    {currentView === item.id && <span className="text-brand-500">●</span>}
                  </div>
                </button>
              ))}
              
              <div className="pt-6 mt-2 border-t border-slate-800/50 space-y-3">
                 {user ? (
                   isPro ? (
                     <div className="px-4 py-2 bg-brand-500/10 rounded-xl text-brand-300 text-center font-mono">
                       Current Plan: PRO
                     </div>
                   ) : (
                     <button 
                       onClick={() => handleNavClick('pricing')}
                       className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-bold"
                     >
                       Upgrade to Pro
                     </button>
                   )
                 ) : (
                   <button 
                     onClick={() => handleNavClick('login')}
                     className="w-full py-3 bg-slate-800 rounded-xl text-white font-bold"
                   >
                     Login / Signup
                   </button>
                 )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:py-32 relative z-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#020617] relative overflow-hidden">
        {/* Abstract footer glow - Optimized */}
        <div className="absolute bottom-0 left-1/4 w-[300px] md:w-[500px] h-[300px] bg-brand-600/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none transform-gpu translate-z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">TubeMaster.ai</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                The advanced intelligence suite for creators who treat YouTube as a business, not a hobby.
              </p>
            </div>

            {/* Tools Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-brand-400 cursor-pointer transition-colors" onClick={() => onNavigate('keywords')}>Keyword Explorer</li>
                <li className="hover:text-brand-400 cursor-pointer transition-colors" onClick={() => onNavigate('explainer-board')}>AI Explainer Board</li>
                <li className="hover:text-brand-400 cursor-pointer transition-colors" onClick={() => onNavigate('thumbnail-dl')}>Thumbnail Downloader</li>
                <li className="hover:text-brand-400 cursor-pointer transition-colors" onClick={() => onNavigate('script')}>Script Writer</li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-brand-400 cursor-pointer" onClick={() => onNavigate('about')}>About Us</li>
                <li className="hover:text-brand-400 cursor-pointer" onClick={() => onNavigate('contact')}>Contact Support</li>
                <li className="hover:text-brand-400 cursor-pointer" onClick={() => onNavigate('pricing')}>Pricing Plans</li>
              </ul>
            </div>

            {/* Legal/Meta Column */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="hover:text-brand-400 cursor-pointer" onClick={() => onNavigate('privacy')}>Privacy Policy</li>
                <li className="hover:text-brand-400 cursor-pointer" onClick={() => onNavigate('privacy')}>Terms of Service</li>
                <li className="flex items-center gap-2 mt-4 text-xs text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Systems Operational
                </li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-slate-800/50 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TubeMaster AI Suite. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono bg-slate-900/50 px-3 py-1 rounded border border-slate-800">
               <span>Powered by</span>
               <span className="text-slate-400 font-bold">Proprietary AI Logic</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Global Ad Banner */}
      <AdBanner />
    </div>
  );
};