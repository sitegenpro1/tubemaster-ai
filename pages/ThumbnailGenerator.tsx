
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, SectionTitle, Badge } from '../components/UI';
// API Connection Removed as requested
// import { generateThumbnail } from '../services/geminiService';
import { ThumbnailGenResult } from '../types';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

const STYLES = [
  { id: 'realistic', label: 'Hyper Realism', icon: '📸', desc: 'Best for reaction faces & vlogs' },
  { id: '3d', label: '3D Render', icon: '🧊', desc: 'Pixar/Fortnite style visuals' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬', desc: 'Movie poster lighting & drama' },
  { id: 'anime', label: 'Anime Style', icon: '🎌', desc: 'High energy, drawn aesthetic' },
  { id: 'comic', label: 'Comic Book', icon: '💥', desc: 'Bold lines and pop colors' },
  { id: 'cyberpunk', label: 'Neon Future', icon: '🌃', desc: 'Tech, gaming, and crypto' },
];

const MOODS = ['Exciting', 'Mystery', 'Happy', 'Dark', 'Educational', 'Intense', 'Minimalist'];

const TEMPLATES = [
  { label: '📖 Story/Mystery', prompt: 'Dramatic close up of a mysterious figure in shadows, ancient ruins in background, volumetric fog, warm torch lighting, cinematic 8k, highly detailed texture' },
  { label: '⚡ Tech/Review', prompt: 'Clean minimal product shot of a futuristic gadget on a sleek desk, shallow depth of field, soft box lighting, bokeh background, tech aesthetic, apple style advertising' },
  { label: '🆚 Versus', prompt: 'Split screen comparison, left side red theme angry vs right side blue theme happy, lightning bolt in middle, versus text placeholder, 4k render' },
  { label: '🎮 Gaming', prompt: 'Intense action scene, cyberpunk character holding glowing weapon, particle effects, explosion background, 8k render, unreal engine 5' }
];

export const ThumbnailGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [optimize, setOptimize] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedMood, setSelectedMood] = useState('Exciting');
  const [loading, setLoading] = useState(false);
  
  // Session History
  const [history, setHistory] = useState<ThumbnailGenResult[]>([]);
  const [currentImage, setCurrentImage] = useState<ThumbnailGenResult | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  
  const { isPro } = useAuth();

  const handleGenerate = async () => {
    // API Call Removed - Tool is locked
    alert("This tool is currently locked.");
  };

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  return (
    <div className="space-y-16 pb-20 relative">
      <SEO 
        title="AI YouTube Thumbnail Generator & Creator" 
        description="Create viral, high-CTR thumbnails in seconds. Our AI YouTube Thumbnail Generator understands the psychology of clicking. Free 4K rendering."
        path="/thumbnail-gen"
      />

      {/* Hero Header */}
      <div className="text-center pt-4 md:pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          AI YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Thumbnail Generator</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Stop the scroll with scientifically optimized visuals. Powered by our proprietary <span className="text-slate-200 font-semibold">Neural Rendering Engine</span>.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 h-auto relative">
        
        {/* HARD LOCK OVERLAY - ALWAYS VISIBLE */}
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-slate-800">
             <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 shadow-2xl shadow-brand-900/40">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">This Tool Is Locked</h2>
             <p className="text-slate-400 max-w-md mb-8 text-lg">
               Access to this feature is currently restricted.
             </p>
             <button disabled className="bg-slate-800 text-slate-500 px-8 py-3 rounded-full font-bold text-lg cursor-not-allowed border border-slate-700 hover:bg-slate-800">
               Unavailable
             </button>
        </div>

        {/* Left Control Panel - Blurred & Disabled */}
        <div className="lg:col-span-4 space-y-6 blur-sm pointer-events-none select-none">
          <Card title="Creative Studio" className="border-brand-500/10 shadow-2xl">
            <div className="space-y-6">
              
              {/* Quick Templates */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Magic Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button 
                      key={i}
                      className="text-left px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs md:text-sm text-slate-300 flex items-center gap-2 group"
                    >
                      <span className="grayscale">{t.label.split(' ')[0]}</span>
                      <span className="font-medium">{t.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">Visual Prompt</label>
                  <div className="flex gap-2">
                     <Badge color="yellow">No Humans (Beta)</Badge>
                     <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">AI Enhanced</span>
                  </div>
                </div>
                <textarea 
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-slate-200 outline-none min-h-[120px] resize-none text-sm leading-relaxed shadow-inner"
                  placeholder="Describe your scene in detail..."
                  value={prompt}
                  readOnly
                />
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`w-9 h-5 rounded-full relative bg-brand-600`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full left-5`}></div>
                    </div>
                    <span className="text-xs text-slate-400">Auto-Enhance Prompt</span>
                  </label>
                  <span className="text-xs text-slate-600">0/500</span>
                </div>
              </div>

              {/* Style Selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Art Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        selectedStyle === style.id 
                          ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{style.icon}</span>
                        <span className="text-sm font-bold">{style.label}</span>
                      </div>
                      <p className="text-[10px] opacity-60 font-light truncate">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                disabled 
                className="w-full py-4 text-base md:text-lg font-bold shadow-lg bg-slate-800 text-slate-500 border-slate-700"
              >
                🚀 Generate 4K Thumbnail
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Preview Area - Blurred & Disabled */}
        <div className="lg:col-span-8 flex flex-col gap-6 blur-sm pointer-events-none select-none" ref={previewRef}>
          {/* Main Canvas */}
          <div className="flex-1 min-h-[400px] md:min-h-[600px] bg-slate-950/50 rounded-2xl border border-slate-800 relative group overflow-hidden shadow-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="text-center text-slate-600 p-10 relative z-10">
                 <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                    <span className="text-4xl">✨</span>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-300 mb-2">Canvas Empty</h3>
                 <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                   Select a <span className="text-brand-400">Magic Template</span> or describe your vision to begin.
                 </p>
              </div>
          </div>
        </div>
      </div>

      {/* SEO & Educational Content Section */}
      <section className="max-w-5xl mx-auto pt-12 md:pt-24 border-t border-slate-800/50 mt-12 space-y-20">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto">
          <SectionTitle title="The Science of the Click" center />
          <p className="text-lg text-slate-400 leading-relaxed">
            Your thumbnail is not just an image; it is a promise. It is the single most important factor in your Video Click-Through Rate (CTR). 
            TubeMaster uses advanced generative logic to create visuals that trigger curiosity and stop the scroll.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-slate-900/40" title="Visual Hierarchy">
            <p className="text-sm text-slate-400 leading-relaxed">
              The human eye scans images in a 'Z' pattern. Our generator emphasizes the subject (usually a face) and the object of interest to align with natural eye-tracking behavior.
            </p>
          </Card>
          <Card className="bg-slate-900/40" title="Contrast & Pop">
            <p className="text-sm text-slate-400 leading-relaxed">
              Most users browse on mobile in Dark Mode. Our "High Contrast" settings ensure your thumbnail doesn't blend into the background, effectively "popping" off the screen.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};
