
import React, { useState } from 'react';
import { Button, Input, Card, SectionTitle, Spinner, Badge } from '../components/UI';
import { validateNiche } from '../services/geminiService';
import { NicheValidationResult } from '../types';
import { SEO } from '../components/SEO';

export const NicheValidator: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NicheValidationResult | null>(null);

  const handleValidate = async () => {
    if (!niche) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await validateNiche(niche);
      setResult(data);
    } catch (e) {
      alert("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, inverse = false) => {
    if (inverse) {
      if (score > 70) return 'text-rose-500';
      if (score > 40) return 'text-amber-500';
      return 'text-emerald-500';
    }
    if (score > 70) return 'text-emerald-500';
    if (score > 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressColor = (score: number, inverse = false) => {
    if (inverse) {
      if (score > 70) return 'bg-rose-500';
      if (score > 40) return 'bg-amber-500';
      return 'bg-emerald-500';
    }
    if (score > 70) return 'bg-emerald-500';
    if (score > 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="YouTube Niche Validator & Viral Simulator" 
        description="Is your niche profitable? Check estimated CPM, competition saturation, and simulate your first viral video concept." 
        path="/niche-validator" 
      />

      <div className="text-center pt-8 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">
          Niche <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Validator</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Don't start a channel without data. Check profitability, saturation, and get a viral blueprint instantly.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Enter Niche Idea (e.g. 'Stoic Philosophy for Men', 'Luxury Real Estate')" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
              />
            </div>
            <Button onClick={handleValidate} disabled={loading || !niche} className="md:w-48 font-bold text-lg">
              {loading ? <Spinner /> : 'Validate Niche'}
            </Button>
          </div>
        </div>
      </div>

      {result && (
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          {/* Main Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profitability */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Profitability</h3>
                <span className="text-2xl">💰</span>
              </div>
              <div className={`text-4xl font-extrabold mb-2 ${getScoreColor(result.profitabilityScore)}`}>
                {result.profitabilityScore}/100
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-4">
                <div className={`h-full rounded-full ${getProgressColor(result.profitabilityScore)}`} style={{width: `${result.profitabilityScore}%`}}></div>
              </div>
              <p className="text-slate-300 text-sm">Est. CPM: <span className="font-mono font-bold text-white">{result.estimatedCPM}</span></p>
            </div>

            {/* Competition (Inverse: Lower is Better) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Saturation</h3>
                <span className="text-2xl">🦈</span>
              </div>
              <div className={`text-4xl font-extrabold mb-2 ${getScoreColor(result.competitionScore, true)}`}>
                {result.competitionScore}/100
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-4">
                <div className={`h-full rounded-full ${getProgressColor(result.competitionScore, true)}`} style={{width: `${result.competitionScore}%`}}></div>
              </div>
              <p className="text-slate-300 text-sm">{result.competitionScore > 70 ? 'Red Ocean (Crowded)' : 'Blue Ocean (Open)'}</p>
            </div>

            {/* Growth */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Growth Potential</h3>
                <span className="text-2xl">🚀</span>
              </div>
              <div className={`text-4xl font-extrabold mb-2 ${getScoreColor(result.growthPotential)}`}>
                {result.growthPotential}/100
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-4">
                <div className={`h-full rounded-full ${getProgressColor(result.growthPotential)}`} style={{width: `${result.growthPotential}%`}}></div>
              </div>
              <p className="text-slate-300 text-sm">Verdict: <span className="font-bold text-white">{result.verdict}</span></p>
            </div>
          </div>

          {/* Analysis Text */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-lg text-slate-300 italic">"{result.analysis}"</p>
          </div>

          {/* Viral Simulator */}
          <div className="mt-12 pt-8 border-t border-slate-800/50">
            <SectionTitle title="Viral Video Simulator" subtitle="We asked our AI to dream up the perfect breakout video for this niche." center />
            
            <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-br from-slate-900 to-black border border-fuchsia-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
               
               <div className="grid md:grid-cols-2 gap-8 items-center">
                 {/* Mock Thumbnail */}
                 <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden group border border-slate-700">
                    <div className="text-center p-6">
                      <span className="text-4xl mb-4 block">📸</span>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Thumbnail Concept</p>
                      <p className="text-sm text-white font-medium leading-relaxed">{result.viralIdea.thumbnailConcept}</p>
                    </div>
                    {/* Fake Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      10:24
                    </div>
                 </div>

                 {/* Video Metadata */}
                 <div className="space-y-6">
                   <div>
                     <Badge color="purple">Suggested Title</Badge>
                     <h3 className="text-xl md:text-2xl font-bold text-white mt-2 leading-tight">
                       {result.viralIdea.title}
                     </h3>
                   </div>
                   
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                     <p className="text-xs text-slate-500 uppercase font-bold mb-2">The Hook (0:00 - 0:15)</p>
                     <p className="text-slate-300 italic text-sm border-l-2 border-fuchsia-500 pl-3">
                       "{result.viralIdea.hookScript}"
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
