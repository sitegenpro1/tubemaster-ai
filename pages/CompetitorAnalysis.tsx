
import React, { useState } from 'react';
import { Card, Input, Button, Spinner, Badge } from '../components/UI';
import { analyzeCompetitor } from '../services/geminiService';
import { resolveChannelId, getChannelStats, getChannelVideos } from '../services/rapidApiService';
import { CompetitorAnalysisResult, RapidFullAnalysisData } from '../types';
import { SEO } from '../components/SEO';

export const CompetitorAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  
  // Steps: 'idle' -> 'fetching_data' -> 'analyzing_ai' -> 'complete'
  const [status, setStatus] = useState<'idle' | 'fetching_data' | 'analyzing_ai' | 'complete'>('idle');
  const [scrapedData, setScrapedData] = useState<RapidFullAnalysisData | null>(null);
  const [aiResult, setAiResult] = useState<CompetitorAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = status === 'fetching_data' || status === 'analyzing_ai';

  const handleAnalyze = async () => {
    if (!url) return;

    setStatus('fetching_data');
    setError(null);
    setScrapedData(null);
    setAiResult(null);
    
    try {
      // 1. Resolve ID with new robust resolver
      const channelId = await resolveChannelId(url);
      if (!channelId) throw new Error("Could not resolve Channel ID. Please try the full YouTube Channel URL.");

      // 2. Fetch Stats & Videos Parallel
      const [stats, videos] = await Promise.all([
        getChannelStats(channelId),
        getChannelVideos(channelId)
      ]);

      // Check if critical stats are present
      if (!stats) {
        throw new Error("Failed to retrieve channel statistics.");
      }

      const fullData = { channel: stats, recentVideos: videos };
      setScrapedData(fullData);

      // 3. AI Analysis
      setStatus('analyzing_ai');
      const result = await analyzeCompetitor(fullData);
      setAiResult(result);
      setStatus('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed. Ensure your RapidAPI Key is valid and has quota.");
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <SEO title="Competitor Spy - Real Data Analysis" description="Analyze YouTube channels using real-time API data and AI logic." path="/competitors" />
      
      {/* Header */}
      <div className="text-center pt-8 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Competitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Spy Engine</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Enter a competitor's handle (e.g., @MrBeast) or full channel URL. Our system fetches real-time performance metrics and uses AI to generate an "Attack Plan" to outrank them.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/50 p-6 md:p-10 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
             <Input 
               placeholder="e.g. @MrBeast or youtube.com/@MrBeast"
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
             />
          </div>
          <Button onClick={handleAnalyze} disabled={isProcessing || !url} className="md:w-56 font-bold text-lg shadow-lg shadow-purple-900/20">
            {isProcessing ? <Spinner /> : 'Run Spy Tool 🕵️'}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span> 
            <div>
              <p className="font-bold">Analysis Failed</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress States */}
      {status === 'fetching_data' && (
        <div className="text-center py-12 animate-pulse space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-3xl">📡</div>
          <h3 className="text-xl font-bold text-white">Connecting to YouTube Data API...</h3>
          <p className="text-slate-400">Resolving Channel ID and fetching latest metrics.</p>
        </div>
      )}

      {status === 'analyzing_ai' && scrapedData && (
        <div className="text-center py-12 animate-pulse space-y-4">
           <div className="w-16 h-16 bg-brand-900/30 rounded-full mx-auto flex items-center justify-center text-3xl">🧠</div>
           <h3 className="text-xl font-bold text-white">AI Strategy Processing...</h3>
           <p className="text-slate-400">Analyzing {scrapedData.recentVideos.length} videos from <span className="text-brand-400 font-bold">{scrapedData.channel.title}</span>.</p>
        </div>
      )}

      {/* Results */}
      {status === 'complete' && scrapedData && aiResult && (
        <div className="space-y-8 animate-slide-up">
          
          {/* Channel Overview Card */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md">
             {scrapedData.channel.avatar ? (
               <img src={scrapedData.channel.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl" />
             ) : (
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl">📺</div>
             )}
             <div className="text-center md:text-left flex-1">
               <h3 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                 {scrapedData.channel.title}
                 {scrapedData.channel.isVerified && <span className="text-blue-400 text-xl" title="Verified">✓</span>}
               </h3>
               <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                 <Badge color="blue">{scrapedData.channel.subscriberCount} Subs</Badge>
                 <Badge color="purple">{scrapedData.channel.videoCount} Videos</Badge>
                 <Badge color="green">Active</Badge>
               </div>
               <p className="text-slate-400 mt-4 text-sm line-clamp-2 max-w-2xl">{scrapedData.channel.description}</p>
             </div>
          </div>

          {/* AI Attack Plan */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Strategic Attack Plan" className="bg-gradient-to-br from-brand-900/20 to-slate-900 border-brand-500/30 h-full">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-200 leading-relaxed font-medium italic border-l-4 border-brand-500 pl-4 py-2 bg-brand-500/5 rounded-r-lg">
                    "{aiResult.actionPlan}"
                  </p>
                </div>
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                    <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                      <span>💪</span> Core Strengths
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-2">
                      {aiResult.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
                    <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                      <span>🔻</span> Exploitable Weaknesses
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-2">
                      {aiResult.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
               <Card title="Winning Niches & Keywords" className="border-indigo-500/20 bg-indigo-900/5">
                 <p className="text-xs text-slate-500 mb-4">Top performing topics driving views:</p>
                 <div className="flex flex-wrap gap-2">
                   {aiResult.topPerformingTopics && aiResult.topPerformingTopics.length > 0 ? (
                     aiResult.topPerformingTopics.map((topic, i) => (
                       <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                         #{topic.replace(/ /g, '')}
                       </span>
                     ))
                   ) : (
                     <span className="text-slate-500 text-sm">No specific trend identified.</span>
                   )}
                 </div>
               </Card>

               <Card title="Content Gaps" className="border-amber-500/20 bg-amber-900/5">
                 <p className="text-xs text-slate-500 mb-4">Topics this channel is missing:</p>
                 <div className="space-y-3">
                   {aiResult.contentGaps.map((gap, i) => (
                     <div key={i} className="flex items-start gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                       <span className="text-amber-500 font-bold text-lg">⚠️</span>
                       <span className="text-slate-300 text-sm font-medium">{gap}</span>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>

          {/* Recent Video Data Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h4 className="text-white font-bold">Analyzed Video Data</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Video Title</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scrapedData.recentVideos.length > 0 ? (
                    scrapedData.recentVideos.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-slate-200 font-medium max-w-md truncate" title={v.title}>{v.title}</td>
                        <td className="p-4 font-mono text-brand-400">{v.viewCount}</td>
                        <td className="p-4">{v.publishedTimeText}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                        No recent videos found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
