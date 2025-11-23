import React, { useState } from 'react';
import { Button, Spinner, Card } from '../components/UI';
import { findKeywords } from '../services/geminiService';
import { KeywordResult } from '../types';
import { SEO } from '../components/SEO';

export const KeywordFinder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!topic) return;
    setError(null);
    setLoading(true);
    setExpandedRow(null);
    setResults([]);

    try {
      const data = await findKeywords(topic);
      if (data && data.length > 0) {
        setResults(data);
      } else {
        setError("No keywords found. Please try a broader term.");
      }
    } catch (error: any) {
      console.error(error);
      setError(`Error: ${error.message || "Failed to fetch"}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const copyList = () => {
    navigator.clipboard.writeText(results.map(r => r.keyword).join('\n'));
    alert("Copied to clipboard");
  };

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="YouTube Keyword Finder & Tag Generator" 
        description="Free YouTube Keyword Tool. Find high-volume, low-competition keywords to rank your videos fast using our Semantic Logic Engine." 
        path="/keywords" 
      />
      
      {/* Hero Section with H1 for SEO */}
      <div className="text-center pt-8 md:pt-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] bg-blue-500/10 blur-[100px] -z-10 rounded-full"></div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
          YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand-400">Keyword Finder</span>
        </h1>
        
        <h2 className="text-xl md:text-2xl font-semibold text-brand-200/80 mb-2">
          Keyword Deep Dive Analysis
        </h2>
        
        <p className="text-sm md:text-base text-slate-500 font-mono tracking-wide">
          Powered by Semantic Logic Engine v2.4
        </p>
      </div>

      {/* Search Input Section */}
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-2xl backdrop-blur-xl transition-all focus-within:border-brand-500/50 focus-within:shadow-brand-500/10">
          <input 
            className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg px-2 py-2 placeholder:text-slate-500 w-full"
            placeholder="Enter your niche (e.g., 'Calisthenics for beginners')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !topic} className="px-8 py-3 w-full sm:w-auto font-semibold">
            {loading ? <Spinner /> : 'Analyze Keywords'}
          </Button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        <p className="text-center text-slate-500 text-xs mt-4">
          Tip: Be specific. Instead of "Gaming", try "Best RPG Games 2024".
        </p>
      </div>

      {/* Results Section - Automatically expands when data exists */}
      {results.length > 0 && (
        <div className="space-y-6 animate-slide-up max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end px-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Analysis Results</h3>
              <p className="text-slate-400 text-sm">Found {results.length} optimized terms based on opportunity score.</p>
            </div>
            <button 
              onClick={copyList} 
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-brand-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              Copy List
            </button>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-5">Keyword Phrase</th>
                    <th className="p-5">Search Volume</th>
                    <th className="p-5">Difficulty (KD)</th>
                    <th className="p-5 text-right">Opportunity Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {results.map((r, i) => (
                    <React.Fragment key={i}>
                      <tr 
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)} 
                        className={`cursor-pointer transition-colors group ${expandedRow === i ? 'bg-slate-800/60' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="p-5 font-medium text-slate-200 group-hover:text-white transition-colors">
                          <div className="flex items-center gap-2">
                             {expandedRow === i ? 
                               <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> : 
                               <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                             }
                             {r.keyword}
                          </div>
                        </td>
                        <td className="p-5 text-slate-400 font-mono text-sm">{r.searchVolume}</td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${r.difficulty > 70 ? 'bg-rose-500' : r.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{width: `${r.difficulty}%`}}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${r.difficulty > 70 ? 'text-rose-400' : r.difficulty > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {r.difficulty}/100
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-sm">
                            {r.opportunityScore}
                          </span>
                        </td>
                      </tr>
                      {expandedRow === i && (
                        <tr className="bg-slate-900/80 animate-slide-down">
                          <td colSpan={4} className="p-0">
                             <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm border-t border-slate-800/50">
                               <div className="space-y-1">
                                 <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Trend Trajectory</span>
                                 <div className="flex items-center gap-2 text-slate-200">
                                   {r.trend === 'Rising' ? '📈' : r.trend === 'Falling' ? '📉' : '📊'} {r.trend}
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">User Intent</span>
                                 <div className="text-slate-200">{r.intent}</div>
                               </div>
                               <div className="space-y-1">
                                 <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Top Competitor</span>
                                 <div className="text-slate-200 truncate">{r.topCompetitor}</div>
                               </div>
                               <div className="space-y-1">
                                 <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Est. CPC</span>
                                 <div className="text-emerald-400 font-mono">{r.cpc}</div>
                               </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEO Content Sections - Permanently visible to boost ranking */}
      <div className="max-w-5xl mx-auto px-4 pt-16 space-y-16 border-t border-slate-800/50 mt-12">
        
        {/* Section 1: Introduction & Benefits */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Why our <span className="text-brand-400">Logic Engine</span> Wins</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Most YouTube keyword tools simply scrape autocomplete data. The TubeMaster Semantic Engine is different. We analyze the <strong>mathematical probability</strong> of ranking based on your channel's size versus the established competition.
            </p>
            <ul className="space-y-3">
              {[
                "Analyzes 'Content Freshness' scores of competitors.",
                "Detects 'Rising' trends before they peak.",
                "Filters out 'Vanity Keywords' with high views but low conversion."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="mt-1 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-brand-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
            <h3 className="text-xl font-bold text-white mb-4">The 10-Point Score</h3>
            <p className="text-sm text-slate-400 mb-4">
              Every keyword receives a proprietary Opportunity Score (0-100) derived from:
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono text-brand-200">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700">Search Vol</div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700">Competition</div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700">Click Potential</div>
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700">Video Age</div>
            </div>
          </div>
        </section>

        {/* Section 2: Importance of Keywords */}
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">The Mathematics of Ranking</h2>
            <p className="text-slate-400 text-lg">
              The algorithm cannot watch your video (yet). It reads. Here is why proper tagging is the backbone of channel discovery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/40" title="1. Contextual Relevance">
              <p className="text-slate-400 text-sm">
                YouTube uses keywords to categorize your video. If you upload a cooking video but fail to tag "Vegan Recipe," the algorithm won't know who to show it to. Precise keywords bridge your content to the right audience.
              </p>
            </Card>
            <Card className="bg-slate-900/40" title="2. The 'Suggested' Ladder">
              <p className="text-slate-400 text-sm">
                70% of YouTube views come from the "Suggested" sidebar. To get there, you must use similar metadata tags as the viral videos in your niche. Our tool identifies these competitor tags for you.
              </p>
            </Card>
            <Card className="bg-slate-900/40" title="3. Search Intent">
              <p className="text-slate-400 text-sm">
                Not all keywords are equal. "iPhone review" (Commercial intent) has a higher CPM than "funny cat videos" (Entertainment). Using the right intent keywords can double your ad revenue.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: How to Choose & Use */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-brand-500 to-purple-500"></div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">How to Choose the "Golden Ratio" Keywords</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                New creators make a fatal mistake: they chase high volume. If you have 100 subscribers, you will not rank for "Minecraft" (100M+ searches). You need the <strong>Golden Ratio</strong>:
              </p>
              <div className="bg-slate-950 p-6 rounded-xl border-l-4 border-brand-500 italic text-slate-300 mb-6">
                "Target keywords with decent volume (1k-10k) but LOW competition. These are the cracks in the wall where you can break through."
              </div>
              <p className="text-slate-400">
                Our tool highlights these opportunities with a high <strong>Opportunity Score</strong>. Look for green scores above 70.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Strategic Placement Guide</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-white font-bold">The File Name</h4>
                    <p className="text-sm text-slate-500">Rename your raw file from <code>MOV_123.mp4</code> to <code>your-main-keyword.mp4</code> before uploading.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-white font-bold">The Title Front-Load</h4>
                    <p className="text-sm text-slate-500">Place your main keyword at the <strong>beginning</strong> of your title. E.g., "<strong>Keto Diet</strong>: A Beginner's Guide" ranks better than "A Beginner's Guide to the Keto Diet".</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-white font-bold">The First 2 Lines</h4>
                    <p className="text-sm text-slate-500">Include your primary and secondary keywords naturally in the first two sentences of your description.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
