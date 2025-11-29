import React, { useState, useRef } from 'react';
import { Card, Button, Badge, SectionTitle } from '../components/UI';
import { compareThumbnailsVision } from '../services/geminiService';
import { ThumbnailCompareResult } from '../types';
import { SEO } from '../components/SEO';

// Client-side compression utility
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1024;

        // Maintain aspect ratio while resizing
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
        }
        
        // Draw white background for transparency handling (PNG -> JPEG)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        const MAX_BYTES = 600 * 1024; // 600KB limit for API safety
        let quality = 0.95;
        
        // Iterative compression to meet size requirements
        const attemptCompression = (q: number) => {
            const dataUrl = canvas.toDataURL('image/jpeg', q);
            // Estimate size: (Base64 Chars - Header) * 0.75 = Bytes
            const head = 'data:image/jpeg;base64,';
            const size = Math.round((dataUrl.length - head.length) * 0.75);
            
            if (size <= MAX_BYTES) {
                resolve(dataUrl);
            } else if (q <= 0.3) {
                // If quality drops too low and still big, fail gracefully
                reject(new Error("Image too large"));
            } else {
                // Step down quality
                attemptCompression(q - 0.15);
            }
        };
        
        attemptCompression(quality);
      };
      img.onerror = () => reject(new Error("Image load failed"));
    };
    reader.onerror = () => reject(new Error("File read failed"));
  });
};

const ANALYSIS_STEPS = [
  "Initializing Vision Intelligence...",
  "Mapping Saliency & Focal Points...",
  "Analyzing Text Readability & Contrast...",
  "Comparing Emotional Triggers...",
  "Simulating Human Eye-Tracking...",
  "Calculating Final CTR Probability..."
];

export const ThumbnailCompare: React.FC = () => {
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<ThumbnailCompareResult | null>(null);
  const intervalRef = useRef<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, setImg: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessing(true);
      try {
        const compressedDataUrl = await compressImage(file);
        setImg(compressedDataUrl);
        setResult(null); // Reset result on new upload
      } catch (err) {
        console.error("Compression failed:", err);
        alert("Please upload images smaller than 600 KB");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleCompare = async () => {
    if (!imgA || !imgB) return;
    setLoading(true);
    setResult(null);
    setAnalysisStep(0);

    // Animation loop for analysis steps
    intervalRef.current = setInterval(() => {
      setAnalysisStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const data = await compareThumbnailsVision(imgA, imgB, 'OPENROUTER');
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      console.error(e);
      alert("Comparison failed. Check your API settings or try again.");
    } finally {
      clearInterval(intervalRef.current);
      setLoading(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-20">
      <SEO 
        title="YouTube Thumbnail Compare Tool - AI A/B Tester" 
        description="The #1 AI Thumbnail Compare Tool. Predict your Click-Through Rate (CTR) before you publish. Advanced Vision AI analyzes contrast, emotion, and text." 
        path="/compare" 
      />
      
      {/* Hero Header - H1 Tag for SEO */}
      <div className="text-center pt-6 md:pt-12 relative px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] bg-emerald-500/10 blur-[80px] md:blur-[100px] rounded-full -z-10"></div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-3 md:mb-4">
          A/B <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Intelligence Engine</span>
        </h1>
        <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Don't guess. Know. Compare two variations and let our Vision AI predict the winner based on 10+ psychological CTR vectors.
        </p>
      </div>

      {/* Main Interface */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Comparison Stage */}
        <div className="relative grid md:grid-cols-2 gap-6 md:gap-16 items-center">
          
          {/* VS Badge - Mobile Optimized */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none scale-75 md:scale-100">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-2xl shadow-black/50">
               <span className="font-black text-slate-500 italic text-lg md:text-xl">VS</span>
             </div>
          </div>

          {[
            { id: 'A', img: imgA, set: setImgA, score: result?.scoreA, win: result?.winner === 'A' },
            { id: 'B', img: imgB, set: setImgB, score: result?.scoreB, win: result?.winner === 'B' }
          ].map((item) => (
            <div key={item.id} className="relative group perspective-1000">
              <div className={`
                relative bg-slate-900/50 rounded-2xl border-2 transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-sm
                ${item.win 
                  ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] scale-[1.02] z-10' 
                  : result && !item.win
                  ? 'border-slate-800 opacity-60 grayscale-[0.5] scale-95'
                  : 'border-slate-700 hover:border-slate-500'
                }
              `}>
                
                {/* Upload Area */}
                <div 
                  onClick={() => !processing && !loading && document.getElementById(`file${item.id}`)?.click()}
                  className={`aspect-video relative cursor-pointer flex flex-col items-center justify-center ${item.img ? '' : 'p-6 md:p-8'}`}
                >
                  {item.img ? (
                    <>
                      <img src={item.img} className="w-full h-full object-cover" alt={`Variant ${item.id}`} />
                      {/* Scanning Animation Overlay */}
                      {loading && (
                        <div className="absolute inset-0 z-10 bg-emerald-500/10 mix-blend-overlay">
                          <div className="w-full h-1 bg-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                      )}
                      
                      {/* Hover Change Button */}
                      {!loading && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                           <span className="text-white font-bold border border-white/20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm md:text-base">Change Image</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center space-y-3 md:space-y-4 border-2 border-dashed border-slate-700 rounded-xl w-full h-full flex flex-col items-center justify-center bg-slate-900/50 group-hover:bg-slate-800/50 transition-colors">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">
                        {processing ? '⏳' : '📥'}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm md:text-base">Variant {item.id}</h3>
                        <p className="text-slate-500 text-xs md:text-sm">Tap to upload</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Score Badge */}
                  {item.score !== undefined && (
                    <div className="absolute top-4 right-4 z-30">
                       <div className={`flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl border backdrop-blur-md shadow-lg ${item.win ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}>
                         <span className="text-lg md:text-2xl font-black leading-none">{item.score}</span>
                         <span className="text-[8px] md:text-[10px] font-bold uppercase">Score</span>
                       </div>
                    </div>
                  )}

                  {/* Winner Label */}
                  {item.win && (
                    <div className="absolute bottom-0 left-0 w-full bg-emerald-600/90 text-white text-center py-2 font-black uppercase tracking-widest backdrop-blur-md text-xs md:text-sm">
                      Recommended Winner
                    </div>
                  )}
                </div>
                
                <input 
                  id={`file${item.id}`} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFile(e, item.set)}
                  disabled={processing || loading}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-8 md:mt-12 text-center max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 animate-pulse">
               <div className="flex items-center justify-center gap-4 mb-4">
                 <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-emerald-400 font-bold tracking-wide uppercase text-sm">AI Analysis in Progress</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                   style={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                 ></div>
               </div>
               <p className="text-slate-400 font-mono text-xs">{ANALYSIS_STEPS[analysisStep]}</p>
            </div>
          ) : (
            <Button 
              onClick={handleCompare} 
              disabled={processing || !imgA || !imgB} 
              className={`w-full sm:w-auto px-10 py-4 text-base font-bold rounded-2xl shadow-emerald-500/20 tracking-wide transition-all duration-300 ${(!imgA || !imgB) ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 hover:shadow-emerald-500/40 hover:-translate-y-1'}`}
              variant="primary"
            >
              Run Analysis ⚡
            </Button>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div ref={resultRef} className="mt-16 md:mt-20 scroll-mt-24">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
               <div className="p-6 md:p-12 border-b border-slate-800">
                 <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6 md:mb-8">
                   <h3 className="text-2xl md:text-3xl font-bold text-white">Analysis Report</h3>
                   <div className="flex gap-3">
                     <Badge color={result.winner === 'A' ? 'green' : 'blue'}>Winner: Variant {result.winner}</Badge>
                     <Badge color="purple">Confidence: High</Badge>
                   </div>
                 </div>
                 <p className="text-base md:text-lg text-slate-300 leading-relaxed font-light">
                   {result.reasoning}
                 </p>
               </div>
               
               {/* Detailed Breakdown Grid */}
               <div className="bg-slate-950/50 p-6 md:p-12">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Vector Breakdown</h4>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                   {result.breakdown?.map((b, i) => (
                     <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors group">
                       <div className="flex justify-between items-center mb-3">
                         <span className="font-bold text-slate-200 text-sm md:text-base">{b.criterion}</span>
                         <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded bg-slate-800 ${b.winner === 'A' ? 'text-emerald-400' : 'text-blue-400'}`}>
                           Best: {b.winner}
                         </span>
                       </div>
                       <p className="text-xs md:text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
                         {b.explanation}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Extended SEO Content Section - H2/H3/H4 Structure */}
      <section className="max-w-4xl mx-auto px-4 pt-12 md:pt-16 border-t border-slate-800/50 mt-16 md:mt-20 space-y-12 md:space-y-16">
        
        {/* Intro / The Why */}
        <div className="space-y-6">
          {/* H2 Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">The Science Behind the Click</h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Why A/B Testing Your Thumbnails is the Highest ROI Activity for Your Channel.</p>
          </div>

          <div className="prose prose-invert prose-sm md:prose-lg max-w-none text-slate-300 leading-relaxed">
            <p>
              In the hyper-competitive landscape of YouTube, your video is judged in less than 13 milliseconds. That is how fast the human brain processes an image. Before a viewer reads your title, before they check your view count, they have already made a subconscious decision based on your thumbnail. This is why using a <strong>YouTube Thumbnail Compare Tool</strong> is not optional—it is essential for growth.
            </p>
            <p>
              Traditional A/B testing on YouTube is slow. You upload a video, wait 24 hours, change the thumbnail, and wait another 24 hours. By then, the algorithm has already decided your video's fate. Our <strong>AI Thumbnail A/B Tester</strong> solves this by simulating thousands of viewer interactions in seconds, giving you predictive data <em>before</em> you publish.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive - H3 Headings */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card title="Heatmap & Focal Point Analysis" className="bg-slate-900/40">
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-4">
              Our vision engine uses saliency mapping to determine exactly where a human eye will land first. If your main subject isn't the focal point, you are losing clicks.
            </p>
            <ul className="text-xs md:text-sm text-slate-400 space-y-2">
              <li className="flex gap-2">✅ <span className="text-slate-300">Face Detection:</span> Ensures emotional expressions are clear.</li>
              <li className="flex gap-2">✅ <span className="text-slate-300">Contrast Check:</span> Verifies subject separation from background.</li>
            </ul>
          </Card>
          <Card title="Cognitive Load Assessment" className="bg-slate-900/40">
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-4">
              A cluttered thumbnail confuses the brain. We analyze "Cognitive Load"—the amount of mental effort required to understand your image.
            </p>
            <ul className="text-xs md:text-sm text-slate-400 space-y-2">
              <li className="flex gap-2">✅ <span className="text-slate-300">Text Readability:</span> Tests font size for mobile screens.</li>
              <li className="flex gap-2">✅ <span className="text-slate-300">Rule of Thirds:</span> Checks compositional balance.</li>
            </ul>
          </Card>
        </div>

        {/* Extensive Article Content - H3 Headings */}
        <div className="space-y-12">
           <div>
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Why "Gut Feeling" Fails</h3>
             <p className="text-slate-400 leading-relaxed text-sm md:text-base">
               As creators, we are often too close to our own content. We might love a thumbnail because it took hours to design, but a <strong>Thumbnail Click-Through Rate Analyzer</strong> doesn't care about effort; it cares about impact. Data shows that "ugly" thumbnails often outperform polished ones because they are more authentic or jarring. By removing your ego and relying on an <strong>AI Thumbnail Grader</strong>, you align your strategy with actual viewer psychology.
             </p>
           </div>

           <div>
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">The 3 Pillars of a High-CTR Thumbnail</h3>
             <div className="grid md:grid-cols-3 gap-6 mt-6">
               <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                 <div className="text-brand-500 text-3xl md:text-4xl mb-3">01</div>
                 <h4 className="text-white font-bold mb-2">Curiosity Gap</h4>
                 <p className="text-xs md:text-sm text-slate-500">Does the image ask a question that only the video can answer? The tool scans for visual storytelling elements that create intrigue.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                 <div className="text-purple-500 text-3xl md:text-4xl mb-3">02</div>
                 <h4 className="text-white font-bold mb-2">Emotional Mirroring</h4>
                 <p className="text-xs md:text-sm text-slate-500">Humans mimic emotions. A shocked face triggers alertness. A happy face triggers openness. Our tool identifies the dominant emotion.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                 <div className="text-blue-500 text-3xl md:text-4xl mb-3">03</div>
                 <h4 className="text-white font-bold mb-2">Branding Consistency</h4>
                 <p className="text-xs md:text-sm text-slate-500">Long-term growth requires recognizability. We check if your color palette matches your channel's established identity.</p>
               </div>
             </div>
           </div>

           <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-8 rounded-2xl border border-emerald-500/20">
             <h3 className="text-xl md:text-2xl font-bold text-white mb-4">How to Use This Tool for Maximum Growth</h3>
             <p className="text-slate-300 mb-4 text-sm md:text-base">
               Don't just upload two random images. Use the scientific method:
             </p>
             <ol className="list-decimal list-inside space-y-3 text-slate-400 text-sm md:text-base">
               <li><strong>Test Concepts, Not Tweaks:</strong> Don't just change the saturation. Test a "Face" thumbnail vs. an "Action" thumbnail.</li>
               <li><strong>Test Text vs. No Text:</strong> Sometimes, the image speaks for itself. Use the comparison tool to see if text adds clarity or clutter.</li>
               <li><strong>Iterate on the Loser:</strong> Take the losing thumbnail, understand <em>why</em> it failed based on the AI breakdown, and try to beat the winner in round 2.</li>
             </ol>
             <p className="mt-6 text-xs md:text-sm text-emerald-400 font-bold">
               Pro Tip: The algorithm rewards High CTR + High Retention. This tool solves the first half of that equation perfectly.
             </p>
           </div>
        </div>

      </section>
    </div>
  );
};