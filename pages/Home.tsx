
import React, { useEffect } from 'react';
import { Button, Card, SectionTitle } from '../components/UI';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  onNavigate: (view: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { isPro } = useAuth();
  
  const tools = [
    {
      title: 'Niche Validator',
      desc: 'Stop wasting time on bad ideas. Check profitability, saturation, and get a viral video concept instantly before you start.',
      icon: '📊',
      id: 'niche-validator',
      color: 'from-fuchsia-500 to-pink-600',
      stat: 'Idea Check',
      locked: false
    },
    {
      title: 'Competitor Analysis Tool',
      desc: 'Don\'t guess—know. Spy on top channels to uncover their content gaps, weakness analysis, and actionable attack plans to steal their traffic.',
      icon: '🕵️',
      id: 'competitors',
      color: 'from-purple-500 to-indigo-600',
      stat: 'Traffic Stealer',
      locked: false // Unlocked for Beta
    },
    {
      title: 'AI Explainer Board',
      desc: 'Create professional flowchart-style explainer graphics instantly. Perfect for educational videos and documentaries.',
      icon: '📐',
      id: 'explainer-board',
      color: 'from-teal-400 to-teal-600',
      stat: 'Edu-Graphics',
      locked: false
    },
    {
      title: 'YT Keyword Finder',
      desc: 'Our advanced 10-Point Logic system analyzes intent, trend trajectory, and difficulty to find low-competition keywords that actually rank.',
      icon: '🔑',
      id: 'keywords',
      color: 'from-blue-500 to-cyan-500',
      stat: 'Rank Faster',
      locked: false
    },
    {
      title: 'Thumbnail Downloader',
      desc: 'Instantly extract High-Resolution (4K/HD) thumbnails from any YouTube video URL. Perfect for research and archives.',
      icon: '📥',
      id: 'thumbnail-dl',
      color: 'from-red-500 to-orange-500',
      stat: 'Utility',
      locked: false
    },
    {
      title: 'Viral Script Writer',
      desc: 'Writer\'s block is over. Generate scripts engineered for watch time with built-in hooks, retention spikes, and pattern interrupts.',
      icon: '✍️',
      id: 'script',
      color: 'from-amber-500 to-orange-500',
      stat: 'Retention Max',
      locked: false
    },
    {
      title: 'Thumbnail Compare Tool',
      desc: 'A/B Test before you publish. Simulate human eye-tracking to predict which thumbnail will get the click before you risk your upload.',
      icon: '🆚',
      id: 'compare',
      color: 'from-emerald-500 to-green-600',
      stat: 'Vision AI',
      locked: false
    },
    {
      title: 'SEO Tags Generator',
      desc: 'Generate exactly 5 high-power semantic tags. No spam, just highly relevant metadata to help the algorithm categorize you.',
      icon: '🏷️',
      id: 'tags-gen',
      color: 'from-cyan-400 to-blue-500',
      stat: 'Metadata Logic',
      locked: false
    },
    {
      title: 'Description Writer',
      desc: 'Craft optimized video descriptions with perfect hooks and keyword density to improve search ranking and CTR.',
      icon: '📝',
      id: 'desc-gen',
      color: 'from-indigo-400 to-purple-500',
      stat: 'Search Ranking',
      locked: false
    },
    {
      title: 'Title & Timing Optimizer',
      desc: 'Maximize reach with SEO-optimized titles and a predictive algorithm that tells you exactly the best time to hit publish.',
      icon: '⏰',
      id: 'title-time',
      color: 'from-slate-500 to-slate-700',
      stat: 'Algorithm Hacks',
      locked: false
    }
  ];

  const faqs = [
    {
      q: "Why is this better than basic YouTube SEO tools?",
      a: "Most tools just give you search volume numbers. TubeMaster uses a proprietary '10-Point Logic' engine to analyze the *intent* and *psychology* behind the search, helping you rank for terms that drive actual revenue and views, not just vanity metrics."
    },
    {
      q: "Can I use the generated graphics commercially?",
      a: "Yes. All flowcharts created with the Explainer Board are 100% royalty-free and yours to use in your videos."
    },
    {
      q: "How does the Script Writer improve retention?",
      a: "Retention is king. Our AI Script Writer is trained on millions of viral videos. It automatically structures your content with 'Hooks,' 'Stakes,' and 'Visual Cues' to keep viewers glued to the screen, signaling the algorithm to promote your video."
    },
    {
      q: "Is the competitor data real-time?",
      a: "Absolutely. Our YouTube Competitor Analysis tool uses live data grounding to fetch the most up-to-date metrics, ensuring your strategy is based on what is working *today*, not last year."
    }
  ];

  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      <SEO 
        title="Best YouTube SEO Tool & Growth Suite" 
        description="Dominate your niche with the ultimate YouTube SEO tool. Features include YT Keyword Finder, Viral Script Writer, Competitor Analysis, and AI Explainer Graphics."
        path="/"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center pt-0 md:pt-10 overflow-hidden">
        {/* Abstract Background Mesh - PERFORMANCE OPTIMIZED */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[1000px] h-[300px] md:h-[600px] bg-brand-600/20 blur-[60px] md:blur-[120px] rounded-full -z-10 opacity-50 animate-pulse transform-gpu translate-z-0" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-0 right-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-purple-600/10 blur-[50px] md:blur-[100px] rounded-full -z-10 transform-gpu translate-z-0"></div>
        
        <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-slate-900/50 border border-brand-500/30 backdrop-blur-md mb-2 md:mb-4">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-brand-500"></span>
            </span>
            <span className="text-xs md:text-sm font-medium text-brand-300 tracking-wide">New: Niche Validator Engine</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-purple-400">YouTube SEO Tool</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-2xl text-slate-400 max-w-xl md:max-w-2xl mx-auto leading-normal md:leading-relaxed">
            Explode your channel growth with the all-in-one suite. 
            <span className="text-slate-200 font-semibold"> Validate Niches</span>, 
            <span className="text-slate-200 font-semibold"> Find Keywords</span>, and 
            <span className="text-slate-200 font-semibold"> Create Explainer Graphics</span> that demand attention.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-2 md:pt-4">
            <Button 
              variant="glow" 
              className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 text-base md:text-lg"
              onClick={() => onNavigate('keywords')}
            >
              Start Ranking Now 🚀
            </Button>
            <Button onClick={scrollToTools} variant="outline" className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 text-base md:text-lg border-slate-600 hover:border-white">
              Explore Tools
            </Button>
          </div>

          {/* Social Proof / Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-12 border-t border-slate-800/50 mt-6 md:mt-12 max-w-2xl mx-auto">
             <div>
               <div className="text-xl md:text-3xl font-bold text-white">10+</div>
               <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">Growth Modules</div>
             </div>
             <div>
               <div className="text-xl md:text-3xl font-bold text-white">4K</div>
               <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">Graphics Export</div>
             </div>
             <div>
               <div className="text-xl md:text-3xl font-bold text-white">24/7</div>
               <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">Uptime</div>
             </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="scroll-mt-24">
        <SectionTitle 
          title="Your Complete Growth Arsenal" 
          subtitle="Stop juggling multiple subscriptions. We provide every Youtube SEO tool you need to dominate your niche, from ideation to publication."
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              onClick={() => !tool.locked && onNavigate(tool.id)}
              className={`group block h-full relative ${tool.locked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              <div className="h-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-brand-500/50 transition-all duration-300 hover:bg-slate-800/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-900/20 relative overflow-hidden backdrop-blur-sm transform-gpu will-change-transform">
                
                {/* Locked Overlay */}
                {tool.locked && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 shadow-2xl">
                       <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h4 className="text-white font-bold text-lg">Pro Feature</h4>
                    <p className="text-slate-300 text-sm mt-1 mb-4">Upgrade to unlock this tool.</p>
                    <button onClick={e => { e.stopPropagation(); onNavigate('pricing'); }} className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-full font-bold text-sm transition-colors">
                      View Plans
                    </button>
                  </div>
                )}

                {/* Gradient Header Line */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${tool.color}`} />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="text-5xl drop-shadow-lg filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110">{tool.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded-md group-hover:text-brand-300 group-hover:border-brand-500/30 transition-colors">
                    {tool.stat}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-200 transition-colors">{tool.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">
                  {tool.desc}
                </p>
                
                {!tool.locked && (
                  <div className="mt-6 flex items-center text-brand-400 text-sm font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Open Tool <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO & Content Section */}
      <section className="max-w-5xl mx-auto">
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 md:p-16">
          <SectionTitle title="Mastering the Algorithm: Beyond Basic Tags" subtitle="Why relying on luck is not a strategy. It's time to engineer your success." />
          
          <div className="prose prose-invert prose-lg max-w-none space-y-12">
            {/* Article Part 1 */}
            <div>
              <h3 className="text-2xl font-bold text-brand-300 mb-4">The New Era of Search Intent</h3>
              <p className="text-slate-300 leading-relaxed">
                In 2024, the YouTube algorithm evolved. It no longer cares just about keywords; it cares about <strong>Satisfied User Intent</strong>. This is where TubeMaster acts as your unfair advantage. As a premium <strong>Youtube SEO tool</strong>, we don't just find keywords; our <strong>YT Keyword Finder</strong> analyzes the difficulty and opportunity cost of every topic, ensuring you only create videos that have a mathematical probability of ranking.
              </p>
              <p className="text-slate-300 leading-relaxed mt-4">
                Stop wasting time on oversaturated topics. Use data to find the "Blue Ocean" opportunities where viewers are starving for content, but competitors are silent.
              </p>
            </div>

            {/* Article Part 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-brand-300 mb-4">Visuals: The Gatekeeper of Views</h3>
                <p className="text-slate-300 leading-relaxed">
                   You can have the best video in the world, but if nobody clicks, the algorithm kills it. Your thumbnail is your most valuable asset. Our <strong>Thumbnail Compare Tool</strong> utilizes advanced vision AI to simulate human eye-tracking.
                </p>
                <ul className="mt-4 space-y-2 text-slate-400">
                  <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Mobile-first contrast optimization</li>
                  <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Emotional facial triggers</li>
                  <li className="flex items-center gap-2"><span className="text-brand-500">✓</span> Curiosity gap verification</li>
                </ul>
              </div>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
                 <div className="text-center space-y-4">
                    <div className="text-6xl">👁️</div>
                    <h4 className="text-white font-bold text-xl">The 58% Rule</h4>
                    <p className="text-sm text-slate-400">
                      Data shows that thumbnails utilizing a "Curiosity Gap"—an incomplete visual story—achieve a <strong>58% higher CTR</strong>. Our <strong>Youtube thumbnail compare tool</strong> validates this before you publish.
                    </p>
                 </div>
              </div>
            </div>

            {/* Article Part 3 */}
            <div>
              <h3 className="text-2xl font-bold text-brand-300 mb-4">Retention Engineering</h3>
              <p className="text-slate-300 leading-relaxed">
                Once you get the click, you must keep the viewer. A <strong>YT Script Writer</strong> isn't just about grammar; it's about psychology. Our tool structures your content with "Pattern Interrupts" every 60 seconds to reset the viewer's attention span. This "Hook-Retain-Reward" cycle is the secret sauce behind the world's biggest channels.
              </p>
            </div>

             {/* Article Part 4 */}
            <div>
               <h3 className="text-2xl font-bold text-brand-300 mb-4">Strategic Competitor Analysis</h3>
               <p className="text-slate-300 leading-relaxed">
                 Success leaves clues. Our <strong>Youtube Competitor Analysis tool</strong> scans rival channels to find their "Content Gaps"—topics their audience is begging for in the comments. By serving this underserved audience, you can grow your channel rapidly, regardless of your current subscriber count.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto">
        <SectionTitle title="Frequently Asked Questions" center />
        <div className="grid gap-6">
          {faqs.map((faq, i) => (
            <Card key={i} className="hover:border-brand-500/30 transition-colors bg-slate-900/40">
              <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                <span className="text-brand-500 font-serif italic text-xl">Q.</span>
                {faq.q}
              </h3>
              <p className="text-slate-400 leading-relaxed pl-8">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-900/20 to-blue-900/20 border border-brand-500/20 rounded-3xl p-12 text-center max-w-5xl mx-auto relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to Dominate Your Niche?</h2>
         <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto relative z-10">Join thousands of creators using TubeMaster's advanced Youtube SEO tool suite to build sustainable, high-income channels.</p>
         <div className="relative z-10 inline-block">
           <Button 
             variant="primary" 
             className="px-10 py-4 text-xl rounded-full shadow-brand-500/50 hover:shadow-brand-500/80 hover:scale-105 transition-transform"
             onClick={() => onNavigate('keywords')}
           >
             Start Creating for Free
           </Button>
         </div>
      </section>
    </div>
  );
};
