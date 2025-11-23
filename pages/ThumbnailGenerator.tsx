import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Spinner, SectionTitle, Badge } from '../components/UI';
import { generateThumbnail } from '../services/geminiService';
import { ThumbnailGenResult } from '../types';
import { SEO } from '../components/SEO';

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

const LOADING_STEPS = [
  "🧠 Analyzing Prompt Semantics...",
  "📐 Constructing Scene Geometry...",
  "💡 Calculating Global Illumination...",
  "🎨 Applying Neural Style Filters...",
  "✨ Finalizing 4K Render..."
];

export const ThumbnailGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [optimize, setOptimize] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedMood, setSelectedMood] = useState('Exciting');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Session History
  const [history, setHistory] = useState<ThumbnailGenResult[]>([]);
  const [currentImage, setCurrentImage] = useState<ThumbnailGenResult | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setLoadingStep(0);

    // Cycle through loading steps
    intervalRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const result = await generateThumbnail(prompt, selectedStyle, selectedMood, optimize);
      setHistory(prev => [result, ...prev]);
      setCurrentImage(result);
      
      // On mobile, smooth scroll to preview so user sees result immediately
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      console.error(error);
      alert("Generation failed. Please try again.");
    } finally {
      clearInterval(intervalRef.current);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    // Optional: Visual feedback or auto-focus could go here
  };

  return (
    <div className="space-y-16 pb-20">
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

      <div className="grid lg:grid-cols-12 gap-8 h-auto">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Creative Studio" className="border-brand-500/10 shadow-2xl">
            <div className="space-y-6">
              
              {/* Quick Templates */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Magic Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button 
                      key={i}
                      onClick={() => applyTemplate(t.prompt)}
                      className="text-left px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-800 transition-all text-xs md:text-sm text-slate-300 flex items-center gap-2 group"
                    >
                      <span className="grayscale group-hover:grayscale-0 transition-all">{t.label.split(' ')[0]}</span>
                      <span className="font-medium">{t.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-white">Visual Prompt</label>
                  <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">AI Enhanced</span>
                </div>
                <textarea 
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none min-h-[120px] placeholder:text-slate-600 resize-none text-sm leading-relaxed transition-all shadow-inner"
                  placeholder="Describe your scene in detail. E.g., 'A futuristic robot holding a glowing YouTube play button, cinematic lighting, 8k resolution...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${optimize ? 'bg-brand-600' : 'bg-slate-700'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${optimize ? 'left-5' : 'left-1'}`}></div>
                       <input type="checkbox" checked={optimize} onChange={(e) => setOptimize(e.target.checked)} className="hidden" />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-brand-300 transition-colors">Auto-Enhance Prompt</span>
                  </label>
                  <span className="text-xs text-slate-600">{prompt.length}/500</span>
                </div>
              </div>

              {/* Style Selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Art Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        selectedStyle === style.id 
                          ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg shadow-brand-500/10' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{style.icon}</span>
                        <span className="text-sm font-bold">{style.label}</span>
                      </div>
                      <p className="text-[10px] opacity-60 font-light truncate">{style.desc}</p>
                      {selectedStyle === style.id && <div className="absolute inset-0 border-2 border-brand-500 rounded-xl pointer-events-none animate-pulse-slow"></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Atmosphere</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 active:scale-95 ${
                        selectedMood === mood 
                          ? 'bg-slate-100 text-slate-900 border-white' 
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !prompt} 
                className="w-full py-4 text-base md:text-lg font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
              >
                {loading ? 'Processing...' : '🚀 Generate 4K Thumbnail'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Preview Area */}
        <div className="lg:col-span-8 flex flex-col gap-6" ref={previewRef}>
          {/* Main Canvas */}
          <div className="flex-1 min-h-[400px] md:min-h-[600px] bg-slate-950/50 rounded-2xl border border-slate-800 relative group overflow-hidden shadow-2xl flex items-center justify-center backdrop-blur-sm">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {loading ? (
               <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fade-in">
                 <div className="relative w-24 h-24 mb-8">
                   <div className="absolute inset-0 border-t-4 border-brand-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
                   <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
                     🎨
                   </div>
                 </div>
                 
                 <div className="space-y-2 text-center max-w-sm">
                   <h3 className="text-xl font-bold text-white tracking-wide animate-pulse">
                     {LOADING_STEPS[loadingStep]}
                   </h3>
                   <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                      ></div>
                   </div>
                   <p className="text-xs text-slate-500 font-mono pt-2">
                     Generating {selectedStyle} visuals...
                   </p>
                 </div>
               </div>
            ) : currentImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 animate-fade-in">
                <img 
                  src={currentImage.imageUrl} 
                  alt="AI Generated Thumbnail" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-white/5"
                />
                
                {/* Hover Actions */}
                <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                   <a 
                     href={currentImage.imageUrl} 
                     download={`tubemaster-thumb-${Date.now()}.jpg`}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg border border-white/10 transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                     Download 4K
                   </a>
                </div>

                {/* Info Badge */}
                {currentImage.optimizedPrompt && (
                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-white flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     AI Optimized Result
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-600 p-10 relative z-10">
                 <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                    <span className="text-4xl">✨</span>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-300 mb-2">Canvas Empty</h3>
                 <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                   Select a <span className="text-brand-400">Magic Template</span> or describe your vision to begin. 
                   Our engine creates unique, royalty-free images tailored for YouTube CTR.
                 </p>
              </div>
            )}
          </div>

          {/* Film Strip History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Gallery</span>
                <span className="text-xs text-slate-600">{history.length} Images</span>
              </div>
              <div className="h-28 bg-slate-950/30 border border-slate-800 rounded-xl overflow-x-auto custom-scrollbar flex items-center gap-3 px-3">
                 {history.map((item, idx) => (
                   <div 
                     key={item.createdAt} 
                     onClick={() => setCurrentImage(item)}
                     className={`relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden cursor-pointer border transition-all duration-200 group ${currentImage?.createdAt === item.createdAt ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-800 hover:border-slate-600'}`}
                   >
                     <img src={item.imageUrl} className="w-full h-full object-cover" loading="lazy" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Load</span>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
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

        {/* Detailed Guide */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6">
              <h3 className="text-3xl font-bold text-white">How to Prompt for Viral Results</h3>
              <p className="text-slate-400">
                You don't need to be a prompt engineer. Just follow the <span className="text-brand-400 font-bold">SAC Formula</span>:
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">S</div>
                  <div>
                    <h4 className="text-white font-bold">Subject</h4>
                    <p className="text-xs text-slate-500">Who is in the picture? (e.g., "A futuristic robot", "A worried man")</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">A</div>
                  <div>
                    <h4 className="text-white font-bold">Action</h4>
                    <p className="text-xs text-slate-500">What are they doing? (e.g., "Holding a glowing orb", "Running from explosion")</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">C</div>
                  <div>
                    <h4 className="text-white font-bold">Context</h4>
                    <p className="text-xs text-slate-500">Where are they? (e.g., "In a neon city", "On a blurred beach background")</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6">Style Guide Cheatsheet</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-300">Vlogs / Lifestyle</span>
                  <Badge color="blue">Realistic</Badge>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-300">Gaming / Crypto</span>
                  <Badge color="purple">3D Render</Badge>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-300">Storytime</span>
                  <Badge color="red">Cinematic</Badge>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-300">Tech Reviews</span>
                  <Badge color="brand">Minimalist</Badge>
                </div>
                <div className="mt-6 p-4 bg-brand-500/10 rounded-lg text-brand-200 text-xs italic">
                  "Pro Tip: Always toggle 'Auto-Enhance' on. Our system adds invisible keywords like 'volumetric lighting' and 'octane render' to boost quality automatically."
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};