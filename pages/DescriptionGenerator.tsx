import React, { useState } from 'react';
import { Button, Spinner, Card, SectionTitle, Input } from '../components/UI';
import { generateVideoDescription } from '../services/geminiService';
import { DescriptionResult } from '../types';
import { SEO } from '../components/SEO';

export const DescriptionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DescriptionResult | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await generateVideoDescription(topic, keywords);
      setResult(data);
    } catch (e) {
      alert("Failed to generate description.");
    } finally {
      setLoading(false);
    }
  };

  const copyFull = () => {
    if (!result) return;
    const text = `${result.hook}\n\n${result.body}\n\n${result.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="YouTube Description Generator" 
        description="Write SEO-optimized video descriptions in seconds. Includes hooks, summary, and hashtags." 
        path="/desc-gen" 
      />

      <div className="text-center pt-8 md:pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">
          Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Description Writer</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          The first 2 lines of your description are as important as your title. We optimize them for maximum click-through.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto px-4">
        {/* Left: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Video Details" className="border-indigo-500/20 shadow-xl">
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Video Title</label>
                 <Input 
                   value={topic} 
                   onChange={(e) => setTopic(e.target.value)} 
                   placeholder="e.g. How to Bake Sourdough Bread"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keywords to Include (Optional)</label>
                 <Input 
                   value={keywords} 
                   onChange={(e) => setKeywords(e.target.value)} 
                   placeholder="e.g. baking, fermentation, easy recipe"
                 />
               </div>
               <Button onClick={handleGenerate} disabled={loading || !topic} className="w-full py-4 text-lg">
                 {loading ? <Spinner /> : '✨ Write Description'}
               </Button>
             </div>
          </Card>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-7">
           {result ? (
             <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 md:p-8 relative">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-white">Generated Description</h3>
                 <button onClick={copyFull} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">
                   Copy All
                 </button>
               </div>

               <div className="space-y-6 text-slate-300 font-light leading-relaxed whitespace-pre-wrap">
                 <div className="bg-slate-950/50 p-4 rounded-xl border border-indigo-500/30">
                   <p className="text-xs text-indigo-400 font-bold uppercase mb-2">The Hook (Visible in Search)</p>
                   <p className="text-white font-medium">{result.hook}</p>
                 </div>

                 <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Main Body</p>
                    <p>{result.body}</p>
                 </div>

                 <div className="text-blue-400">
                   {result.hashtags.join(' ')}
                 </div>
               </div>
             </div>
           ) : (
             <div className="h-full min-h-[400px] bg-slate-900/30 border border-slate-800 rounded-2xl border-dashed flex flex-col items-center justify-center text-slate-500 p-8 text-center">
               <div className="text-4xl mb-4">📝</div>
               <p>Enter your video details to generate an SEO-optimized description structure.</p>
             </div>
           )}
        </div>
      </div>

       {/* Educational Content */}
       <section className="max-w-4xl mx-auto px-4 pt-12 border-t border-slate-800/50 mt-12">
        <SectionTitle title="Description Anatomy" subtitle="How to structure for ranking." center />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
           <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
             <div className="text-indigo-500 font-bold text-xl mb-2">01. The Fold</div>
             <p className="text-slate-400 text-sm">Only the first 2 lines are visible in search results. This must be a compelling "ad" for your video.</p>
           </div>
           <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
             <div className="text-indigo-500 font-bold text-xl mb-2">02. SEO Body</div>
             <p className="text-slate-400 text-sm">YouTube converts your speech to text, but also reads your description. Repeat your main keywords naturally here.</p>
           </div>
           <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
             <div className="text-indigo-500 font-bold text-xl mb-2">03. Hashtags</div>
             <p className="text-slate-400 text-sm">Use 3-5 specific hashtags. These appear above your title and help link your video to broader topics.</p>
           </div>
        </div>
      </section>
    </div>
  );
};