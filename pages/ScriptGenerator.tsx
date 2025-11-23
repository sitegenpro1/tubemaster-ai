
import React, { useState, useRef } from 'react';
import { Card, Button, Badge, SectionTitle } from '../components/UI';
import { generateScript } from '../services/geminiService';
import { ScriptResponse } from '../types';
import { SEO } from '../components/SEO';

const TONES = [
  { id: 'Energetic', label: 'Energetic 🔥' },
  { id: 'Professional', label: 'Professional 👔' },
  { id: 'Dramatic', label: 'Dramatic 🎭' },
  { id: 'Empathetic', label: 'Empathetic ❤️' }
];

const FORMATS = [
  { id: 'Tutorial', label: 'Tutorial / How-To' },
  { id: 'Listicle', label: 'Listicle / Top 10' },
  { id: 'Storytime', label: 'Storytime / Vlog' },
  { id: 'Review', label: 'Product Review' },
  { id: 'Commentary', label: 'Commentary / Op-Ed' },
  { id: 'Shorts', label: 'Shorts (<60s)' }
];

const LOADING_STEPS = [
  "🧠 Analyzing Niche Trends...",
  "🎣 Crafting the Perfect Hook...",
  "📉 Structuring Retention Points...",
  "✍️ Writing Engaging Dialogue...",
  "✨ Polishing Visual Cues..."
];

export const ScriptGenerator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0].id);
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [script, setScript] = useState<ScriptResponse | null>(null);
  
  const intervalRef = useRef<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!title) return;
    setLoading(true);
    setLoadingStep(0);
    setScript(null);

    // Combine parameters to pass context to the AI service
    const compositeAudience = `${audience || 'General Audience'}. Tone: ${selectedTone}. Format: ${selectedFormat}.`;

    // Cycle through loading steps
    intervalRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      const data = await generateScript(title, compositeAudience);
      if (data && data.sections) {
        setScript(data);
        // Scroll to results on mobile
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (e) {
      console.error(e);
      alert("Script generation failed. Please try again.");
    } finally {
      clearInterval(intervalRef.current);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const copySection = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const copyFullScript = () => {
    if (!script) return;
    const fullText = script.sections.map(s => `[${s.logicStep}]\n${s.content}\n(Visual: ${s.visualCue})`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    alert("Full script copied to clipboard!");
  };

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="AI YouTube Script Writer & Generator" 
        description="Generate viral YouTube scripts with AI. Optimized for high audience retention, our tool structures your video with hooks, value spikes, and payoffs." 
        path="/script" 
      />
      
      {/* Hero Header */}
      <div className="text-center pt-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          Viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Script Writer</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Writer's block is over. Generate retention-engineered scripts that keep viewers watching until the very last second.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto px-4">
        
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Script Configuration" className="shadow-2xl border-amber-500/10 h-full">
            <div className="space-y-8">
              
              {/* Modern Inputs */}
              <div className="space-y-5">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Video Topic</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="e.g. I tried the Carnivore Diet for 30 Days"
                      className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium shadow-inner"
                    />
                    {/* Active Glow */}
                    <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Target Audience</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500 group-focus-within:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <input 
                      value={audience} 
                      onChange={(e) => setAudience(e.target.value)} 
                      placeholder="e.g. Fitness beginners, Tech enthusiasts..." 
                      className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Tone of Voice</label>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`px-3 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        selectedTone === t.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Video Structure</label>
                <div className="grid grid-cols-2 gap-3">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={`px-3 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        selectedFormat === f.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !title} 
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-transform"
              >
                {loading ? 'Thinking...' : '✨ Write Viral Script'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-8 min-h-[600px]" ref={resultsRef}>
          <div className="h-full bg-slate-950/50 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col backdrop-blur-sm shadow-2xl">
            
            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-8">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-t-4 border-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">✍️</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">{LOADING_STEPS[loadingStep]}</h3>
                <p className="text-slate-500 font-mono text-sm">Drafting content for {selectedFormat} format...</p>
                <div className="w-64 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500 ease-out"
                    style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Content State */}
            {script ? (
              <div className="flex flex-col h-full animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{script.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>⏱️ Est. {script.estimatedDuration}</span>
                      <span>🎯 {script.targetAudience}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="secondary" onClick={copyFullScript} className="text-xs py-2 px-4 h-9">
                      Copy Full Script
                    </Button>
                  </div>
                </div>

                {/* Script Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                  {script.sections.map((section, idx) => (
                    <div 
                      key={idx} 
                      className="group bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-lg animate-slide-up"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800/60 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-mono font-bold border border-slate-700">
                            {idx + 1}
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            section.logicStep.includes('Hook') ? 'text-amber-400' : 
                            section.logicStep.includes('Payoff') ? 'text-emerald-400' : 'text-blue-400'
                          }`}>
                            {section.logicStep}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-slate-500 font-mono">{section.duration}</span>
                          <button 
                            onClick={() => copySection(section.content)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy section"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-5 grid lg:grid-cols-12 gap-6">
                        {/* Dialogue */}
                        <div className="lg:col-span-8">
                          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {section.content}
                          </p>
                        </div>
                        
                        {/* Editor Notes */}
                        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800/50 pt-4 lg:pt-0 lg:pl-6">
                           <div className="space-y-3">
                             <div className="flex gap-2">
                               <span className="text-lg">🎥</span>
                               <div>
                                 <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Visual Cue</span>
                                 <p className="text-xs text-slate-400 italic leading-snug">{section.visualCue}</p>
                               </div>
                             </div>
                             {section.psychologicalTrigger && (
                               <div className="flex gap-2">
                                 <span className="text-lg">🧠</span>
                                 <div>
                                   <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Logic</span>
                                   <Badge color="purple">{section.psychologicalTrigger}</Badge>
                                 </div>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-8 pb-4">
                     <p className="text-slate-600 text-xs font-mono">End of Script • Generated by TubeMaster AI</p>
                  </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                  <span className="text-5xl grayscale">📄</span>
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Your Page is Blank</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Select your settings on the left to generate a script tailored for maximum <span className="text-amber-500">Watch Time</span>.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SEO Content Section */}
      <section className="max-w-5xl mx-auto pt-16 border-t border-slate-800/50 mt-12 px-4">
        <SectionTitle title="The Science of Retention" subtitle="Why 'Good Content' isn't enough anymore. You need structured psychology." center />
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <Card title="1. The Hook (0:00 - 0:30)" className="bg-slate-900/40">
            <p className="text-sm text-slate-400 leading-relaxed">
              50% of viewers leave in the first 30 seconds. Our AI ensures your script starts with a "Curiosity Gap" or "Immediate Value Statement" to hook viewers instantly.
            </p>
          </Card>
          <Card title="2. The Pattern Interrupt" className="bg-slate-900/40">
            <p className="text-sm text-slate-400 leading-relaxed">
              Human attention spans are short. The script generator inserts "Pattern Interrupts" (visual changes, tone shifts) every 60-90 seconds to reset the viewer's dopamine levels.
            </p>
          </Card>
          <Card title="3. The Payoff" className="bg-slate-900/40">
            <p className="text-sm text-slate-400 leading-relaxed">
              Never bury the lead. We structure scripts to deliver on the title's promise exactly when retention starts to dip, ensuring satisfaction and earning the subscription.
            </p>
          </Card>
        </div>

        <div className="mt-16 bg-gradient-to-r from-amber-900/20 to-slate-900 border border-amber-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Mastering the YouTube Script Template</h3>
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p>
                Using a <strong>YouTube script generator</strong> isn't about being lazy; it's about being efficient. The top 1% of creators don't write from scratch—they use proven frameworks.
              </p>
              <p>
                Whether you are making a "Talking Head" video or a high-production documentary, the underlying structure remains the same: <strong>Hook → Context → Value → Climax → CTA</strong>. TubeMaster automates this structure so you can focus on your personality and delivery.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
        </div>
      </section>

    </div>
  );
};
