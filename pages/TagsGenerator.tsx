
import React, { useState } from 'react';
import { Button, Spinner, Card, SectionTitle } from '../components/UI';
import { generateSeoTags } from '../services/geminiService';
import { SEO } from '../components/SEO';

export const TagsGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setTags([]);
    setError(null);

    try {
      const result = await generateSeoTags(topic);
      if (result && result.length > 0) {
        setTags(result);
      } else {
        setError("AI returned no tags. Try a simpler topic.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to generate tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTags = () => {
    navigator.clipboard.writeText(tags.join(', '));
    alert("Tags copied to clipboard!");
  };

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="YouTube Tag Generator Tool" 
        description="Generate 5 high-power, SEO-optimized tags for your YouTube videos. Uses AI to find low-competition, high-relevance semantic tags." 
        path="/tags-gen" 
      />

      {/* Hero */}
      <div className="text-center pt-8 md:pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">
          Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Tag Generator</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Quality over Quantity. We generate the top 5 semantically relevant tags that actually move the needle for your SEO.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Video Topic / Title</label>
          <input 
            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-4 text-lg text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
            placeholder="e.g. Best Mirrorless Cameras for Beginners 2024"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !topic} 
            className="w-full py-4 text-lg font-bold shadow-lg shadow-cyan-900/20"
          >
            {loading ? <Spinner /> : '🚀 Generate Expert Tags'}
          </Button>
          {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
        </div>
      </div>

      {/* Results */}
      {tags.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 animate-slide-up">
          <div className="bg-slate-900/50 border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
             
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-white">Optimized Tags</h3>
               <button onClick={copyTags} className="text-sm bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors font-bold">
                 Copy All
               </button>
             </div>

             <div className="flex flex-wrap gap-3">
               {tags.map((tag, i) => (
                 <div key={i} className="bg-slate-950 border border-slate-800 rounded-full px-6 py-3 text-slate-200 text-lg shadow-inner flex items-center gap-2">
                   <span className="text-cyan-500 font-bold">#</span>
                   {tag}
                 </div>
               ))}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800 text-center">
               <p className="text-slate-500 text-sm">
                 Paste these into the "Tags" section of YouTube Studio. Also consider adding them to the bottom of your description.
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Educational Content */}
      <section className="max-w-4xl mx-auto px-4 pt-12 border-t border-slate-800/50 mt-12">
        <SectionTitle title="Why 5 Tags?" subtitle="The strategy behind metadata minimalism." center />
        
        <div className="grid md:grid-cols-2 gap-8 mt-8">
           <Card title="Keyword Stuffing is Dead" className="bg-slate-900/30">
             <p className="text-slate-400 text-sm leading-relaxed">
               Years ago, creators used 50+ tags. Today, YouTube's algorithm considers this "spammy." It confuses the categorization AI. By using fewer, highly specific tags, you signal exactly what your video is about.
             </p>
           </Card>
           <Card title="Semantic Relevance" className="bg-slate-900/30">
             <p className="text-slate-400 text-sm leading-relaxed">
               Our AI doesn't just look for string matches. It understands "Semantic Relevance." For example, if you type "Jogging", it knows to suggest "Cardio" and "Running Tips" even though the words are different.
             </p>
           </Card>
        </div>
      </section>
    </div>
  );
};