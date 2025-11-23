
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AdBanner: React.FC = () => {
  const { isPro } = useAuth();

  // Even if isPro is false, we just show the banner. 
  // If isPro were true (legacy/future), we would hide it.
  if (isPro) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-2 z-40 hidden md:flex items-center justify-center gap-4 shadow-lg">
      <div className="text-xs text-slate-500 uppercase tracking-widest font-bold border border-slate-700 px-2 py-1 rounded">Ad</div>
      <p className="text-slate-300 text-sm">
        <span className="font-bold text-white">TubeMaster AI</span> - Free Public Beta Access.
      </p>
    </div>
  );
};
